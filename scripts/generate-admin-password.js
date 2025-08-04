const bcrypt = require('bcryptjs')
const readline = require('readline')

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

async function generateHashedPassword() {
  try {
    console.log('관리자 비밀번호 해시 생성기')
    console.log('========================')
    
    rl.question('관리자 비밀번호를 입력하세요: ', async (password) => {
      if (!password || password.length < 8) {
        console.error('비밀번호는 최소 8자 이상이어야 합니다.')
        rl.close()
        return
      }
      
      // 비밀번호 해시 생성
      const saltRounds = 12
      const hashedPassword = await bcrypt.hash(password, saltRounds)
      
      console.log('\n=== 해시된 비밀번호 ===')
      console.log(hashedPassword)
      console.log('\n=== 환경변수 설정 방법 ===')
      console.log('.env.local 파일에 다음을 추가하세요:')
      console.log(`ADMIN_PASSWORD="${hashedPassword}"`)
      console.log('\n=== JWT 시크릿 생성 ===')
      
      // JWT 시크릿도 생성
      const jwtSecret = require('crypto').randomBytes(64).toString('hex')
      console.log('JWT_SECRET 환경변수도 설정하세요:')
      console.log(`JWT_SECRET="${jwtSecret}"`)
      
      console.log('\n=== 완료 ===')
      console.log('이제 보안이 강화된 인증 시스템을 사용할 수 있습니다.')
      
      rl.close()
    })
  } catch (error) {
    console.error('오류가 발생했습니다:', error)
    rl.close()
  }
}

generateHashedPassword() 