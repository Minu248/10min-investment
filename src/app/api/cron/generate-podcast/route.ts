import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { supabase } from '@/lib/supabaseClient'

export async function GET(request: NextRequest) {
  try {
    console.log('Cron job triggered at:', new Date().toISOString())
    
    // Step 1: Mock Data - 하드코딩된 샘플 뉴스 기사
    const mockNewsText = `
    삼성전자가 2024년 3분기 실적을 발표했다. 반도체 부문의 수요 회복과 AI 반도체의 급성장으로 인해 
    영업이익이 전년 동기 대비 280% 증가한 10조 1,600억원을 기록했다. 특히 HBM(고대역폭 메모리)과 
    AI 반도체 수요가 급증하면서 메모리 반도체 가격이 상승세를 보이고 있다. 
    
    한편, 애플은 새로운 iPhone 15 시리즈를 출시하며 AI 기능을 대폭 강화했다. 
    A17 Pro 칩을 탑재한 Pro 모델은 게임 성능과 AI 처리 능력이 크게 향상되었다. 
    시장에서는 애플의 AI 전략이 삼성전자와의 경쟁을 더욱 치열하게 만들 것으로 전망하고 있다.
    
    국내 주식시장에서는 KOSPI가 2,500선을 회복하며 상승세를 보이고 있다. 
    외국인 투자자들의 순매수세와 기관투자자들의 관심이 증가하면서 시장 낙관론이 확산되고 있다. 
    특히 반도체, 2차전지, 바이오 등 테마주들이 강세를 보이고 있다.
    
    미국 연방준비제도(Fed)는 기준금리를 현재 수준으로 유지한다고 발표했다. 
    인플레이션 압력이 완화되고 있지만, 경제 성장세를 고려해 신중한 정책을 유지한다는 입장이다. 
    시장에서는 내년 상반기 금리 인하 가능성을 점치고 있다.
    `

    // Step 2: Initialize API Clients
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
    
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not configured')
    }

    // Step 3: Call Gemini API for Summary
    const model = genAI.getGenerativeModel({ model: "gemini-pro" })
    
    const prompt = `
    다음은 오늘의 주요 금융 뉴스입니다. 초보 투자자들이 이해하기 쉽게 10분 분량의 팟캐스트 스크립트로 요약해주세요.
    
    요구사항:
    - 초보 투자자도 이해할 수 있는 쉬운 용어 사용
    - 핵심 포인트만 선별하여 10분 분량으로 요약
    - 투자에 도움이 되는 인사이트 포함
    - 자연스러운 대화체로 작성
    
    뉴스 내용:
    ${mockNewsText}
    
    팟캐스트 스크립트를 작성해주세요.
    `

    const result = await model.generateContent(prompt)
    const response = await result.response
    const summaryText = response.text()

    if (!summaryText) {
      throw new Error('Failed to generate summary from Gemini API')
    }

    // Step 4: Store the Result in Supabase
    const today = new Date().toISOString().split('T')[0]
    const podcastData = {
      title: `오늘의 재테크 요약 - ${today}`,
      episode_date: today,
      summary_text: summaryText,
      script_json: {
        speaker1: "안녕하세요, 오늘의 재테크 요약을 시작하겠습니다.",
        speaker2: "네, 오늘도 유용한 투자 정보를 전해드리겠습니다.",
        content: summaryText
      },
      audio_url: null, // 나중에 TTS로 생성된 오디오 URL로 업데이트
      duration_seconds: 600 // 10분 = 600초
    }

    const { data, error } = await supabase
      .from('podcasts')
      .insert([podcastData])
      .select()

    if (error) {
      console.error('Supabase insertion error:', error)
      throw new Error(`Database insertion failed: ${error.message}`)
    }

    // Step 5: Return Success Response
    console.log('Podcast generated successfully:', data[0].id)
    
    return NextResponse.json({
      status: 'success',
      message: 'Podcast generated successfully',
      podcast: {
        id: data[0].id,
        title: data[0].title,
        summary_length: summaryText.length,
        generated_at: new Date().toISOString()
      },
      summary_preview: summaryText.substring(0, 200) + '...'
    })

  } catch (error) {
    console.error('Cron job error:', error)
    
    return NextResponse.json(
      {
        status: 'error',
        message: 'Cron job failed',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 