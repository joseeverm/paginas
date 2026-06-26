import { Router } from 'express'
import * as profileController from '../controllers/profile.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Rutas de perfiles requieren estar logueado
router.use(authenticate)

router.put('/me', profileController.updateProfile)
router.post('/follow', profileController.toggleFollow)
router.get('/:username', profileController.getProfile)

export default router
