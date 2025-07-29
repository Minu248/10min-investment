import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 데이터베이스 타입 정의
export interface Podcast {
  id: string
  title: string
  episode_date: string
  summary_text: string | null
  script_json: any | null
  audio_url: string | null
  duration_seconds: number | null
  created_at: string
} 