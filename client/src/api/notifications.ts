import { apiFetch } from './client'
import type { Notification } from '../types'

export interface NotificationsResponse {
  notifications: Notification[]
  unread_count: number
}

export async function getNotifications(): Promise<NotificationsResponse> {
  return apiFetch('/notifications')
}

export async function markAllRead(): Promise<void> {
  return apiFetch('/notifications/read-all', { method: 'PATCH' })
}

export async function markOneRead(id: string): Promise<Notification> {
  return apiFetch(`/notifications/${id}/read`, { method: 'PATCH' })
}
