'use client'

import { useState, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'

export default function TestAudioPage() {
  const [audioUrl, setAudioUrl] = useState('')
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // 데이터베이스에서 팟캐스트 목록 가져오기
  const [podcasts, setPodcasts] = useState<any[]>([])
  const [loadingPodcasts, setLoadingPodcasts] = useState(false)

  const fetchPodcasts = async () => {
    setLoadingPodcasts(true)
    try {
      const { data, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error fetching podcasts:', error)
        setError('팟캐스트 목록을 불러오는데 실패했습니다.')
      } else {
        setPodcasts(data || [])
        console.log('Podcasts loaded:', data)
      }
    } catch (error) {
      console.error('Unexpected error:', error)
      setError('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoadingPodcasts(false)
    }
  }

  const testAudio = async (url: string) => {
    setAudioUrl(url)
    setError('')
    setLoading(true)

    if (audioRef.current) {
      try {
        console.log('Testing audio URL:', url)
        
        // 기존 이벤트 리스너 제거
        audioRef.current.onloadstart = null
        audioRef.current.oncanplay = null
        audioRef.current.onerror = null
        audioRef.current.onplay = null
        audioRef.current.onpause = null

        // 새로운 이벤트 리스너 추가
        audioRef.current.onloadstart = () => {
          console.log('Audio loading started')
          setLoading(true)
        }

        audioRef.current.oncanplay = () => {
          console.log('Audio can play')
          setLoading(false)
          setError('')
        }

        audioRef.current.onerror = (e) => {
          console.error('Audio error:', e)
          console.error('Audio error details:', audioRef.current?.error)
          setLoading(false)
          setError(`오디오 로드 실패: ${audioRef.current?.error?.message || 'Unknown error'}`)
        }

        audioRef.current.onplay = () => {
          console.log('Audio started playing')
          setIsPlaying(true)
        }

        audioRef.current.onpause = () => {
          console.log('Audio paused')
          setIsPlaying(false)
        }

        // 오디오 소스 설정
        audioRef.current.src = url
        audioRef.current.load()

        // 자동 재생 시도
        await audioRef.current.play()
      } catch (error) {
        console.error('Play error:', error)
        setLoading(false)
        setError(`재생 실패: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    }
  }

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(error => {
          console.error('Toggle play error:', error)
          setError(`재생 실패: ${error.message}`)
        })
      }
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">오디오 재생 테스트</h1>

          {/* 팟캐스트 목록 */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">등록된 팟캐스트</h2>
              <button
                onClick={fetchPodcasts}
                disabled={loadingPodcasts}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loadingPodcasts ? '로딩 중...' : '목록 새로고침'}
              </button>
            </div>

            {podcasts.length > 0 ? (
              <div className="space-y-2">
                {podcasts.map((podcast) => (
                  <div key={podcast.id} className="p-3 border rounded hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">{podcast.title}</h3>
                        <p className="text-sm text-gray-600">{podcast.audio_url}</p>
                      </div>
                      <button
                        onClick={() => testAudio(podcast.audio_url)}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                      >
                        테스트
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">등록된 팟캐스트가 없습니다.</p>
            )}
          </div>

          {/* 수동 URL 테스트 */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">수동 URL 테스트</h2>
            <div className="flex gap-2">
              <input
                type="url"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
                placeholder="오디오 파일 URL을 입력하세요"
                className="flex-1 px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={() => testAudio(audioUrl)}
                disabled={!audioUrl || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? '로딩 중...' : '테스트'}
              </button>
            </div>
          </div>

          {/* 재생 컨트롤 */}
          {audioUrl && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">재생 컨트롤</h2>
              <div className="flex items-center gap-4">
                <button
                  onClick={togglePlay}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? '로딩 중...' : isPlaying ? '일시정지' : '재생'}
                </button>
                <span className="text-sm text-gray-600">
                  현재 URL: {audioUrl}
                </span>
              </div>
            </div>
          )}

          {/* 에러 메시지 */}
          {error && (
            <div className="mb-8 p-4 bg-red-50 border border-red-200 rounded text-red-800">
              <h3 className="font-semibold mb-2">에러:</h3>
              <p>{error}</p>
            </div>
          )}

          {/* 숨겨진 오디오 엘리먼트 */}
          <audio
            ref={audioRef}
            controls
            className="w-full"
            preload="metadata"
            crossOrigin="anonymous"
          />
        </div>
      </div>
    </div>
  )
} 