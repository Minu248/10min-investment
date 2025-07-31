'use client'

import { useState, useEffect } from 'react'
import { Podcast } from '@/lib/supabase/client'
import { useAudioStore } from '@/store/audioStore'

interface PodcastCardProps {
  podcast: Podcast
}

export default function PodcastCard({ podcast }: PodcastCardProps) {
  const { 
    currentPodcast, 
    setCurrentPodcast, 
    isPlaying,
    setIsPlaying,
    audioElement,
    isAudioInitialized
  } = useAudioStore()
  
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  
  const isCurrentPodcast = currentPodcast?.id === podcast.id

  // 디버깅을 위한 로그
  useEffect(() => {
    console.log('PodcastCard - isAudioInitialized:', isAudioInitialized)
    console.log('PodcastCard - audioElement:', !!audioElement)
  }, [isAudioInitialized, audioElement])

  const handlePlayClick = async () => {
    console.log('Play button clicked')
    console.log('isAudioInitialized:', isAudioInitialized)
    console.log('audioElement:', !!audioElement)
    
    // 오디오 엘리먼트가 있으면 재생 시도 (초기화 상태와 관계없이)
    if (!audioElement) {
      setError('오디오 플레이어를 초기화하는 중입니다. 잠시 후 다시 시도해주세요.')
      return
    }

    if (isCurrentPodcast && isPlaying) {
      // 현재 팟캐스트가 재생 중이면 일시정지
      audioElement.pause()
    } else {
      // 새로운 팟캐스트 재생 또는 재생 시작
      setCurrentPodcast(podcast)
      setIsLoading(true)
      setError('')

      try {
        // 기존 이벤트 리스너 제거
        audioElement.onloadstart = null
        audioElement.oncanplay = null
        audioElement.onerror = null

        // 새로운 이벤트 리스너 추가
        audioElement.onloadstart = () => {
          console.log('Audio loading started')
          setIsLoading(true)
        }

        audioElement.oncanplay = () => {
          console.log('Audio can play')
          setIsLoading(false)
          setError('')
        }

        audioElement.onerror = (e) => {
          console.error('Audio error:', e)
          setIsLoading(false)
          setError('오디오 파일을 로드할 수 없습니다.')
        }

        // 오디오 소스 설정
        audioElement.src = podcast.audio_url
        audioElement.load()

        // 자동 재생 시도
        await audioElement.play()
      } catch (error) {
        console.error('Play error:', error)
        setIsLoading(false)
        setError('재생에 실패했습니다.')
      }
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const isButtonDisabled = isLoading || !audioElement

  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start gap-4">
        {/* 썸네일/아이콘 */}
        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
          <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
          </svg>
        </div>

        {/* 콘텐츠 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
            {podcast.title}
          </h3>
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {podcast.summary}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span>{formatDuration(podcast.duration)}</span>
              <span>•</span>
              <span>{new Date(podcast.created_at).toLocaleDateString('ko-KR')}</span>
            </div>

            {/* 재생 버튼 */}
            <button
              onClick={handlePlayClick}
              disabled={isButtonDisabled}
              className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                isButtonDisabled
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : isCurrentPodcast && isPlaying
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              }`}
              title={isButtonDisabled ? '오디오 플레이어 초기화 중...' : '재생'}
            >
              {isLoading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : isCurrentPodcast && isPlaying ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
              )}
            </button>
          </div>

          {/* 디버깅 정보 */}
          <div className="mt-2 text-xs text-gray-400">
            오디오: {audioElement ? '있음' : '없음'} | 
            초기화: {isAudioInitialized ? '완료' : '대기 중'} | 
            버튼: {isButtonDisabled ? '비활성화' : '활성화'}
          </div>

          {/* 에러 메시지 */}
          {error && (
            <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-red-800 text-xs">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 