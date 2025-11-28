# API de Inteligencia Artificial - Análisis de Cáncer de Piel

Este directorio contiene las APIs de Inteligencia Artificial para el análisis de imágenes y consultas de chat.

## Estructura

```
apis/
├── index.js                    # Servidor principal
├── routes/
│   ├── imageAnalysis.js        # Rutas para análisis de imágenes
│   └── chat.js                 # Rutas para chat con IA
├── services/
│   ├── imageAnalysisService.js # Servicio de análisis de imágenes
│   └── chatService.js          # Servicio de chat
└── package.json
```

## Endpoints

### Análisis de Imágenes

**POST /api/image-analysis**
- Analiza una imagen de piel usando IA
- Body: `multipart/form-data` con campo `image`
- Response: Resultado del análisis con predicción, confianza y recomendaciones

### Chat con IA

**POST /api/chat**
- Envía un mensaje al chatbot de IA
- Body: `{ message: string, userId?: string, conversationHistory?: array }`
- Response: Respuesta de la IA

## Instalación

```bash
cd apis
npm install
```

## Uso

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

## Integración con Modelos de IA

Los servicios actuales (`imageAnalysisService.js` y `chatService.js`) contienen implementaciones de ejemplo. Para usar modelos reales:

1. **Análisis de Imágenes**: Integra tu modelo en `services/imageAnalysisService.js`
   - TensorFlow.js
   - API de modelo Python (Flask/FastAPI)
   - Servicios cloud (AWS SageMaker, Google Cloud AI, etc.)

2. **Chat**: Integra tu modelo en `services/chatService.js`
   - OpenAI GPT
   - Claude (Anthropic)
   - Modelo personalizado

## Variables de Entorno

Crea un archivo `.env`:

```env
PORT=3002
AI_MODEL_URL=http://localhost:8000
OPENAI_API_KEY=tu_api_key_aqui
```

