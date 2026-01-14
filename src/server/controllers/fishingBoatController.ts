import { Response } from 'express';
import { FishingBoatModel } from '../models/FishingBoat';
import { VillageModel } from '../models/Village';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';
import { getTransaction, commitTransaction, rollbackTransaction } from '../utils/database-wrapper';

/**
 * Hole Fischerboote für ein Dorf
 */
export const getFishingBoats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.villageId, 10);
    if (isNaN(villageId)) {
      res.status(400).json({ error: 'Ungültige Dorf-ID' });
      return;
    }

    // Prüfe ob Dorf dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village || village.user_id !== req.user.id) {
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    const fishingBoats = await FishingBoatModel.getByVillageId(villageId);
    const boatCount = fishingBoats?.count || 0;
    const foodProduction = await FishingBoatModel.getFoodProductionPerHour(villageId);

    res.json({
      count: boatCount,
      foodProductionPerHour: foodProduction,
    });
  } catch (error) {
    logger.error('Fehler beim Abrufen der Fischerboote:', error);
    res.status(500).json({ 
      error: 'Fehler beim Abrufen der Fischerboote',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Baue ein Fischerboot
 */
export const buildFishingBoat = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }

    const villageId = parseInt(req.params.villageId, 10);
    if (isNaN(villageId)) {
      res.status(400).json({ error: 'Ungültige Dorf-ID' });
      return;
    }

    // Prüfe ob Dorf dem Benutzer gehört
    const village = await VillageModel.findById(villageId);
    if (!village || village.user_id !== req.user.id) {
      res.status(404).json({ error: 'Dorf nicht gefunden' });
      return;
    }

    // Prüfe ob Hafen Stufe 1 oder höher vorhanden ist
    const buildings = await VillageModel.getBuildings(villageId);
    const hafen = buildings.find(b => b.building_type === 'hafen');
    
    if (!hafen || hafen.level < 1) {
      res.status(400).json({ error: 'Hafen Stufe 1 wird benötigt, um Fischerboote zu bauen' });
      return;
    }

    // Prüfe Ressourcen (100 Holz pro Boot)
    const resources = await VillageModel.getResources(villageId);
    if (!resources) {
      res.status(404).json({ error: 'Ressourcen nicht gefunden' });
      return;
    }
    
    const boatCost = 100;

    if (resources.wood < boatCost) {
      res.status(400).json({ error: `Nicht genug Holz. Benötigt: ${boatCost}, Vorhanden: ${resources.wood}` });
      return;
    }

    const client = await getTransaction();
    try {
      // Ziehe Holz ab
      await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? 'UPDATE resources SET wood = wood - ? WHERE village_id = ?'
          : 'UPDATE resources SET wood = wood - $1 WHERE village_id = $2',
        [boatCost, villageId]
      );

      // Füge Fischerboot hinzu
      const fishingBoats = await FishingBoatModel.addBoat(villageId);
      const foodProduction = await FishingBoatModel.getFoodProductionPerHour(villageId);

      await commitTransaction(client);

      logger.info(`Fischerboot gebaut für Dorf ${villageId}, neue Anzahl: ${fishingBoats.count}`);

      res.json({
        message: 'Fischerboot erfolgreich gebaut',
        fishingBoats: {
          count: fishingBoats.count,
          foodProductionPerHour: foodProduction,
        },
      });
    } catch (error) {
      await rollbackTransaction(client);
      throw error;
    }
  } catch (error) {
    logger.error('Fehler beim Bauen des Fischerboots:', error);
    res.status(500).json({ 
      error: 'Fehler beim Bauen des Fischerboots',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
