import { Response } from 'express';
import { VillageModel } from '../models/Village';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { query, getTransaction, commitTransaction, rollbackTransaction } from '../utils/database-wrapper';

/**
 * Hole alle Dörfer des aktuellen Benutzers
 */
export const getVillages = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villages = await VillageModel.findByUserId(req.user.id);
    res.json(villages);
  } catch (error) {
    logger.error('Fehler beim Abrufen der Dörfer:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Dörfer' });
  }
};

/**
 * Hole Details eines spezifischen Dorfes
 */
export const getVillageDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    if (isNaN(villageId)) {
      res.status(400).json({ error: 'Ungültige Dorf-ID' });
      return;
    }

    const village = await VillageModel.findById(villageId);
    if (!village) {
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    // Prüfe ob Dorf dem Benutzer gehört
    if (village.user_id !== req.user.id) {
      res.status(403).json({ error: 'Keine Berechtigung für dieses Dorf' });
      return;
    }

    // Hole Ressourcen und Gebäude
    const resources = await VillageModel.getResources(villageId);
    const buildings = await VillageModel.getBuildings(villageId);

    res.json({
      village,
      resources,
      buildings,
    });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Dorfdetails:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Dorfdetails' });
  }
};

/**
 * Hole Ressourcen eines Dorfes
 */
export const getResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    if (isNaN(villageId)) {
      res.status(400).json({ error: 'Ungültige Dorf-ID' });
      return;
    }

    const village = await VillageModel.findById(villageId);
    if (!village || village.user_id !== req.user.id) {
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    const resources = await VillageModel.getResources(villageId);
    if (!resources) {
      res.status(404).json({ error: 'Ressourcen nicht gefunden' });
      return;
    }

    res.json(resources);
  } catch (error) {
    logger.error('Fehler beim Abrufen der Ressourcen:', error);
    res.status(500).json({ error: 'Fehler beim Abrufen der Ressourcen' });
  }
};

/**
 * Aktualisiere Ressourcen eines Dorfes
 */
export const updateResources = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    if (isNaN(villageId)) {
      res.status(400).json({ error: 'Ungültige Dorf-ID' });
      return;
    }

    logger.info(`[updateResources] Update für Dorf ${villageId}, User ${req.user.id}`);
    logger.info(`[updateResources] Request Body:`, req.body);

    // Prüfe ob Dorf dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village || village.user_id !== req.user.id) {
      logger.warn(`[updateResources] Dorf ${villageId} nicht gefunden oder gehört nicht zu User ${req.user.id}`);
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    const { wood, stone, water, food, luxury } = req.body;
    
    logger.info(`[updateResources] Aktualisiere Ressourcen:`, { wood, stone, water, food, luxury });
    
    // Aktualisiere Ressourcen
    await VillageModel.updateResources(villageId, {
      wood,
      stone,
      water,
      food,
      luxury,
    });

    // Hole aktualisierte Ressourcen
    const resources = await VillageModel.getResources(villageId);
    
    logger.info(`[updateResources] Ressourcen aktualisiert:`, resources);

    res.json({
      message: 'Ressourcen aktualisiert',
      resources,
    });
  } catch (error) {
    logger.error('Fehler beim Aktualisieren der Ressourcen:', error);
    logger.error('Fehler-Details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    
    // Stelle sicher, dass immer eine JSON-Antwort gesendet wird
    if (!res.headersSent) {
      res.status(500).json({ 
        error: 'Fehler beim Aktualisieren der Ressourcen',
        details: error instanceof Error ? error.message : String(error)
      });
    }
  }
};

/**
 * Upgrade ein Gebäude
 */
export const upgradeBuilding = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    const { buildingType, position } = req.body;

    if (isNaN(villageId) || !buildingType || position === undefined) {
      res.status(400).json({ error: 'Ungültige Parameter' });
      return;
    }

    // Prüfe ob Dorf dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village || village.user_id !== req.user.id) {
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    // Upgrade Gebäude
    const building = await VillageModel.upgradeBuilding(villageId, buildingType, position);

    res.json({
      message: 'Gebäude-Upgrade gestartet',
      building,
    });
  } catch (error) {
    logger.error('Fehler beim Gebäude-Upgrade:', error);
    res.status(500).json({ error: 'Fehler beim Gebäude-Upgrade' });
  }
};

/**
 * Erobere eine Insel
 */
export const conquerIsland = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    if (isNaN(villageId)) {
      res.status(400).json({ error: 'Ungültige Insel-ID' });
      return;
    }

    // Hole Insel
    const village = await VillageModel.findById(villageId);
    if (!village) {
      res.status(404).json({ error: 'Insel nicht gefunden' });
      return;
    }

    // Prüfe ob Insel bereits dem aktuellen Spieler gehört
    if (village.user_id === req.user.id) {
      res.status(400).json({ error: 'Du besitzt diese Insel bereits' });
      return;
    }

    const oldOwnerId = village.user_id;

    // Hole alle Inseln des alten Besitzers
    const oldOwnerIslands = await VillageModel.findByUserId(oldOwnerId);
    const hasOtherIslands = oldOwnerIslands.length > 1;

    // Übertrage Insel an neuen Besitzer
    const client = await getTransaction();
    try {
      // Aktualisiere Besitzer
      await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? 'UPDATE villages SET user_id = ? WHERE id = ?'
          : 'UPDATE villages SET user_id = $1 WHERE id = $2',
        [req.user.id, villageId]
      );

      await commitTransaction(client);

      // Hole aktualisierte Insel
      const updatedVillage = await VillageModel.findById(villageId);

      res.json({
        success: true,
        village: updatedVillage,
        oldOwnerLostAllIslands: !hasOtherIslands,
        oldOwnerId: oldOwnerId
      });
    } catch (error) {
      await rollbackTransaction(client);
      throw error;
    }
  } catch (error) {
    logger.error('Fehler beim Erobern der Insel:', error);
    res.status(500).json({ error: 'Fehler beim Erobern der Insel' });
  }
};


/**
 * Erstelle ein neues Dorf für den aktuellen Benutzer
 */
export const createNewVillage = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    // Prüfe ob Benutzer bereits Inseln hat
    const existingVillages = await VillageModel.findByUserId(req.user.id);
    if (existingVillages.length > 0) {
      res.status(400).json({ error: 'Du hast bereits Inseln' });
      return;
    }

    // Hole alle Inseln um Position zu berechnen
    const allIslandsResult = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'SELECT x, y FROM villages'
        : 'SELECT x, y FROM villages'
    );
    const islandsArray = Array.isArray(allIslandsResult) 
      ? allIslandsResult 
      : (allIslandsResult.rows || []);

    // Berechne nächste freie Position im Kreis von der Mitte weg
    const fieldsX = 100;
    const fieldsY = 100;
    const worldCenterX = Math.floor(fieldsX / 2);
    const worldCenterY = Math.floor(fieldsY / 2);
    const minDistance = 3;

    let position = { x: worldCenterX, y: worldCenterY };
    if (islandsArray.length > 0) {
      // Suche im Kreis von der Mitte weg
      let radius = minDistance;
      const maxRadius = Math.max(fieldsX, fieldsY);
      let found = false;

      while (radius <= maxRadius && !found) {
        for (let angle = 0; angle < 360; angle += 15) {
          const rad = (angle * Math.PI) / 180;
          const x = Math.round(worldCenterX + radius * Math.cos(rad));
          const y = Math.round(worldCenterY + radius * Math.sin(rad));

          if (x >= 0 && x < fieldsX && y >= 0 && y < fieldsY) {
            let isValid = true;
            for (const island of islandsArray) {
              const islandX = island.x !== undefined && island.x !== null ? island.x : 0;
              const islandY = island.y !== undefined && island.y !== null ? island.y : 0;
              const distance = Math.abs(islandX - x) + Math.abs(islandY - y);
              if (distance < minDistance) {
                isValid = false;
                break;
              }
            }

            if (isValid) {
              position = { x, y };
              found = true;
              break;
            }
          }
        }
        radius++;
      }
    }

    // Erstelle neues Dorf
    const villageName = `${req.user.username}s Insel`;
    const village = await VillageModel.create(
      req.user.id,
      villageName,
      position.x,
      position.y
    );

    logger.info('Neues Dorf erstellt:', { villageId: village.id, name: village.name, x: village.x, y: village.y });

    res.status(201).json({
      success: true,
      village: {
        id: village.id,
        name: village.name,
        x: village.x,
        y: village.y,
      },
    });
  } catch (error) {
    logger.error('Fehler beim Erstellen eines neuen Dorfes:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen eines neuen Dorfes' });
  }
};

/**
 * Aktualisiere Inselname
 */
export const updateVillageName = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    if (isNaN(villageId)) {
      res.status(400).json({ error: 'Ungültige Insel-ID' });
      return;
    }

    const { name } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      res.status(400).json({ error: 'Inselname ist erforderlich' });
      return;
    }

    // Prüfe ob Insel dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village) {
      res.status(404).json({ error: 'Insel nicht gefunden' });
      return;
    }

    if (village.user_id !== req.user.id) {
      res.status(403).json({ error: 'Keine Berechtigung für diese Insel' });
      return;
    }

    const updatedVillage = await VillageModel.updateName(villageId, name.trim());
    if (!updatedVillage) {
      res.status(500).json({ error: 'Fehler beim Aktualisieren des Inselnamens' });
      return;
    }

    res.json(updatedVillage);
  } catch (error) {
    logger.error('Fehler beim Aktualisieren des Inselnamens:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Inselnamens' });
  }
};

export const updatePopulation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.id, 10);
    if (isNaN(villageId)) {
      res.status(400).json({ error: 'Ungültige Insel-ID' });
      return;
    }

    const { population } = req.body;
    if (population === undefined || typeof population !== 'number' || population < 0) {
      res.status(400).json({ error: 'Ungültige Bevölkerungszahl' });
      return;
    }

    // Prüfe ob Insel dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village) {
      res.status(404).json({ error: 'Insel nicht gefunden' });
      return;
    }

    if (village.user_id !== req.user.id) {
      res.status(403).json({ error: 'Keine Berechtigung für diese Insel' });
      return;
    }

    const updatedVillage = await VillageModel.updatePopulation(villageId, Math.floor(population));
    if (!updatedVillage) {
      res.status(500).json({ error: 'Fehler beim Aktualisieren der Bevölkerung' });
      return;
    }

    res.json(updatedVillage);
  } catch (error) {
    logger.error('Fehler beim Aktualisieren der Bevölkerung:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Bevölkerung' });
  }
};




