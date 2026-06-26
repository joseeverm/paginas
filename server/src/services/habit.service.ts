import prisma from '../lib/prisma'

const DEFAULT_PROMPTS = [
  '¿Qué conversación de hoy vas a recordar?',
  '¿Qué evitaste hacer hoy y por qué?',
  '¿Qué te sorprendió hoy en tu rutina?',
  '¿Qué momento de hoy te trajo paz?',
  '¿Por qué estás agradecido hoy?',
  '¿Qué canción, sonido o aroma definió tu día?',
  '¿Qué pequeño logro tuviste hoy?',
  '¿Qué te hizo sonreír hoy?',
  '¿Qué emoción predominó en tu día y qué la causó?'
]

export async function getDailyPrompt() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Buscar pregunta asignada para hoy
  let prompt = await prisma.dailyPrompt.findUnique({
    where: { active_date: today }
  })

  // Si no existe, crearla eligiendo aleatoriamente de la lista predefinida
  if (!prompt) {
    const randomIndex = Math.floor(Math.random() * DEFAULT_PROMPTS.length)
    const question = DEFAULT_PROMPTS[randomIndex]

    try {
      prompt = await prisma.dailyPrompt.create({
        data: {
          question,
          active_date: today
        }
      })
    } catch {
      // En caso de colisión por concurrencia, intentar leer la que acaba de ser creada
      prompt = await prisma.dailyPrompt.findUnique({
        where: { active_date: today }
      })
    }
  }

  return prompt
}

export async function getArchiveEntry(userId: string) {
  const today = new Date()
  const currentYear = today.getFullYear()
  const month = today.getMonth() + 1 // 1-indexed
  const day = today.getDate()

  // Buscar entrada escrita en el mismo mes y día de cualquier año anterior
  // Usamos un query crudo de Prisma para extraer mes y día, ya que varía según la base de datos
  // O podemos buscar primero de forma segura para exactamente hace 1 año, 2 años, etc.
  // Vamos a buscar exactamente hace 1 año (año actual - 1) en rango de fecha para máxima compatibilidad con Prisma y Postgres sin raw queries complejas
  const targetYear = currentYear - 1
  const startOfDay = new Date(targetYear, month - 1, day, 0, 0, 0, 0)
  const endOfDay = new Date(targetYear, month - 1, day, 23, 59, 59, 999)

  const entry = await prisma.entry.findFirst({
    where: {
      user_id: userId,
      created_at: {
        gte: startOfDay,
        lte: endOfDay
      }
    },
    include: {
      photo: true,
      journal: {
        select: { title: true }
      }
    }
  })

  // Si no hay de hace exactamente 1 año, podemos buscar de hace 2 años
  if (!entry) {
    const targetYear2 = currentYear - 2
    const start2 = new Date(targetYear2, month - 1, day, 0, 0, 0, 0)
    const end2 = new Date(targetYear2, month - 1, day, 23, 59, 59, 999)

    return prisma.entry.findFirst({
      where: {
        user_id: userId,
        created_at: {
          gte: start2,
          lte: end2
        }
      },
      include: {
        photo: true,
        journal: {
          select: { title: true }
        }
      }
    })
  }

  return entry
}
