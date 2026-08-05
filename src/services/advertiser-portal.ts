import pb from '@/lib/pocketbase/client'

export interface AdvertiserLoginResult {
  access_token: string
  advertiser: string
}

export async function loginAdvertiser(
  advertiser: string,
  email: string,
): Promise<AdvertiserLoginResult> {
  return await pb.send('/backend/v1/public/anunciante/login', {
    method: 'POST',
    body: JSON.stringify({ advertiser, email }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function approveContract(accessToken: string, proposalId: string): Promise<void> {
  await pb.send('/backend/v1/public/anunciante/contrato/aprovar', {
    method: 'POST',
    body: JSON.stringify({ access_token: accessToken, proposal_id: proposalId }),
    headers: { 'Content-Type': 'application/json' },
  })
}
