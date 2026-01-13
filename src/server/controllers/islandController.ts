import { Request, Response } from 'express';
import { query, getTransaction, commitTransaction, rollbackTransaction } from '../utils/database-wrapper';
import { logger } from '../utils/logger';
import { AuthRequest } from '../middleware/auth';

/**
 * Hole alle Spieler-Inseln
 */
export const getIslands = async (req: Request, res: Response): Promise<void> => {
  try {
    // Hole alle Dörfer (Inseln) mit Benutzer-Informationen
    const result = await query(
      `SELECT v.id, v.user_id, v.x, v.y, v.points, v.population, u.username, v.name
       FROM villages v
       JOIN users u ON v.user_id = u.id
       ORDER BY v.created_at ASC`
    );
    
    const islands = Array.isArray(result) ? result : result.rows || [];
    
    res.json({
      islands: islands.map((island: any) => ({
        id: island.id,
        villageId: island.id,
        x: island.x,
        y: island.y,
        points: island.points !== undefined ? island.points : 0,
        population: island.population !== undefined ? island.population : 0,
        playerId: island.user_id,
        username: island.username,
        villageName: island.name
      }))
    });
  } catch (error) {
    logger.error('Fehler beim Laden der Inseln:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Inseln' });
  }
};

/**
 * Platziere eine neue Insel für einen Spieler
 */
export const placeIsland = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Nicht authentifiziert' });
      return;
    }
    
    // Prüfe ob Spieler bereits ein Dorf hat
    const existingVillage = await query(
      process.env.DB_TYPE === 'sqlite'
        ? `SELECT id FROM villages WHERE user_id = ? LIMIT 1`
        : `SELECT id FROM villages WHERE user_id = $1 LIMIT 1`,
      [userId]
    );
    
    const existing = Array.isArray(existingVillage) ? existingVillage[0] : existingVillage.rows?.[0];
    
    if (existing) {
      res.status(409).json({ error: 'Spieler hat bereits eine Insel' });
      return;
    }
    
    // Hole alle bestehenden Inseln für Positionsberechnung
    const allIslandsResult = await query(
      `SELECT x, y FROM villages`
    );
    const allIslands = Array.isArray(allIslandsResult) ? allIslandsResult : allIslandsResult.rows || [];
    
    // Berechne nächste freie Position im Kreis von der Mitte weg
    const fieldsX = 100;
    const fieldsY = 100;
    const worldCenterX = Math.floor(fieldsX / 2);
    const worldCenterY = Math.floor(fieldsY / 2);
    const minDistance = 3;
    
    let position = { x: worldCenterX, y: worldCenterY };
    if (allIslands.length > 0) {
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
            for (const island of allIslands) {
              const distance = Math.abs(island.x - x) + Math.abs(island.y - y);
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
      
      if (!found) {
        res.status(500).json({ error: 'Keine freie Position für neue Insel gefunden' });
        return;
      }
    }
    
    // Hole Benutzername
    const userResult = await query(
      process.env.DB_TYPE === 'sqlite'
        ? `SELECT username FROM users WHERE id = ?`
        : `SELECT username FROM users WHERE id = $1`,
      [userId]
    );
    const user = Array.isArray(userResult) ? userResult[0] : userResult.rows?.[0];
    
    if (!user) {
      res.status(404).json({ error: 'Benutzer nicht gefunden' });
      return;
    }
    
    // Erstelle Dorf (Insel) für den Spieler
    const client = await getTransaction();
    try {
      const villageResult = await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? `INSERT INTO villages (user_id, name, x, y, population, points) VALUES (?, ?, ?, ?, 2, 0) RETURNING *`
          : `INSERT INTO villages (user_id, name, x, y, population, points) VALUES ($1, $2, $3, $4, 2, 0) RETURNING *`,
        [userId, `${user.username}s Insel`, position.x, position.y]
      );
      const village = Array.isArray(villageResult) ? villageResult[0] : villageResult.rows[0];
      
      // Initiale Ressourcen setzen
      await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? `INSERT INTO resources (village_id, wood, stone, water, food, luxury) VALUES (?, 750, 750, 750, 750, 0)`
          : `INSERT INTO resources (village_id, wood, stone, water, food, luxury) VALUES ($1, 750, 750, 750, 750, 0)`,
        [village.id]
      );
      
      // Initiale Gebäude erstellen (Hauptgebäude Level 1)
      await client.query(
        process.env.DB_TYPE === 'sqlite'
          ? `INSERT INTO buildings (village_id, building_type, level, position) VALUES (?, 'main_building', 1, 0)`
          : `INSERT INTO buildings (village_id, building_type, level, position) VALUES ($1, 'main_building', 1, 0)`,
        [village.id]
      );
      
      await commitTransaction(client);
      
      res.status(201).json({
        message: 'Insel erfolgreich platziert',
        island: {
          x: village.x,
          y: village.y,
          playerId: village.user_id,
          villageId: village.id,
          villageName: village.name
        }
      });
    } catch (error) {
      await rollbackTransaction(client);
      throw error;
    }
  } catch (error) {
    logger.error('Fehler beim Platzieren der Insel:', error);
    res.status(500).json({ error: 'Fehler beim Platzieren der Insel' });
  }
};

