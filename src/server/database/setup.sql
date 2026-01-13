-- Einfaches SQL-Setup-Script für schnelles Testen
-- Führe dies aus, wenn node-pg-migrate Probleme macht

-- Tabelle: users
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_login TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Tabelle: villages
CREATE TABLE IF NOT EXISTS villages (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  x INTEGER NOT NULL DEFAULT 0,
  y INTEGER NOT NULL DEFAULT 0,
  population INTEGER NOT NULL DEFAULT 2,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_villages_user_id ON villages(user_id);
CREATE INDEX IF NOT EXISTS idx_villages_coords ON villages(x, y);

-- Tabelle: resources
CREATE TABLE IF NOT EXISTS resources (
  village_id INTEGER PRIMARY KEY REFERENCES villages(id) ON DELETE CASCADE,
  wood NUMERIC(15, 2) NOT NULL DEFAULT 750,
  stone NUMERIC(15, 2) NOT NULL DEFAULT 750,
  water NUMERIC(15, 2) NOT NULL DEFAULT 750,
  food NUMERIC(15, 2) NOT NULL DEFAULT 750,
  luxury NUMERIC(15, 2) NOT NULL DEFAULT 0,
  last_updated TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_resources_village_id ON resources(village_id);

-- Tabelle: buildings
CREATE TABLE IF NOT EXISTS buildings (
  id SERIAL PRIMARY KEY,
  village_id INTEGER NOT NULL REFERENCES villages(id) ON DELETE CASCADE,
  building_type VARCHAR(50) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  position INTEGER NOT NULL,
  upgrade_finishes_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(village_id, building_type, position)
);

CREATE INDEX IF NOT EXISTS idx_buildings_village_id ON buildings(village_id);

-- Tabelle: servers
CREATE TABLE IF NOT EXISTS servers (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  start_date TIMESTAMP NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'planned',
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_servers_status ON servers(status);
CREATE INDEX IF NOT EXISTS idx_servers_start_date ON servers(start_date);




