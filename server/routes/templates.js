import express from 'express';
import {
  getTemplates,
  getMyTemplates,
  getTemplate,
  createTemplate,
  updateTemplate,
  deleteTemplate,
} from '../controllers/templateController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All template routes require authentication
router.use(protect);

// Template routes
router.route('/').get(getTemplates).post(createTemplate);

router.get('/my-templates', getMyTemplates);

router.route('/:id').get(getTemplate).put(updateTemplate).delete(deleteTemplate);

export default router;
