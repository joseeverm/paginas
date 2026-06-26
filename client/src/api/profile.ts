import { apiFetch } from './client'
import type { User, Entry } from '../types'

export interface ProfileResponse {
  user: Omit<User, 'password_hash'>
  followersCount: number
  followingCount: number
  isFollowing: boolean
  entries: Entry[]
}

export async function getProfile(username: string): Promise<ProfileResponse> {
  return apiFetch(`/profiles/${username}`)
}

export async function updateProfile(data: {
  display_name?: string
  bio?: string
  social_links?: Record<string, string>
  avatar_url?: string
}): Promise<User> {
  return apiFetch('/profiles/me', {
    method: 'PUT',
    body: JSON.stringify(data)
  })
}

export async function toggleFollow(followingId: string): Promise<{ following: boolean }> {
  return apiFetch('/profiles/follow', {
    method: 'POST',
    body: JSON.stringify({ followingId })
  })
}
