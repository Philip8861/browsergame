import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

// Dynamischer Import von archiver (falls nicht installiert)
let archiver: any;
try {
  archiver = require('archiver');
  logger.info('✅ archiver Modul erfolgreich geladen');
} catch (error: any) {
  logger.error('❌ archiver Modul nicht gefunden:', error?.message || error);
  logger.warn('⚠️ Backup-Funktion nicht verfügbar.');
}

/**
 * Erstelle ein Backup des gesamten Projekts als ZIP-Datei
 * @route   POST /api/backup/create
 * @access  Public (kann später auf Admin beschränkt werden)
 */
export async function createBackup(_req: Request, res: Response): Promise<void> {
  try {
    // Prüfe ob archiver verfügbar ist
    if (!archiver) {
      logger.error('❌ archiver ist nicht verfügbar');
      // Versuche nochmal zu laden
      try {
        archiver = require('archiver');
        logger.info('✅ archiver beim zweiten Versuch erfolgreich geladen');
      } catch (retryError: any) {
        logger.error('❌ archiver konnte auch beim zweiten Versuch nicht geladen werden:', retryError?.message || retryError);
        res.status(500).json({
          error: 'Backup-Funktion nicht verfügbar',
          details: 'archiver Modul ist nicht installiert oder konnte nicht geladen werden. Bitte installieren: npm install archiver und Server neu starten.'
        });
        return;
      }
    }

    logger.info('📦 Starte Backup-Erstellung...');

    // Backup-Verzeichnis erstellen falls nicht vorhanden
    const backupDir = 'C:\\Users\\info\\Desktop\\Browsergame_backup';
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
      logger.info(`✅ Backup-Verzeichnis erstellt: ${backupDir}`);
    }

    // Zeitstempel für Dateinamen
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const zipFileName = `Browsergame_Backup_${timestamp}.zip`;
    const zipFilePath = path.join(backupDir, zipFileName);

    // Projekt-Root-Verzeichnis
    const projectRoot = path.resolve(__dirname, '../../..');

    // ZIP-Archiv erstellen
    const output = fs.createWriteStream(zipFilePath);
    const archive = archiver('zip', {
      zlib: { level: 9 } // Maximale Kompression
    });

    // Event-Handler für Archiv
    archive.on('error', (err) => {
      logger.error('❌ Fehler beim Erstellen des ZIP-Archivs:', err);
      res.status(500).json({
        error: 'Fehler beim Erstellen des Backups',
        details: err.message
      });
    });

    archive.on('end', () => {
      logger.info(`✅ Backup erfolgreich erstellt: ${zipFilePath}`);
      logger.info(`📊 Archiv-Größe: ${archive.pointer()} bytes`);
    });

    // Pipe archive data to the file
    archive.pipe(output);

    // Promise für das Warten auf das Ende des Archivs
    const archivePromise = new Promise<void>((resolve, reject) => {
      output.on('close', () => {
        resolve();
      });

      archive.on('error', (err: Error) => {
        reject(err);
      });
    });

    // Alle Dateien und Ordner hinzufügen (1:1 Backup des kompletten Ordners)
    // Nur das Backup-Verzeichnis selbst ausschließen, falls es im Projekt-Root liegt
    const backupDirRelative = path.relative(projectRoot, backupDir);
    const backupDirIsInsideProject = !backupDirRelative.startsWith('..') && path.isAbsolute(backupDir) === false;
    
    // Rekursiv alle Dateien hinzufügen
    const addDirectory = (dir: string, baseDir: string = projectRoot): void => {
      const files = fs.readdirSync(dir);

      files.forEach((file) => {
        const filePath = path.join(dir, file);
        const relativePath = path.relative(baseDir, filePath);

        // Nur das Backup-Verzeichnis selbst ausschließen, falls es im Projekt liegt
        if (backupDirIsInsideProject && (relativePath === backupDirRelative || relativePath.startsWith(backupDirRelative + path.sep))) {
          return; // Überspringe das Backup-Verzeichnis selbst
        }

        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
          addDirectory(filePath, baseDir);
        } else {
          archive.file(filePath, { name: relativePath });
        }
      });
    };

    // Starte das Hinzufügen aller Dateien
    addDirectory(projectRoot);

    // Finalisiere das Archiv
    await archive.finalize();

    // Warte bis der Output-Stream geschlossen ist
    await archivePromise;

    const fileSizeMB = (archive.pointer() / (1024 * 1024)).toFixed(2);
    res.json({
      success: true,
      message: 'Backup erfolgreich erstellt',
      filePath: zipFilePath,
      fileName: zipFileName,
      size: `${fileSizeMB} MB`,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    logger.error('❌ Fehler beim Erstellen des Backups:', error);
    res.status(500).json({
      error: 'Fehler beim Erstellen des Backups',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}
