export function debugEnvironmentVariables() {
  console.log('=== 환경변수 디버깅 ===')
  console.log('NODE_ENV:', process.env.NODE_ENV)
  console.log('ADMIN_PASSWORD exists:', !!process.env.ADMIN_PASSWORD)
  console.log('ADMIN_PASSWORD length:', process.env.ADMIN_PASSWORD?.length)
  console.log('ADMIN_PASSWORD starts with $2b$12$:', process.env.ADMIN_PASSWORD?.startsWith('$2b$12$'))
  console.log('ADMIN_PASSWORD contains quotes:', process.env.ADMIN_PASSWORD?.includes('"'))
  console.log('ADMIN_PASSWORD raw value:', `"${process.env.ADMIN_PASSWORD}"`)
  console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET)
  console.log('JWT_SECRET length:', process.env.JWT_SECRET?.length)
  console.log('JWT_SECRET starts with:', process.env.JWT_SECRET?.substring(0, 10))
  console.log('========================')
} 