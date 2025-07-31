import { supabase } from '@/lib/supabase/client'
import PodcastCard from '@/components/PodcastCard'
import GlobalAudioPlayer from '@/components/GlobalAudioPlayer'

export default async function HomePage() {
  // Supabase에서 팟캐스트 데이터 가져오기
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching podcasts:', error)
    return (
      <main className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">10분 재테크 팟캐스트</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">데이터를 불러오는 데 실패했습니다.</p>
            <p className="text-red-600 text-sm mt-1">Supabase 연결을 확인해주세요.</p>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 pb-24">
      <div className="max-w-4xl mx-auto p-8">
        {/* 헤더 */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">10분 재테크 팟캐스트</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-6">
            짧은 시간에 핵심만 담은 재테크 팟캐스트를 들어보세요.
            언제 어디서나 편리하게 재생할 수 있습니다.
          </p>
          <div className="flex gap-2 justify-center">
            <a
              href="/admin"
              className="inline-flex items-center px-4 py-2 bg-gray-800 text-white text-sm font-medium rounded-md hover:bg-gray-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              팟캐스트 등록
            </a>
            <a
              href="/test-audio"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              오디오 테스트
            </a>
          </div>
        </div>

        {/* 팟캐스트 목록 */}
        <div className="space-y-6">
          {podcasts && podcasts.length > 0 ? (
            podcasts.map((podcast) => (
              <PodcastCard key={podcast.id} podcast={podcast} />
            ))
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 팟캐스트가 없습니다</h3>
              <p className="text-gray-500">첫 번째 팟캐스트를 등록해보세요!</p>
            </div>
          )}
        </div>
      </div>

      {/* 전역 오디오 플레이어 */}
      <GlobalAudioPlayer />
    </main>
  )
}
