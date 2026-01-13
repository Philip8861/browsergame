import { MigrationBuilder, ColumnDefinitions } from 'node-pg-migrate';

export const shorthands: ColumnDefinitions = {};

export async function up(pgm: MigrationBuilder): Promise<void> {
  pgm.createTable('servers', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    name: {
      type: 'varchar(100)',
      notNull: true,
    },
    description: {
      type: 'text',
    },
    start_date: {
      type: 'timestamp',
      notNull: true,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'planned', // planned, active, ended
    },
    settings: {
      type: 'jsonb',
      default: '{}',
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

  pgm.createIndex('servers', 'status');
  pgm.createIndex('servers', 'start_date');
}

export async function down(pgm: MigrationBuilder): Promise<void> {
  pgm.dropTable('servers');
}

