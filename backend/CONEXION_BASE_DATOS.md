# Conexión con Base de Datos - Análisis e Historial

Este documento explica cómo se conecta el sistema de análisis e historial con la base de datos Supabase.

## Configuración de Supabase

### Credenciales

Las credenciales de Supabase están configuradas en `backend/config/supabase.js`:

```javascript
const supabaseUrl = 'https://sjarucjxlqwczhgseuzs.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

### Estructura de la Tabla `analyses`

La tabla `analyses` almacena todos los análisis realizados por los usuarios:

```sql
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  fecha TIMESTAMP NOT NULL,
  image TEXT NOT NULL, -- Base64 o URL de la imagen
  result JSONB NOT NULL, -- Resultado del análisis en formato JSON
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_fecha ON analyses(fecha DESC);
CREATE INDEX idx_analyses_result_risk ON analyses USING GIN (result);
```

### Estructura del Campo `result` (JSONB)

El campo `result` almacena el resultado del análisis en formato JSON:

```json
{
  "prediction": "Melanoma",
  "confidence": 85,
  "riskLevel": "alto",
  "recommendation": "Se recomienda consulta médica urgente",
  "details": {
    "allPredictions": [
      { "name": "Melanoma", "probability": 0.85 },
      { "name": "Nevus", "probability": 0.10 },
      { "name": "Queratosis actínica", "probability": 0.05 }
    ],
    "modelVersion": "1.0.0"
  }
}
```

## Flujo de Conexión

### 1. Guardar un Análisis

**Frontend → Backend → Supabase**

1. El usuario sube una imagen en el frontend
2. El frontend envía la imagen a `/api/image-analysis` (API de IA)
3. La API de IA procesa la imagen y retorna el resultado
4. El frontend envía el resultado a `/api/analysis` (Backend)
5. El backend guarda el análisis en Supabase:

```javascript
// backend/routes/analysis.js
const payload = {
  user_id: userId,
  fecha: fecha,
  image: image, // Base64 o URL
  result: result, // Objeto JSON
  created_at: new Date().toISOString()
};

const { data, error } = await supabase
  .from('analyses')
  .insert(payload)
  .select()
  .single();
```

### 2. Obtener Historial de Análisis

**Frontend → Backend → Supabase**

1. El usuario accede a la sección "Historial"
2. El frontend solicita el historial a `/api/history/:userId`
3. El backend consulta Supabase:

```javascript
// backend/routes/history.js
const { data, error } = await supabase
  .from('analyses')
  .select('*')
  .eq('user_id', userId)
  .order('fecha', { ascending: false });
```

### 3. Filtrar por Nivel de Riesgo

El backend permite filtrar análisis por nivel de riesgo:

```javascript
// Filtrar por riesgo
if (riskLevel && riskLevel !== 'todos') {
  query = query.filter('result->>riskLevel', 'eq', riskLevel);
}
```

Esto utiliza la capacidad de Supabase para filtrar campos JSONB usando notación de punto.

### 4. Eliminar un Análisis

**Frontend → Backend → Supabase**

```javascript
// backend/routes/analysis.js
const { error } = await supabase
  .from('analyses')
  .delete()
  .eq('id', id)
  .eq('user_id', userId); // Verificar que pertenece al usuario
```

## Sección de Análisis (AnalysisSection)

La sección de análisis muestra gráficos y estadísticas basadas en los datos de Supabase:

### Carga de Datos

```typescript
// frontend/src/components/Configuracion/AnalysisSection.tsx
const data = await apiService.getAnalyses(user.id);
const history = (data || []).map((d: any) => ({
  id: d.id,
  fecha: d.fecha,
  result: d.result, // Ya viene como objeto desde Supabase
}));
```

### Procesamiento para Gráficos

Los datos se procesan para crear gráficos de progreso:

```typescript
const chartData = history.slice(0, 10).reverse().map((record, index) => {
  const date = new Date(record.fecha);
  const riskScore = record.result.riskLevel === "bajo" ? 1 : 
                   record.result.riskLevel === "medio" ? 2 : 3;
  
  return {
    fecha: date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    riesgo: riskScore,
    confianza: record.result.confidence,
    nombre: record.result.prediction
  };
});
```

## Sección de Historial (HistorialSection)

La sección de historial muestra todos los análisis guardados:

### Carga de Datos

```typescript
// frontend/src/components/Configuracion/HistorialSection.tsx
const data = await apiService.getAnalyses(user.id);
const mapped = (data || []).map((d: any) => ({
  id: d.id,
  fecha: d.fecha,
  image: d.image,
  result: d.result,
}));
```

### Funcionalidades

1. **Búsqueda**: Filtra análisis por término de búsqueda
2. **Filtro por riesgo**: Filtra por nivel de riesgo (bajo, medio, alto)
3. **Visualización**: Muestra la imagen y los resultados
4. **Eliminación**: Permite eliminar análisis individuales

## Estadísticas

El backend proporciona un endpoint para obtener estadísticas:

**GET /api/history/:userId/stats**

Retorna:
```json
{
  "success": true,
  "stats": {
    "total": 25,
    "lowRisk": 15,
    "mediumRisk": 7,
    "highRisk": 3,
    "avgConfidence": 78.5
  }
}
```

## Seguridad

### Row Level Security (RLS)

Se recomienda configurar RLS en Supabase para asegurar que los usuarios solo puedan acceder a sus propios análisis:

```sql
-- Habilitar RLS
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Política: Usuarios solo pueden ver sus propios análisis
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

-- Política: Usuarios solo pueden insertar sus propios análisis
CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Política: Usuarios solo pueden eliminar sus propios análisis
CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);
```

## Sincronización en Tiempo Real

El frontend recarga los datos cada 3 segundos para detectar nuevos análisis:

```typescript
useEffect(() => {
  const loadData = async () => {
    // Cargar datos desde Supabase
  };
  
  loadData();
  const interval = setInterval(loadData, 3000);
  return () => clearInterval(interval);
}, [user]);
```

Para una mejor experiencia, considera usar Supabase Realtime:

```javascript
// Suscripción a cambios en tiempo real
supabase
  .channel('analyses')
  .on('postgres_changes', 
    { event: '*', schema: 'public', table: 'analyses', filter: `user_id=eq.${userId}` },
    (payload) => {
      // Actualizar UI cuando hay cambios
    }
  )
  .subscribe();
```

## Troubleshooting

### Error: "relation 'analyses' does not exist"

La tabla no existe en Supabase. Crea la tabla usando el SQL proporcionado arriba.

### Error: "permission denied for table analyses"

Configura las políticas RLS o verifica que el usuario tenga permisos.

### Los datos no se actualizan

Verifica que:
1. El backend esté ejecutándose
2. Las credenciales de Supabase sean correctas
3. El usuario esté autenticado correctamente

