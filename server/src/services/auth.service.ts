import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import prisma from '../lib/prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'secret_dev'

export async function register(
  username: string,
  email: string,
  password: string
) {
  // Verificar si el usuario o email ya existen
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  })

  if (existing) {
    if (existing.email === email) throw new Error('El email ya está registrado')
    if (existing.username === username) throw new Error('El nombre de usuario ya está en uso')
  }

  // Hashear la contraseña
  const password_hash = await bcrypt.hash(password, 10)

  // Crear el usuario y su diario personal por defecto en una sola transacción
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { username, email, password_hash },
      select: { id: true, username: true, email: true, created_at: true }
    })
    await tx.journal.create({
      data: {
        user_id: newUser.id,
        title: 'Mi diario personal',
        description: 'Diario por defecto.'
      }
    })
    return newUser
  })

  // Generar token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

  return { user, token }
}

export async function login(email: string, password: string) {
  // Buscar usuario
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Credenciales inválidas')

  // Verificar contraseña
  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) throw new Error('Credenciales inválidas')

  // Generar token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' })

  const { password_hash, ...safeUser } = user
  return { user: safeUser, token }
}