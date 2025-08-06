'use client'

import { useEffect, useRef, useState } from 'react'
import { useAudioStore } from '@/store/audioStore'
import { Podcast } from '@/lib/supabase/client'
import AudioVisualization from './AudioVisualization'

interface ModernAudioPlayerProps {
  podcast: Podcast
}

export default function ModernAudioPlayer({ podcast }: ModernAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const progressRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const {
    isPlaying,
    currentTime,
    duration,
    setCurrentPodcast,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setAudioElement
  } = useAudioStore()

  useEffect(() => {
    if (audioRef.current) {
      setAudioElement(audioRef.current)
      setCurrentPodcast(podcast)
      
      // 오디오 URL 설정
      audioRef.current.src = podcast.audio_url
      audioRef.current.load()
      
      // 새로운 팟캐스트가 로드되면 재생 상태 초기화
      setIsPlaying(false)
      setCurrentTime(0)
      setDuration(0)
    }
  }, [podcast, setAudioElement, setCurrentPodcast, setIsPlaying, setCurrentTime, setDuration])

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleTimeUpdate = () => {
    if (audioRef.current && !isDragging) {
      setCurrentTime(audioRef.current.currentTime)
    }
  }

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration)
    }
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  const handleTogglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play().catch(error => {
          console.error('Play error:', error)
        })
      }
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (progressRef.current && audioRef.current && duration > 0) {
      const rect = progressRef.current.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      const newTime = percentage * duration
      
      audioRef.current.currentTime = newTime
      setCurrentTime(newTime)
    }
  }

  const handleProgressMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    handleProgressClick(e)
  }

  const handleProgressMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      handleProgressClick(e)
    }
  }

  const handleProgressMouseUp = () => {
    setIsDragging(false)
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <>
      {/* 숨겨진 오디오 엘리먼트 */}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="metadata"
        crossOrigin="anonymous"
        style={{ display: 'none' }}
      />

      {/* 메인 플레이어 UI */}
      <div className="bg-gradient-to-br from-blue-100 to-purple-90 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
        {/* 오디오 시각화 */}
        <div className="flex justify-center mb-6">
          <AudioVisualization 
            audioElement={audioRef.current} 
            isPlaying={isPlaying}
            size={192}
          />
        </div>

        {/* 곡 정보 */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-1">{podcast.title}</h2>
          <p className="text-gray-600">{podcast.summary || '10분 재테크'}</p>
        </div>

        {/* 재생 바 */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
          <div
            ref={progressRef}
            className="relative h-2 bg-gray-200 rounded-full cursor-pointer"
            onClick={handleProgressClick}
            onMouseDown={handleProgressMouseDown}
            onMouseMove={handleProgressMouseMove}
            onMouseUp={handleProgressMouseUp}
            onMouseLeave={handleProgressMouseUp}
          >
            <div
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-rose-400 to-red-500 rounded-full transition-all duration-100"
              style={{ width: `${progressPercentage}%` }}
            ></div>
            {/* 드래그 핸들 */}
            <div
              className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-rose-500 rounded-full shadow-lg transition-all duration-100"
              style={{ left: `calc(${progressPercentage}% - 8px)` }}
            ></div>
          </div>
        </div>

        {/* 재생/일시정지 버튼 */}
        <div className="flex items-center justify-center mb-4">
          <button
            onClick={handleTogglePlay}
            className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          >
            {isPlaying ? (
              <svg className="w-6 h-6 text-gray-800" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg className="w-6 h-6 text-gray-800 ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>

        {/* 공유하기 버튼 */}
        <div className="flex items-center justify-center">
          <button
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: podcast.title,
                  text: podcast.summary || '10분 재테크',
                  url: window.location.href
                }).catch(console.error)
              } else {
                // Web Share API를 지원하지 않는 경우 클립보드에 복사
                navigator.clipboard.writeText(window.location.href)
                  .then(() => alert('링크가 클립보드에 복사되었습니다!'))
                  .catch(console.error)
              }
            }}
            className="flex items-center gap-2 px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-full transition-colors mt-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
            </svg>
            <span className="text-sm font-medium">공유하기</span>
          </button>
        </div>
      </div>
    </>
  )
}