/**
 * API Client für REST-Kommunikation mit dem Backend
 */
import { API_BASE_URL } from './config.js';

/**
 * Hilfsfunktion: Hole aktuelle Insel-ID
 */
export async function getCurrentIslandId() {
  try {
    const islands = await api.getVillages();
    if (islands && Array.isArray(islands) && islands.length > 0) {
      // Wenn Spieler nur eine Insel hat, wähle diese automatisch aus
      if (islands.length === 1) {
        const singleIslandId = islands[0].id;
        localStorage.setItem('currentIslandId', singleIslandId.toString());
        return singleIslandId;
      }
      
      // Wenn mehrere Inseln vorhanden sind, prüfe gespeicherte ID
      const storedId = localStorage.getItem('currentIslandId');
      if (storedId) {
        const id = parseInt(storedId);
        if (!isNaN(id)) {
          // Prüfe ob die gespeicherte ID noch existiert
          const islandExists = islands.some(island => island.id === id);
          if (islandExists) {
            return id;
          }
        }
      }
      
      // Fallback: Erste Insel auswählen
      const firstIslandId = islands[0].id;
      localStorage.setItem('currentIslandId', firstIslandId.toString());
      return firstIslandId;
    }
  } catch (error) {
    console.error('Fehler beim Abrufen der Inseln:', error);
  }
  return null;
}

class ApiClient {
  constructor() {
    this.baseUrl = API_BASE_URL;
    this.token = localStorage.getItem('authToken');
  }

  /**
   * Setze Auth Token
   */
  setToken(token) {
    this.token = token;
    if (token) {
      localStorage.setItem('authToken', token);
    } else {
      localStorage.removeItem('authToken');
    }
  }

  /**
   * Generische Fetch-Funktion mit Auth-Header
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      // Prüfe ob Antwort leer ist
      const contentType = response.headers.get('content-type');
      const text = await response.text();
      
      let data;
      if (text && contentType && contentType.includes('application/json')) {
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('JSON Parse Fehler:', parseError);
          console.error('Response Text:', text);
          throw new Error(`Ungültige JSON-Antwort: ${text.substring(0, 100)}`);
        }
      } else if (text) {
        // Wenn keine JSON-Antwort, aber Text vorhanden
        throw new Error(`Unerwartete Antwort: ${text.substring(0, 100)}`);
      } else {
        // Leere Antwort
        data = {};
      }

      if (!response.ok) {
        const errorMessage = data.error || `HTTP ${response.status}: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return data;
    } catch (error) {
      console.error('API Request Fehler:', {
        endpoint,
        method: options.method || 'GET',
        error: error.message,
        details: error.details,
        stack: error.stack
      });
      
      // Erstelle eine aussagekräftigere Fehlermeldung
      let errorMessage = error.message || 'Unbekannter Fehler';
      if (error.details && error.details !== error.message) {
        errorMessage = `${errorMessage}: ${error.details}`;
      }
      
      const enhancedError = new Error(errorMessage);
      enhancedError.details = error.details;
      enhancedError.stack = error.stack;
      throw enhancedError;
    }
  }

  /**
   * Auth Endpoints
   */
  async register(username, email, password) {
    return this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    });
  }

  async login(username, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });
    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  }

  async getCurrentUser() {
    return this.request('/auth/me');
  }

  /**
   * Village Endpoints
   */
  async getVillages() {
    return this.request('/villages');
  }

  async getVillageDetails(villageId) {
    return this.request(`/villages/${villageId}`);
  }

  async getLeaderboard(sortBy = 'points') {
    return this.request(`/leaderboard?sortBy=${encodeURIComponent(sortBy)}`);
  }

  async updateVillageName(villageId, name) {
    return this.request(`/villages/${villageId}/name`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    });
  }

  async updatePopulation(villageId, population) {
    return this.request(`/villages/${villageId}/population`, {
      method: 'PATCH',
      body: JSON.stringify({ population }),
    });
  }

  async conquerIsland(villageId) {
    return this.request(`/villages/${villageId}/conquer`, {
      method: 'POST',
    });
  }

  async createNewVillage() {
    return this.request('/villages/create', {
      method: 'POST',
    });
  }

  async getResources(villageId) {
    return this.request(`/villages/${villageId}/resources`);
  }

  /**
   * Hole aktuelles Wetter (für alle Spieler gleich)
   */
  async getWeather() {
    return this.request('/weather');
  }

  /**
   * Fischerboot Endpoints
   */
  async getFishingBoats(villageId) {
    return this.request(`/villages/${villageId}/fishing-boats`);
  }

  async buildFishingBoat(villageId) {
    return this.request(`/villages/${villageId}/fishing-boats/build`, {
      method: 'POST',
    });
  }

  async updateResources(villageId, resources) {
    return this.request(`/villages/${villageId}/resources`, {
      method: 'PUT',
      body: JSON.stringify(resources),
    });
  }

  async upgradeBuilding(villageId, buildingType, position) {
    return this.request(`/villages/${villageId}/buildings/upgrade`, {
      method: 'POST',
      body: JSON.stringify({ buildingType, position }),
    });
  }

  async getBuildings(villageId) {
    const details = await this.getVillageDetails(villageId);
    return details.buildings || [];
  }

  async startUpgrade(villageId, upgradeType, level) {
    return this.request(`/villages/${villageId}/upgrades/start`, {
      method: 'POST',
      body: JSON.stringify({ upgradeType, level }),
    });
  }

  async completeUpgrade(villageId, upgradeType, level, points) {
    console.log('📤 Sende completeUpgrade Request:', { villageId, upgradeType, level, points });
    const result = await this.request(`/villages/${villageId}/upgrades/complete`, {
      method: 'POST',
      body: JSON.stringify({ upgradeType, level, points }),
    });
    console.log('📥 completeUpgrade Response:', result);
    return result;
  }

  async cancelUpgrade(villageId, upgradeType, level, refund, finishTime) {
    console.log('📤 Sende cancelUpgrade Request:', { villageId, upgradeType, level, refund, finishTime });
    const result = await this.request(`/villages/${villageId}/upgrades/cancel`, {
      method: 'POST',
      body: JSON.stringify({ upgradeType, level, refund, finishTime }),
    });
    console.log('📥 cancelUpgrade Response:', result);
    return result;
  }


}

// Exportiere Singleton-Instanz
export const api = new ApiClient();




