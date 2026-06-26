import { apiFetch } from './client'
import type { Journal } from '../types'

export async function getJournals(): Promise<Journal[]> {
  return apiFetch('/journals')
}

export async function getJournalById(id: string): Promise<Journal> {
  return apiFetch(`/journals/${id}`)
}

export async function createJournal(title: string, description?: string): Promise<Journal> {
  return apiFetch('/journals', {
    method: 'POST',
    body: JSON.stringify({ title, description })
  })
}

export async function updateJournal(id: string, title: string, description?: string): Promise<Journal> {
  return apiFetch(`/journals/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ title, description })
  })
}

export async function deleteJournal(id: string): Promise<{ message: string }> {
  return apiFetch(`/journals/${id}`, {
    method: 'DELETE'
  })
}
