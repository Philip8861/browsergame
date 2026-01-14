import { query, getTransaction, commitTransaction, rollbackTransaction } from '../utils/database-wrapper';

export interface FishingBoat {
  id: number;
  village_id: number;
  count: number;
  created_at: Date;
  updated_at: Date;
}

/**
 * Fishing Boat Model - Verwaltet Fischerboote für Dörfer
 */
export class FishingBoatModel {
  /**
   * Hole Fischerboote für ein Dorf
   */
  static async getByVillageId(villageId: number): Promise<FishingBoat | null> {
    const result = await query(
      process.env.DB_TYPE === 'sqlite'
        ? 'SELECT * FROM fishing_boats WHERE village_id = ? LIMIT 1'
        : 'SELECT * FROM fishing_boats WHERE village_id = $1 LIMIT 1',
      [villageId]
    );
    
    if (Array.isArray(result)) {
      return result[0] || null;
    }
    return result.rows?.[0] || null;
  }

  /**
   * Erstelle oder aktualisiere Fischerboote für ein Dorf
   */
  static async createOrUpdate(villageId: number, count: number): Promise<FishingBoat> {
    const client = await getTransaction();
    try {
      const existing = await this.getByVillageId(villageId);
      
      if (existing) {
        // Update
        if (process.env.DB_TYPE === 'sqlite') {
          await client.query(
            'UPDATE fishing_boats SET count = ?, updated_at = CURRENT_TIMESTAMP WHERE village_id = ?',
            [count, villageId]
          );
        } else {
          await client.query(
            'UPDATE fishing_boats SET count = $1, updated_at = NOW() WHERE village_id = $2',
            [count, villageId]
          );
        }
        await commitTransaction(client);
        
        const updated = await this.getByVillageId(villageId);
        if (!updated) {
          throw new Error('Fischerboote konnten nicht aktualisiert werden');
        }
        return updated;
      } else {
        // Create
        if (process.env.DB_TYPE === 'sqlite') {
          await client.query(
            'INSERT INTO fishing_boats (village_id, count) VALUES (?, ?)',
            [villageId, count]
          );
        } else {
          await client.query(
            'INSERT INTO fishing_boats (village_id, count) VALUES ($1, $2) RETURNING *',
            [villageId, count]
          );
        }
        await commitTransaction(client);
        
        const created = await this.getByVillageId(villageId);
        if (!created) {
          throw new Error('Fischerboote konnten nicht erstellt werden');
        }
        return created;
      }
    } catch (error) {
      await rollbackTransaction(client);
      throw error;
    }
  }

  /**
   * Füge ein Fischerboot hinzu
   */
  static async addBoat(villageId: number): Promise<FishingBoat> {
    const existing = await this.getByVillageId(villageId);
    const currentCount = existing?.count || 0;
    return this.createOrUpdate(villageId, currentCount + 1);
  }

  /**
   * Berechne Nahrungsproduktion pro Stunde basierend auf Fischerbooten
   */
  static async getFoodProductionPerHour(villageId: number): Promise<number> {
    const fishingBoats = await this.getByVillageId(villageId);
    const boatCount = fishingBoats?.count || 0;
    // Jedes Boot bringt 100 Nahrung pro Stunde
    return boatCount * 100;
  }
}
