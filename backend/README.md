# Backend - Sistema de Análisis de Cáncer de Piel

Backend para gestionar la conexión con Supabase y las operaciones de base de datos.

## Estructura

```
backend/
├── index.js                 # Servidor principal
├── config/
│   └── supabase.js          # Configuración de Supabase
├── routes/
│   ├── analysis.js          # Rutas para análisis
│   └── history.js           # Rutas para historial
├── package.json
└── .env                     # Variables de entorno (crear manualmente)
```

## Instalación

```bash
cd backend
npm install
```

## Configuración

1. Copia `.env.example` a `.env`:
```bash
cp .env.example .env
```

2. Edita `.env` con tus credenciales de Supabase (ya están configuradas por defecto)

## Uso

```bash
# Desarrollo
npm run dev

# Producción
npm start
```

El servidor se ejecutará en `http://localhost:3001`

## Endpoints

### Análisis

- **POST /api/analysis** - Guarda un análisis
- **GET /api/analysis/:userId** - Obtiene análisis de un usuario
- **DELETE /api/analysis/:id** - Elimina un análisis

### Historial

- **GET /api/history/:userId** - Obtiene historial completo
- **GET /api/history/:userId/stats** - Obtiene estadísticas
- **DELETE /api/history/:userId** - Elimina todo el historial

### Salud

- **GET /health** - Verifica estado del servidor y conexión a BD

## Conexión con Supabase

Ver `CONEXION_BASE_DATOS.md` para detalles completos sobre cómo se conecta el análisis e historial con la base de datos.

## Credenciales de Supabase

- **URL**: `https://sjarucjxlqwczhgseuzs.supabase.co`
- **Key**: Configurada en `config/supabase.js`

