import { NextRequest, NextResponse } from 'next/server'
import { checkRateLimit } from '@/lib/rate-limit'
import { validateAuthRequest } from '@/lib/validation'
import { logAuthAttempt, getRequestInfo } from '@/lib/logger'
import { generateToken } from '@/lib/jwt'
import { verifyPassword, getHashedAdminPassword } from '@/lib/password'
import { debugEnvironmentVariables } from '@/lib/debug-env'

export async function POST(request: NextRequest) {
  const { ip, userAgent } = getRequestInfo(request)
  const timestamp = new Date().toISOString()
  
  // 개발 환경에서만 환경변수 디버깅 실행
  if (process.env.NODE_ENV !== 'production') {
    debugEnvironmentVariables()
  }
  
  try {
    // Rate limiting 체크
    const rateLimitResult = checkRateLimit(ip, {
      maxRequests: 5, // 15분에 5회 시도 제한
      windowMs: 15 * 60 * 1000
    })
    
    if (!rateLimitResult.allowed) {
      logAuthAttempt({
        timestamp,
        ip,
        userAgent,
        success: false,
        reason: 'Rate limit exceeded',
        attemptCount: 5 - rateLimitResult.remaining
      })
      
      return NextResponse.json({
        success: false,
        message: '너무 많은 인증 시도가 있었습니다. 15분 후에 다시 시도해주세요.',
        remainingAttempts: 0,
        resetTime: new Date(rateLimitResult.resetTime).toISOString()
      }, { 
        status: 429,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      })
    }
    
    // 요청 본문 파싱
    let body
    try {
      body = await request.json()
    } catch {
      logAuthAttempt({
        timestamp,
        ip,
        userAgent,
        success: false,
        reason: 'Invalid JSON'
      })
      
      return NextResponse.json({
        success: false,
        message: '잘못된 요청 형식입니다.'
      }, { status: 400 })
    }
    
    // 입력 검증
    const validationResult = validateAuthRequest(body)
    if (!validationResult.isValid) {
      logAuthAttempt({
        timestamp,
        ip,
        userAgent,
        success: false,
        reason: `Validation failed: ${validationResult.errors.join(', ')}`
      })
      
      return NextResponse.json({
        success: false,
        message: '입력 데이터가 올바르지 않습니다.',
        errors: validationResult.errors
      }, { status: 400 })
    }
    
    const { password } = body
    
    // 환경변수에서 관리자 비밀번호 확인
    let hashedAdminPassword: string
    try {
      hashedAdminPassword = getHashedAdminPassword()
    } catch (error) {
      console.error('관리자 비밀번호 가져오기 실패:', error)
      logAuthAttempt({
        timestamp,
        ip,
        userAgent,
        success: false,
        reason: 'Admin password not configured'
      })
      
      return NextResponse.json({
        success: false,
        message: '서버 설정 오류가 발생했습니다.'
      }, { status: 500 })
    }
    
    // 비밀번호 검증
    const isPasswordValid = await verifyPassword(password, hashedAdminPassword)
    
    if (isPasswordValid) {
      // JWT 토큰 생성
      const token = generateToken({
        userId: 'admin',
        role: 'admin'
      })
      
      logAuthAttempt({
        timestamp,
        ip,
        userAgent,
        success: true
      })
      
      return NextResponse.json({
        success: true,
        message: '인증 성공',
        expiresIn: '24h'
      }, {
        headers: {
          'Set-Cookie': `admin_token=${token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${24 * 60 * 60}`
        }
      })
    } else {
      logAuthAttempt({
        timestamp,
        ip,
        userAgent,
        success: false,
        reason: 'Invalid password',
        attemptCount: 5 - rateLimitResult.remaining
      })
      
      return NextResponse.json({
        success: false,
        message: '잘못된 비밀번호입니다.',
        remainingAttempts: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.resetTime).toISOString()
      }, { 
        status: 401,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
          'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString()
        }
      })
    }
  } catch (error) {
    console.error('Authentication error:', error)
    
    logAuthAttempt({
      timestamp,
      ip,
      userAgent,
      success: false,
      reason: 'Server error'
    })
    
    return NextResponse.json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    }, { status: 500 })
  }
} 