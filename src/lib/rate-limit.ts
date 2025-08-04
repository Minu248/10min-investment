interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

// 메모리 기반 저장소 (개발용)
const rateLimitStore: RateLimitStore = {}

// 전역 정리 함수 - 만료된 모든 항목 제거
function cleanupExpiredEntries(): void {
  const now = Date.now()
  const keysToDelete: string[] = []
  
  for (const [key, value] of Object.entries(rateLimitStore)) {
    if (value.resetTime < now) {
      keysToDelete.push(key)
    }
  }
  
  keysToDelete.forEach(key => delete rateLimitStore[key])
  
  if (keysToDelete.length > 0) {
    console.log(`Rate limit cleanup: removed ${keysToDelete.length} expired entries`)
  }
}

// 주기적 정리 스케줄링 (5분마다)
let cleanupInterval: NodeJS.Timeout | null = null

function startCleanupScheduler(): void {
  if (cleanupInterval) {
    clearInterval(cleanupInterval)
  }
  
  cleanupInterval = setInterval(cleanupExpiredEntries, 5 * 60 * 1000) // 5분마다
  
  // 프로세스 종료 시 정리
  process.on('SIGTERM', () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
    }
  })
  
  process.on('SIGINT', () => {
    if (cleanupInterval) {
      clearInterval(cleanupInterval)
    }
  })
}

// 정리 스케줄러 시작
startCleanupScheduler()

export interface RateLimitConfig {
  maxRequests: number
  windowMs: number
}

export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig = { maxRequests: 5, windowMs: 15 * 60 * 1000 } // 15분에 5회
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const windowStart = now - config.windowMs

  // 기존 데이터 정리
  if (rateLimitStore[identifier] && rateLimitStore[identifier].resetTime < now) {
    delete rateLimitStore[identifier]
  }

  // 새로운 요청이거나 윈도우가 리셋된 경우
  if (!rateLimitStore[identifier]) {
    rateLimitStore[identifier] = {
      count: 1,
      resetTime: now + config.windowMs
    }
    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetTime: rateLimitStore[identifier].resetTime
    }
  }

  // 요청 수 증가
  rateLimitStore[identifier].count++

  const remaining = Math.max(0, config.maxRequests - rateLimitStore[identifier].count)
  const allowed = rateLimitStore[identifier].count <= config.maxRequests

  return {
    allowed,
    remaining,
    resetTime: rateLimitStore[identifier].resetTime
  }
}

// IP 주소 유효성 검증 함수
function isValidIP(ip: string): boolean {
  // IPv4 패턴
  const ipv4Pattern = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
  
  // IPv6 패턴 (간단한 버전)
  const ipv6Pattern = /^(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$|^::1$|^::$/
  
  return ipv4Pattern.test(ip) || ipv6Pattern.test(ip)
}

export function getClientIP(request: Request): string {
  // 여러 헤더에서 IP 추출 시도 (우선순위 순)
  const headers = [
    'cf-connecting-ip',      // Cloudflare
    'x-forwarded-for',       // 일반적인 프록시
    'x-real-ip',            // Nginx
    'x-client-ip',          // Apache
    'forwarded'             // RFC 7239
  ]
  
  for (const header of headers) {
    const value = request.headers.get(header)
    if (value) {
      // x-forwarded-for는 쉼표로 구분된 여러 IP를 포함할 수 있음
      const ips = value.split(',').map(ip => ip.trim())
      
      for (const ip of ips) {
        if (isValidIP(ip)) {
          return ip
        }
      }
    }
  }
  
  // 유효한 IP를 찾지 못한 경우
  console.warn('유효한 클라이언트 IP를 찾을 수 없습니다. 헤더를 확인하세요.')
  return 'unknown'
} 