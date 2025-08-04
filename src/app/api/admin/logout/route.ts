import { NextRequest, NextResponse } from 'next/server'
import { withAuth } from '@/lib/auth-middleware'

async function logoutHandler(request: any) {
  return NextResponse.json({
    success: true,
    message: '로그아웃되었습니다.'
  }, {
    headers: {
      'Set-Cookie': 'admin_token=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/'
    }
  })
}

export const POST = withAuth(logoutHandler) 