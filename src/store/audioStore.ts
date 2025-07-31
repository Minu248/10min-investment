import { create } from 'zustand'
import { Podcast } from '@/lib/supabase/client'

export type RepeatMode = 'none' | 'all' | 'one'

interface AudioState {
  // 현재 재생 중인 팟캐스트
  currentPodcast: Podcast | null
  // 재생 상태
  isPlaying: boolean
  // 현재 재생 시간 (초)
  currentTime: number
  // 전체 재생 시간 (초)
  duration: number
  // 볼륨 (0-1)
  volume: number
  // 오디오 엘리먼트 참조
  audioElement: HTMLAudioElement | null
  // 오디오 엘리먼트 초기화 상태
  isAudioInitialized: boolean
  // 좋아요 상태
  isLiked: boolean
  // 반복 모드
  repeatMode: RepeatMode
  // 플레이어 최소화 상태
  isMinimized: boolean
  
  // 액션들
  setCurrentPodcast: (podcast: Podcast | null) => void
  setIsPlaying: (playing: boolean) => void
  setCurrentTime: (time: number) => void
  setDuration: (duration: number) => void
  setVolume: (volume: number) => void
  setAudioElement: (element: HTMLAudioElement | null) => void
  setIsLiked: (liked: boolean) => void
  setRepeatMode: (mode: RepeatMode) => void
  setIsMinimized: (minimized: boolean) => void
}

export const useAudioStore = create<AudioState>((set, get) => ({
  currentPodcast: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.7,
  audioElement: null,
  isAudioInitialized: false,
  isLiked: false,
  repeatMode: 'none',
  isMinimized: false,

  setCurrentPodcast: (podcast) => {
    set({ currentPodcast: podcast })
  },

  setIsPlaying: (playing) => set({ isPlaying: playing }),
  
  setCurrentTime: (time) => set({ currentTime: time }),
  
  setDuration: (duration) => set({ duration }),
  
  setVolume: (volume) => {
    set({ volume })
    const { audioElement } = get()
    if (audioElement) {
      audioElement.volume = volume
    }
  },

  setAudioElement: (element) => {
    set({ 
      audioElement: element,
      isAudioInitialized: !!element 
    })
    // 기존 볼륨 설정 적용
    const { volume } = get()
    if (element && volume !== undefined) {
      element.volume = volume
    }
  },

  setIsLiked: (liked) => set({ isLiked: liked }),

  setRepeatMode: (mode) => set({ repeatMode: mode }),

  setIsMinimized: (minimized) => set({ isMinimized: minimized })
})) 