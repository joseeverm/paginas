import prisma from '../lib/prisma'

export async function createJournal(userId: string, title: string, description?: string) {
  return prisma.journal.create({
    data: {
      user_id: userId,
      title,
      description
    }
  })
}

export async function getJournalsByUser(userId: string) {
  return prisma.journal.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' }
  })
}

export async function getJournalById(userId: string, journalId: string) {
  const journal = await prisma.journal.findUnique({
    where: { id: journalId }
  })

  if (!journal) {
    throw new Error('Diario no encontrado')
  }

  if (journal.user_id !== userId) {
    throw new Error('No autorizado para ver este diario')
  }

  return journal
}

export async function updateJournal(userId: string, journalId: string, title: string, description?: string) {
  // Verificar propiedad
  await getJournalById(userId, journalId)

  return prisma.journal.update({
    where: { id: journalId },
    data: { title, description }
  })
}

export async function deleteJournal(userId: string, journalId: string) {
  // Verificar propiedad
  await getJournalById(userId, journalId)

  return prisma.journal.delete({
    where: { id: journalId }
  })
}
