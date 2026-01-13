import { MigrationBuilder } from 'node-pg-migrate';

export const up = (pgm: MigrationBuilder) => {
  pgm.createTable('buildings', {
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
    building_type: {
      type: 'varchar(50)',
      notNull: true,
    },
    level: {
      type: 'integer',
      notNull: true,
      default: 1,
    },
    position: {
      type: 'integer',
      notNull: true,
      comment: 'Position im Dorf (0-8 für 3x3 Grid)',
    },
    upgrade_finishes_at: {
      type: 'timestamp',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('buildings', 'village_id');
  pgm.createIndex('buildings', ['village_id', 'building_type', 'position'], {
    unique: true,
    name: 'buildings_village_type_position_unique',
  });
};

export const down = (pgm: MigrationBuilder) => {
  pgm.dropTable('buildings');
};




