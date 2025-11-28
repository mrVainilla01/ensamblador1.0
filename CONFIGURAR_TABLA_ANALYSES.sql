-- SOLUCIÓN: Cambiar el tipo de columna 'id' de UUID a TEXT
-- El frontend genera IDs usando Date.now() que son timestamps, no UUIDs
-- Ejecuta este script en: Supabase Dashboard → SQL Editor

-- 1. Eliminar la tabla existente y recrearla con el tipo correcto
DROP TABLE IF EXISTS analyses CASCADE;

-- 2. Crear la tabla con 'id' como TEXT en lugar de UUID
CREATE TABLE analyses (
  id TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fecha TIMESTAMP NOT NULL,
  image TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Crear índices para mejorar rendimiento
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_fecha ON analyses(fecha DESC);

-- 4. Habilitar Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- 5. Crear políticas de seguridad
CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- 6. Verificar que todo está configurado correctamente
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'analyses'
ORDER BY ordinal_position;
