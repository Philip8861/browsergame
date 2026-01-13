import { Request, Response } from 'express';
import { query } from '../utils/database-wrapper';
import { logger } from '../utils/logger';

/**
 * Hole Rangliste aller Spieler
 * Aggregiert Daten über alle Inseln eines Spielers
 */
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
  try {
    const sortBy = req.query.sortBy as string || 'points';
    
    // Validiere Sortier-Parameter
    const validSortFields = ['points', 'population', 'wood', 'stone', 'water', 'food', 'luxury', 'island_count'];
    if (!validSortFields.includes(sortBy)) {
      res.status(400).json({ error: `Ungültiger Sortier-Parameter. Erlaubt: ${validSortFields.join(', ')}` });
      return;
    }

    // Sortier-Feld-Mapping (sicher gegen SQL-Injection)
    const sortFieldMap: Record<string, string> = {
      points: 'total_points',
      population: 'total_population',
      wood: 'total_wood',
      stone: 'total_stone',
      water: 'total_water',
      food: 'total_food',
      luxury: 'total_luxury',
      island_count: 'island_count'
    };

    const sortField = sortFieldMap[sortBy] || 'total_points';
    const isSQLite = process.env.DB_TYPE === 'sqlite';

    // Versuche zuerst mit points Spalte, falls sie nicht existiert, verwende Fallback
    let leaderboardQuery = '';
    let result: any;
    
    try {
      // SQL Query für aggregierte Spielerdaten mit points
      leaderboardQuery = `
        SELECT 
          u.id as user_id,
          u.username,
          COALESCE(SUM(COALESCE(v.points, 0)), 0) as total_points,
          COALESCE(SUM(COALESCE(v.population, 0)), 0) as total_population,
          COALESCE(SUM(COALESCE(r.wood, 0)), 0) as total_wood,
          COALESCE(SUM(COALESCE(r.stone, 0)), 0) as total_stone,
          COALESCE(SUM(COALESCE(r.water, 0)), 0) as total_water,
          COALESCE(SUM(COALESCE(r.food, 0)), 0) as total_food,
          COALESCE(SUM(COALESCE(r.luxury, 0)), 0) as total_luxury,
          COUNT(DISTINCT v.id) as island_count
        FROM users u
        LEFT JOIN villages v ON u.id = v.user_id
        LEFT JOIN resources r ON v.id = r.village_id
        GROUP BY u.id, u.username
        HAVING COUNT(DISTINCT v.id) > 0
        ORDER BY ${sortField} DESC
      `;

      logger.info(`[Leaderboard] Lade Rangliste sortiert nach: ${sortBy} (Feld: ${sortField})`);
      logger.info(`[Leaderboard] DB Type: ${isSQLite ? 'SQLite' : 'PostgreSQL'}`);

      result = await query(leaderboardQuery, []);
    } catch (error: any) {
      // Falls points Spalte nicht existiert, verwende Fallback ohne points
      logger.warn(`[Leaderboard] Fehler mit points Spalte, verwende Fallback: ${error.message}`);
      
      // Fallback Query ohne points (setze points auf 0)
      leaderboardQuery = `
        SELECT 
          u.id as user_id,
          u.username,
          0 as total_points,
          COALESCE(SUM(COALESCE(v.population, 0)), 0) as total_population,
          COALESCE(SUM(COALESCE(r.wood, 0)), 0) as total_wood,
          COALESCE(SUM(COALESCE(r.stone, 0)), 0) as total_stone,
          COALESCE(SUM(COALESCE(r.water, 0)), 0) as total_water,
          COALESCE(SUM(COALESCE(r.food, 0)), 0) as total_food,
          COALESCE(SUM(COALESCE(r.luxury, 0)), 0) as total_luxury,
          COUNT(DISTINCT v.id) as island_count
        FROM users u
        LEFT JOIN villages v ON u.id = v.user_id
        LEFT JOIN resources r ON v.id = r.village_id
        GROUP BY u.id, u.username
        HAVING COUNT(DISTINCT v.id) > 0
        ORDER BY ${sortField === 'total_points' ? 'total_population' : sortField} DESC
      `;
      
      result = await query(leaderboardQuery, []);
    }
    const leaderboard = Array.isArray(result) ? result : result.rows || [];
    
    logger.info(`[Leaderboard] ${leaderboard.length} Spieler gefunden`);

    // Formatiere Daten für Frontend
    const formattedLeaderboard = leaderboard.map((row: any, index: number) => ({
      rank: index + 1,
      userId: row.user_id,
      username: row.username,
      points: Math.floor(row.total_points || 0),
      population: Math.floor(row.total_population || 0),
      wood: Math.floor(row.total_wood || 0),
      stone: Math.floor(row.total_stone || 0),
      water: Math.floor(row.total_water || 0),
      food: Math.floor(row.total_food || 0),
      luxury: Math.floor(row.total_luxury || 0),
      islandCount: parseInt(row.island_count || 0, 10)
    }));

    res.json({
      leaderboard: formattedLeaderboard,
      sortBy: sortBy
    });
  } catch (error) {
    logger.error('Fehler beim Laden der Rangliste:', error);
    logger.error('Fehler-Details:', {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    });
    res.status(500).json({ 
      error: 'Fehler beim Laden der Rangliste',
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
