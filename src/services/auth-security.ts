import pb from '@/lib/pocketbase/client'

export interface RequestResetResponse {
  success: boolean
  message: string
  resetUrl: string | null
}

export async function requestPasswordReset(email: string): Promise<RequestResetResponse> {
  return await pb.send('/backend/v1/auth/request-reset', {
    method: 'POST',
    body: JSON.stringify({ email }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ success: boolean; message: string }> {
  return await pb.send('/backend/v1/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export interface TwoFactorSetupResponse {
  success: boolean
  backupCodes: string[]
}

export async function setup2FA(password: string): Promise<TwoFactorSetupResponse> {
  return await pb.send('/backend/v1/auth/2fa/setup', {
    method: 'POST',
    body: JSON.stringify({ password }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function disable2FA(password: string): Promise<{ success: boolean }> {
  return await pb.send('/backend/v1/auth/2fa/disable', {
    method: 'POST',
    body: JSON.stringify({ password }),
    headers: { 'Content-Type': 'application/json' },
  })
}

export async function generate2FAOTP(): Promise<{ otp: string; message: string }> {
  return await pb.send('/backend/v1/auth/2fa/generate-otp', {
    method: 'POST',
  })
}

export interface TwoFactorVerifyResult {
  token: string
  record: unknown
}

export async function verify2FA(
  email: string,
  code: string,
  isBackupCode = false,
): Promise<TwoFactorVerifyResult> {
  return await pb.send('/backend/v1/auth/2fa/verify', {
    method: 'POST',
    body: JSON.stringify({
      email,
      code: isBackupCode ? '' : code,
      backupCode: isBackupCode ? code : '',
    }),
    headers: { 'Content-Type': 'application/json' },
  })
}
