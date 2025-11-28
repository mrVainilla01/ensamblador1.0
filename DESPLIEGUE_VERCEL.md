# 🚀 Guía de Despliegue en Vercel

Esta guía te ayudará a desplegar el frontend de DERMA_IA en Vercel paso a paso.

## 📋 Antes de Empezar

Asegúrate de tener:
- ✅ Cuenta de GitHub (ya tienes el código subido)
- ✅ Las credenciales de Supabase a mano

## 🎯 Pasos para Desplegar

### 1️⃣ Ir a Vercel

1. Abre tu navegador y ve a: **https://vercel.com**
2. Haz clic en **"Sign Up"** (si no tienes cuenta) o **"Log In"**
3. Selecciona **"Continue with GitHub"**
4. Autoriza a Vercel para acceder a tus repositorios

### 2️⃣ Importar el Proyecto

1. En el dashboard de Vercel, haz clic en **"Add New..."** → **"Project"**
2. Busca el repositorio **"ensamblador1.0"** en la lista
3. Haz clic en **"Import"** junto al repositorio

### 3️⃣ Configurar el Proyecto

#### **Framework Preset:**
- Vercel detectará automáticamente **"Vite"** ✅

#### **Root Directory:**
- Haz clic en **"Edit"** al lado de "Root Directory"
- Escribe: `frontend`
- Haz clic en **"Continue"**

#### **Build Settings** (Verificar que estén así):
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

> 💡 Estos valores ya vienen configurados automáticamente

#### **Environment Variables** (¡IMPORTANTE!):

Haz clic en **"Environment Variables"** y agrega las siguientes:

**Variable 1:**
- **Name**: `VITE_SUPABASE_URL`
- **Value**: `https://bsnvmbmyveqhcilebfci.supabase.co`

**Variable 2:**
- **Name**: `VITE_SUPABASE_ANON_KEY`
- **Value**: (Copia la clave de tu archivo `frontend/.env`)

> ⚠️ **IMPORTANTE**: Sin estas variables, la aplicación NO funcionará

### 4️⃣ Desplegar

1. Haz clic en el botón **"Deploy"**
2. Espera 2-3 minutos mientras Vercel:
   - Instala las dependencias
   - Construye el proyecto
   - Despliega la aplicación

### 5️⃣ ¡Listo! 🎉

Una vez completado:
- Verás un mensaje de éxito con confeti 🎊
- Tu URL será algo como: `https://ensamblador1-0.vercel.app`
- Haz clic en **"Visit"** para ver tu sitio en vivo

## 🔄 Actualizaciones Automáticas

Cada vez que hagas `git push` a GitHub:
- Vercel detectará los cambios automáticamente
- Desplegará la nueva versión
- Te enviará un email con el resultado

## 🌐 Dominio Personalizado (Opcional)

Si quieres usar tu propio dominio:

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Domains"**
3. Agrega tu dominio
4. Sigue las instrucciones para configurar el DNS

## 🐛 Solución de Problemas

### ❌ Error: "Build failed"

**Causa**: Falta alguna configuración

**Solución**:
1. Verifica que el Root Directory sea `frontend`
2. Revisa que las variables de entorno estén correctas
3. Asegúrate de que `npm run build` funcione localmente

### ❌ La página carga pero no funciona

**Causa**: Variables de entorno incorrectas

**Solución**:
1. Ve a **Settings** → **Environment Variables**
2. Verifica que `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` estén correctas
3. Haz un nuevo deploy: **Deployments** → **...** → **Redeploy**

### ❌ Error 404 al navegar

**Causa**: Configuración de rutas

**Solución**: El archivo `vercel.json` ya está configurado para manejar esto ✅

## 📝 Verificar el Deploy

Para verificar que todo funciona:

1. Abre la URL de Vercel
2. Intenta **registrarte** con un nuevo usuario
3. Intenta **iniciar sesión**
4. Sube una imagen para análisis
5. Verifica que el historial funcione

## 🔒 Seguridad

- ✅ Las variables de entorno están protegidas
- ✅ Los archivos `.env` NO se suben a GitHub
- ✅ Supabase maneja la autenticación de forma segura

## 📚 Recursos Adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Guía de Vite en Vercel](https://vercel.com/docs/frameworks/vite)
- [Variables de Entorno en Vercel](https://vercel.com/docs/environment-variables)

---

**¿Necesitas ayuda?** Revisa la sección de solución de problemas o contacta al equipo de soporte.
