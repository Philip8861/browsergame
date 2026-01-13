import { Response } from 'express';
import { VillageModel } from '../models/Village';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { query, getTransaction, commitTransaction, rollbackTransaction } from '../utils/database-wrapper';

/**
 * Berechne Kosten und Build-Zeit für ein Gebäude
 */
function getUpgradeCosts(upgradeType: string, level: number): { wood: number; stone?: number; buildTime: number } {
  if (upgradeType === 'hafen') {
    // Hafen: Stufe 1: 100 Holz/10s, ab Stufe 2: verdoppelt + 100 Stein (verdoppelt)
    const baseWood = 100;
    const wood = baseWood * Math.pow(2, level - 1);
    const baseBuildTime = 10;
    const buildTime = baseBuildTime * Math.pow(2, level - 1);
    
    if (level >= 2) {
      // Ab Stufe 2: zusätzlich Stein (100 * 2^(level-2))
      const baseStone = 100;
      const stone = baseStone * Math.pow(2, level - 2);
      return { wood, stone, buildTime };
    }
    
    return { wood, buildTime };
  } else {
    // Standard: Lagerfeuer und andere Gebäude
    const baseCost = 10;
    const cost = baseCost * Math.pow(2, level - 1);
    const baseBuildTime = 15;
    const buildTime = baseBuildTime * Math.pow(2, level - 1);
    return { wood: cost, buildTime };
  }
}

/**
 * Prüfe Voraussetzungen für ein Gebäude
 */
async function checkRequirements(villageId: number, upgradeType: string, level: number): Promise<{ valid: boolean; error?: string }> {
  if (upgradeType === 'hafen' && level >= 3) {
    // Hafen ab Stufe 3 benötigt Lagerfeuer Stufe 2
    const buildingsResult = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'SELECT level FROM buildings WHERE village_id = ? AND building_type = ? LIMIT 1'
        : 'SELECT level FROM buildings WHERE village_id = $1 AND building_type = $2 LIMIT 1',
      [villageId, 'lagerfeuer']
    );
    
    const lagerfeuer = Array.isArray(buildingsResult) 
      ? buildingsResult[0] 
      : buildingsResult.rows?.[0];
    
    if (!lagerfeuer || lagerfeuer.level < 2) {
      return { 
        valid: false, 
        error: `Hafen Stufe ${level} benötigt Lagerfeuer Stufe 2! Aktuell: ${lagerfeuer?.level || 0}` 
      };
    }
  }
  
  return { valid: true };
}

/**
 * Starte einen Ausbau
 */
export const startUpgrade = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    const { upgradeType, level } = req.body;

    if (isNaN(villageId) || !upgradeType || level === undefined) {
      res.status(400).json({ error: 'Ungültige Parameter' });
      return;
    }

    // Prüfe ob Dorf dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village || village.user_id !== req.user.id) {
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    // Prüfe Voraussetzungen
    const requirementsCheck = await checkRequirements(villageId, upgradeType, level);
    if (!requirementsCheck.valid) {
      res.status(400).json({ error: requirementsCheck.error });
      return;
    }

    // Berechne Kosten und Zeit
    const costs = getUpgradeCosts(upgradeType, level);

    // Prüfe Ressourcen
    const resources = await VillageModel.getResources(villageId);
    if (!resources) {
      res.status(400).json({ error: 'Ressourcen konnten nicht geladen werden' });
      return;
    }

    // Prüfe Holz
    if (resources.wood < costs.wood) {
      res.status(400).json({ error: `Nicht genug Holz! Benötigt: ${costs.wood}, Vorhanden: ${resources.wood}` });
      return;
    }

    // Prüfe Stein (falls benötigt)
    if (costs.stone && resources.stone < costs.stone) {
      res.status(400).json({ error: `Nicht genug Stein! Benötigt: ${costs.stone}, Vorhanden: ${resources.stone}` });
      return;
    }

    const client = await getTransaction();
    try {
      // Ziehe Ressourcen ab
      await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? 'UPDATE resources SET wood = wood - ? WHERE village_id = ?'
          : 'UPDATE resources SET wood = wood - $1 WHERE village_id = $2',
        [costs.wood, villageId]
      );

      // Ziehe Stein ab (falls benötigt)
      if (costs.stone) {
        await client.query(
          process.env.DB_TYPE === 'sqlite'
            ? 'UPDATE resources SET stone = stone - ? WHERE village_id = ?'
            : 'UPDATE resources SET stone = stone - $1 WHERE village_id = $2',
          [costs.stone, villageId]
        );
      }

      // Erstelle oder aktualisiere Gebäude
      const buildingType = upgradeType; // z.B. 'lagerfeuer'
      const existingBuilding = await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? 'SELECT * FROM buildings WHERE village_id = ? AND building_type = ? LIMIT 1'
          : 'SELECT * FROM buildings WHERE village_id = $1 AND building_type = $2 LIMIT 1',
        [villageId, buildingType]
      );

      const existing = Array.isArray(existingBuilding) 
        ? existingBuilding[0] 
        : existingBuilding.rows?.[0];

      // Berechne Finish-Zeit basierend auf bereits existierender upgrade_finishes_at Zeit
      // Wenn bereits ein Gebäude in der Queue ist, startet der neue Auftrag nach dem vorherigen
      let baseTime = Date.now();
      if (existing && existing.upgrade_finishes_at) {
        // Es gibt bereits einen Auftrag - der neue startet nach diesem
        const existingFinishTime = new Date(existing.upgrade_finishes_at).getTime();
        // Verwende die spätere Zeit (entweder jetzt oder wenn der vorherige Auftrag fertig ist)
        baseTime = Math.max(Date.now(), existingFinishTime);
      }
      
      const finishTime = new Date(baseTime + costs.buildTime * 1000);
      const finishTimeStr = finishTime.toISOString().replace('T', ' ').substring(0, 19);

      if (existing) {
        // Aktualisiere bestehendes Gebäude - Level bleibt unverändert, nur upgrade_finishes_at wird gesetzt
        // Das Level wird erst beim completeUpgrade erhöht
        // WICHTIG: Das aktuelle Level bleibt erhalten, es wird NICHT auf das Ziel-Level gesetzt
        await client.query(
          process.env.DB_TYPE === 'sqlite'
            ? 'UPDATE buildings SET upgrade_finishes_at = ? WHERE village_id = ? AND building_type = ?'
            : 'UPDATE buildings SET upgrade_finishes_at = $1 WHERE village_id = $2 AND building_type = $3',
          [finishTimeStr, villageId, buildingType]
        );
      } else {
        // Erstelle neues Gebäude mit Level 0 (wird erst beim completeUpgrade auf Level 1 erhöht)
        await client.query(
          process.env.DB_TYPE === 'sqlite'
            ? 'INSERT INTO buildings (village_id, building_type, level, position, upgrade_finishes_at) VALUES (?, ?, 0, 0, ?)'
            : 'INSERT INTO buildings (village_id, building_type, level, position, upgrade_finishes_at) VALUES ($1, $2, 0, 0, $3)',
          [villageId, buildingType, finishTimeStr]
        );
      }

      await commitTransaction(client);

      res.json({
        success: true,
        message: 'Ausbau gestartet',
        finishTime: finishTime.toISOString(),
        cost: costs.wood,
        costs: costs
      });
    } catch (error) {
      await rollbackTransaction(client);
      throw error;
    }
  } catch (error: any) {
    logger.error('Fehler beim Starten des Ausbaus:', error);
    logger.error('Fehlerdetails:', {
      message: error?.message,
      stack: error?.stack,
      upgradeType: req.body?.upgradeType,
      level: req.body?.level
    });
    res.status(500).json({ 
      error: 'Fehler beim Starten des Ausbaus',
      details: error?.message || 'Unbekannter Fehler'
    });
  }
};

/**
 * Schließe einen Ausbau ab (wird aufgerufen wenn Timer abgelaufen ist)
 */
export const completeUpgrade = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    const { upgradeType, level, points } = req.body;

    if (isNaN(villageId) || !upgradeType || level === undefined || points === undefined) {
      res.status(400).json({ error: 'Ungültige Parameter' });
      return;
    }

    // Prüfe ob Dorf dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village || village.user_id !== req.user.id) {
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    // Prüfe zuerst ob points-Spalte existiert (außerhalb der Transaktion)
    try {
      await query(
        process.env.DB_TYPE === 'sqlite'
          ? 'SELECT points FROM villages WHERE id = ? LIMIT 1'
          : 'SELECT points FROM villages WHERE id = $1 LIMIT 1',
        [villageId]
      );
    } catch (checkError: any) {
      // Falls Spalte nicht existiert, erstelle sie (außerhalb der Transaktion)
      if (checkError.message && checkError.message.includes('no such column: points')) {
        logger.info('points-Spalte existiert nicht, erstelle sie...');
        try {
          await query('ALTER TABLE villages ADD COLUMN points INTEGER NOT NULL DEFAULT 0');
          logger.info('points-Spalte erfolgreich erstellt');
        } catch (alterError: any) {
          if (!alterError.message.includes('duplicate column')) {
            logger.error('Fehler beim Hinzufügen der points-Spalte:', alterError);
            throw alterError;
          }
        }
      } else {
        logger.warn('Unerwarteter Fehler beim Prüfen der points-Spalte:', checkError);
      }
    }

    const client = await getTransaction();
    try {
      // Prüfe ob Gebäude in der Bauschleife ist (upgrade_finishes_at sollte gesetzt sein)
      const buildingResult = await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? 'SELECT * FROM buildings WHERE village_id = ? AND building_type = ? LIMIT 1'
          : 'SELECT * FROM buildings WHERE village_id = $1 AND building_type = $2 LIMIT 1',
        [villageId, upgradeType]
      );

      const building = Array.isArray(buildingResult) 
        ? buildingResult[0] 
        : buildingResult.rows?.[0];

      if (!building) {
        await rollbackTransaction(client);
        res.status(400).json({ error: 'Gebäude nicht gefunden' });
        return;
      }

      // Prüfe ob upgrade_finishes_at gesetzt ist (sollte beim Starten gesetzt worden sein)
      if (!building.upgrade_finishes_at) {
        await rollbackTransaction(client);
        res.status(400).json({ error: 'Gebäude ist nicht in der Bauschleife' });
        return;
      }

      // Prüfe ob die Zeit abgelaufen ist
      const finishTime = new Date(building.upgrade_finishes_at);
      if (finishTime > new Date()) {
        await rollbackTransaction(client);
        res.status(400).json({ error: 'Ausbau ist noch nicht fertig' });
        return;
      }

      // JETZT erst das Level erhöhen (beim Abschließen)
      await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? 'UPDATE buildings SET level = ?, upgrade_finishes_at = NULL WHERE village_id = ? AND building_type = ?'
          : 'UPDATE buildings SET level = $1, upgrade_finishes_at = NULL WHERE village_id = $2 AND building_type = $3',
        [level, villageId, upgradeType]
      );

      // Füge Punkte hinzu (Lagerfeuer gibt 2 Punkte pro Stufe)
      if (points > 0) {
        logger.info(`[completeUpgrade] Füge ${points} Punkte zu Dorf ${villageId} hinzu`);
        
        // Hole aktuellen Punkte-Stand
        const currentVillage = await client.query(
          process.env.DB_TYPE === 'sqlite'
            ? 'SELECT points FROM villages WHERE id = ?'
            : 'SELECT points FROM villages WHERE id = $1',
          [villageId]
        );
        
        const currentPoints = Array.isArray(currentVillage) 
          ? (currentVillage[0]?.points || 0)
          : (currentVillage.rows?.[0]?.points || 0);
        
        const newPoints = currentPoints + points;
        logger.info(`[completeUpgrade] Aktuelle Punkte: ${currentPoints}, Neue Punkte: ${newPoints}`);
        
        const pointsResult = await client.query(
          process.env.DB_TYPE === 'sqlite'
            ? 'UPDATE villages SET points = ? WHERE id = ?'
            : 'UPDATE villages SET points = $1 WHERE id = $2',
          [newPoints, villageId]
        );
        logger.info(`[completeUpgrade] Punkte-Update Ergebnis:`, pointsResult);
      } else {
        logger.info(`[completeUpgrade] Keine Punkte zu vergeben für ${upgradeType}`);
      }

      // upgrade_finishes_at wurde bereits oben auf NULL gesetzt beim Level-Update

      await commitTransaction(client);

      // Hole aktualisierte Daten
      const updatedVillage = await VillageModel.findById(villageId);
      const updatedResources = await VillageModel.getResources(villageId);
      
      logger.info(`[completeUpgrade] Aktualisierte Punkte: ${updatedVillage?.points || 0}`);

      res.json({
        success: true,
        message: 'Ausbau abgeschlossen',
        village: updatedVillage,
        resources: updatedResources
      });
    } catch (error: any) {
      await rollbackTransaction(client);
      logger.error('Fehler in completeUpgrade Transaction:', error);
      logger.error('Error details:', {
        message: error?.message,
        stack: error?.stack,
        villageId,
        upgradeType,
        level,
        points
      });
      throw error;
    }
  } catch (error) {
    logger.error('Fehler beim Abschließen des Ausbaus:', error);
    res.status(500).json({ error: 'Fehler beim Abschließen des Ausbaus' });
  }
};

/**
 * Breche einen Ausbau ab und erstatte 80% der Ressourcen zurück
 */
export const cancelUpgrade = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    const { upgradeType, level, refund, finishTime } = req.body;

    if (isNaN(villageId) || !upgradeType || level === undefined || !refund) {
      res.status(400).json({ error: 'Ungültige Parameter' });
      return;
    }

    // Prüfe ob Dorf dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village || village.user_id !== req.user.id) {
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    const client = await getTransaction();
    try {
      // Prüfe ob Gebäude in der Bauschleife ist
      const buildingResult = await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? 'SELECT * FROM buildings WHERE village_id = ? AND building_type = ? LIMIT 1'
          : 'SELECT * FROM buildings WHERE village_id = $1 AND building_type = $2 LIMIT 1',
        [villageId, upgradeType]
      );

      const building = Array.isArray(buildingResult) 
        ? buildingResult[0] 
        : buildingResult.rows?.[0];

      if (!building) {
        await rollbackTransaction(client);
        res.status(400).json({ error: 'Gebäude nicht gefunden' });
        return;
      }

      // Erstatte Ressourcen zurück (100% - vollständige Rückerstattung)
      // Hinweis: Die Bauschleife wird im Frontend verwaltet, daher wird hier nur die Rückerstattung durchgeführt
      // WICHTIG: Level bleibt unverändert - wurde beim Starten nicht erhöht
      const currentResources = await VillageModel.getResources(villageId);
      if (!currentResources) {
        await rollbackTransaction(client);
        res.status(404).json({ error: 'Ressourcen nicht gefunden' });
        return;
      }

      const woodValue = typeof currentResources.wood === 'string' ? parseFloat(currentResources.wood) : (currentResources.wood || 0);
      const stoneValue = typeof currentResources.stone === 'string' ? parseFloat(currentResources.stone) : (currentResources.stone || 0);
      const newWood = woodValue + (refund.wood || 0);
      const newStone = stoneValue + (refund.stone || 0);

      await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? 'UPDATE resources SET wood = ?, stone = ?, last_updated = CURRENT_TIMESTAMP WHERE village_id = ?'
          : 'UPDATE resources SET wood = $1, stone = $2, last_updated = NOW() WHERE village_id = $3',
        [String(newWood), String(newStone), String(villageId)] as unknown[]
      );

      // Prüfe ob der abzubrechende Auftrag der letzte ist (späteste Finish-Zeit)
      // Wenn finishTime mit upgrade_finishes_at übereinstimmt, ist es der letzte Auftrag
      // und wir können upgrade_finishes_at auf NULL setzen
      // Wenn finishTime früher ist, gibt es noch spätere Aufträge, und wir sollten
      // upgrade_finishes_at nicht ändern, damit diese weiterlaufen können
      if (finishTime && building.upgrade_finishes_at) {
        const buildingFinishTime = new Date(building.upgrade_finishes_at).getTime();
        const cancelFinishTime = typeof finishTime === 'string' ? new Date(finishTime).getTime() : parseInt(finishTime);
        
        // Nur wenn die Finish-Zeit übereinstimmt (mit Toleranz von 1 Sekunde für Rundungsfehler),
        // setzen wir upgrade_finishes_at auf NULL
        if (Math.abs(buildingFinishTime - cancelFinishTime) <= 1000) {
          // Dies ist der letzte Auftrag - setze upgrade_finishes_at auf NULL
          await client.query(
            process.env.DB_TYPE === 'sqlite'
              ? 'UPDATE buildings SET upgrade_finishes_at = NULL WHERE village_id = ? AND building_type = ?'
              : 'UPDATE buildings SET upgrade_finishes_at = NULL WHERE village_id = $1 AND building_type = $2',
            [villageId, upgradeType]
          );
        }
        // Wenn die Finish-Zeit nicht übereinstimmt, bedeutet das, dass es noch spätere Aufträge gibt
        // und wir upgrade_finishes_at nicht ändern sollten
      } else {
        // Fallback: Wenn keine finishTime übergeben wurde, setze upgrade_finishes_at auf NULL
        // (für Rückwärtskompatibilität)
        await client.query(
          process.env.DB_TYPE === 'sqlite'
            ? 'UPDATE buildings SET upgrade_finishes_at = NULL WHERE village_id = ? AND building_type = ?'
            : 'UPDATE buildings SET upgrade_finishes_at = NULL WHERE village_id = $1 AND building_type = $2',
          [villageId, upgradeType]
        );
      }

      await commitTransaction(client);

      // Hole aktualisierte Ressourcen
      const updatedResources = await VillageModel.getResources(villageId);

      res.json({
        success: true,
        message: 'Ausbau abgebrochen',
        resources: updatedResources,
        refund: refund
      });
    } catch (error: any) {
      await rollbackTransaction(client);
      logger.error('Fehler in cancelUpgrade Transaction:', error);
      throw error;
    }
  } catch (error) {
    logger.error('Fehler beim Abbrechen des Ausbaus:', error);
    res.status(500).json({ error: 'Fehler beim Abbrechen des Ausbaus' });
  }
};
