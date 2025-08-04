import { supabase } from './client'

export async function testSupabaseConnection() {
  try {
    console.log('🔍 Supabase 연결 테스트 시작...')
    
    // 1. 기본 연결 테스트
    const { error } = await supabase.from('podcasts').select('count').limit(1)
    
    if (error) {
      console.error('❌ 데이터베이스 연결 실패:', error)
      return { success: false, error: '데이터베이스 연결 실패' }
    }
    
    console.log('✅ 데이터베이스 연결 성공')
    
    // 2. Storage 연결 테스트
    const { error: storageError } = await supabase.storage
      .from('podcast-audio')
      .list('', { limit: 1 })
    
    if (storageError) {
      console.error('❌ Storage 연결 실패:', storageError)
      return { success: false, error: 'Storage 연결 실패' }
    }
    
    console.log('✅ Storage 연결 성공')
    
    return { success: true, message: '모든 연결이 정상입니다!' }
    
  } catch (error) {
    console.error('❌ 연결 테스트 중 오류:', error)
    return { success: false, error: '연결 테스트 실패' }
  }
}

// 브라우저 콘솔에서 실행할 수 있는 함수
export function runConnectionTest() {
  testSupabaseConnection().then(result => {
    if (result.success) {
      console.log('🎉', result.message)
    } else {
      console.error('💥', result.error)
    }
  })
} 