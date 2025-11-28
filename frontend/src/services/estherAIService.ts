/**
 * Servicio para comunicarse con la API de EstherAI
 * Esta API utiliza un modelo de IA para analizar imágenes de lesiones cutáneas
 */

interface EstherAIPrediction {
  prediction: string; // "benigna" | "precancerigena" | "maligna"
  confidence: number; // 0-1
  probabilities: {
    benigna: number;
    precancerigena: number;
    maligna: number;
  };
}

interface AnalysisResult {
  prediction: string;
  confidence: number;
  recommendation: string;
  riskLevel: "ninguno" | "bajo" | "medio" | "alto";
}

class EstherAIService {
  private apiUrl: string;
  private apiKey: string;

  constructor() {
    // Obtener URL y Key de variables de entorno
    this.apiUrl = import.meta.env.VITE_ESTHERAI_API_URL;
    this.apiKey = import.meta.env.VITE_ESTHERAI_API_KEY || '';

    if (!this.apiUrl) {
      console.warn('VITE_ESTHERAI_API_URL no está definida en .env');
      this.apiUrl = 'http://localhost:8000'; // Fallback
    }
  }

  /**
   * Convierte una imagen base64 a un objeto Blob
   */
  private base64ToBlob(base64String: string): Blob {
    const arr = base64String.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);

    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }

    return new Blob([u8arr], { type: mime });
  }

  /**
   * Mapea la predicción de la API al formato esperado por el frontend
   * Soporta tanto el formato local como el de Hugging Face
   */
  private mapPredictionToResult(apiResponse: any): AnalysisResult {
    let prediction = '';
    let confidence = 0;

    // Detectar formato de respuesta
    if (Array.isArray(apiResponse)) {
      // Formato Hugging Face: [{ label: "benigna", score: 0.9 }, ...]
      // Ordenar por score descendente
      const sorted = [...apiResponse].sort((a, b) => b.score - a.score);
      if (sorted.length > 0) {
        prediction = sorted[0].label;
        confidence = sorted[0].score;
      }
    } else if (apiResponse.prediction) {
      // Formato Local API
      prediction = apiResponse.prediction;
      confidence = apiResponse.confidence;
    } else {
      console.error('Formato de respuesta desconocido:', apiResponse);
      throw new Error('Formato de respuesta de la API no reconocido');
    }

    // Convertir confianza de 0-1 a 0-100
    const confidencePercent = Math.round(confidence * 100);

    // Mapear predicción y nivel de riesgo
    let displayPrediction: string;
    let riskLevel: "ninguno" | "bajo" | "medio" | "alto";
    let recommendation: string;

    // Normalizar predicción (lowercase y trim)
    const predLower = prediction.toLowerCase().trim();

    if (predLower.includes('normal')) {
      displayPrediction = 'Piel Normal';
      riskLevel = 'ninguno';
      recommendation = `La piel analizada presenta características normales con una confianza del ${confidencePercent}%. No se detectaron signos de lesión. Continúe con sus cuidados habituales de la piel y protección solar.`;
    } else if (predLower.includes('benign')) {
      displayPrediction = 'Lesión Benigna';
      riskLevel = 'bajo';
      recommendation = `La lesión presenta características benignas con una confianza del ${confidencePercent}%. Se recomienda seguimiento de rutina y consulta con dermatólogo para confirmación.`;
    } else if (predLower.includes('precancer') || predLower.includes('akiec') || predLower.includes('actinic')) {
      displayPrediction = 'Lesión Precancerígena';
      riskLevel = 'medio';
      recommendation = `Se han detectado características precancerígenas con una confianza del ${confidencePercent}%. Es importante consultar con un dermatólogo especialista para evaluación y seguimiento cercano.`;
    } else if (predLower.includes('malign') || predLower.includes('melanoma') || predLower.includes('basal') || predLower.includes('squamous')) {
      displayPrediction = 'Lesión Maligna';
      riskLevel = 'alto';
      recommendation = `Se han detectado características malignas con una confianza del ${confidencePercent}%. URGENTE: Consulte inmediatamente con un dermatólogo oncólogo para evaluación y tratamiento.`;
    } else {
      displayPrediction = `Resultado: ${prediction}`;
      riskLevel = 'medio';
      recommendation = 'No se pudo determinar el tipo de lesión con certeza. Por favor, consulte con un dermatólogo para evaluación profesional.';
    }

    return {
      prediction: displayPrediction,
      confidence: confidencePercent,
      recommendation,
      riskLevel
    };
  }

  /**
   * Envía una imagen a la API de EstherAI para análisis
   * @param imageData - Imagen en formato base64 (data URL)
   * @returns Resultado del análisis formateado para el frontend
   */
  async predictImage(imageData: string): Promise<AnalysisResult> {
    try {
      // Convertir base64 a Blob
      const imageBlob = this.base64ToBlob(imageData);

      const headers: HeadersInit = {};
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      // Normalizar URL (remover trailing slash si existe)
      let apiEndpoint = this.apiUrl.replace(/\/$/, '');

      let response;

      // Detectar si es Hugging Face Spaces o Inference API
      if (this.apiUrl.includes('hf.space')) {
        // Hugging Face Spaces - usar FormData con endpoint /predict
        const formData = new FormData();
        formData.append('file', new File([imageBlob], 'image.jpg', { type: 'image/jpeg' }));

        response = await fetch(`${apiEndpoint}/predict`, {
          method: 'POST',
          headers: headers,
          body: formData,
        });
      } else if (this.apiUrl.includes('huggingface.co')) {
        // Hugging Face Inference API - enviar blob directo
        response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: headers,
          body: imageBlob,
        });
      } else {
        // API Local - usar FormData
        const formData = new FormData();
        formData.append('file', new File([imageBlob], 'image.jpg', { type: 'image/jpeg' }));

        response = await fetch(`${apiEndpoint}/predict`, {
          method: 'POST',
          headers: headers,
          body: formData,
        });
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error del servidor (${response.status}): ${errorText}`);
      }

      const apiResponse = await response.json();
      console.log('Respuesta API:', apiResponse);

      // Mapear respuesta al formato del frontend
      return this.mapPredictionToResult(apiResponse);

    } catch (error) {
      console.error('Error al comunicarse con la API de EstherAI:', error);

      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error(
          `No se pudo conectar con el servidor en ${this.apiUrl}. ` +
          'Verifique su conexión a internet y la URL de la API.'
        );
      }

      throw error;
    }
  }

  /**
   * Verifica si la API está disponible
   */
  async checkHealth(): Promise<boolean> {
    try {
      // Para HF, no hay un endpoint estándar de health check público fácil, 
      // pero podemos intentar un GET a la raíz o simplemente asumir true si hay URL.
      if (this.apiUrl.includes('huggingface.co')) {
        return true;
      }

      const response = await fetch(`${this.apiUrl}/docs`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Exportar instancia única del servicio
export const estherAIService = new EstherAIService();
