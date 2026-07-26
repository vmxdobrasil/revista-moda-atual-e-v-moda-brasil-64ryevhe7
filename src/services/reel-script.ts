import pb from '@/lib/pocketbase/client'

export interface ReelCena {
  timing: string
  visual: string
  text: string
}

export interface ReelCenaFinal {
  timing: string
  visual: string
  text: string
  cta: string
}

export interface ReelScript {
  type: 'reels-script'
  hook: string
  cena1: ReelCena
  cena2: ReelCena
  cena3: ReelCena
  cenaFinal: ReelCenaFinal
  legenda: string
  hashtags: string[]
  audio: string
  raw: string
}

export interface ReelScriptResult {
  script: ReelScript
  recordId: string
}

export async function generateReelScript(tema: string): Promise<ReelScriptResult> {
  const res = await pb.send('/backend/v1/generate-reel-script', {
    method: 'POST',
    body: JSON.stringify({ tema }),
    headers: { 'Content-Type': 'application/json' },
  })
  return {
    script: res.script as ReelScript,
    recordId: res.recordId as string,
  }
}
