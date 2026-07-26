let pendingStoriesSubject: string | null = null

export function setPendingStoriesSubject(subject: string | null): void {
  pendingStoriesSubject = subject
}

export function getPendingStoriesSubject(): string | null {
  return pendingStoriesSubject
}

export function parseStoriesOptions(content: string): string[] {
  const options: string[] = []
  const regex = /Op[çc][ãa]o\s*\d+\s*:?\s*(.+)/gi
  let match: RegExpExecArray | null
  while ((match = regex.exec(content)) !== null) {
    let text = match[1].trim()
    text = text.replace(/^\[|\]$/g, '').trim()
    if (text) options.push(text)
  }
  return options.slice(0, 3)
}
