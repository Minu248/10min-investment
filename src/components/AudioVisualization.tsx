'use client'

import { useEffect, useRef, useCallback } from 'react'

interface AudioVisualizationProps {
  audioElement: HTMLAudioElement | null
  isPlaying: boolean
  size?: number
}

export default function AudioVisualization({ 
  audioElement, 
  isPlaying, 
  size = 192 
}: AudioVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null)
  const animationIdRef = useRef<number | null>(null)
  
  // 물결 애니메이션을 위한 시간 상태
  const timeRef = useRef(0)

  const initializeAudio = useCallback(async () => {
    if (!audioElement || audioContextRef.current) return

    try {
      // AudioContext 생성
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
      
      // 오디오 소스 연결
      sourceRef.current = audioContextRef.current.createMediaElementSource(audioElement)
      
      // AnalyserNode 생성 및 설정
      analyserRef.current = audioContextRef.current.createAnalyser()
      analyserRef.current.fftSize = 256
      analyserRef.current.smoothingTimeConstant = 0.8
      
      // 오디오 그래프 연결
      sourceRef.current.connect(analyserRef.current)
      analyserRef.current.connect(audioContextRef.current.destination)
      
      console.log('Audio visualization initialized')
    } catch (error) {
      console.error('Failed to initialize audio visualization:', error)
    }
  }, [audioElement])

  const drawVisualization = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx || !analyserRef.current) return

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2
    const radius = Math.min(centerX, centerY) - 10

    // Canvas 클리어
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (!isPlaying) {
      // 정지 상태일 때는 고정된 원형만 표시
      drawStaticCircle(ctx, centerX, centerY, radius)
      return
    }

    // 오디오 데이터 가져오기
    const bufferLength = analyserRef.current.frequencyBinCount
    const dataArray = new Uint8Array(bufferLength)
    analyserRef.current.getByteFrequencyData(dataArray)

    // 전체 볼륨 레벨 계산
    const overallLevel = dataArray.reduce((sum, val) => sum + val, 0) / dataArray.length / 255

    // 저음역대만 간단히 분석 (베이스 효과용)
    const bassRange = dataArray.slice(0, 32)
    const bassLevel = bassRange.reduce((sum, val) => sum + val, 0) / bassRange.length / 255

    timeRef.current += 0.03 // 더 부드러운 애니메이션

    // 부드러운 물결 원 그리기
    drawSmoothWave(ctx, centerX, centerY, radius, overallLevel, bassLevel)

    animationIdRef.current = requestAnimationFrame(drawVisualization)
  }, [isPlaying])

  const drawStaticCircle = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number) => {
    // 정적인 그라데이션 원
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
    gradient.addColorStop(0, 'rgba(239, 68, 68, 0.6)') // rose-500
    gradient.addColorStop(0.7, 'rgba(251, 146, 60, 0.4)') // orange-400
    gradient.addColorStop(1, 'rgba(147, 51, 234, 0.2)') // purple-600

    ctx.beginPath()
    ctx.arc(x, y, radius * 0.8, 0, Math.PI * 2)
    ctx.fillStyle = gradient
    ctx.fill()

    // 중앙 흰색 원
    ctx.beginPath()
    ctx.arc(x, y, 8, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.fill()
  }

  const drawSmoothWave = (
    ctx: CanvasRenderingContext2D, 
    x: number, 
    y: number, 
    baseRadius: number, 
    intensity: number,
    bassLevel: number
  ) => {
    const points = 120 // 더 많은 점으로 부드러운 곡선
    const angleStep = (Math.PI * 2) / points

    // 여러 레이어의 물결 그리기
    for (let layer = 0; layer < 3; layer++) {
      ctx.beginPath()
      
      for (let i = 0; i <= points; i++) {
        const angle = i * angleStep
        
        // 부드러운 물결 효과 (여러 사인파의 조합)
        const wave1 = Math.sin(angle * 2 + timeRef.current * 1.5) * intensity * 15
        const wave2 = Math.sin(angle * 4 + timeRef.current * 2.2) * intensity * 8
        const wave3 = Math.sin(angle * 6 + timeRef.current * 1.8) * bassLevel * 12
        
        // 레이어별로 다른 크기와 오프셋
        const layerOffset = layer * 15
        const layerIntensity = (3 - layer) / 3
        const radius = (baseRadius - layerOffset) * (0.7 + intensity * 0.3 * layerIntensity) + 
                      (wave1 + wave2 + wave3) * layerIntensity
        
        const px = x + Math.cos(angle) * radius
        const py = y + Math.sin(angle) * radius
        
        if (i === 0) {
          ctx.moveTo(px, py)
        } else {
          ctx.lineTo(px, py)
        }
      }

      ctx.closePath()

      // 레이어별 그라데이션과 투명도
      const opacity = (0.4 - layer * 0.1) + intensity * 0.3
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, baseRadius)
      
      if (layer === 0) {
        // 가장 안쪽 - 밝은 색상
        gradient.addColorStop(0, `rgba(251, 146, 60, ${opacity})`) // orange-400
        gradient.addColorStop(0.7, `rgba(239, 68, 68, ${opacity * 0.8})`) // rose-500
        gradient.addColorStop(1, `rgba(147, 51, 234, ${opacity * 0.4})`) // purple-600
      } else if (layer === 1) {
        // 중간 레이어
        gradient.addColorStop(0, `rgba(239, 68, 68, ${opacity})`) // rose-500
        gradient.addColorStop(0.8, `rgba(251, 146, 60, ${opacity * 0.6})`) // orange-400
        gradient.addColorStop(1, `rgba(147, 51, 234, ${opacity * 0.3})`) // purple-600
      } else {
        // 바깥쪽 레이어
        gradient.addColorStop(0, `rgba(147, 51, 234, ${opacity})`) // purple-600
        gradient.addColorStop(0.5, `rgba(239, 68, 68, ${opacity * 0.5})`) // rose-500
        gradient.addColorStop(1, `rgba(251, 146, 60, ${opacity * 0.2})`) // orange-400
      }

      ctx.fillStyle = gradient
      ctx.fill()
    }

    // 중앙 흰색 원 (베이스에 따라 크기 변화)
    ctx.beginPath()
    ctx.arc(x, y, 6 + bassLevel * 6, 0, Math.PI * 2)
    ctx.fillStyle = 'white'
    ctx.shadowBlur = 10
    ctx.shadowColor = 'rgba(255, 255, 255, 0.5)'
    ctx.fill()
    ctx.shadowBlur = 0
  }

  useEffect(() => {
    if (audioElement && isPlaying) {
      initializeAudio()
    }
  }, [audioElement, isPlaying, initializeAudio])

  useEffect(() => {
    if (isPlaying && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume()
    }
    
    if (isPlaying) {
      drawVisualization()
    } else {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
      // 정적 상태 그리기
      const canvas = canvasRef.current
      const ctx = canvas?.getContext('2d')
      if (canvas && ctx) {
        drawStaticCircle(ctx, canvas.width / 2, canvas.height / 2, Math.min(canvas.width, canvas.height) / 2 - 10)
      }
    }

    return () => {
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current)
      }
    }
  }, [isPlaying, drawVisualization])

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="rounded-full"
        style={{ 
          width: size, 
          height: size,
          filter: 'drop-shadow(0 10px 20px rgba(0, 0, 0, 0.1))'
        }}
      />
      {/* 글로우 효과 */}
      <div 
        className="absolute -inset-2 rounded-full opacity-30 blur-lg animate-pulse"
        style={{
          background: 'radial-gradient(circle, rgba(239, 68, 68, 0.4) 0%, rgba(251, 146, 60, 0.3) 50%, rgba(147, 51, 234, 0.2) 100%)'
        }}
      ></div>
    </div>
  )
}