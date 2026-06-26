import { Router } from 'express'
import * as journalController from '../controllers/journal.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

router.use(authenticate) // Todas las rutas de diarios requieren autenticación

router.post('/', journalController.createJournal)
router.get('/', journalController.getJournals)
router.get('/:id', journalController.getJournalById)
router.put('/:id', journalController.updateJournal)
router.delete('/:id', journalController.deleteJournal)

export default router
