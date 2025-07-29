'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'

export default function TestPage() {
  const [status, setStatus] = useState<string>('테스트 중...')
  const [podcasts, setPodcasts] = useState<any[]>([])

  useEffect(() => {
    testSupabaseConnection()
  }, [])

  const testSupabaseConnection = async () => {
    try {
      // API를 통해 Supabase 연결 테스트
      const response = await fetch('/api/podcasts')
      const result = await response.json()

      if (!response.ok) {
        setStatus(`연결 오류: ${result.error}`)
        console.error('API error:', result.error)
      } else {
        setStatus('Supabase 연결 성공!')
        setPodcasts(result.podcasts || [])
        console.log('Podcasts data:', result.podcasts)
      }
    } catch (error) {
      setStatus(`예상치 못한 오류: ${error}`)
      console.error('Unexpected error:', error)
    }
  }

  const addTestPodcast = async () => {
    try {
      const testPodcast = {
        title: '테스트 팟캐스트',
        episode_date: new Date().toISOString().split('T')[0],
        summary_text: '이것은 테스트용 팟캐스트입니다.',
        script_json: { speaker1: '안녕하세요', speaker2: '반갑습니다' },
        audio_url: null,
        duration_seconds: 600
      }

      const response = await fetch('/api/podcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPodcast),
      })

      const result = await response.json()

      if (!response.ok) {
        setStatus(`데이터 삽입 오류: ${result.error}`)
      } else {
        setStatus('테스트 팟캐스트 추가 성공!')
        testSupabaseConnection() // 목록 새로고침
      }
    } catch (error) {
      setStatus(`예상치 못한 오류: ${error}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Supabase 연결 테스트
          </h1>
          
          <div className="mb-8">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <h2 className="text-lg font-semibold text-blue-900 mb-2">연결 상태</h2>
              <p className="text-blue-800">{status}</p>
            </div>
          </div>

          <div className="mb-8">
            <button
              onClick={addTestPodcast}
              className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-md transition-colors"
            >
              테스트 팟캐스트 추가
            </button>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              저장된 팟캐스트 목록 ({podcasts.length}개)
            </h2>
            {podcasts.length === 0 ? (
              <p className="text-gray-500">저장된 팟캐스트가 없습니다.</p>
            ) : (
              <div className="space-y-4">
                {podcasts.map((podcast) => (
                  <div key={podcast.id} className="border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-900">{podcast.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      날짜: {podcast.episode_date}
                    </p>
                    {podcast.summary_text && (
                      <p className="text-sm text-gray-700 mt-2">
                        요약: {podcast.summary_text.substring(0, 100)}...
                      </p>
                    )}
                    {podcast.audio_url && (
                      <div className="mt-3">
                        <audio controls className="w-full">
                          <source src={podcast.audio_url} type="audio/mpeg" />
                          Your browser does not support the audio element.
                        </audio>
                        <p className="text-xs text-green-600 mt-1">
                          🎵 오디오 재생 가능
                        </p>
                      </div>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                      ID: {podcast.id}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 