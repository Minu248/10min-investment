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
    
    // 비밀번호 복잡성 검증
    // 프로덕션 환경에서는 엄격한 규칙 적용, 개발 환경에서는 더 관대한 규칙 사용
    const complexityPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/
    
    if (!complexityPattern.test(password)) {
      if (process.env.NODE_ENV === 'production') {
        errors.push('비밀번호는 대소문자, 숫자, 특수문자를 포함해야 합니다.')
      } else {
        // 개발 환경에서는 복잡성 요구사항을 경고로만 표시
        console.warn('개발 환경: 비밀번호 복잡성 요구사항이 완화되었습니다. 프로덕션에서는 더 엄격한 규칙이 적용됩니다.')
      }
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
    const passwordValidation = validatePassword(String(authBody.password))
    if (!passwordValidation.isValid) {
      errors.push(...passwordValidation.errors)
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  }
} 