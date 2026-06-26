export interface User {
  id: string
  username: string
  display_name: string | null
  email: string
  bio: string | null
  avatar_url: string | null
  social_links: Record<string, string> | null
  created_at: string
}

export interface Journal {
  id: string
  user_id: string
  title: string
  description: string | null
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  actor_id: string
  entry_id: string | null
  type: 'reaction' | 'comment' | 'follow'
  is_read: boolean
  created_at: string
  actor: Pick<User, 'id' | 'username' | 'display_name' | 'avatar_url'>
  entry: { id: string; title: string | null; visibility: string; journal_id: string } | null
}

export interface Entry {
  id: string
  journal_id: string
  user_id: string
  title: string | null
  content: string
  excerpt: string | null
  visibility: 'private' | 'public' | 'excerpt'
  daily_prompt: string | null
  created_at: string
  updated_at: string
  photo?: { url: string }
  user?: User
  comments?: any[]
  reactions?: any[]
}
