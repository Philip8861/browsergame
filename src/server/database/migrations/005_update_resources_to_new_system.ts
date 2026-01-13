import { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  // Neue Spalten hinzufügen
  pgm.addColumn('resources', {
    stone: {
      type: 'numeric(15, 2)',
      notNull: false,
      default: 750,
    },
    water: {
      type: 'numeric(15, 2)',
      notNull: false,
      default: 750,
    },
    food: {
      type: 'numeric(15, 2)',
      notNull: false,
      default: 750,
    },
    luxury: {
      type: 'numeric(15, 2)',
      notNull: false,
      default: 0,
    },
  });

  // Migriere Daten: clay -> stone, iron -> water, wheat -> food
  pgm.sql(`
    UPDATE resources 
    SET 
      stone = COALESCE(clay, 750),
      water = COALESCE(iron, 750),
      food = COALESCE(wheat, 750),
      luxury = 0
    WHERE stone IS NULL;
  `);

  // Setze NOT NULL Constraints
  pgm.alterColumn('resources', 'stone', { notNull: true });
  pgm.alterColumn('resources', 'water', { notNull: true });
  pgm.alterColumn('resources', 'food', { notNull: true });
  pgm.alterColumn('resources', 'luxury', { notNull: true });

  // Alte Spalten entfernen (optional - kann später gemacht werden wenn sicher)
  // pgm.dropColumn('resources', 'clay');
  // pgm.dropColumn('resources', 'iron');
  // pgm.dropColumn('resources', 'wheat');
};

export const down = (pgm: MigrationBuilder) => {
  // Entferne neue Spalten
  pgm.dropColumn('resources', 'stone');
  pgm.dropColumn('resources', 'water');
  pgm.dropColumn('resources', 'food');
  pgm.dropColumn('resources', 'luxury');
};
