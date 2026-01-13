import { Router } from 'express';
import { createBackup } from '../controllers/backupController';

const router = Router();

/**
 * @route   POST /api/backup/create
 * @desc    Erstelle ein Backup des gesamten Projekts als ZIP-Datei
 * @access  Public
 */
router.post('/create', createBackup);

export default router;
