// Rutas para el análisis de imágenes
import express from 'express';
import { supabase } from '../config/supabase.js';

const router = express.Router();

/**
 * POST /api/analysis
 * Guarda un análisis en la base de datos
 */
router.post('/', async (req, res) => {
  try {
    const { userId, fecha, image, result } = req.body;

    if (!userId || !fecha || !image || !result) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: userId, fecha, image, result'
      });
    }

    const payload = {
      user_id: userId,
      fecha: fecha,
      image: image,
      result: result, // JSONB - se guarda como objeto JSON
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('analyses')
      .insert(payload)
      .select()
      .single();

    if (error) {
      console.error('Error guardando análisis:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al guardar el análisis en la base de datos',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data
    });
  } catch (error) {
    console.error('Error en POST /api/analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * GET /api/analysis/:userId
 * Obtiene todos los análisis de un usuario
 */
router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('analyses')
      .select('*')
      .eq('user_id', userId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error('Error obteniendo análisis:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al obtener los análisis de la base de datos',
        error: error.message
      });
    }

    res.json({
      success: true,
      data: data || []
    });
  } catch (error) {
    console.error('Error en GET /api/analysis/:userId:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

/**
 * DELETE /api/analysis/:id
 * Elimina un análisis por su ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.query; // Opcional: verificar que el análisis pertenece al usuario

    let query = supabase.from('analyses').delete().eq('id', id);
    
    if (userId) {
      query = query.eq('user_id', userId);
    }

    const { error } = await query;

    if (error) {
      console.error('Error eliminando análisis:', error);
      return res.status(500).json({
        success: false,
        message: 'Error al eliminar el análisis',
        error: error.message
      });
    }

    res.json({
      success: true,
      message: 'Análisis eliminado correctamente'
    });
  } catch (error) {
    console.error('Error en DELETE /api/analysis/:id:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      error: error.message
    });
  }
});

export { router as analysisRoutes };

