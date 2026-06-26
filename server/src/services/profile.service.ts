import prisma from '../lib/prisma'
import { Visibility, NotificationType } from '@prisma/client'

export async function getProfileByUsername(currentUserId: string | undefined, username: string) {
  // Buscar usuario
  const targetUser = await prisma.user.findUnique({
    where: { username }
  })

  if (!targetUser) {
    throw new Error('Usuario no encontrado')
  }

  // Contar seguidores y seguidos
  const followersCount = await prisma.follow.count({
    where: { following_id: targetUser.id }
  })

  const followingCount = await prisma.follow.count({
    where: { follower_id: targetUser.id }
  })

  // Verificar si el usuario actual sigue a este usuario
  let isFollowing = false
  if (currentUserId && currentUserId !== targetUser.id) {
    const followRecord = await prisma.follow.findUnique({
      where: {
        follower_id_following_id: {
          follower_id: currentUserId,
          following_id: targetUser.id
        }
      }
    })
    isFollowing = !!followRecord
  }

  // Obtener las entradas compartidas de este usuario
  // Si el usuario actual es el dueño, puede ver todas (incluso privadas)
  // Si es otro usuario, solo públicas y excerpts
  const isOwner = currentUserId && currentUserId === targetUser.id

  const entries = await prisma.entry.findMany({
    where: {
      user_id: targetUser.id,
      visibility: isOwner
        ? undefined
        : { in: [Visibility.public, Visibility.excerpt] }
    },
    include: {
      photo: true,
      reactions: true,
      comments: {
        where: { is_visible: true }
      }
    },
    orderBy: { created_at: 'desc' }
  })

  // Sanitizar excerpts si el lector no es el dueño
  const sanitizedEntries = entries.map(entry => {
    if (!isOwner && entry.visibility === Visibility.excerpt) {
      return {
        ...entry,
        content: '' // Omitir contenido completo
      }
    }
    return entry
  })

  const { password_hash, ...safeUser } = targetUser

  return {
    user: safeUser,
    followersCount,
    followingCount,
    isFollowing,
    entries: sanitizedEntries
  }
}

export async function updateProfile(
  userId: string,
  data: { display_name?: string; bio?: string; social_links?: any; avatar_url?: string }
) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      display_name: data.display_name,
      bio: data.bio,
      social_links: data.social_links || undefined,
      avatar_url: data.avatar_url
    },
    select: {
      id: true,
      username: true,
      display_name: true,
      email: true,
      bio: true,
      avatar_url: true,
      social_links: true,
      created_at: true
    }
  })
}

export async function toggleFollow(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error('No puedes seguirte a ti mismo')
  }

  // Verificar que el usuario a seguir existe
  const target = await prisma.user.findUnique({
    where: { id: followingId }
  })
  if (!target) {
    throw new Error('Usuario a seguir no existe')
  }

  const existingFollow = await prisma.follow.findUnique({
    where: {
      follower_id_following_id: {
        follower_id: followerId,
        following_id: followingId
      }
    }
  })

  if (existingFollow) {
    // Si existe, dejar de seguir (unfollow)
    await prisma.follow.delete({
      where: { id: existingFollow.id }
    })
    return { following: false }
  } else {
    // Si no existe, seguir (follow)
    await prisma.follow.create({
      data: {
        follower_id: followerId,
        following_id: followingId
      }
    })

    // Notificar al usuario seguido
    await prisma.notification.create({
      data: {
        user_id:  followingId,
        actor_id: followerId,
        type:     NotificationType.follow
      }
    })

    return { following: true }
  }
}
