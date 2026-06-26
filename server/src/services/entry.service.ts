import prisma from '../lib/prisma'
import { Visibility } from '@prisma/client'

interface CreateEntryInput {
  journalId: string
  title?: string
  content: string
  excerpt?: string
  visibility: Visibility
  dailyPrompt?: string
  photoUrl?: string
}

interface UpdateEntryInput {
  title?: string
  content: string
  excerpt?: string
  visibility: Visibility
  journalId: string
  photoUrl?: string
  deletePhoto?: boolean
}

export async function createEntry(userId: string, input: CreateEntryInput) {
  // Verificar que el diario le pertenece al usuario
  const journal = await prisma.journal.findUnique({
    where: { id: input.journalId }
  })
  if (!journal || journal.user_id !== userId) {
    throw new Error('Diario no encontrado o no autorizado')
  }

  // Crear la entrada
  const entry = await prisma.entry.create({
    data: {
      journal_id: input.journalId,
      user_id: userId,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      visibility: input.visibility,
      daily_prompt: input.dailyPrompt,
      // Si hay foto, crear la relación
      photo: input.photoUrl
        ? {
            create: {
              url: input.photoUrl,
              cloudinary_id: 'mock_' + Date.now() // Carga simulada
            }
          }
        : undefined
    },
    include: {
      photo: true,
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

  return entry
}

export async function updateEntry(userId: string, entryId: string, input: UpdateEntryInput) {
  // Verificar propiedad de la entrada
  const existingEntry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: { photo: true }
  })

  if (!existingEntry || existingEntry.user_id !== userId) {
    throw new Error('Entrada no encontrada o no autorizado')
  }

  // Si cambia de diario, verificar propiedad del nuevo diario
  if (input.journalId !== existingEntry.journal_id) {
    const journal = await prisma.journal.findUnique({
      where: { id: input.journalId }
    })
    if (!journal || journal.user_id !== userId) {
      throw new Error('Nuevo diario no encontrado o no autorizado')
    }
  }

  // Lógica de comentarios al cambiar visibilidad
  const visibilityChanged = input.visibility !== existingEntry.visibility
  if (visibilityChanged) {
    const isPrivateNow = input.visibility === 'private'
    await prisma.comment.updateMany({
      where: { entry_id: entryId },
      data: { is_visible: !isPrivateNow } // false si es privado, true en caso contrario
    })
  }

  // Preparar actualización de foto
  let photoData: any = undefined

  if (input.deletePhoto) {
    // Eliminar foto existente
    if (existingEntry.photo) {
      await prisma.entryPhoto.delete({
        where: { id: existingEntry.photo.id }
      })
    }
  } else if (input.photoUrl) {
    // Si ya tiene foto, actualizar URL
    if (existingEntry.photo) {
      photoData = {
        update: {
          url: input.photoUrl
        }
      }
    } else {
      // Si no tiene, crear una nueva
      photoData = {
        create: {
          url: input.photoUrl,
          cloudinary_id: 'mock_' + Date.now()
        }
      }
    }
  }

  const updatedEntry = await prisma.entry.update({
    where: { id: entryId },
    data: {
      journal_id: input.journalId,
      title: input.title,
      content: input.content,
      excerpt: input.excerpt,
      visibility: input.visibility,
      photo: photoData
    },
    include: {
      photo: true,
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

  return updatedEntry
}

export async function deleteEntry(userId: string, entryId: string) {
  const existingEntry = await prisma.entry.findUnique({
    where: { id: entryId }
  })

  if (!existingEntry || existingEntry.user_id !== userId) {
    throw new Error('Entrada no encontrada o no autorizado')
  }

  return prisma.entry.delete({
    where: { id: entryId }
  })
}

export async function getEntryById(userId: string | undefined, entryId: string) {
  const entry = await prisma.entry.findUnique({
    where: { id: entryId },
    include: {
      photo: true,
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      comments: {
        where: userId
          ? {
              OR: [
                { is_visible: true },
                { entry: { user_id: userId } } // El autor de la entrada siempre ve todos los comentarios
              ]
            }
          : { is_visible: true },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              display_name: true,
              avatar_url: true
            }
          }
        },
        orderBy: { created_at: 'asc' }
      },
      reactions: true
    }
  })

  if (!entry) {
    throw new Error('Entrada no encontrada')
  }

  // Filtrar visibilidad
  const isOwner = userId && entry.user_id === userId
  if (!isOwner) {
    if (entry.visibility === Visibility.private) {
      throw new Error('No autorizado para ver esta entrada')
    }
    if (entry.visibility === Visibility.excerpt) {
      return {
        ...entry,
        content: '' // Ocultar el contenido completo
      }
    }
  }

  return entry
}

export async function getHomeFeed(userId: string) {
  // Obtener IDs de usuarios que este usuario sigue
  const followed = await prisma.follow.findMany({
    where: { follower_id: userId },
    select: { following_id: true }
  })

  const followedIds = followed.map(f => f.following_id)

  // El feed cronológico incluye entradas públicas/excerpt de usuarios seguidos más las del propio usuario (incluso privadas suyas)
  const entries = await prisma.entry.findMany({
    where: {
      OR: [
        {
          user_id: { in: followedIds },
          visibility: { in: [Visibility.public, Visibility.excerpt] }
        },
        {
          user_id: userId // Sus propias entradas completas
        }
      ]
    },
    include: {
      photo: true,
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      comments: {
        where: { is_visible: true },
        include: {
          user: {
            select: { id: true, username: true }
          }
        }
      },
      reactions: true
    },
    orderBy: { created_at: 'desc' }
  })

  // Sanitizar entradas en las que el usuario no es dueño
  return entries.map(entry => {
    const isOwner = entry.user_id === userId
    if (!isOwner && entry.visibility === Visibility.excerpt) {
      return {
        ...entry,
        content: '' // Limpiar contenido completo
      }
    }
    return entry
  })
}

export async function getExploreFeed(userId: string | undefined, search?: string) {
  // Construir filtros de búsqueda por palabra clave
  const searchFilter = search
    ? {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { content: { contains: search, mode: 'insensitive' as const } }
        ]
      }
    : {}

  // El feed de exploración muestra entradas públicas o excerpts de toda la comunidad (excepto privadas)
  // Si el usuario está logueado, también puede ver sus propias privadas aquí (opcional), pero por simplicidad solo públicas/excerpts
  const entries = await prisma.entry.findMany({
    where: {
      visibility: { in: [Visibility.public, Visibility.excerpt] },
      ...searchFilter
    },
    include: {
      photo: true,
      user: {
        select: {
          id: true,
          username: true,
          display_name: true,
          avatar_url: true
        }
      },
      comments: {
        where: { is_visible: true }
      },
      reactions: true
    },
    orderBy: { created_at: 'desc' }
  })

  // Sanitizar excerpts
  return entries.map(entry => {
    const isOwner = userId && entry.user_id === userId
    if (!isOwner && entry.visibility === Visibility.excerpt) {
      return {
        ...entry,
        content: ''
      }
    }
    return entry
  })
}

export async function getEntriesByJournal(userId: string, journalId: string) {
  // Verificar propiedad del diario
  const journal = await prisma.journal.findUnique({
    where: { id: journalId }
  })
  if (!journal || journal.user_id !== userId) {
    throw new Error('Diario no encontrado o no autorizado')
  }

  return prisma.entry.findMany({
    where: { journal_id: journalId },
    include: {
      photo: true,
      reactions: true,
      comments: true
    },
    orderBy: { created_at: 'desc' }
  })
}
