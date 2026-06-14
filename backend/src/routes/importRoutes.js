import express from 'express';
import multer  from 'multer';
import { importExcel, downloadTemplate } from '../controllers/importController.js';
import { protect } from '../middleware/authMiddleware.js';

// Store file in memory (no disk writes) — we parse it directly from buffer
const upload = multer({
  storage: multer.memoryStorage(),
  limits:  { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only .xlsx and .xls files are allowed'), false);
    }
  },
});

const router = express.Router();

router.use(protect);

router.post('/',         upload.single('file'), importExcel);
router.get('/template',  downloadTemplate);

export default router;