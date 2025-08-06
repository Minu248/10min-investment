export function debugEnvironmentVariables() {
  // 프로덕션 환경에서는 민감한 정보 로깅 방지
  if (process.env.NODE_ENV === 'production') {
    console.log('=== 환경변수 디버깅 ===')
    console.log('NODE_ENV: production (민감한 정보 로깅 비활성화)')
    console.log('========================')
    return
  }

  console.log('=== 환경변수 디버깅 ===')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('ADMIN_PASSWORD exists:', !!process.env.ADMIN_PASSWORD)
  console.log('ADMIN_PASSWORD length:', process.env.ADMIN_PASSWORD?.length)
  console.log('ADMIN_PASSWORD starts with $2b$12$:', process.env.ADMIN_PASSWORD?.startsWith('$2b$12$'))
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)
  console.log('========================')
} 