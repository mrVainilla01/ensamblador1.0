// Rutas para consultas con IA (chat)
import express from 'express';
import { chatWithAI } from '../services/chatService.js';

const router = express.Router();

/**
 * POST /api/chat
 * Envía un mensaje al chatbot de IA
 * 
 * Body:
 * {
 *   message: string,
 *   userId: string (opcional),
 *   conversationHistory: array (opcional)
 * }
 * 
 * Response:
 * {
 *   success: boolean,
 *   data: {
 *     response: string,
 *     timestamp: string
 *   }
 * }
 */
router.post('/', async (req, res) => {
  try {
    const { message, userId, conversationHistory } = req.body;

    if (!message || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'El mensaje no puede estar vacío'
      });
    }

    console.log(`💬 Consulta de chat para usuario: ${userId || 'anónimo'}`);

    // Llamar al servicio de chat
    const chatResponse = await chatWithAI(message, userId, conversationHistory);

    if (!chatResponse) {
      return res.status(500).json({
        success: false,
        message: 'Error al procesar la consulta'
      });
    }

    res.json({
      success: true,
      data: {
        response: chatResponse,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Error en chat:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno al procesar la consulta',
      error: error.message
    });
  }
});

/**
 * GET /api/chat/health
 * Verifica el estado del servicio de chat
 */
router.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Chat AI',
    timestamp: new Date().toISOString()
  });
});

export { router as chatRoutes };

