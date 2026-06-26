import { Router } from 'express'
import * as habitController from '../controllers/habit.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Las rutas de hábitos requieren estar logueado
router.use(authenticate)

router.get('/daily-prompt', habitController.getDailyPrompt)
router.get('/archive', habitController.getArchiveEntry)

export default router
