import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as entryService from '../services/entry.service'
import { Visibility } from '@prisma/client'

export async function createEntry(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { journalId, title, content, excerpt, visibility, dailyPrompt, photoUrl } = req.body

    if (!journalId || !content || !visibility) {
      res.status(400).json({ error: 'journalId, content y visibility son requeridos' })
      return
    }

    if (!Object.values(Visibility).includes(visibility)) {
      res.status(400).json({ error: 'Visibilidad no válida' })
      return
    }

    const entry = await entryService.createEntry(userId, {
      journalId,
      title,
      content,
      excerpt,
      visibility,
      dailyPrompt,
      photoUrl
    })

    res.status(201).json(entry)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function updateEntry(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string
    const userId = req.userId!
    const { journalId, title, content, excerpt, visibility, photoUrl, deletePhoto } = req.body

    if (!journalId || !content || !visibility) {
      res.status(400).json({ error: 'journalId, content y visibility son requeridos' })
      return
    }

    const entry = await entryService.updateEntry(userId, id, {
      journalId,
      title,
      content,
      excerpt,
      visibility,
      photoUrl,
      deletePhoto
    })

    res.status(200).json(entry)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function deleteEntry(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string
    const userId = req.userId!

    await entryService.deleteEntry(userId, id)
    res.status(200).json({ message: 'Entrada eliminada con éxito' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function getEntryById(req: AuthRequest, res: Response) {
  try {
    const id = req.params.id as string
    const userId = req.userId

    const entry = await entryService.getEntryById(userId, id)
    res.status(200).json(entry)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function getHomeFeed(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const feed = await entryService.getHomeFeed(userId)
    res.status(200).json(feed)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function getExploreFeed(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId // Opcional pero definido por el middleware
    const { search } = req.query

    const feed = await entryService.getExploreFeed(userId, search as string)
    res.status(200).json(feed)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function getEntriesByJournal(req: AuthRequest, res: Response) {
  try {
    const journalId = req.params.journalId as string
    const userId = req.userId!

    const entries = await entryService.getEntriesByJournal(userId, journalId)
    res.status(200).json(entries)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
