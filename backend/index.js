// Servidor Backend para Sistema de Análisis de Cáncer de Piel
import express from 'express';
import cors from 'cors';
import { supabase, testConnection } from './config/supabase.js';
import { analysisRoutes } from './routes/analysis.js';
import { historyRoutes } from './routes/history.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/analysis', analysisRoutes);
app.use('/api/history', historyRoutes);

// Ruta de salud
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    status: 'ok',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'Backend API para Sistema de Análisis de Cáncer de Piel',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      analysis: '/api/analysis',
      history: '/api/history'
    }
  });
});

// Iniciar servidor
app.listen(PORT, async () => {
  console.log(`🚀 Servidor backend ejecutándose en http://localhost:${PORT}`);
  console.log(`📊 Verificando conexión a Supabase...`);
  await testConnection();
});

