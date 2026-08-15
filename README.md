# 🗳️ Encuestas Anteño TV — Elecciones 2026 (Antonio Ante, Imbabura)

Aplicación web de una sola pantalla (Single Page Application) moderna, reactiva y optimizada para dispositivos móviles para la realización de encuestas no oficiales de las Elecciones Seccionales 2026 de Ecuador, desarrollada para el medio digital comunitario **Anteño TV**.

Desarrollada por **Teo / TeoDev** ([@TeoDev1611](https://github.com/TeoDev1611)).

---

## ✨ Características Principales

- **Diseño Fiel a Anteño TV**: Paleta oscura (`#0f172a`), tipografía `Outfit`, efectos de cristal (*glassmorphism*), mallas de gradiente azul y cyan.
- **Flujo en 1 Sola Pantalla**: Visualización de candidatos → Voto a 1 solo toque → Resultados en vivo → Compartir en redes. Cero recargas de página.
- **Resultados en Tiempo Real**: Gráfico de barras y porcentajes interactivo potenciado por **Supabase Realtime**.
- **Temporizador de Cierre**: Cuenta regresiva automática hasta `fecha_cierre` (configurable en base de datos). Desactiva el voto y muestra resultados finales al expirar.
- **Sistema Anti-Spam en Servidor**:
  - Campo *Honeypot* invisible para desarmar bots.
  - 1 voto por dispositivo y dignidad vía `localStorage` + cookie segura.
  - Edge Function con hashing criptográfico de IP (`SHA-256 + Salt`) y límite de 3 votos cada 24 horas por red (permite votos legítimos en hogares compartidos sin admitir granjas de bots).
  - Punto de integración preparado para hCaptcha.
- **Compartir Fácil**: Integración con **Web Share API** nativa (WhatsApp, Telegram, etc.) con mensaje prellenado y respaldo de copiado al portapapeles.
- **SEO & Open Graph Optimizado**: Tarjetas de vista previa listas para WhatsApp, Facebook y X/Twitter con banner oficial.
- **Escalabilidad por Fases**: Cambia de dignidad (Alcaldía → Concejales → Prefectura) o cantón directamente desde Supabase sin tener que volver a desplegar código.

---

## 🚀 Puesta en Marcha Rápida (Local)

### 1. Clonar e Instalar Dependencias
```bash
npm install
```

### 2. Iniciar el Servidor de Desarrollo
```bash
npm run dev
```
La aplicación se abrirá en `http://localhost:5173`. Si no configuras variables de Supabase, la app iniciará automáticamente en **Modo Demostración** con datos representativos de Antonio Ante 2026.

---

## 🗄️ Configuración de Supabase (Paso a Paso)

### 1. Crear Proyecto en Supabase
1. Ingresa a [supabase.com](https://supabase.com/) y crea un nuevo proyecto gratuito.
2. Copia la **URL del proyecto** y la clave pública **anon key** desde:
   `Project Settings > API > Project API keys`.

### 2. Ejecutar el Script SQL
1. En el panel de Supabase, ve a **SQL Editor**.
2. Abre o pega el contenido del archivo [`supabase/schema.sql`](./supabase/schema.sql).
3. Haz clic en **Run**. Esto creará:
   - Tablas: `cantones`, `dignidades`, `candidatos`, `votos`, `conteo_candidatos`.
   - Vistas agregadas: `vista_resultados_candidatos`.
   - Triggers de conteo automático y funciones RPC.
   - Políticas de seguridad Row Level Security (RLS).
   - Datos iniciales para la **Alcaldía de Antonio Ante 2026**.

---

## ⚡ Despliegue de la Edge Function (Anti-Spam)

La Edge Function valida los votos de forma segura en servidor, oculta las IPs de los votantes y aplica las reglas anti-spam.

### 1. Instalar Supabase CLI (si no lo tienes)
```bash
npm install -g supabase
```

### 2. Iniciar Sesión y Vincular Proyecto
```bash
supabase login
supabase link --project-ref TU_ID_DE_PROYECTO
```

### 3. Configurar Secreto de Salt para Hasheo de IP
```bash
supabase secrets set IP_HASH_SALT="TuSaltSecretoAnteñoTV2026"
```

### 4. Desplegar la Función
```bash
supabase functions deploy vote --no-verify-jwt
```
La URL generada será: `https://TU_ID_DE_PROYECTO.supabase.co/functions/v1/vote`.

---

## 🌐 Variables de Entorno (`.env`)

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu-clave-anon-publica
VITE_EDGE_FUNCTION_VOTE_URL=https://tu-proyecto.supabase.co/functions/v1/vote
```

---

## 🚀 Despliegue en Vercel o Netlify

### Despliegue en Vercel (Recomendado)
1. Sube tu repositorio a GitHub.
2. Ingresa a [vercel.com](https://vercel.com/) e importa el repositorio.
3. En **Environment Variables**, agrega:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_EDGE_FUNCTION_VOTE_URL`
4. Haz clic en **Deploy**. ¡Listo!

### Despliegue en Netlify
1. Conecta tu repositorio en [netlify.com](https://netlify.com/).
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Configura las variables de entorno en `Site configuration > Environment variables`.

---

## 📊 Gestión de Encuestas (Lanzamiento por Fases)

Para cambiar de encuesta o lanzar una nueva fase (ejemplo: Concejales o Prefectura):
1. Ingresa a la tabla `dignidades` en Supabase.
2. Marca `activa = false` en la dignidad anterior.
3. Inserta la nueva dignidad con su respectiva `fecha_cierre` y `activa = true`.
4. Agrega los candidatos correspondientes en la tabla `candidatos` vinculados al nuevo `dignidad_id`.
5. La aplicación web se actualizará automáticamente sin necesidad de re-compilar código.

---

## 👨‍💻 Créditos
- **Canal Digital**: [Anteño TV](https://antenotv.vercel.app/) — *Desde el Corazón de Imbabura*
- **Desarrollo**: [TeoDev (@TeoDev1611)](https://github.com/TeoDev1611)
