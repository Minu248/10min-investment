'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CreatePodcastData, testSupabaseConnection } from '@/lib/supabase/client'
import { uploadAudioFile, getAudioDuration } from '@/lib/supabase/storage'

export default function AdminPage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [formData, setFormData] = useState<CreatePodcastData>({
    title: '',
    summary: '',
    audio_url: '',
    duration: 0,
    file_size: 0,
    file_name: ''
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [uploadProgress, setUploadProgress] = useState(0)
  const [connectionStatus, setConnectionStatus] = useState<'checking' | 'connected' | 'failed' | null>(null)

  // 페이지 로드 시 연결 상태 확인
  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    setConnectionStatus('checking')
    try {
      const isConnected = await testSupabaseConnection()
      setConnectionStatus(isConnected ? 'connected' : 'failed')
      if (!isConnected) {
        setMessage('Supabase 연결에 실패했습니다. 환경 변수와 설정을 확인해주세요.')
      }
    } catch (error) {
      setConnectionStatus('failed')
      setMessage('연결 테스트 중 오류가 발생했습니다.')
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    setMessage('')

    try {
      // 파일 정보 미리 설정
      setFormData(prev => ({
        ...prev,
        file_name: file.name,
        file_size: file.size
      }))

      // 오디오 재생 시간 자동 감지
      try {
        const duration = await getAudioDuration(file)
        setFormData(prev => ({
          ...prev,
          duration
        }))
        setMessage('파일이 선택되었습니다. 재생 시간이 자동으로 감지되었습니다.')
      } catch (error) {
        setMessage('파일이 선택되었습니다. 재생 시간을 수동으로 입력해주세요.')
      }
    } catch (error) {
      setMessage('파일 선택 중 오류가 발생했습니다.')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')
    setUploadProgress(0)

    try {
      let finalFormData = { ...formData }

      // 파일이 선택된 경우 업로드
      if (selectedFile) {
        setMessage('파일을 업로드하고 있습니다...')
        setUploadProgress(50)

        const uploadResult = await uploadAudioFile(selectedFile, formData.title)
        
        finalFormData = {
          ...finalFormData,
          audio_url: uploadResult.url,
          file_size: uploadResult.size,
          file_name: selectedFile.name
        }

        setUploadProgress(100)
        setMessage('파일 업로드 완료! 팟캐스트를 등록하고 있습니다...')
      }

      // 팟캐스트 등록
      const response = await fetch('/api/podcasts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalFormData),
      })

      const result = await response.json()

      if (response.ok) {
        setMessage('팟캐스트가 성공적으로 등록되었습니다!')
        setFormData({
          title: '',
          summary: '',
          audio_url: '',
          duration: 0,
          file_size: 0,
          file_name: ''
        })
        setSelectedFile(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        // 3초 후 홈페이지로 이동
        setTimeout(() => {
          router.push('/')
        }, 3000)
      } else {
        setMessage(`오류: ${result.error}`)
      }
    } catch (error) {
      console.error('Submit error:', error)
      setMessage(`오류: ${error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.'}`)
    } finally {
      setIsLoading(false)
      setUploadProgress(0)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'duration' || name === 'file_size' ? parseInt(value) || 0 : value
    }))
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">팟캐스트 등록</h1>
          
          {/* 연결 상태 표시 */}
          {connectionStatus && (
            <div className={`mb-6 p-4 rounded-lg ${
              connectionStatus === 'connected' 
                ? 'bg-green-50 border border-green-200 text-green-800'
                : connectionStatus === 'failed'
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-yellow-50 border border-yellow-200 text-yellow-800'
            }`}>
              <div className="flex items-center justify-between">
                <span>
                  {connectionStatus === 'checking' && '연결 상태 확인 중...'}
                  {connectionStatus === 'connected' && '✅ Supabase 연결됨'}
                  {connectionStatus === 'failed' && '❌ Supabase 연결 실패'}
                </span>
                {connectionStatus === 'failed' && (
                  <button
                    onClick={checkConnection}
                    className="text-sm px-3 py-1 bg-red-100 hover:bg-red-200 rounded"
                  >
                    재시도
                  </button>
                )}
              </div>
            </div>
          )}
          
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.includes('성공') || message.includes('완료') || message.includes('감지')
                ? 'bg-green-50 border border-green-200 text-green-800' 
                : message.includes('오류') || message.includes('실패')
                ? 'bg-red-50 border border-red-200 text-red-800'
                : 'bg-blue-50 border border-blue-200 text-blue-800'
            }`}>
              {message}
            </div>
          )}

          {uploadProgress > 0 && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                업로드 진행률: {uploadProgress}%
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 제목 */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                제목 *
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="팟캐스트 제목을 입력하세요"
              />
            </div>

            {/* 요약 */}
            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                요약
              </label>
              <textarea
                id="summary"
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="팟캐스트 내용 요약을 입력하세요"
              />
            </div>

            {/* 파일 업로드 */}
            <div>
              <label htmlFor="audio_file" className="block text-sm font-medium text-gray-700 mb-2">
                오디오 파일 업로드 *
              </label>
              <input
                ref={fileInputRef}
                type="file"
                id="audio_file"
                accept="audio/*"
                onChange={handleFileSelect}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <p className="text-sm text-gray-500 mt-1">
                MP3, WAV, OGG, M4A 파일만 지원됩니다. (최대 50MB)
              </p>
              {selectedFile && (
                <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                  <p className="text-sm text-blue-800">
                    선택된 파일: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                  </p>
                </div>
              )}
            </div>

            {/* 또는 URL 직접 입력 */}
            <div>
              <label htmlFor="audio_url" className="block text-sm font-medium text-gray-700 mb-2">
                또는 오디오 파일 URL 직접 입력
              </label>
              <input
                type="url"
                id="audio_url"
                name="audio_url"
                value={formData.audio_url}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/audio/file.mp3"
              />
              <p className="text-sm text-gray-500 mt-1">
                파일 업로드 대신 외부 URL을 사용할 수도 있습니다.
              </p>
            </div>

            {/* 재생 시간 */}
            <div>
              <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                재생 시간 (초) *
              </label>
              <input
                type="number"
                id="duration"
                name="duration"
                value={formData.duration}
                onChange={handleInputChange}
                required
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="600 (10분)"
              />
              <p className="text-sm text-gray-500 mt-1">
                파일을 업로드하면 자동으로 감지됩니다.
              </p>
            </div>

            {/* 파일 크기 */}
            <div>
              <label htmlFor="file_size" className="block text-sm font-medium text-gray-700 mb-2">
                파일 크기 (bytes)
              </label>
              <input
                type="number"
                id="file_size"
                name="file_size"
                value={formData.file_size}
                onChange={handleInputChange}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="10240000 (10MB)"
              />
            </div>

            {/* 파일명 */}
            <div>
              <label htmlFor="file_name" className="block text-sm font-medium text-gray-700 mb-2">
                원본 파일명
              </label>
              <input
                type="text"
                id="file_name"
                name="file_name"
                value={formData.file_name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="podcast-episode-1.mp3"
              />
            </div>

            {/* 제출 버튼 */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '등록 중...' : '팟캐스트 등록'}
              </button>
              <button
                type="button"
                onClick={() => router.push('/')}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                취소
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  )
} 