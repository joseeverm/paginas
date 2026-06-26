import prisma from '../lib/prisma'

const ACTOR_SELECT = {
  id: true,
  username: true,
  display_name: true,
  avatar_url: true
}

const ENTRY_SELECT = {
  id: true,
  title: true,
  visibility: true,
  journal_id: true
}

export async function getNotifications(userId: string) {
  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    include: {
      actor: { select: ACTOR_SELECT },
      entry: { select: ENTRY_SELECT }  // null cuando entry_id es null (follow)
    },
    orderBy: { created_at: 'desc' },
    take: 30
  })

  const unread_count = notifications.filter(n => !n.is_read).length

  return { notifications, unread_count }
}

export async function markAllRead(userId: string) {
  await prisma.notification.updateMany({
    where: { user_id: userId, is_read: false },
    data: { is_read: true }
  })
}

export async function markOneRead(userId: string, notifId: string) {
  const notif = await prisma.notification.findUnique({
    where: { id: notifId }
  })

  if (!notif || notif.user_id !== userId) {
    throw new Error('Notificación no encontrada')
  }

  return prisma.notification.update({
    where: { id: notifId },
    data: { is_read: true }
  })
}
