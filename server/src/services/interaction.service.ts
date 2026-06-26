import prisma from '../lib/prisma'
import { ReactionType, Visibility, NotificationType } from '@prisma/client'

// --- Comentarios ---

export async function createComment(userId: string, entryId: string, content: string) {
  // Verificar que la entrada existe y es accesible
  const entry = await prisma.entry.findUnique({
    where: { id: entryId }
  })

  if (!entry) {
    throw new Error('Entrada no encontrada')
  }

  // Si la entrada es privada, solo el dueño puede comentar
  if (entry.visibility === Visibility.private && entry.user_id !== userId) {
    throw new Error('No puedes comentar en una entrada privada')
  }

  // Crear comentario. El flag is_visible depende de si la entrada es privada
  const comment = await prisma.comment.create({
    data: {
      entry_id: entryId,
      user_id: userId,
      content,
      is_visible: entry.visibility !== Visibility.private
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      }
    }
  })

  // Notificar al dueño de la entrada (nunca a uno mismo)
  if (userId !== entry.user_id) {
    await prisma.notification.create({
      data: {
        user_id:  entry.user_id,
        actor_id: userId,
        entry_id: entryId,
        type:     NotificationType.comment
      }
    })
  }

  return comment
}

export async function deleteComment(userId: string, commentId: string) {
  const comment = await prisma.comment.findUnique({
    where: { id: commentId },
    include: { entry: true }
  })

  if (!comment) {
    throw new Error('Comentario no encontrado')
  }

  // Se puede eliminar si: es el autor del comentario O es el autor de la entrada
  const canDelete = comment.user_id === userId || comment.entry.user_id === userId
  if (!canDelete) {
    throw new Error('No autorizado para eliminar este comentario')
  }

  return prisma.comment.delete({
    where: { id: commentId }
  })
}

// --- Reacciones ---

export async function toggleReaction(userId: string, entryId: string, type: ReactionType) {
  // Verificar entrada
  const entry = await prisma.entry.findUnique({
    where: { id: entryId }
  })

  if (!entry) {
    throw new Error('Entrada no encontrada')
  }

  // Si es privada, solo el dueño puede reaccionar
  if (entry.visibility === Visibility.private && entry.user_id !== userId) {
    throw new Error('No puedes reaccionar en una entrada privada')
  }

  // Buscar reacción existente
  const existing = await prisma.reaction.findUnique({
    where: {
      entry_id_user_id: {
        entry_id: entryId,
        user_id: userId
      }
    }
  })

  if (existing) {
    if (existing.type === type) {
      // Si es el mismo tipo, se remueve (toggle off)
      await prisma.reaction.delete({
        where: { id: existing.id }
      })
      return { action: 'removed', reaction: null }
    } else {
      // Si es tipo distinto, se actualiza
      const updated = await prisma.reaction.update({
        where: { id: existing.id },
        data: { type }
      })
      return { action: 'updated', reaction: updated }
    }
  } else {
    // Si no existe, se crea
    const created = await prisma.reaction.create({
      data: {
        entry_id: entryId,
        user_id: userId,
        type
      }
    })

    // Notificar al dueño (nunca a uno mismo)
    if (userId !== entry.user_id) {
      await prisma.notification.create({
        data: {
          user_id:  entry.user_id,
          actor_id: userId,
          entry_id: entryId,
          type:     NotificationType.reaction
        }
      })
    }

    return { action: 'created', reaction: created }
  }
}

export async function getReactionsByEntry(entryId: string) {
  return prisma.reaction.findMany({
    where: { entry_id: entryId }
  })
}
