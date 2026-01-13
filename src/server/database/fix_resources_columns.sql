-- Migration: Füge fehlende Spalten zur resources Tabelle hinzu
-- Führe dies aus, wenn die Spalten stone, water, food, luxury fehlen

-- Prüfe ob Spalten existieren und füge sie hinzu falls nicht
DO $$
BEGIN
    -- Füge stone Spalte hinzu falls nicht vorhanden
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'stone'
    ) THEN
        ALTER TABLE resources ADD COLUMN stone NUMERIC(15, 2) DEFAULT 750;
    END IF;

    -- Füge water Spalte hinzu falls nicht vorhanden
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'water'
    ) THEN
        ALTER TABLE resources ADD COLUMN water NUMERIC(15, 2) DEFAULT 750;
    END IF;

    -- Füge food Spalte hinzu falls nicht vorhanden
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'food'
    ) THEN
        ALTER TABLE resources ADD COLUMN food NUMERIC(15, 2) DEFAULT 750;
    END IF;

    -- Füge luxury Spalte hinzu falls nicht vorhanden
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'luxury'
    ) THEN
        ALTER TABLE resources ADD COLUMN luxury NUMERIC(15, 2) DEFAULT 0;
    END IF;

    -- Migriere Daten von alten Spalten zu neuen (falls alte Spalten existieren)
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'clay'
    ) THEN
        UPDATE resources 
        SET stone = COALESCE(clay, 750)
        WHERE stone IS NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'iron'
    ) THEN
        UPDATE resources 
        SET water = COALESCE(iron, 750)
        WHERE water IS NULL;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'resources' AND column_name = 'wheat'
    ) THEN
        UPDATE resources 
        SET food = COALESCE(wheat, 750)
        WHERE food IS NULL;
    END IF;

    -- Setze NOT NULL Constraints
    ALTER TABLE resources ALTER COLUMN stone SET NOT NULL;
    ALTER TABLE resources ALTER COLUMN water SET NOT NULL;
    ALTER TABLE resources ALTER COLUMN food SET NOT NULL;
    ALTER TABLE resources ALTER COLUMN luxury SET NOT NULL;
END $$;
