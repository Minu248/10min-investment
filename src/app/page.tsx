import { supabase } from '@/lib/supabase/client'
import ModernAudioPlayer from '@/components/ModernAudioPlayer'

export default async function HomePage() {
  // Supabase에서 가장 최근 팟캐스트 하나만 가져오기
  const { data: podcasts, error } = await supabase
    .from('podcasts')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)

  if (error) {
    console.error('Error fetching podcasts:', error)
    return (
      <main className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 p-8">
        <div className="max-w-md mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">10분 재테크 팟캐스트</h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800">데이터를 불러오는 데 실패했습니다.</p>
            <p className="text-red-600 text-sm mt-1">Supabase 연결을 확인해주세요.</p>
          </div>
        </div>
      </main>
    )
  }

  const latestPodcast = podcasts && podcasts.length > 0 ? podcasts[0] : null

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

        {/* 메인 오디오 플레이어 */}
        {latestPodcast ? (
          <ModernAudioPlayer podcast={latestPodcast} />
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-8 shadow-xl text-center">
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
    </main>
  )
}
