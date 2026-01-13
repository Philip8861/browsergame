import fs from 'fs';
import path from 'path';

/**
 * Mock-Datenbank für schnelles Testen ohne PostgreSQL
 * Speichert Daten in JSON-Dateien
 */
const dataDir = path.join(process.cwd(), 'data');
const dbFile = path.join(dataDir, 'mock-db.json');

interface MockDB {
  users: any[];
  villages: any[];
  resources: any[];
  buildings: any[];
}

let db: MockDB = {
  users: [],
  villages: [],
  resources: [],
  buildings: [],
};

// Lade Datenbank beim Start
if (fs.existsSync(dbFile)) {
  try {
    db = JSON.parse(fs.readFileSync(dbFile, 'utf-8'));
  } catch (error) {
    console.log('Neue Mock-Datenbank wird erstellt');
  }
}

// Speichere Datenbank
function saveDB() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  fs.writeFileSync(dbFile, JSON.stringify(db, null, 2));
}

/**
 * Teste die Datenbankverbindung
 */
export async function testConnection(): Promise<boolean> {
  return true;
}

/**
 * Führe eine Query aus (vereinfachte SQL-Parsing)
 */
export async function query(text: string, params?: unknown[]): Promise<any> {
  const upperText = text.toUpperCase().trim();
  
  // INSERT INTO users
  if (upperText.includes('INSERT INTO USERS')) {
    if (params && params.length >= 3) {
      const user: any = {
        id: db.users.length + 1,
        username: params[0],
        email: params[1],
        password_hash: params[2],
        created_at: new Date().toISOString(),
        last_login: null,
      };
      db.users.push(user);
      saveDB();
      
      // Wenn RETURNING vorhanden, filtere die zurückgegebenen Felder
      if (upperText.includes('RETURNING')) {
        const returningMatch = text.match(/RETURNING\s+(.+)/i);
        if (returningMatch) {
          const fields = returningMatch[1].split(',').map(f => f.trim());
          const filteredUser: any = {};
          fields.forEach(field => {
            if (user[field]) filteredUser[field] = user[field];
          });
          return { rows: [filteredUser], rowCount: 1 };
        }
      }
      return { rows: [user], rowCount: 1 };
    }
  }
  
  // SELECT * FROM users WHERE email
  if (upperText.includes('SELECT') && upperText.includes('FROM USERS') && upperText.includes('WHERE EMAIL')) {
    const user = db.users.find(u => u.email === params?.[0]);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  
  // SELECT * FROM users WHERE username
  if (upperText.includes('SELECT') && upperText.includes('FROM USERS') && upperText.includes('WHERE USERNAME')) {
    const user = db.users.find(u => u.username === params?.[0]);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  
  // SELECT * FROM users WHERE id
  if (upperText.includes('SELECT') && upperText.includes('FROM USERS') && upperText.includes('WHERE ID')) {
    const user = db.users.find(u => u.id === params?.[0]);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }
  
  // UPDATE users SET last_login
  if (upperText.includes('UPDATE USERS') && upperText.includes('SET LAST_LOGIN')) {
    const user = db.users.find(u => u.id === params?.[0]);
    if (user) {
      user.last_login = new Date().toISOString();
      saveDB();
    }
    return { rows: [], rowCount: 1 };
  }
  
  // INSERT INTO villages
  if (upperText.includes('INSERT INTO VILLAGES')) {
    if (params && params.length >= 4) {
      const village: any = {
        id: db.villages.length + 1,
        user_id: params[0],
        name: params[1],
        x: params[2],
        y: params[3],
        population: params[4] || 2,
        created_at: new Date().toISOString(),
      };
      db.villages.push(village);
      saveDB();
      
      // Wenn RETURNING vorhanden
      if (upperText.includes('RETURNING')) {
        const returningMatch = text.match(/RETURNING\s+(.+)/i);
        if (returningMatch) {
          const fields = returningMatch[1].split(',').map(f => f.trim().replace(/\*/g, ''));
          if (fields.includes('*') || fields.length === 0) {
            return { rows: [village], rowCount: 1 };
          }
          const filteredVillage: any = {};
          fields.forEach(field => {
            if (village[field]) filteredVillage[field] = village[field];
          });
          return { rows: [filteredVillage], rowCount: 1 };
        }
      }
      return { rows: [village], rowCount: 1 };
    }
  }
  
  // SELECT * FROM villages WHERE user_id
  if (upperText.includes('SELECT') && upperText.includes('FROM VILLAGES') && upperText.includes('WHERE USER_ID')) {
    const villages = db.villages.filter(v => v.user_id === params?.[0]);
    return { rows: villages, rowCount: villages.length };
  }
  
  // SELECT * FROM villages WHERE id
  if (upperText.includes('SELECT') && upperText.includes('FROM VILLAGES') && upperText.includes('WHERE ID')) {
    const village = db.villages.find(v => v.id === params?.[0]);
    return { rows: village ? [village] : [], rowCount: village ? 1 : 0 };
  }
  
  // INSERT INTO resources
  if (upperText.includes('INSERT INTO RESOURCES')) {
    const match = text.match(/VALUES\s*\(([^)]+)\)/i);
    if (match && params) {
      const resource = {
        village_id: params[0],
        wood: params[1] || 750,
        clay: params[2] || 750,
        iron: params[3] || 750,
        wheat: params[4] || 750,
        last_updated: new Date().toISOString(),
      };
      db.resources.push(resource);
      saveDB();
      return { rows: [resource], rowCount: 1 };
    }
  }
  
  // SELECT * FROM resources WHERE village_id
  if (upperText.includes('SELECT') && upperText.includes('FROM RESOURCES') && upperText.includes('WHERE VILLAGE_ID')) {
    const resource = db.resources.find(r => r.village_id === params?.[0]);
    return { rows: resource ? [resource] : [], rowCount: resource ? 1 : 0 };
  }
  
  // UPDATE resources SET
  if (upperText.includes('UPDATE RESOURCES')) {
    try {
      console.log(`[MOCK DB] UPDATE resources Query:`, text);
      console.log(`[MOCK DB] Parameters:`, params);
      
      if (!params || params.length === 0) {
        throw new Error('Keine Parameter für UPDATE resources Query');
      }
      
      // Finde village_id (letzter Parameter)
      const villageId = params[params.length - 1];
      
      if (!villageId) {
        throw new Error(`Ungültige village_id: ${villageId}`);
      }
      
      const resource = db.resources.find(r => r.village_id === villageId);
      
      if (!resource) {
        console.warn(`[MOCK DB] Keine Ressourcen gefunden für Dorf ${villageId}`);
        throw new Error(`Keine Ressourcen gefunden für Dorf ${villageId}`);
      }
      
      // Parse die UPDATE-Query um zu sehen welche Felder aktualisiert werden
      // Die Parameter kommen in der Reihenfolge der SET-Klauseln
      // Beispiel: UPDATE resources SET wood = $1, last_updated = NOW() WHERE village_id = $2
      // params[0] = wood value, params[1] = village_id
      
      // Finde die Position jedes Feldes in der Query und extrahiere Parameter-Index
      const woodMatch = text.match(/wood\s*=\s*\$\d+/i);
      const clayMatch = text.match(/clay\s*=\s*\$\d+/i);
      const ironMatch = text.match(/iron\s*=\s*\$\d+/i);
      const wheatMatch = text.match(/wheat\s*=\s*\$\d+/i);
      
      // Extrahiere Parameter-Index aus Matches (1-basiert zu 0-basiert)
      const getParamIndex = (match) => {
        if (!match) return -1;
        const numMatch = match[0].match(/\$(\d+)/);
        return numMatch ? parseInt(numMatch[1], 10) - 1 : -1;
      };
      
      const woodParamIndex = getParamIndex(woodMatch);
      const clayParamIndex = getParamIndex(clayMatch);
      const ironParamIndex = getParamIndex(ironMatch);
      const wheatParamIndex = getParamIndex(wheatMatch);
      
      console.log(`[MOCK DB] Parameter-Indizes: wood=${woodParamIndex}, clay=${clayParamIndex}, iron=${ironParamIndex}, wheat=${wheatParamIndex}`);
      
      let updated = false;
      
      // Aktualisiere nur die Felder die in der Query sind
      if (woodParamIndex >= 0 && params[woodParamIndex] !== undefined) {
        resource.wood = Number(params[woodParamIndex]);
        console.log(`[MOCK DB] Holz aktualisiert: ${resource.wood}`);
        updated = true;
      }
      if (clayParamIndex >= 0 && params[clayParamIndex] !== undefined) {
        resource.clay = Number(params[clayParamIndex]);
        console.log(`[MOCK DB] Lehm aktualisiert: ${resource.clay}`);
        updated = true;
      }
      if (ironParamIndex >= 0 && params[ironParamIndex] !== undefined) {
        resource.iron = Number(params[ironParamIndex]);
        console.log(`[MOCK DB] Eisen aktualisiert: ${resource.iron}`);
        updated = true;
      }
      if (wheatParamIndex >= 0 && params[wheatParamIndex] !== undefined) {
        resource.wheat = Number(params[wheatParamIndex]);
        console.log(`[MOCK DB] Weizen aktualisiert: ${resource.wheat}`);
        updated = true;
      }
      
      if (!updated) {
        console.warn(`[MOCK DB] Keine Felder aktualisiert für Dorf ${villageId}`);
      }
      
      resource.last_updated = new Date().toISOString();
      saveDB();
      console.log(`[MOCK DB] Ressourcen aktualisiert für Dorf ${villageId}:`, resource);
      return { rows: [resource], rowCount: 1 };
    } catch (error) {
      console.error(`[MOCK DB] Fehler bei UPDATE resources:`, error);
      throw error;
    }
  }
  
  // INSERT INTO buildings
  if (upperText.includes('INSERT INTO BUILDINGS')) {
    const match = text.match(/VALUES\s*\(([^)]+)\)/i);
    if (match && params) {
      const building = {
        id: db.buildings.length + 1,
        village_id: params[0],
        building_type: params[1],
        level: params[2] || 1,
        position: params[3],
        upgrade_finishes_at: params[4] || null,
        created_at: new Date().toISOString(),
      };
      db.buildings.push(building);
      saveDB();
      return { rows: [building], rowCount: 1 };
    }
  }
  
  // SELECT * FROM buildings WHERE village_id
  if (upperText.includes('SELECT') && upperText.includes('FROM BUILDINGS') && upperText.includes('WHERE VILLAGE_ID')) {
    const buildings = db.buildings.filter(b => b.village_id === params?.[0]);
    return { rows: buildings, rowCount: buildings.length };
  }
  
  // UPDATE buildings SET level
  if (upperText.includes('UPDATE BUILDINGS') && upperText.includes('SET LEVEL')) {
    const building = db.buildings.find(b => 
      b.village_id === params?.[0] && 
      b.building_type === params?.[1] && 
      b.position === params?.[2]
    );
    if (building) {
      building.level = (building.level || 1) + 1;
      const upgradeTime = 60 * (building.level + 1);
      building.upgrade_finishes_at = new Date(Date.now() + upgradeTime * 1000).toISOString();
      saveDB();
      return { rows: [building], rowCount: 1 };
    }
  }
  
  // SELECT * FROM buildings WHERE village_id AND building_type AND position
  if (upperText.includes('SELECT') && upperText.includes('FROM BUILDINGS') && upperText.includes('AND')) {
    const building = db.buildings.find(b => 
      b.village_id === params?.[0] && 
      b.building_type === params?.[1] && 
      b.position === params?.[2]
    );
    return { rows: building ? [building] : [], rowCount: building ? 1 : 0 };
  }
  
  console.warn('Unbekannte Query:', text);
  return { rows: [], rowCount: 0 };
}

/**
 * Beginne eine Transaktion (Mock - macht nichts)
 */
export async function getTransaction(): Promise<any> {
  return {
    query: (text: string, params?: unknown[]) => query(text, params),
  };
}

/**
 * Committe eine Transaktion (Mock - speichert DB)
 */
export async function commitTransaction(_client: any): Promise<void> {
  saveDB();
}

/**
 * Rollback einer Transaktion (Mock - macht nichts)
 */
export async function rollbackTransaction(_client: any): Promise<void> {
  // Mock - kein Rollback nötig
}

console.log('✅ Mock-Datenbank initialisiert (Daten werden in data/mock-db.json gespeichert)');

export default { query, testConnection, getTransaction, commitTransaction, rollbackTransaction };

