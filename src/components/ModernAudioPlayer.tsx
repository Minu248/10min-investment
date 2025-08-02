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

    isLiked,
    repeatMode,
    isMinimized,
    setCurrentPodcast,
    setIsPlaying,
    setCurrentTime,
    setDuration,
    setAudioElement,
    setIsLiked,
    setRepeatMode,
    setIsMinimized
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
    if (repeatMode === 'one') {
      // 한 곡 반복
      if (audioRef.current) {
        audioRef.current.currentTime = 0
        audioRef.current.play()
      }
    } else {
      setIsPlaying(false)
      setCurrentTime(0)
    }
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

  const toggleRepeat = () => {
    const modes = ['none', 'all', 'one'] as const
    const currentIndex = modes.indexOf(repeatMode)
    const nextIndex = (currentIndex + 1) % modes.length
    setRepeatMode(modes[nextIndex])
  }

  const toggleLike = () => {
    setIsLiked(!isLiked)
    // 여기에 서버에 좋아요 상태 저장하는 로직 추가 가능
  }

  const getRepeatIcon = () => {
    switch (repeatMode) {
      case 'all':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
        )
      case 'one':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
            <text x="12" y="14" fontSize="8" textAnchor="middle" fill="currentColor">1</text>
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>
          </svg>
        )
    }
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg z-50">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMinimized(false)}
            className="text-gray-600 hover:text-gray-800"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button
            onClick={handleTogglePlay}
            className="w-10 h-10 bg-rose-500 text-white rounded-full flex items-center justify-center hover:bg-rose-600 transition-colors"
          >
            {isPlaying ? (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <rect x="6" y="4" width="4" height="16"/>
                <rect x="14" y="4" width="4" height="16"/>
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
          <div className="text-sm">
            <div className="font-medium text-gray-900 truncate w-32">{podcast.title}</div>
          </div>
        </div>
      </div>
    )
  }

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
      <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-6 shadow-xl">
        {/* 상단 아이콘 */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => setIsMinimized(true)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
          <button className="text-gray-400 hover:text-gray-600 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

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
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{podcast.title}</h2>
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

        {/* 컨트롤 버튼 */}
        <div className="flex items-center justify-center gap-6 mb-6">
          {/* 이전 곡 */}
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
            </svg>
          </button>

          {/* 재생/일시정지 */}
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

          {/* 다음 곡 */}
          <button className="text-gray-600 hover:text-gray-800 transition-colors">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
            </svg>
          </button>
        </div>

        {/* 하단 아이콘 */}
        <div className="flex items-center justify-between">
          {/* 반복 재생 */}
          <button
            onClick={toggleRepeat}
            className={`transition-colors ${repeatMode !== 'none' ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {getRepeatIcon()}
          </button>

          {/* 좋아요 */}
          <button
            onClick={toggleLike}
            className={`transition-colors ${isLiked ? 'text-rose-500' : 'text-gray-400 hover:text-gray-600'}`}
          >
            {isLiked ? (
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </>
  )
}