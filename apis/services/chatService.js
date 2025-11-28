// Servicio para chat con IA
// NOTA: Este es un servicio de ejemplo. Debes integrar tu modelo de IA real aquí.

/**
 * Procesa un mensaje del usuario y genera una respuesta con IA
 * @param {string} message - Mensaje del usuario
 * @param {string} userId - ID del usuario (opcional)
 * @param {Array} conversationHistory - Historial de conversación (opcional)
 * @returns {Promise<string>} Respuesta de la IA
 */
export async function chatWithAI(message, userId, conversationHistory = []) {
  try {
    // TODO: Integrar aquí tu modelo de IA real
    // Por ejemplo: OpenAI GPT, Claude, modelo personalizado, etc.
    
    console.log('💬 Procesando mensaje con IA...');
    
    // Simulación de procesamiento
    await new Promise(resolve => setTimeout(resolve, 500));

    // Respuestas contextuales basadas en palabras clave
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('melanoma') || lowerMessage.includes('cáncer')) {
      return `El melanoma es un tipo de cáncer de piel que puede ser muy peligroso si no se detecta a tiempo. Los signos de advertencia incluyen cambios en el tamaño, forma o color de un lunar, así como la aparición de nuevos lunares. Si tienes preocupaciones sobre una lesión en tu piel, es importante consultar con un dermatólogo lo antes posible. Este sistema es solo una herramienta de apoyo y no reemplaza el diagnóstico médico profesional.`;
    }

    if (lowerMessage.includes('prevención') || lowerMessage.includes('prevenir')) {
      return `Para prevenir el cáncer de piel, es importante:
1. Usar protector solar con FPS 30 o superior todos los días
2. Evitar la exposición al sol durante las horas pico (10 AM - 4 PM)
3. Usar ropa protectora y sombreros
4. Realizar autoexámenes regulares de la piel
5. Visitar a un dermatólogo anualmente para exámenes profesionales

Recuerda que la detección temprana es clave para un tratamiento exitoso.`;
    }

    if (lowerMessage.includes('síntoma') || lowerMessage.includes('signo')) {
      return `Los signos de advertencia del cáncer de piel incluyen:
- Cambios en lunares existentes (ABCDE: Asimetría, Bordes irregulares, Color variado, Diámetro >6mm, Evolución)
- Nuevos crecimientos en la piel
- Llagas que no sanan
- Cambios en la textura de la piel
- Picazón o sangrado en lesiones

Si notas alguno de estos signos, consulta con un dermatólogo. Este sistema puede ayudarte a monitorear cambios, pero siempre debes buscar atención médica profesional para un diagnóstico definitivo.`;
    }

    if (lowerMessage.includes('análisis') || lowerMessage.includes('resultado')) {
      return `Para analizar una imagen de tu piel:
1. Ve a la sección "Análisis" en el menú
2. Sube una foto clara de la lesión
3. El sistema utilizará IA para analizar la imagen
4. Revisa los resultados y recomendaciones

Recuerda que los resultados son solo orientativos. Siempre consulta con un profesional de la salud para un diagnóstico definitivo.`;
    }

    // Respuesta genérica
    return `Hola, soy tu asistente de IA para el análisis de cáncer de piel. Puedo ayudarte con:
- Información sobre prevención del cáncer de piel
- Explicación de síntomas y signos de advertencia
- Guía sobre cómo usar el sistema de análisis
- Respuestas a preguntas generales sobre salud de la piel

Recuerda que este sistema es una herramienta de apoyo y no reemplaza la consulta médica profesional. Si tienes preocupaciones sobre tu salud, siempre debes consultar con un dermatólogo.

¿En qué más puedo ayudarte?`;
  } catch (error) {
    console.error('Error en chat con IA:', error);
    throw error;
  }
}

/**
 * Genera contexto para la conversación basado en el historial
 * @param {Array} conversationHistory - Historial de conversación
 * @returns {string} Contexto formateado
 */
export function generateContext(conversationHistory) {
  if (!conversationHistory || conversationHistory.length === 0) {
    return '';
  }

  // Extraer temas principales de la conversación
  const topics = conversationHistory
    .slice(-5) // Últimos 5 mensajes
    .map(msg => msg.message || msg.content)
    .join(' ');

  return `Contexto de la conversación: ${topics}`;
}

