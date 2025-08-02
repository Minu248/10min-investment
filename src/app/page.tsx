'use client'

import { useEffect, useState } from 'react'
import { supabase, Podcast } from '@/lib/supabase/client'
import ModernAudioPlayer from '@/components/ModernAudioPlayer'

export default function HomePage() {
  const [latestPodcast, setLatestPodcast] = useState<Podcast | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 최신 팟캐스트 가져오기
  const fetchLatestPodcast = async () => {
    try {
      setLoading(true)
      const { data: podcasts, error } = await supabase
        .from('podcasts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1)

      if (error) {
        console.error('Error fetching podcasts:', error)
        setError('데이터를 불러오는 데 실패했습니다.')
      } else {
        setLatestPodcast(podcasts && podcasts.length > 0 ? podcasts[0] : null)
        setError(null)
      }
    } catch (err) {
      console.error('Unexpected error:', err)
      setError('예상치 못한 오류가 발생했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 컴포넌트 마운트 시 최신 팟캐스트 가져오기
  useEffect(() => {
    fetchLatestPodcast()
  }, [])

  // 실시간 업데이트를 위한 Supabase 구독
  useEffect(() => {
    const channel = supabase
      .channel('podcasts_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'podcasts'
        },
        () => {
          // 새로운 팟캐스트가 추가되거나 변경되면 최신 팟캐스트 다시 가져오기
          fetchLatestPodcast()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  return (
    <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">10분 재테크</h1>
          <p className="text-sm text-gray-600">
            최신 재테크 팟캐스트를 들어보세요
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <a
              href="/admin"
              className="inline-flex items-center px-3 py-1 bg-gray-800 text-white text-xs font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              등록
            </a>
          </div>
        </div>

        {/* 로딩 상태 */}
        {loading && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">로딩 중...</h3>
            <p className="text-gray-500">팟캐스트를 불러오는 중입니다</p>
          </div>
        )}

        {/* 에러 상태 */}
        {error && !loading && (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">오류가 발생했습니다</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchLatestPodcast}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            >
              다시 시도
            </button>
          </div>
        )}

        {/* 메인 오디오 플레이어 */}
        {!loading && !error && latestPodcast ? (
          <ModernAudioPlayer podcast={latestPodcast} />
        ) : !loading && !error && !latestPodcast ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">아직 팟캐스트가 없습니다</h3>
            <p className="text-gray-500">첫 번째 팟캐스트를 등록해보세요!</p>
          </div>
        ) : null}
      </div>
    </main>
  )
}
