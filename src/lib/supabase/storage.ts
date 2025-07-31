import { supabase } from './client'

export interface UploadResult {
  url: string
  path: string
  size: number
}

// 파일명을 안전한 형식으로 변환하는 함수
function sanitizeFileName(fileName: string): string {
  // 한글, 특수문자, 공백을 제거하고 영문/숫자/하이픈/언더스코어만 허용
  return fileName
    .replace(/[^a-zA-Z0-9\-_]/g, '') // 영문, 숫자, 하이픈, 언더스코어만 남김
    .replace(/[-_]+/g, '-') // 연속된 하이픈/언더스코어를 하나로
    .replace(/^-|-$/g, '') // 앞뒤 하이픈 제거
    .toLowerCase() // 소문자로 변환
}

export async function uploadAudioFile(
  file: File,
  fileName?: string
): Promise<UploadResult> {
  try {
    console.log('Upload started:', { fileName: file.name, size: file.size, type: file.type })
    
    // 파일 확장자 검증
    const allowedTypes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/m4a']
    if (!allowedTypes.includes(file.type)) {
      throw new Error('지원하지 않는 오디오 파일 형식입니다. MP3, WAV, OGG, M4A 파일만 업로드 가능합니다.')
    }

    // 파일 크기 제한 (50MB - Supabase 기본 제한)
    const maxSize = 50 * 1024 * 1024 // 50MB
    if (file.size > maxSize) {
      throw new Error('파일 크기가 너무 큽니다. 50MB 이하의 파일만 업로드 가능합니다.')
    }

    // 고유한 파일명 생성 (안전한 형식으로 변환)
    const timestamp = Date.now()
    const fileExtension = file.name.split('.').pop()?.toLowerCase()
    const safeFileName = fileName ? sanitizeFileName(fileName) : 'podcast'
    const uniqueFileName = `${safeFileName}-${timestamp}.${fileExtension}`

    console.log('Generated filename:', uniqueFileName)

    // Supabase 클라이언트 상태 확인
    if (!supabase) {
      throw new Error('Supabase 클라이언트가 초기화되지 않았습니다.')
    }

    // Storage 버킷 존재 확인 (인증 문제로 인해 직접 업로드 시도)
    console.log('Skipping bucket list check due to authentication requirements')
    console.log('Attempting direct upload to podcast-audio bucket...')

    // Supabase Storage에 파일 업로드
    const { data, error } = await supabase.storage
      .from('podcast-audio')
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Upload error details:', error)
      
      // 구체적인 에러 메시지 제공
      if (error.message.includes('JWT')) {
        throw new Error('인증 토큰이 유효하지 않습니다. Supabase 설정을 확인해주세요.')
      } else if (error.message.includes('bucket')) {
        throw new Error('Storage 버킷에 접근할 수 없습니다. 버킷 설정을 확인해주세요.')
      } else if (error.message.includes('policy')) {
        throw new Error('파일 업로드 권한이 없습니다. Storage 정책을 확인해주세요.')
      } else {
        throw new Error(`파일 업로드에 실패했습니다: ${error.message}`)
      }
    }

    if (!data) {
      throw new Error('업로드된 파일 데이터를 받을 수 없습니다.')
    }

    console.log('Upload successful:', data)

    // 공개 URL 생성
    const { data: urlData } = supabase.storage
      .from('podcast-audio')
      .getPublicUrl(uniqueFileName)

    if (!urlData?.publicUrl) {
      throw new Error('공개 URL을 생성할 수 없습니다.')
    }

    console.log('Public URL generated:', urlData.publicUrl)

    return {
      url: urlData.publicUrl,
      path: uniqueFileName,
      size: file.size
    }
  } catch (error) {
    console.error('Upload utility error:', error)
    throw error
  }
}

export async function deleteAudioFile(filePath: string): Promise<void> {
  try {
    const { error } = await supabase.storage
      .from('podcast-audio')
      .remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      throw new Error('파일 삭제에 실패했습니다.')
    }
  } catch (error) {
    console.error('Delete utility error:', error)
    throw error
  }
}

// 오디오 파일의 재생 시간을 가져오는 함수
export function getAudioDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const audio = new Audio()
    const url = URL.createObjectURL(file)
    
    audio.addEventListener('loadedmetadata', () => {
      URL.revokeObjectURL(url)
      resolve(Math.round(audio.duration))
    })
    
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url)
      reject(new Error('오디오 파일을 읽을 수 없습니다.'))
    })
    
    audio.src = url
  })
} 