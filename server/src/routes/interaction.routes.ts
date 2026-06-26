import { Router } from 'express'
import * as interactionController from '../controllers/interaction.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Todas las rutas de interacción requieren autenticación
router.use(authenticate)

router.post('/comments', interactionController.createComment)
router.delete('/comments/:id', interactionController.deleteComment)
router.post('/reactions', interactionController.toggleReaction)

export default router
