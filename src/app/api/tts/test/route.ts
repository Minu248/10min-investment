import { NextRequest, NextResponse } from 'next/server'
import { TextToSpeechClient } from '@google-cloud/text-to-speech'

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      throw new Error('GOOGLE_APPLICATION_CREDENTIALS is not configured')
    }

    // Google Cloud Text-to-Speech 클라이언트 초기화
    const client = new TextToSpeechClient()

    // 간단한 테스트 스크립트
    const testScript = `
    안녕하세요, 투린이 여러분! 
    오늘은 간단한 테스트를 위해 짧은 팟캐스트를 만들어보겠습니다.
    이 음성이 잘 들리시나요?
    `

    console.log('Testing Google Cloud Text-to-Speech...')

    // TTS 요청 구성
    const request = {
      input: { text: testScript },
      voice: {
        languageCode: 'ko-KR',
        name: 'ko-KR-Neural2-A', // 한국어 여성 음성
        ssmlGender: 'FEMALE' as const
      },
      audioConfig: {
        audioEncoding: 'MP3' as const,
        speakingRate: 0.9, // 약간 느리게
        pitch: 0.0,
        volumeGainDb: 0.0
      }
    }

    // TTS API 호출
    const [response] = await client.synthesizeSpeech(request)
    
    if (!response.audioContent) {
      return NextResponse.json({
        status: 'error',
        message: 'No audio data generated',
        service: 'Google Cloud Text-to-Speech'
      })
    }

    // 오디오 데이터를 Buffer로 변환
    const audioBuffer = Buffer.from(response.audioContent)

    return NextResponse.json({
      status: 'success',
      message: 'TTS test successful',
      audioDataLength: audioBuffer.length,
      service: 'Google Cloud Text-to-Speech',
      mimeType: 'audio/mp3',
      bufferSize: audioBuffer.byteLength
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