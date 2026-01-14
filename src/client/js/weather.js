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
          remainingSeconds: 60,
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
    
    if (weatherType) {
      weatherType.textContent = weather.name;
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
    
    this.timeTimer = setInterval(() => {
      this.updateTime();
    }, 1000);
  }

  /**
   * Aktualisiere Uhrzeit-Anzeige
   */
  updateTime() {
    const now = new Date();
    
    // Zeit
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const timeDisplay = document.getElementById('time-display');
    if (timeDisplay) {
      timeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
    }
    
    // Datum
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    const dateDisplay = document.getElementById('date-display');
    if (dateDisplay) {
      dateDisplay.textContent = `${day}.${month}.${year}`;
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

export default initWeatherTime;
