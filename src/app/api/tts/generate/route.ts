import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { createClient } from '@supabase/supabase-js'

// 서버 사이드용 Supabase 클라이언트
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

export async function POST(request: NextRequest) {
  try {
    const { podcastId, script } = await request.json()

    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    // Gemini 2.5 Flash TTS 모델 초기화
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-tts"
    })

    // 2인 화자 팟캐스트 스크립트 구성
    const audioPrompt = `
    다음은 투린이를 위한 금융 뉴스 팟캐스트입니다. 
    두 명의 화자가 자연스럽게 대화하는 형태로 진행해주세요.
    
    화자 1 (MC): 친근하고 전문적인 톤으로 진행
    화자 2 (전문가): 지식이 풍부하고 설명을 잘하는 톤
    
    스크립트:
    ${script}
    
    요구사항:
    - 자연스러운 대화체로 진행
    - 한국어 발음이 명확하고 정확하게
    - 팟캐스트다운 친근하고 전문적인 톤
    - 약 10분 분량으로 적절한 속도 조절
    `

    console.log('Generating audio with Gemini 2.5 Flash TTS...')

    // 오디오 생성 (TTS 모델은 오디오만 출력)
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: audioPrompt }] }],
      generationConfig: {
        responseMimeType: "audio/mpeg"
      }
    })
    const response = await result.response

    // 오디오 데이터 추출 (실험적 API이므로 타입 체크 우회)
    const audioData = (response as any).audio
    if (!audioData) {
      throw new Error('No audio data generated')
    }

    // 오디오 파일을 Supabase Storage에 업로드
    const fileName = `podcast-${podcastId}-${Date.now()}.mp3`
    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('podcasts')
      .upload(fileName, audioData, {
        contentType: 'audio/mpeg',
        cacheControl: '3600'
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      throw new Error(`Storage upload failed: ${uploadError.message}`)
    }

    // 공개 URL 생성
    const { data: urlData } = supabaseAdmin.storage
      .from('podcasts')
      .getPublicUrl(fileName)

    const audioUrl = urlData.publicUrl

    // 데이터베이스에 오디오 URL 업데이트
    const { data: updateData, error: updateError } = await supabaseAdmin
      .from('podcasts')
      .update({ 
        audio_url: audioUrl,
        duration_seconds: 600 // 10분으로 추정
      })
      .eq('id', podcastId)
      .select()

    if (updateError) {
      console.error('Database update error:', updateError)
      throw new Error(`Database update failed: ${updateError.message}`)
    }

    console.log('Audio generated and uploaded successfully:', audioUrl)

    return NextResponse.json({
      status: 'success',
      message: 'Audio generated successfully',
      audio: {
        url: audioUrl,
        fileName: fileName,
        podcastId: podcastId,
        duration: 600
      }
    })

  } catch (error) {
    console.error('TTS generation error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'TTS generation failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 