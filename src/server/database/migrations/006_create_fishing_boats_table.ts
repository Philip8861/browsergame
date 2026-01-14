import { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.createTable('fishing_boats', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    village_id: {
      type: 'integer',
      notNull: true,
      references: 'villages(id)',
      onDelete: 'CASCADE',
    },
    count: {
      type: 'integer',
      notNull: true,
      default: 0,
      comment: 'Anzahl der Fischerboote',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('fishing_boats', 'village_id', { unique: true });
};

export const down = (pgm: MigrationBuilder) => {
  pgm.dropTable('fishing_boats');
};
