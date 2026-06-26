import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as notificationService from '../services/notification.service'

export async function getNotifications(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const result = await notificationService.getNotifications(userId)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function markAllRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    await notificationService.markAllRead(userId)
    res.status(200).json({ message: 'Notificaciones marcadas como leídas' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function markOneRead(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const id = req.params.id as string
    const notif = await notificationService.markOneRead(userId, id)
    res.status(200).json(notif)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
