-- Congelar experimentos B-1 y C-1 como Baseline v1
-- Marcar como cerrados y agregar metadata de congelamiento

UPDATE experiments 
SET 
  status = 'frozen',
  metadata = JSON_SET(
    COALESCE(metadata, '{}'),
    '$.baseline_version', 'v1',
    '$.frozen_at', CURRENT_TIMESTAMP,
    '$.frozen_by', 'ARESK-OBS System',
    '$.reason', 'Baseline v1 - Post-experimental freeze',
    '$.encoder_locked', 'sentence-transformers/all-MiniLM-L6-v2',
    '$.dimension_locked', 384,
    '$.modifications_blocked', true
  )
WHERE experiment_id IN ('B-1-1770592429287', 'C-1-1770595741129');

-- Verificar congelamiento
SELECT 
  experiment_id,
  regime,
  status,
  JSON_EXTRACT(metadata, '$.baseline_version') as baseline,
  JSON_EXTRACT(metadata, '$.frozen_at') as frozen_at
FROM experiments
WHERE experiment_id IN ('B-1-1770592429287', 'C-1-1770595741129');
