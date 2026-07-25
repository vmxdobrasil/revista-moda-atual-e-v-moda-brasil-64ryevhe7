type PromptListener = (prompt: string | null) => void

let pendingPrompt: string | null = null
const listeners = new Set<PromptListener>()

export function setPendingPrompt(prompt: string | null): void {
  pendingPrompt = prompt
  listeners.forEach((l) => l(prompt))
}

export function consumePendingPrompt(): string | null {
  const p = pendingPrompt
  pendingPrompt = null
  return p
}

export function subscribePendingPrompt(cb: PromptListener): () => void {
  listeners.add(cb)
  return () => {
    listeners.delete(cb)
  }
}
