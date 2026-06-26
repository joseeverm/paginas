import { apiFetch } from './client'

export interface CommentResponse {
  id: string
  entry_id: string
  user_id: string
  content: string
  is_visible: boolean
  created_at: string
  user: {
    id: string
    username: string
    display_name: string | null
    avatar_url: string | null
  }
}

export interface ToggleReactionResponse {
  action: 'created' | 'updated' | 'removed'
  reaction: {
    id: string
    entry_id: string
    user_id: string
    type: string
    created_at: string
  } | null
}

export async function createComment(entryId: string, content: string): Promise<CommentResponse> {
  return apiFetch('/interactions/comments', {
    method: 'POST',
    body: JSON.stringify({ entryId, content })
  })
}

export async function deleteComment(id: string): Promise<{ message: string }> {
  return apiFetch(`/interactions/comments/${id}`, {
    method: 'DELETE'
  })
}

export async function toggleReaction(entryId: string, type: string): Promise<ToggleReactionResponse> {
  return apiFetch('/interactions/reactions', {
    method: 'POST',
    body: JSON.stringify({ entryId, type })
  })
}
