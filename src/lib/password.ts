import bcrypt from 'bcryptjs'

// 환경변수에서 큰따옴표 제거하는 함수
function cleanEnvironmentVariable(value: string | undefined): string | undefined {
  if (!value) return undefined
  // 앞뒤 큰따옴표 제거
  return value.replace(/^"|"$/g, '')
}

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12 // 보안을 위해 높은 salt rounds 사용
  return bcrypt.hash(password, saltRounds)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function getHashedAdminPassword(): string {
  const rawAdminPassword = process.env.ADMIN_PASSWORD
  const adminPassword = cleanEnvironmentVariable(rawAdminPassword)
  
  if (!adminPassword) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('프로덕션 환경에서 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다. 보안상 하드코딩된 비밀번호를 사용할 수 없습니다.')
    }
    
    // 개발 환경에서만 임시 비밀번호 사용 (경고와 함께)
    console.warn('⚠️  개발 환경: 환경변수 ADMIN_PASSWORD가 설정되지 않아 임시 비밀번호를 사용합니다.')
    console.warn('⚠️  프로덕션 배포 전 반드시 ADMIN_PASSWORD 환경변수를 설정하세요.')
    console.warn('⚠️  개발 환경 임시 비밀번호: admin')
    return '$2b$12$WcLEY7ePIEw9wjUxviUvren7nkrTqNDFby5FJsiQyya5LNafBjOWC'
  }
  
  return adminPassword
} 