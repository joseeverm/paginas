import { apiFetch } from './client'
import type { Entry } from '../types'

export interface DailyPromptResponse {
  id: string
  question: string
  active_date: string
  created_at: string
}

export async function getDailyPrompt(): Promise<DailyPromptResponse> {
  return apiFetch('/habits/daily-prompt')
}

export async function getArchiveEntry(): Promise<(Entry & { journal?: { title: string } }) | null> {
  return apiFetch('/habits/archive')
}
