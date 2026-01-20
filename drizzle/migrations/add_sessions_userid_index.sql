-- Agregar índice en sessions.userId para optimizar consultas
CREATE INDEX idx_sessions_userId ON sessions(userId);
