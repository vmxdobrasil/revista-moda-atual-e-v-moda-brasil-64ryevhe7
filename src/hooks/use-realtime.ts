import { useEffect, useRef } from 'react'
import type { RecordModel, RecordSubscription } from 'pocketbase'

import pb from '@/lib/pocketbase/client'

/**
 * Hook for real-time subscriptions to a PocketBase collection.
 * ALWAYS use this hook instead of subscribing inline.
 * Uses the per-listener UnsubscribeFunc so multiple components
 * can safely subscribe to the same collection without conflicts.
 *
 * Generic over the record type: pass your collection's interface as
 * `useRealtime<MyRecord>(...)` to get a typed subscription payload
 * instead of `unknown`.
 */
export function useRealtime<TRecord extends RecordModel = RecordModel>(
  collectionName: string,
  callback: (data: RecordSubscription<TRecord>) => void,
  enabled: boolean = true,
) {
  const callbackRef = useRef(callback)
  callbackRef.current = callback

  useEffect(() => {
    if (!enabled) return

    let unsubscribeFn: (() => Promise<void>) | undefined
    let cancelled = false

    // Timeout guard of 5 seconds to ensure subscription attempts never hang or block
    let timerId: ReturnType<typeof setTimeout> | undefined

    const subscribeWithTimeout = Promise.race([
      pb.collection<TRecord>(collectionName).subscribe('*', (e) => {
        callbackRef.current(e)
      }),
      new Promise<never>((_, reject) => {
        timerId = setTimeout(() => {
          reject(new Error(`Realtime subscription timeout for "${collectionName}"`))
        }, 5000)
      }),
    ])

    subscribeWithTimeout
      .then((fn) => {
        if (timerId) clearTimeout(timerId)
        if (cancelled) {
          fn().catch(() => {})
        } else {
          unsubscribeFn = fn
        }
      })
      .catch((err) => {
        if (timerId) clearTimeout(timerId)
        // Silent fallback - realtime failure should never crash or block UI
        if (import.meta.env.DEV) {
          console.warn(
            `[useRealtime] Realtime subscription to "${collectionName}" not established:`,
            err?.message || err,
          )
        }
      })

    return () => {
      cancelled = true
      if (timerId) clearTimeout(timerId)
      if (unsubscribeFn) {
        unsubscribeFn().catch(() => {})
      }
    }
  }, [collectionName, enabled])
}

export default useRealtime
