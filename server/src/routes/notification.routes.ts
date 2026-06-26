import { Router } from 'express'
import * as notificationController from '../controllers/notification.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate)

router.get('/', notificationController.getNotifications)
router.patch('/read-all', notificationController.markAllRead)
router.patch('/:id/read', notificationController.markOneRead)

export default router
