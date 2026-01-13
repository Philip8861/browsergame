import { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.createTable('resources', {
    village_id: {
      type: 'integer',
      primaryKey: true,
      references: 'villages(id)',
      onDelete: 'CASCADE',
    },
    wood: {
      type: 'numeric(15, 2)',
      notNull: true,
      default: 750,
    },
    clay: {
      type: 'numeric(15, 2)',
      notNull: true,
      default: 750,
    },
    iron: {
      type: 'numeric(15, 2)',
      notNull: true,
      default: 750,
    },
    wheat: {
      type: 'numeric(15, 2)',
      notNull: true,
      default: 750,
    },
    last_updated: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('resources', 'village_id');
};

export const down = (pgm: MigrationBuilder) => {
  pgm.dropTable('resources');
};




