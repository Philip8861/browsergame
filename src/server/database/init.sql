-- Initialisierungsscript für Docker PostgreSQL Container
-- Wird automatisch beim ersten Start ausgeführt

-- Erstelle Datenbank falls nicht vorhanden (wird normalerweise durch POSTGRES_DB erledigt)
-- CREATE DATABASE browsergame_db;

-- Erstelle Extension für UUID falls benötigt
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Erstelle Extension für pgcrypto für Passwort-Hashing (falls bcrypt nicht verwendet wird)
-- CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Die Tabellen werden durch Migrationen erstellt (node-pg-migrate)
-- Dieses Script kann für zusätzliche Initialisierungen verwendet werden

