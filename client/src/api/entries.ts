import { apiFetch } from './client'
import type { Entry } from '../types'

export interface CreateEntryData {
  journalId: string
  title?: string
  content: string
  excerpt?: string
  visibility: 'private' | 'public' | 'excerpt'
  dailyPrompt?: string
  photoUrl?: string
}

export interface UpdateEntryData {
  journalId: string
  title?: string
  content: string
  excerpt?: string
  visibility: 'private' | 'public' | 'excerpt'
  photoUrl?: string
  deletePhoto?: boolean
}

export async function createEntry(data: CreateEntryData): Promise<Entry> {
  return apiFetch('/entries', {
    method: 'POST',
    body: JSON.stringify(data)
  })
}

export async function updateEntry(id: string, data: UpdateEntryData): Promise<Entry> {
  return apiFetch(`/entries/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function deleteEntry(id: string): Promise<{ message: string }> {
  return apiFetch(`/entries/${id}`, {
    method: 'DELETE'
  })
}

export async function getEntryById(id: string): Promise<Entry> {
  return apiFetch(`/entries/${id}`)
}

export async function getHomeFeed(): Promise<Entry[]> {
  return apiFetch('/entries/feed/home')
}

export async function getExploreFeed(search?: string): Promise<Entry[]> {
  const queryParams = search ? `?search=${encodeURIComponent(search)}` : ''
  return apiFetch(`/entries/feed/explore${queryParams}`)
}

export async function getEntriesByJournal(journalId: string): Promise<Entry[]> {
  return apiFetch(`/entries/journal/${journalId}`)
}
