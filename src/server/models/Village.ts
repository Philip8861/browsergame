import { query, getTransaction, commitTransaction, rollbackTransaction } from '../utils/database-wrapper';

export interface Village {
  id: number;
  user_id: number;
  name: string;
  x: number;
  y: number;
  population: number;
  points: number;
  created_at: Date;
}

export interface Resources {
  village_id: number;
  wood: number;
  stone: number;
  water: number;
  food: number;
  luxury: number;
  last_updated: Date;
}

export interface Building {
  id: number;
  village_id: number;
  building_type: string;
  level: number;
  position: number;
  upgrade_finishes_at?: Date;
}

/**
 * Village Model - Datenbankoperationen für Dörfer
 */
export class VillageModel {
  /**
   * Erstelle ein neues Dorf für einen Benutzer
   */
  static async create(userId: number, name: string, x: number, y: number): Promise<Village> {
    console.log('[VillageModel] Erstelle Dorf:', { userId, name, x, y, dbType: process.env.DB_TYPE });
    const client = await getTransaction();
    try {
      // Dorf erstellen
      if (process.env.DB_TYPE === 'sqlite') {
        console.log('[VillageModel] Führe INSERT für Dorf aus (SQLite)');
        let insertSuccess = false;
        try {
          // Versuche INSERT mit points
          const insertResult = await client.query(
            `INSERT INTO villages (user_id, name, x, y, population, points)
             VALUES (?, ?, ?, ?, 2, 0)`,
            [userId, name, x, y]
          );
          console.log('[VillageModel] INSERT mit points erfolgreich:', insertResult);
          insertSuccess = true;
        } catch (insertError: any) {
          console.log('[VillageModel] INSERT mit points fehlgeschlagen:', insertError.message);
          // Falls points-Spalte nicht existiert, versuche ohne points
          if (insertError.message && (insertError.message.includes('no such column: points') || insertError.message.includes('no such column'))) {
            console.log('[VillageModel] points-Spalte existiert nicht, versuche INSERT ohne points');
            const insertResult2 = await client.query(
              `INSERT INTO villages (user_id, name, x, y, population)
               VALUES (?, ?, ?, ?, 2)`,
              [userId, name, x, y]
            );
            console.log('[VillageModel] INSERT ohne points erfolgreich:', insertResult2);
            insertSuccess = true;
          } else {
            console.error('[VillageModel] INSERT-Fehler (nicht points-bezogen):', insertError);
            throw insertError;
          }
        }
        if (!insertSuccess) {
          throw new Error('INSERT konnte nicht ausgeführt werden');
        }
        console.log('[VillageModel] INSERT erfolgreich, hole Dorf zurück');
        // Hole das erstellte Dorf zurück (SQLite hat kein RETURNING)
        const result = await client.query(
          `SELECT * FROM villages WHERE user_id = ? AND name = ? ORDER BY id DESC LIMIT 1`,
          [userId, name]
        );
        console.log('[VillageModel] SELECT Ergebnis:', result);
        const village = Array.isArray(result) ? result[0] : result.rows[0];
        if (!village) {
          throw new Error('Dorf konnte nach INSERT nicht gefunden werden');
        }
        // Stelle sicher, dass points vorhanden ist (falls Spalte nicht existiert)
        if (village.points === undefined) {
          village.points = 0;
        }
        console.log('[VillageModel] Dorf gefunden:', village);
        
        // Initiale Ressourcen setzen
        console.log('[VillageModel] Erstelle Ressourcen für Dorf:', village.id);
        await client.query(
          `INSERT INTO resources (village_id, wood, stone, water, food, luxury)
           VALUES (?, 750, 750, 750, 750, 0)`,
          [village.id]
        );
        console.log('[VillageModel] Ressourcen erstellt');

        // Initiale Gebäude erstellen (Hauptgebäude Level 1)
        console.log('[VillageModel] Erstelle Gebäude für Dorf:', village.id);
        await client.query(
          `INSERT INTO buildings (village_id, building_type, level, position)
           VALUES (?, 'main_building', 1, 0)`,
          [village.id]
        );
        console.log('[VillageModel] Gebäude erstellt');

        console.log('[VillageModel] Committe Transaktion');
        await commitTransaction(client);
        console.log('[VillageModel] Transaktion committed');
        return village;
      } else {
        // PostgreSQL
        console.log('[VillageModel] Führe INSERT für Dorf aus (PostgreSQL)');
        const villageResult = await client.query(
          `INSERT INTO villages (user_id, name, x, y, population, points)
           VALUES ($1, $2, $3, $4, 2, 0)
           RETURNING *`,
          [userId, name, x, y]
        );
        const village = villageResult.rows[0];
        console.log('[VillageModel] Dorf erstellt:', village);

        // Initiale Ressourcen setzen
        console.log('[VillageModel] Erstelle Ressourcen für Dorf:', village.id);
        await client.query(
          `INSERT INTO resources (village_id, wood, stone, water, food, luxury)
           VALUES ($1, 750, 750, 750, 750, 0)`,
          [village.id]
        );
        console.log('[VillageModel] Ressourcen erstellt');

        // Initiale Gebäude erstellen (Hauptgebäude Level 1)
        console.log('[VillageModel] Erstelle Gebäude für Dorf:', village.id);
        await client.query(
          `INSERT INTO buildings (village_id, building_type, level, position)
           VALUES ($1, 'main_building', 1, 0)`,
          [village.id]
        );
        console.log('[VillageModel] Gebäude erstellt');

        console.log('[VillageModel] Committe Transaktion');
        await commitTransaction(client);
        console.log('[VillageModel] Transaktion committed');
        return village;
      }
    } catch (error) {
      console.error('[VillageModel] Fehler beim Erstellen des Dorfes:', error);
      await rollbackTransaction(client);
      throw error;
    }
  }

  /**
   * Hole alle Dörfer eines Benutzers
   */
  static async findByUserId(userId: number): Promise<Village[]> {
    try {
      // Versuche zuerst mit points-Spalte
      const result = await query(
        process.env.DB_TYPE === 'sqlite'
          ? 'SELECT * FROM villages WHERE user_id = ? ORDER BY created_at ASC'
          : 'SELECT * FROM villages WHERE user_id = $1 ORDER BY created_at ASC',
        [userId]
      );
      const villages = Array.isArray(result) ? result : result.rows || [];
      
      // Füge points hinzu falls nicht vorhanden
      return villages.map((v: any) => ({
        ...v,
        points: v.points !== undefined ? v.points : 0
      }));
    } catch (error: any) {
      // Falls Query fehlschlägt, logge Fehler und werfe weiter
      console.error('[VillageModel] Fehler bei findByUserId:', error);
      throw error;
    }
  }

  /**
   * Hole ein Dorf nach ID
   */
  static async findById(villageId: number): Promise<Village | null> {
    try {
      const result = await query(
        process.env.DB_TYPE === 'sqlite'
          ? 'SELECT * FROM villages WHERE id = ?'
          : 'SELECT * FROM villages WHERE id = $1',
        [villageId]
      );
      const village = Array.isArray(result) ? result[0] : result.rows?.[0];
      
      if (!village) {
        return null;
      }
      
      // Füge points hinzu falls nicht vorhanden
      return {
        ...village,
        points: village.points !== undefined ? village.points : 0
      };
    } catch (error: any) {
      console.error('[VillageModel] Fehler bei findById:', error);
      throw error;
    }
  }

  /**
   * Hole Ressourcen eines Dorfes
   */
  static async getResources(villageId: number): Promise<Resources | null> {
    const result = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'SELECT * FROM resources WHERE village_id = ?'
        : 'SELECT * FROM resources WHERE village_id = $1',
      [villageId]
    );
    if (Array.isArray(result)) {
      return result[0] || null;
    }
    return result.rows?.[0] || null;
  }

  /**
   * Aktualisiere Ressourcen
   */
  static async updateResources(
    villageId: number,
    resources: Partial<Resources>
  ): Promise<void> {
    try {
      const updates: string[] = [];
      const values: unknown[] = [];
      const isSQLite = process.env.DB_TYPE === 'sqlite';
      let paramIndex = 1;

      if (resources.wood !== undefined) {
        if (isSQLite) {
          updates.push(`wood = ?`);
        } else {
          updates.push(`wood = $${paramIndex}`);
        }
        values.push(resources.wood);
        paramIndex++;
      }
      if (resources.stone !== undefined) {
        if (isSQLite) {
          updates.push(`stone = ?`);
        } else {
          updates.push(`stone = $${paramIndex}`);
        }
        values.push(resources.stone);
        paramIndex++;
      }
      if (resources.water !== undefined) {
        if (isSQLite) {
          updates.push(`water = ?`);
        } else {
          updates.push(`water = $${paramIndex}`);
        }
        values.push(resources.water);
        paramIndex++;
      }
      if (resources.food !== undefined) {
        if (isSQLite) {
          updates.push(`food = ?`);
        } else {
          updates.push(`food = $${paramIndex}`);
        }
        values.push(resources.food);
        paramIndex++;
      }
      if (resources.luxury !== undefined) {
        if (isSQLite) {
          updates.push(`luxury = ?`);
        } else {
          updates.push(`luxury = $${paramIndex}`);
        }
        values.push(resources.luxury);
        paramIndex++;
      }

      if (updates.length === 0) {
        console.warn('[VillageModel] Keine Ressourcen zum Aktualisieren');
        return;
      }

      // last_updated wird nicht als Parameter hinzugefügt, da es eine SQL-Funktion ist
      if (isSQLite) {
        updates.push(`last_updated = CURRENT_TIMESTAMP`);
      } else {
        updates.push(`last_updated = NOW()`);
      }
      values.push(villageId);
      
      const queryText = isSQLite
        ? `UPDATE resources SET ${updates.join(', ')} WHERE village_id = ?`
        : `UPDATE resources SET ${updates.join(', ')} WHERE village_id = $${paramIndex}`;
      
      console.log('[VillageModel] Update Query:', queryText);
      console.log('[VillageModel] Parameters:', values);
      
      const result = await query(queryText, values);
      
      console.log('[VillageModel] Update Result:', result);
      
      const rowCount = isSQLite ? (result.changes || 0) : (result.rowCount || 0);
      if (rowCount === 0) {
        console.warn(`[VillageModel] Keine Zeile aktualisiert für Dorf ${villageId}`);
      }
    } catch (error) {
      console.error('[VillageModel] Fehler beim Aktualisieren der Ressourcen:', error);
      throw error;
    }
  }

  /**
   * Aktualisiere Inselname
   */
  static async updateName(villageId: number, name: string): Promise<Village | null> {
    const result = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'UPDATE villages SET name = ? WHERE id = ?'
        : 'UPDATE villages SET name = $1 WHERE id = $2',
      [name, villageId]
    );
    
    if (result.rowCount === 0) {
      return null;
    }
    
    return await this.findById(villageId);
  }

  /**
   * Aktualisiere Bevölkerung
   */
  static async updatePopulation(villageId: number, population: number): Promise<Village | null> {
    const result = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'UPDATE villages SET population = ? WHERE id = ?'
        : 'UPDATE villages SET population = $1 WHERE id = $2',
      [population, villageId]
    );
    
    const rowCount = process.env.DB_TYPE === 'sqlite' ? (result.changes || 0) : (result.rowCount || 0);
    if (rowCount === 0) {
      return null;
    }
    
    return await this.findById(villageId);
  }

  /**
   * Hole alle Gebäude eines Dorfes
   */
  static async getBuildings(villageId: number): Promise<Building[]> {
    const result = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'SELECT * FROM buildings WHERE village_id = ? ORDER BY position ASC'
        : 'SELECT * FROM buildings WHERE village_id = $1 ORDER BY position ASC',
      [villageId]
    );
    return Array.isArray(result) ? result : result.rows || [];
  }

  /**
   * Upgrade ein Gebäude
   */
  static async upgradeBuilding(
    villageId: number,
    buildingType: string,
    position: number
  ): Promise<Building> {
    // Prüfe ob Gebäude existiert
    const existing = await query(
      'SELECT * FROM buildings WHERE village_id = $1 AND building_type = $2 AND position = $3',
      [villageId, buildingType, position]
    );

    let building: Building;
    const upgradeTime = this.calculateUpgradeTime(buildingType, existing.rows[0]?.level || 0);

    if (existing.rows.length > 0) {
      // Gebäude existiert, upgrade
      const result = await query(
        `UPDATE buildings 
         SET level = level + 1, upgrade_finishes_at = NOW() + INTERVAL '${upgradeTime} seconds'
         WHERE village_id = $1 AND building_type = $2 AND position = $3
         RETURNING *`,
        [villageId, buildingType, position]
      );
      building = result.rows[0];
    } else {
      // Neues Gebäude erstellen
      const result = await query(
        `INSERT INTO buildings (village_id, building_type, level, position, upgrade_finishes_at)
         VALUES ($1, $2, 1, $3, NOW() + INTERVAL '${upgradeTime} seconds')
         RETURNING *`,
        [villageId, buildingType, position]
      );
      building = result.rows[0];
    }

    return building;
  }

  /**
   * Berechne Upgrade-Zeit basierend auf Gebäudetyp und Level
   */
  private static calculateUpgradeTime(buildingType: string, currentLevel: number): number {
    // Basis-Zeit in Sekunden (vereinfacht)
    const baseTime = 60; // 1 Minute
    return baseTime * (currentLevel + 1);
  }
}

