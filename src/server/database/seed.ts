import dotenv from 'dotenv';
import { UserModel } from '../models/User';
import { VillageModel } from '../models/Village';

dotenv.config();

/**
 * Seed-Script für Test-Daten
 */
async function seed() {
  try {
    console.log('Starte Seeding...');

    // Erstelle Test-Benutzer
    const testUser = await UserModel.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'test123',
    });
    console.log('Test-Benutzer erstellt:', testUser.username);

    // Erstelle Test-Dorf
    const village = await VillageModel.create(testUser.id, 'Testdorf', 0, 0);
    console.log('Test-Dorf erstellt:', village.name);

    // Füge einige Gebäude hinzu
    await VillageModel.upgradeBuilding(village.id, 'main_building', 0);
    await VillageModel.upgradeBuilding(village.id, 'barracks', 1);
    await VillageModel.upgradeBuilding(village.id, 'farm', 2);

    console.log('Seeding abgeschlossen!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding-Fehler:', error);
    process.exit(1);
  }
}

seed();




