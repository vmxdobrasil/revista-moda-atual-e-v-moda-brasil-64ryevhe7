import pb from '@/lib/pocketbase/client'

export async function logAuthFailure(errorMessage: string, email?: string): Promise<void> {
  try {
    await pb.send('/backend/v1/auth/log-failure', {
      method: 'POST',
      body: JSON.stringify({ error_message: errorMessage, email }),
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    // Best-effort logging — don't fail if logging fails
  }
}
