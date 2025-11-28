// API de Inteligencia Artificial para Análisis de Cáncer de Piel
import express from 'express';
import cors from 'cors';
import multer from 'multer';
import { imageAnalysisRoutes } from './routes/imageAnalysis.js';
import { chatRoutes } from './routes/chat.js';

const app = express();
const PORT = process.env.PORT || 3002;

// Configuración de multer para subida de archivos
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  fileFilter: (req, file, cb) => {
    // Aceptar solo imágenes
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use('/api/image-analysis', upload.single('image'), imageAnalysisRoutes);
app.use('/api/chat', chatRoutes);

// Ruta de salud
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'AI API',
    timestamp: new Date().toISOString()
  });
});

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API de Inteligencia Artificial para Análisis de Cáncer de Piel',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      imageAnalysis: '/api/image-analysis',
      chat: '/api/chat'
    }
  });
});

// Manejo de errores
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'El archivo es demasiado grande. Máximo 10MB'
      });
    }
  }
  
  res.status(500).json({
    success: false,
    message: error.message || 'Error interno del servidor'
  });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🤖 API de IA ejecutándose en http://localhost:${PORT}`);
  console.log(`📝 Endpoints disponibles:`);
  console.log(`   - POST /api/image-analysis - Análisis de imágenes`);
  console.log(`   - POST /api/chat - Consultas con IA`);
});

