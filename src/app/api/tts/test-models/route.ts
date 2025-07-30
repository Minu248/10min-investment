import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const TTS_MODELS = [
  "gemini-2.5-flash-preview-tts",
  "gemini-2.5-pro-preview-tts",
  "gemini-2.5-flash-preview-native-audio-dialog",
  "gemini-2.5-pro-preview-native-audio-dialog"
]

export async function GET(request: NextRequest) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const results = []

    for (const modelName of TTS_MODELS) {
      try {
        console.log(`Testing model: ${modelName}`)
        
        const model = genAI.getGenerativeModel({ model: modelName })
        const testScript = "안녕하세요, 테스트입니다."
        
        const result = await model.generateContent(testScript)
        const response = await result.response
        
        results.push({
          model: modelName,
          status: 'success',
          hasAudio: !!(response as any).audio,
          audioLength: (response as any).audio?.length || 0
        })
        
        console.log(`✅ ${modelName}: Success`)
        
      } catch (error) {
        results.push({
          model: modelName,
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        })
        
        console.log(`❌ ${modelName}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      status: 'success',
      message: 'Model test completed',
      results: results,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Model test error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Model test failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 