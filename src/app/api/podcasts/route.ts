import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { CreatePodcastData } from '@/lib/supabase/client'

// GET: 모든 팟캐스트 조회
export async function GET() {
  try {
    const { data: podcasts, error } = await supabase
      .from('podcasts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching podcasts:', error)
      return NextResponse.json(
        { error: '팟캐스트 목록을 불러오는데 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json(podcasts)
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// POST: 새 팟캐스트 등록
export async function POST(request: NextRequest) {
  try {
    console.log('API: POST request received')
    
    const body: CreatePodcastData = await request.json()
    console.log('API: Request body:', body)
    
    // 필수 필드 검증
    if (!body.title) {
      console.log('API: Missing title')
      return NextResponse.json(
        { error: '제목은 필수입니다.' },
        { status: 400 }
      )
    }

    if (!body.audio_url) {
      console.log('API: Missing audio_url')
      return NextResponse.json(
        { error: '오디오 URL은 필수입니다.' },
        { status: 400 }
      )
    }

    if (!body.duration || body.duration <= 0) {
      console.log('API: Invalid duration:', body.duration)
      return NextResponse.json(
        { error: '유효한 재생 시간을 입력해주세요.' },
        { status: 400 }
      )
    }

    // URL 형식 검증
    try {
      new URL(body.audio_url)
    } catch {
      console.log('API: Invalid URL format:', body.audio_url)
      return NextResponse.json(
        { error: '유효한 오디오 URL을 입력해주세요.' },
        { status: 400 }
      )
    }

    console.log('API: Attempting to insert podcast into database')
    
    const { data: podcast, error } = await supabase
      .from('podcasts')
      .insert([body])
      .select()
      .single()

    if (error) {
      console.error('API: Database error:', error)
      console.error('API: Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code
      })
      return NextResponse.json(
        { error: `팟캐스트 등록에 실패했습니다: ${error.message}` },
        { status: 500 }
      )
    }

    console.log('API: Podcast created successfully:', podcast)
    return NextResponse.json(podcast, { status: 201 })
  } catch (error) {
    console.error('API: Unexpected error:', error)
    console.error('API: Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    return NextResponse.json(
      { error: `서버 오류가 발생했습니다: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    )
  }
} 