import { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.createTable('villages', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    user_id: {
      type: 'integer',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    x: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    y: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
    population: {
      type: 'integer',
      notNull: true,
      default: 2,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('villages', 'user_id');
  pgm.createIndex('villages', ['x', 'y']);
};

export const down = (pgm: MigrationBuilder) => {
  pgm.dropTable('villages');
};




