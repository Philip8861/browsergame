import { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.createTable('users', {
    id: {
      type: 'serial',
      primaryKey: true,
    },
    username: {
      type: 'varchar(50)',
      notNull: true,
      unique: true,
    },
    email: {
      type: 'varchar(255)',
      notNull: true,
      unique: true,
    },
    password_hash: {
      type: 'varchar(255)',
      notNull: true,
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    last_login: {
      type: 'timestamp',
    },
  });

  pgm.createIndex('users', 'email');
  pgm.createIndex('users', 'username');
};

export const down = (pgm: MigrationBuilder) => {
  pgm.dropTable('users');
};




