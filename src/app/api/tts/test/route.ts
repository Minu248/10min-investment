import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    // Gemini 2.5 Flash TTS 모델 초기화
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash-preview-tts"
    })

    // 간단한 테스트 스크립트
    const testScript = `
    안녕하세요, 투린이 여러분! 
    오늘은 간단한 테스트를 위해 짧은 팟캐스트를 만들어보겠습니다.
    이 음성이 잘 들리시나요?
    `

    console.log('Testing TTS with Gemini 2.5 Flash TTS...')

    // 오디오 생성 (TTS 모델은 오디오만 출력)
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: testScript }] }],
      generationConfig: {
        responseMimeType: "audio/mpeg"
      }
    })
    
    const response = await result.response

    // 오디오 데이터 확인
    const audioData = (response as any).audio
    if (!audioData) {
      return NextResponse.json({
        status: 'error',
        message: 'No audio data generated',
        model: 'gemini-2.5-flash-preview-tts'
      })
    }

    return NextResponse.json({
      status: 'success',
      message: 'TTS test successful',
      audioDataLength: audioData.length,
      model: 'gemini-2.5-flash-preview-tts',
      mimeType: 'audio/mpeg'
    })

  } catch (error) {
    console.error('TTS test error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'TTS test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 