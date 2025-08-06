export interface ValidationResult {
  isValid: boolean
  errors: string[]
}

export function validatePassword(password: string): ValidationResult {
  const errors: string[] = []
  
  if (!password) {
    errors.push('비밀번호는 필수입니다.')
  } else {
    if (typeof password !== 'string') {
      errors.push('비밀번호는 문자열이어야 합니다.')
    }
    
    if (password.length < 8) {
      errors.push('비밀번호는 최소 8자 이상이어야 합니다.')
    }
    
    if (password.length > 128) {
      errors.push('비밀번호는 최대 128자까지 가능합니다.')
    }
    
    // 비밀번호 복잡성 검증 - admin 로그인을 위해 완화
    // 기본적인 길이와 형식만 검증
    const basicPattern = /^[A-Za-z0-9@$!%*?&]{8,}$/
    
    if (!basicPattern.test(password)) {
      errors.push('비밀번호는 영문자, 숫자, 특수문자만 사용 가능하며 최소 8자 이상이어야 합니다.')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
}

export function validateAuthRequest(body: unknown): ValidationResult {
  const errors: string[] = []
  
  if (!body || typeof body !== 'object') {
    errors.push('요청 본문이 올바르지 않습니다.')
    return { isValid: false, errors }
  }
  
  const authBody = body as { password?: unknown }
  
  if (!authBody.password) {
    errors.push('비밀번호 필드가 필요합니다.')
  } else {
    // admin 로그인용 간단한 검증
    const password = String(authBody.password)
    
    if (!password) {
      errors.push('비밀번호는 필수입니다.')
    } else if (password.length < 1) {
      errors.push('비밀번호를 입력해주세요.')
    } else if (password.length > 128) {
      errors.push('비밀번호는 최대 128자까지 가능합니다.')
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 