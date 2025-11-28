// Rutas para análisis de imágenes con IA
import express from 'express';
import { analyzeImage } from '../services/imageAnalysisService.js';

const router = express.Router();

/**
 * POST /api/image-analysis
 * Analiza una imagen de piel usando IA
 * 
 * Body:
 * - image: archivo de imagen (multipart/form-data)
 * - userId: ID del usuario (opcional)
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     prediction: string,
 *     confidence: number,
 *     riskLevel: "bajo" | "medio" | "alto",
 *     recommendation: string,
 *     details: object
 *   }
 * }
 */
router.post('/', async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No se proporcionó ninguna imagen'
      });
    }

    const { userId } = req.body;
    const imageBuffer = req.file.buffer;
    const imageMimeType = req.file.mimetype;

    console.log(`📸 Analizando imagen para usuario: ${userId || 'anónimo'}`);

    // Llamar al servicio de análisis de imagen
    const analysisResult = await analyzeImage(imageBuffer, imageMimeType);

    if (!analysisResult) {
      return res.status(500).json({
        success: false,
        message: 'Error al analizar la imagen'
      });
    }

    res.json({
      success: true,
      data: analysisResult
    });
  } catch (error) {
    console.error('Error en análisis de imagen:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al procesar la imagen',
      error: error.message
    });
  }
});

export { router as imageAnalysisRoutes };

