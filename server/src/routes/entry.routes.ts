import { Router } from 'express'
import * as entryController from '../controllers/entry.controller'
import { authenticate } from '../middlewares/auth.middleware'

const router = Router()

// Todas las rutas de entradas requieren autenticación
router.use(authenticate)

router.post('/', entryController.createEntry)
router.get('/feed/home', entryController.getHomeFeed)
router.get('/feed/explore', entryController.getExploreFeed)
router.get('/journal/:journalId', entryController.getEntriesByJournal)
router.get('/:id', entryController.getEntryById)
router.put('/:id', entryController.updateEntry)
router.delete('/:id', entryController.deleteEntry)

export default router
