# Configuración del Sistema - Frontend y Backend

Este documento explica cómo configurar y ejecutar el sistema completo de análisis de cáncer de piel.

## Arquitectura del Sistema

El proyecto consta de dos componentes principales:

### 🎨 Frontend (`fr/frontend`)
- **Framework**: React + Vite + TypeScript
- **UI**: Tailwind CSS + shadcn/ui
- **Base de datos**: Supabase (conexión directa)
- **Puerto**: 5173 (desarrollo)

### ⚙️ Backend (`fr/backend`)
- **Framework**: Express.js + Node.js
- **Base de datos**: Supabase
- **Puerto**: 3001

### 🗄️ Base de Datos
- **Servicio**: Supabase
- **URL**: `https://bsnvmbmyveqhcilebfci.supabase.co`
- **Tablas principales**:
  - `auth.users` - Usuarios autenticados
  - `profiles` - Perfiles de usuario (opcional)
  - `analyses` - Análisis de imágenes guardados

## Configuración Inicial

### 1. Variables de Entorno

#### Frontend
Crea el archivo `fr/frontend/.env` con:
```env
VITE_SUPABASE_URL=https://bsnvmbmyveqhcilebfci.supabase.co
VITE_SUPABASE_ANON_KEY=tu_clave_anon_aqui
```

#### Backend
Crea el archivo `fr/backend/.env` con:
```env
SUPABASE_URL=https://bsnvmbmyveqhcilebfci.supabase.co
SUPABASE_KEY=tu_clave_anon_aqui
PORT=3001
```

> **Nota**: Los archivos `.env.example` en cada carpeta muestran la estructura sin credenciales reales.

### 2. Instalar Dependencias

#### Frontend
```bash
cd "c:\Users\User\Downloads\Mi granito de arena\fr\frontend"
npm install
```

#### Backend
```bash
cd "c:\Users\User\Downloads\Mi granito de arena\fr\backend"
npm install
```

### 3. Configurar Base de Datos en Supabase

Accede a tu proyecto de Supabase y ejecuta el siguiente SQL para crear la tabla de análisis:

```sql
-- Crear tabla de análisis
CREATE TABLE analyses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  fecha TIMESTAMP NOT NULL,
  image TEXT NOT NULL,
  result JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para mejorar rendimiento
CREATE INDEX idx_analyses_user_id ON analyses(user_id);
CREATE INDEX idx_analyses_fecha ON analyses(fecha DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad
CREATE POLICY "Users can view own analyses"
  ON analyses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
  ON analyses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own analyses"
  ON analyses FOR DELETE
  USING (auth.uid() = user_id);
```

## Ejecutar el Sistema

### Opción 1: Ejecutar Ambos Servicios

**Terminal 1 - Backend**:
```bash
cd "c:\Users\User\Downloads\Mi granito de arena\fr\backend"
npm run dev
```

**Terminal 2 - Frontend**:
```bash
cd "c:\Users\User\Downloads\Mi granito de arena\fr\frontend"
npm run dev
```

### Opción 2: Solo Frontend

Si solo necesitas el frontend (la autenticación y datos se manejan directamente con Supabase):

```bash
cd "c:\Users\User\Downloads\Mi granito de arena\fr\frontend"
npm run dev
```

Abre el navegador en: `http://localhost:5173`

## Endpoints del Backend

El backend expone los siguientes endpoints REST:

### Análisis
- `POST /api/analysis` - Guardar un análisis
- `GET /api/analysis/:userId` - Obtener análisis de un usuario
- `DELETE /api/analysis/:id` - Eliminar un análisis

### Historial
- `GET /api/history/:userId` - Obtener historial con filtros
- `GET /api/history/:userId/stats` - Obtener estadísticas
- `DELETE /api/history/:userId` - Eliminar todo el historial

### Salud
- `GET /health` - Verificar estado del servidor y conexión a BD

## Flujo de Datos

### Autenticación
```
Usuario → Frontend → Supabase Auth → Frontend
```

El frontend maneja la autenticación directamente con Supabase usando `@supabase/supabase-js`.

### Guardar Análisis

**Opción A - Directo desde Frontend** (actual):
```
Usuario → Frontend → Supabase → Frontend
```

**Opción B - A través del Backend** (opcional):
```
Usuario → Frontend → Backend → Supabase → Backend → Frontend
```

### Obtener Historial

**Opción A - Directo desde Frontend** (actual):
```
Frontend → Supabase → Frontend
```

**Opción B - A través del Backend** (opcional):
```
Frontend → Backend → Supabase → Backend → Frontend
```

## Verificación de la Conexión

### 1. Verificar Backend
```bash
curl http://localhost:3001/health
```

Respuesta esperada:
```json
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-11-23T20:20:00.000Z"
}
```

### 2. Verificar Frontend
1. Abre `http://localhost:5173` en el navegador
2. Abre la consola del navegador (F12)
3. No debe haber errores de conexión a Supabase
4. Intenta registrar un usuario nuevo
5. Verifica que puedes iniciar sesión

### 3. Verificar Integración Completa
1. Inicia sesión en el frontend
2. Realiza un análisis (si la funcionalidad está disponible)
3. Verifica en Supabase que el registro se guardó en la tabla `analyses`
4. Verifica que aparece en el historial del frontend

## Solución de Problemas

### Error: "relation 'analyses' does not exist"
**Solución**: Ejecuta el SQL de creación de tabla en Supabase (ver sección 3 de Configuración Inicial)

### Error: "Invalid API key"
**Solución**: Verifica que las credenciales en los archivos `.env` sean correctas

### Frontend no carga
**Solución**: 
1. Verifica que instalaste las dependencias: `npm install`
2. Verifica que el archivo `.env` existe y tiene las variables correctas
3. Reinicia el servidor de desarrollo

### Backend no se conecta a Supabase
**Solución**:
1. Verifica el archivo `backend/.env`
2. Verifica que las credenciales sean las mismas que en el frontend
3. Revisa los logs del servidor para más detalles

## Seguridad

> **⚠️ IMPORTANTE**: 
> - Nunca subas los archivos `.env` a Git
> - Los archivos `.env` ya están en `.gitignore`
> - Usa `.env.example` para compartir la estructura sin credenciales
> - Las credenciales de Supabase son públicas (anon key) pero están protegidas por RLS

## Próximos Pasos

1. ✅ Credenciales unificadas entre frontend y backend
2. ✅ Variables de entorno configuradas
3. ✅ Documentación completa
4. 🔄 Probar la integración completa
5. 📝 Crear tabla `analyses` en Supabase (si no existe)
6. 🎨 Implementar funcionalidad de análisis de imágenes (si no está)

## Referencias

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Vite](https://vitejs.dev/)
- [Documentación de Express](https://expressjs.com/)
