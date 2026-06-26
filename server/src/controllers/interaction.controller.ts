import { Response } from 'express'
import { AuthRequest } from '../middlewares/auth.middleware'
import * as interactionService from '../services/interaction.service'
import { ReactionType } from '@prisma/client'

export async function createComment(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { entryId, content } = req.body

    if (!entryId || !content) {
      res.status(400).json({ error: 'entryId y content son requeridos' })
      return
    }

    const comment = await interactionService.createComment(userId, entryId, content)
    res.status(201).json(comment)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function deleteComment(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const id = req.params.id as string

    await interactionService.deleteComment(userId, id)
    res.status(200).json({ message: 'Comentario eliminado con éxito' })
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}

export async function toggleReaction(req: AuthRequest, res: Response) {
  try {
    const userId = req.userId!
    const { entryId, type } = req.body

    if (!entryId || !type) {
      res.status(400).json({ error: 'entryId y type son requeridos' })
      return
    }

    if (!Object.values(ReactionType).includes(type)) {
      res.status(400).json({ error: 'Tipo de reacción no válido' })
      return
    }

    const result = await interactionService.toggleReaction(userId, entryId, type)
    res.status(200).json(result)
  } catch (error: any) {
    res.status(400).json({ error: error.message })
  }
}
