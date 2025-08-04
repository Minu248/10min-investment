import jwt from 'jsonwebtoken'

export interface JWTPayload {
  userId: string
  role: string
  iat?: number
  exp?: number
}

export function generateToken(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const secret = process.env.JWT_SECRET
  
  if (!secret) {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.')
  }
  
  return jwt.sign(payload, secret, {
    expiresIn: '24h', // 24시간 후 만료
    issuer: '10min-investment',
    audience: 'admin'
  })
}

export function verifyToken(token: string): JWTPayload | null {
  const secret = process.env.JWT_SECRET
  
  if (!secret) {
    throw new Error('JWT_SECRET 환경변수가 설정되지 않았습니다.')
  }
  
  try {
    const decoded = jwt.verify(token, secret, {
      issuer: '10min-investment',
      audience: 'admin'
    }) as JWTPayload
    
    return decoded
  } catch (error) {
    return null
  }
}

export function extractTokenFromHeader(authHeader: string | null): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }
  
  return authHeader.substring(7) // 'Bearer ' 제거
} 