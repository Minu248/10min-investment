# 보안 설정 가이드

## 개요
이 프로젝트는 강화된 보안 기능을 포함한 관리자 인증 시스템을 구현했습니다.

## 구현된 보안 기능

### 1. Rate Limiting (속도 제한)
- IP 주소별로 15분에 최대 5회 인증 시도 제한
- 브루트 포스 공격 방지
- 실패한 시도에 대한 상세한 로깅

### 2. 입력 검증
- 비밀번호 형식 검증 (최소 8자, 최대 128자)
- 특수문자, 숫자, 대소문자 포함 요구사항
- JSON 파싱 오류 처리

### 3. 비밀번호 보안
- bcrypt를 사용한 비밀번호 해싱 (salt rounds: 12)
- 평문 비밀번호 비교 제거
- 환경변수를 통한 안전한 비밀번호 관리

### 4. JWT 토큰 인증
- 24시간 만료 시간
- 서명된 토큰으로 무결성 보장
- HttpOnly 쿠키를 통한 XSS 방지

### 5. 보안 로깅
- 모든 인증 시도 로깅
- IP 주소, User-Agent, 성공/실패 여부 기록
- 의심스러운 활동 감지 가능

## 환경변수 설정

### 1. 비밀번호 해시 생성
```bash
node scripts/generate-admin-password.js
```

### 2. .env.local 파일 생성
```env
# 관리자 비밀번호 (해시된 값)
ADMIN_PASSWORD="$2b$12$..."

# JWT 시크릿 키
JWT_SECRET="your-64-character-secret-key"
```

## API 엔드포인트

### 인증
- `POST /api/admin/auth` - 로그인
- `POST /api/admin/logout` - 로그아웃 (인증 필요)

### 요청 예시
```javascript
// 로그인
const response = await fetch('/api/admin/auth', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    password: 'your-password'
  })
})

// 보호된 API 호출
const protectedResponse = await fetch('/api/admin/protected', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
})
```

## 보안 모범 사례

### 1. 프로덕션 환경
- 강력한 비밀번호 사용
- HTTPS 필수
- 환경변수 안전한 관리
- 정기적인 로그 모니터링

### 2. 추가 보안 고려사항
- 2FA (Two-Factor Authentication) 구현
- 세션 관리 개선
- IP 화이트리스트
- 실패한 로그인 시도 알림

### 3. 모니터링
- 로그 파일 정기적 검토
- 비정상적인 접근 패턴 감지
- 보안 이벤트 알림 설정

## 문제 해결

### 일반적인 문제
1. **환경변수 미설정**: ADMIN_PASSWORD와 JWT_SECRET이 설정되지 않은 경우
2. **Rate Limit 초과**: 너무 많은 로그인 시도
3. **토큰 만료**: 24시간 후 자동 만료

### 디버깅
- 서버 로그 확인
- 브라우저 개발자 도구에서 네트워크 탭 확인
- 환경변수 설정 상태 확인 