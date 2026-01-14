/**
 * Wetter und Uhrzeit Manager
 * Verwaltet die Anzeige von Wetter und Uhrzeit
 */
class WeatherTimeManager {
  constructor() {
    this.currentWeather = null;
    this.weatherTimer = null;
    this.timeTimer = null;
    this.ws = null;
    this.init();
  }

  async init() {
    console.log('🌤️ Initialisiere Wetter-Manager...');
    
    // Lade initiales Wetter
    await this.loadWeather();
    
    // Starte Uhrzeit-Updates
    this.startTimeUpdates();
    
    // Verbinde mit WebSocket für Wetter-Updates
    this.connectWebSocket();
    
    // Starte Wetter-Timer-Updates
    this.startWeatherTimer();
    
    console.log('✅ Wetter-Manager initialisiert');
  }

  /**
   * Lade aktuelles Wetter vom Server
   */
  async loadWeather() {
    try {
      console.log('🌤️ Lade Wetter vom Server...');
      const { api } = await import('./api.js');
      const response = await api.request('/api/weather', {
        method: 'GET',
      });
      
      console.log('🌤️ Wetter-Response erhalten:', response);
      
      if (response) {
        this.updateWeatherDisplay(response);
      } else {
        console.warn('⚠️ Keine Wetter-Daten erhalten, verwende Fallback');
        this.updateWeatherDisplay({
          type: 'sunny',
          name: 'Sonne',
          icon: '☀️',
          remainingSeconds: 30,
        });
      }
    } catch (error) {
      console.error('❌ Fehler beim Laden des Wetters:', error);
      // Fallback: Zeige Sonne
      this.updateWeatherDisplay({
        type: 'sunny',
        name: 'Sonne',
        icon: '☀️',
        remainingSeconds: 60,
      });
    }
  }

  /**
   * Berechne Wasser-Bonus basierend auf dem Wetter
   * @returns {Object} { bonus: number, description: string }
   */
  getWaterBonus() {
    if (!this.currentWeather) {
      return { bonus: 0, description: '' };
    }
    
    if (this.currentWeather.type === 'rainy') {
      return { bonus: 50, description: 'Regen +50%' };
    }
    
    return { bonus: 0, description: '' };
  }

  /**
   * Aktualisiere Wetter-Anzeige
   */
  updateWeatherDisplay(weather) {
    console.log('🌤️ Aktualisiere Wetter-Anzeige:', weather);
    this.currentWeather = weather;
    
    const weatherIcon = document.getElementById('weather-icon');
    const weatherType = document.getElementById('weather-type');
    const weatherTimer = document.getElementById('weather-timer');
    const weatherContainer = document.querySelector('.weather-container');
    
    if (!weatherIcon) {
      console.warn('⚠️ weather-icon Element nicht gefunden');
    }
    if (!weatherType) {
      console.warn('⚠️ weather-type Element nicht gefunden');
    }
    if (!weatherTimer) {
      console.warn('⚠️ weather-timer Element nicht gefunden');
    }
    if (!weatherContainer) {
      console.warn('⚠️ weather-container Element nicht gefunden');
    }
    
    if (weatherIcon) {
      weatherIcon.textContent = weather.icon;
    }
    
    // Aktualisiere Wetter-Name mit Bonus-Info
    if (weatherType) {
      const waterBonus = this.getWaterBonus();
      if (waterBonus.bonus > 0) {
        weatherType.textContent = `${weather.name} ${waterBonus.description}`;
      } else {
        weatherType.textContent = weather.name;
      }
    }
    
    if (weatherTimer) {
      weatherTimer.textContent = `${weather.remainingSeconds || 60}s`;
    }
    
    // Update CSS-Klasse für Animationen
    if (weatherContainer) {
      weatherContainer.classList.remove('sunny', 'rainy', 'stormy');
      weatherContainer.classList.add(weather.type);
    }
  }

  /**
   * Starte Timer für Wetter-Countdown
   */
  startWeatherTimer() {
    if (this.weatherTimer) {
      clearInterval(this.weatherTimer);
    }
    
    this.weatherTimer = setInterval(() => {
      if (this.currentWeather && this.currentWeather.remainingSeconds > 0) {
        this.currentWeather.remainingSeconds--;
        const weatherTimer = document.getElementById('weather-timer');
        if (weatherTimer) {
          weatherTimer.textContent = `${this.currentWeather.remainingSeconds}s`;
        }
      } else {
        // Wetter sollte sich ändern, lade neu
        this.loadWeather();
      }
    }, 1000);
  }

  /**
   * Starte Uhrzeit-Updates
   */
  startTimeUpdates() {
    this.updateTime();
    
    if (this.timeTimer) {
      clearInterval(this.timeTimer);
    }
    
    // Aktualisiere jede Minute (da keine Sekunden angezeigt werden)
    this.timeTimer = setInterval(() => {
      this.updateTime();
    }, 60000); // 60 Sekunden = 1 Minute
  }

  /**
   * Berechne Fischfang-Bonus basierend auf der aktuellen Uhrzeit
   * @returns {Object} { bonus: number, description: string }
   */
  getFishingBonus() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;
    
    // 06:00 - 09:00: 30% mehr
    if (totalMinutes >= 360 && totalMinutes < 540) {
      return { bonus: 30, description: 'Morgens: Fischfang +30%' };
    }
    
    // 09:00 - 18:00: 20% weniger
    if (totalMinutes >= 540 && totalMinutes < 1080) {
      return { bonus: -20, description: 'Mittags: Fischfang -20%' };
    }
    
    // 18:00 - 22:00: 30% mehr
    if (totalMinutes >= 1080 && totalMinutes < 1320) {
      return { bonus: 30, description: 'Abends: Fischfang +30%' };
    }
    
    // 22:00 - 05:59: Normal (0%)
    return { bonus: 0, description: 'Nacht: Fischfang normal' };
  }

  /**
   * Aktualisiere Uhrzeit-Anzeige
   */
  updateTime() {
    const now = new Date();
    
    // Zeit (ohne Sekunden)
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
      timeDisplay.textContent = `${hours}:${minutes}`;
    }
    
    // Datum verstecken
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
      dateDisplay.style.display = 'none';
    }
    
    // Aktualisiere Fischfang-Bonus-Anzeige
    this.updateFishingBonusDisplay();
  }

  /**
   * Aktualisiere Fischfang-Bonus-Anzeige
   */
  updateFishingBonusDisplay() {
    const bonusInfo = this.getFishingBonus();
    let bonusDisplay = document.getElementById('fishing-bonus-display');
    
    if (!bonusDisplay) {
      // Erstelle Bonus-Anzeige falls nicht vorhanden
      bonusDisplay = document.createElement('div');
      bonusDisplay.id = 'fishing-bonus-display';
      bonusDisplay.className = 'fishing-bonus-display';
      const timeContainer = document.querySelector('.time-container');
      if (timeContainer) {
        timeContainer.appendChild(bonusDisplay);
      } else {
        console.warn('time-container nicht gefunden, kann Bonus nicht anzeigen');
        return;
      }
    }
    
    // Setze Text und Stil basierend auf Bonus
    bonusDisplay.textContent = bonusInfo.description;
    
    // Entferne alte Klassen
    bonusDisplay.classList.remove('bonus-positive', 'bonus-negative', 'bonus-normal');
    
    // Füge entsprechende Klasse hinzu
    if (bonusInfo.bonus > 0) {
      bonusDisplay.classList.add('bonus-positive');
    } else if (bonusInfo.bonus < 0) {
      bonusDisplay.classList.add('bonus-negative');
    } else {
      bonusDisplay.classList.add('bonus-normal');
    }
  }

  /**
   * Verbinde mit WebSocket für Echtzeit-Wetter-Updates
   */
  connectWebSocket() {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('🌤️ WebSocket für Wetter verbunden');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.type === 'weather_update' && data.weather) {
            this.updateWeatherDisplay(data.weather);
          }
        } catch (error) {
          console.error('Fehler beim Verarbeiten der WebSocket-Nachricht:', error);
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket-Fehler:', error);
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket-Verbindung geschlossen, versuche erneut...');
        // Versuche nach 5 Sekunden erneut zu verbinden
        setTimeout(() => {
          this.connectWebSocket();
        }, 5000);
      };
    } catch (error) {
      console.error('Fehler beim Verbinden mit WebSocket:', error);
    }
  }

  /**
   * Stoppe alle Timer
   */
  stop() {
    if (this.weatherTimer) {
      clearInterval(this.weatherTimer);
    }
    if (this.timeTimer) {
      clearInterval(this.timeTimer);
    }
    if (this.ws) {
      this.ws.close();
    }
  }
}

// Exportiere Singleton-Instanz
let weatherTimeManagerInstance = null;

export function initWeatherTime() {
  if (!weatherTimeManagerInstance) {
    weatherTimeManagerInstance = new WeatherTimeManager();
  }
  return weatherTimeManagerInstance;
}

/**
 * Exportiere Funktion zum Abrufen des aktuellen Fischfang-Bonus
 * Kann von anderen Modulen verwendet werden
 */
export function getFishingBonus() {
  if (!weatherTimeManagerInstance) {
    return { bonus: 0, description: 'Nacht: Fischfang normal' };
  }
  return weatherTimeManagerInstance.getFishingBonus();
}

/**
 * Exportiere Funktion zum Abrufen des aktuellen Wasser-Bonus
 * Kann von anderen Modulen verwendet werden
 */
export function getWaterBonus() {
  if (!weatherTimeManagerInstance) {
    return { bonus: 0, description: '' };
  }
  return weatherTimeManagerInstance.getWaterBonus();
}

/**
 * Exportiere Funktion zum Abrufen des aktuellen Wetters
 * Kann von anderen Modulen verwendet werden
 */
export function getCurrentWeather() {
  if (!weatherTimeManagerInstance) {
    return null;
  }
  return weatherTimeManagerInstance.currentWeather;
}

export default initWeatherTime;
