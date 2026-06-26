import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import authRoutes from './routes/auth.routes'
import journalRoutes from './routes/journal.routes'
import entryRoutes from './routes/entry.routes'
import interactionRoutes from './routes/interaction.routes'
import habitRoutes from './routes/habit.routes'
import profileRoutes from './routes/profile.routes'
import notificationRoutes from './routes/notification.routes'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

// Middlewares globales
app.use(cors())
app.use(express.json())

// Rutas
app.use('/api/auth', authRoutes)
app.use('/api/journals', journalRoutes)
app.use('/api/entries', entryRoutes)
app.use('/api/interactions', interactionRoutes)
app.use('/api/habits', habitRoutes)
app.use('/api/profiles', profileRoutes)
app.use('/api/notifications', notificationRoutes)

// Ruta de salud
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', project: 'Páginas' })
})

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})