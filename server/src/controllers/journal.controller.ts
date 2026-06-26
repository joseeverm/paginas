import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as journalService from '../services/journal.service'

export async function createJournal(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { title, description } = req.body

    if (!title) {
      res.status(400).json({ error: 'El título es requerido' })
      return
    }

    const journal = await journalService.createJournal(userId, title, description)
    res.status(201).json(journal)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function getJournals(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const journals = await journalService.getJournalsByUser(userId)
    res.status(200).json(journals)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function getJournalById(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const id = req.params.id as string

    const journal = await journalService.getJournalById(userId, id)
    res.status(200).json(journal)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function updateJournal(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const id = req.params.id as string
    const { title, description } = req.body

    if (!title) {
      res.status(400).json({ error: 'El título es requerido' })
      return
    }

    const journal = await journalService.updateJournal(userId, id, title, description)
    res.status(200).json(journal)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function deleteJournal(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const id = req.params.id as string

    await journalService.deleteJournal(userId, id)
    res.status(200).json({ message: 'Diario eliminado exitosamente' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
