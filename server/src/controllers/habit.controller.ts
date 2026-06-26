import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as habitService from '../services/habit.service'

export async function getDailyPrompt(req: AuthRequest, res: Response) {
  try {
    const prompt = await habitService.getDailyPrompt()
    res.status(200).json(prompt)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function getArchiveEntry(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const entry = await habitService.getArchiveEntry(userId)
    res.status(200).json(entry)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
