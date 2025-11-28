// Rutas para el historial de análisis
import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * GET /api/history/:userId
 * Obtiene el historial completo de análisis de un usuario
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit, offset, riskLevel } = req.query;

    let query = supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });

    // Filtrar por nivel de riesgo si se proporciona
    if (riskLevel && riskLevel !== 'todos') {
      // Nota: Esto requiere que result sea un JSONB y podamos filtrar dentro de él
      // Supabase permite filtrar JSONB con notación de punto
      query = query.filter('result->>riskLevel', 'eq', riskLevel);
    }

    // Aplicar paginación si se proporciona
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    if (offset) {
      query = query.range(parseInt(offset), parseInt(offset) + (parseInt(limit) || 10) - 1);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error obteniendo historial:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener el historial de la base de datos',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data || [],
      count: data?.length || 0
    });
  } catch (error) {
    console.error('Error en GET /api/history/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * DELETE /api/history/:userId
 * Elimina todo el historial de un usuario
 */
router.delete('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { error } = await supabase
      .from('analyses')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error('Error eliminando historial:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el historial',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Historial eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en DELETE /api/history/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/history/:userId/stats
 * Obtiene estadísticas del historial de un usuario
 */
router.get('/:userId/stats', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error obteniendo estadísticas:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener las estadísticas',
        error: error.message
      });
    }

    // Calcular estadísticas
    const total = data?.length || 0;
    const lowRisk = data?.filter(a => a.result?.riskLevel === 'bajo').length || 0;
    const mediumRisk = data?.filter(a => a.result?.riskLevel === 'medio').length || 0;
    const highRisk = data?.filter(a => a.result?.riskLevel === 'alto').length || 0;
    const avgConfidence = data?.length > 0
      ? data.reduce((acc, a) => acc + (a.result?.confidence || 0), 0) / data.length
      : 0;

    res.json({
      success: true,
      stats: {
        total,
        lowRisk,
        mediumRisk,
        highRisk,
        avgConfidence: parseFloat(avgConfidence.toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error en GET /api/history/:userId/stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

export { router as historyRoutes };

