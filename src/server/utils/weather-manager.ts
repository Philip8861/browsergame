import { logger } from './logger';

/**
 * Wetter-Typen
 */
export type WeatherType = 'sunny' | 'rainy' | 'stormy';

/**
 * Wetter-Informationen
 */
export interface WeatherData {
  type: WeatherType;
  name: string;
  icon: string;
  startedAt: Date;
  expiresAt: Date;
}

/**
 * Wetter-Manager - Verwaltet das globale Wetter für alle Spieler
 * Das Wetter wechselt im festen Zyklus: Sonne (30s) -> Sturm (30s) -> Regen (30s)
 */
class WeatherManager {
  private currentWeather: WeatherType = 'sunny';
  private weatherStartTime: Date = new Date();
  private weatherInterval: NodeJS.Timeout | null = null;
  private weatherChangeCallbacks: Array<(weather: WeatherData) => void> = [];
  private weatherCycle: WeatherType[] = ['sunny', 'stormy', 'rainy'];
  private currentCycleIndex: number = 0;

  constructor() {
    // Starte mit Sonne
    this.currentWeather = 'sunny';
    this.currentCycleIndex = 0;
    this.weatherStartTime = new Date();
    
    // Ändere Wetter alle 30 Sekunden im festen Zyklus
    this.weatherInterval = setInterval(() => {
      this.changeWeather();
    }, 30000); // 30 Sekunden

    logger.info('🌤️ Wetter-Manager initialisiert (Zyklus: Sonne -> Sturm -> Regen, je 30s)');
  }

  /**
   * Ändere das Wetter im festen Zyklus
   */
  private changeWeather(): void {
    // Wechsle zum nächsten Wetter im Zyklus
    this.currentCycleIndex = (this.currentCycleIndex + 1) % this.weatherCycle.length;
    const newWeather = this.weatherCycle[this.currentCycleIndex];
    
    this.currentWeather = newWeather;
    this.weatherStartTime = new Date();
    
    const weatherData = this.getCurrentWeather();
    
    logger.info(`🌤️ Wetter geändert zu: ${weatherData.name} (Zyklus-Position: ${this.currentCycleIndex + 1}/${this.weatherCycle.length})`);
    
    // Benachrichtige alle Callbacks
    this.weatherChangeCallbacks.forEach(callback => {
      try {
        callback(weatherData);
      } catch (error) {
        logger.error('Fehler in Wetter-Callback:', error);
      }
    });
  }

  /**
   * Hole aktuelles Wetter
   */
  getCurrentWeather(): WeatherData {
    const expiresAt = new Date(this.weatherStartTime.getTime() + 30000); // 30 Sekunden
    
    const weatherConfig = {
      sunny: { name: 'Sonne', icon: '☀️' },
      rainy: { name: 'Regen', icon: '🌧️' },
      stormy: { name: 'Sturm', icon: '⛈️' },
    };

    const config = weatherConfig[this.currentWeather];
    
    return {
      type: this.currentWeather,
      name: config.name,
      icon: config.icon,
      startedAt: this.weatherStartTime,
      expiresAt: expiresAt,
    };
  }

  /**
   * Registriere Callback für Wetter-Änderungen
   */
  onWeatherChange(callback: (weather: WeatherData) => void): void {
    this.weatherChangeCallbacks.push(callback);
  }

  /**
   * Entferne Callback
   */
  removeWeatherChangeCallback(callback: (weather: WeatherData) => void): void {
    const index = this.weatherChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.weatherChangeCallbacks.splice(index, 1);
    }
  }

  /**
   * Berechne verbleibende Sekunden bis zum nächsten Wetterwechsel
   */
  getRemainingSeconds(): number {
    const now = new Date();
    const expiresAt = new Date(this.weatherStartTime.getTime() + 30000); // 30 Sekunden
    const remaining = Math.max(0, Math.floor((expiresAt.getTime() - now.getTime()) / 1000));
    return remaining;
  }

  /**
   * Stoppe den Wetter-Manager
   */
  stop(): void {
    if (this.weatherInterval) {
      clearInterval(this.weatherInterval);
      this.weatherInterval = null;
    }
  }
}

// Singleton-Instanz
let weatherManagerInstance: WeatherManager | null = null;

/**
 * Hole die Wetter-Manager-Instanz
 */
export function getWeatherManager(): WeatherManager {
  if (!weatherManagerInstance) {
    weatherManagerInstance = new WeatherManager();
  }
  return weatherManagerInstance;
}

export default getWeatherManager;
