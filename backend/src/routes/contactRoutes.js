import express from 'express';
import {
  getAllContacts, getContactById, createContact,
  updateContact, deleteContact, exportContacts,
} from '../controllers/contactController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// All routes require login
router.use(protect);

router.get('/export', exportContacts);   // BEFORE /:id
router.get('/',       getAllContacts);
router.get('/:id',    getContactById);
router.post('/',      createContact);
router.put('/:id',    updateContact);
router.delete('/:id', deleteContact);

export default router;