import { NextRequest, NextResponse } from 'next/server'
import { verifyToken, extractTokenFromHeader } from './jwt'

export interface AuthenticatedRequest extends NextRequest {
  user?: {
    userId: string
    role: string
  }
}

export function withAuth(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
  return async (request: AuthenticatedRequest): Promise<NextResponse> => {
    try {
      // Authorization 헤더에서 토큰 추출
      const authHeader = request.headers.get('authorization')
      const token = extractTokenFromHeader(authHeader)
      
      if (!token) {
        return NextResponse.json({
          success: false,
          message: '인증 토큰이 필요합니다.'
        }, { status: 401 })
      }
      
      // 토큰 검증
      const payload = verifyToken(token)
      if (!payload) {
        return NextResponse.json({
          success: false,
          message: '유효하지 않은 토큰입니다.'
        }, { status: 401 })
      }
      
      // 요청 객체에 사용자 정보 추가
      request.user = {
        userId: payload.userId,
        role: payload.role
      }
      
      // 원본 핸들러 실행
      return handler(request)
    } catch (error) {
      console.error('Auth middleware error:', error)
      return NextResponse.json({
        success: false,
        message: '인증 처리 중 오류가 발생했습니다.'
      }, { status: 500 })
    }
  }
}

export function requireRole(requiredRole: string) {
  return function(handler: (request: AuthenticatedRequest) => Promise<NextResponse>) {
    return withAuth(async (request: AuthenticatedRequest) => {
      if (!request.user) {
        return NextResponse.json({
          success: false,
          message: '인증이 필요합니다.'
        }, { status: 401 })
      }
      
      if (request.user.role !== requiredRole) {
        return NextResponse.json({
          success: false,
          message: '접근 권한이 없습니다.'
        }, { status: 403 })
      }
      
      return handler(request)
    })
  }
} 