export interface AuthLogEntry {
  timestamp: string
  ip: string
  userAgent: string
  success: boolean
  reason?: string
  attemptCount?: number
}

export function logAuthAttempt(entry: AuthLogEntry): void {
  const logMessage = `[AUTH] ${entry.timestamp} - IP: ${entry.ip} - UA: ${entry.userAgent} - Success: ${entry.success}${entry.reason ? ` - Reason: ${entry.reason}` : ''}${entry.attemptCount ? ` - Attempt: ${entry.attemptCount}` : ''}`
  
  // 성공/실패에 따라 적절한 로그 레벨 사용
  if (entry.success) {
    console.info(logMessage)
  } else {
    console.warn(logMessage)
  }
}

export function getRequestInfo(request: Request): { ip: string; userAgent: string } {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
             request.headers.get('x-real-ip') ||
             'unknown'
  
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  return { ip, userAgent }
} 