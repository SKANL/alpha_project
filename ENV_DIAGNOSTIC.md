# 🔍 CHECKLIST DE DIAGNÓSTICO - Variables de Entorno

Por favor verifica cada punto en orden:

## 1. Ubicación del archivo .env
- [ ] El archivo `.env` está en la raíz del proyecto (mismo nivel que `package.json`)
- [ ] El archivo se llama exactamente `.env` (no `.env.txt` o `.env.example`)

## 2. Formato del archivo .env
Tu archivo `.env` debe verse EXACTAMENTE así (sin comentarios adicionales):

```env
PUBLIC_SUPABASE_URL=https://tuproyecto.supabase.co
PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
```

### ⚠️ ERRORES COMUNES:
- ❌ NO uses comillas: `PUBLIC_SUPABASE_URL="https://..."` 
- ❌ NO uses espacios: `PUBLIC_SUPABASE_URL = https://...`
- ❌ NO uses punto y coma al final
- ✅ USA: `PUBLIC_SUPABASE_URL=https://...` (sin espacios, sin comillas)

## 3. Contenido del .env
El archivo debe tener EXACTAMENTE estas dos líneas (reemplaza con tus valores):

```
PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 4. SOLUCIÓN RÁPIDA

1. **Abre tu archivo `.env`** (en la raíz del proyecto)

2. **Borra TODO el contenido**

3. **Copia y pega SOLO estas 2 líneas** (reemplazando con tus valores reales):

```
PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE_AQUI
PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_ANON_AQUI
```

4. **Guarda el archivo**

5. **Detén completamente el servidor** (Ctrl+C en terminal)

6. **Inicia de nuevo**:
```bash
npm run dev
```

## 5. Obtener tus credenciales de Supabase

Si no tienes las credenciales a mano:
1. Ve a https://supabase.com/dashboard
2. Selecciona tu proyecto
3. Menú lateral → Settings → API
4. Copia:
   - **Project URL** → pégalo después de `PUBLIC_SUPABASE_URL=`
   - **anon public** key → pégala después de `PUBLIC_SUPABASE_ANON_KEY=`

## 6. Si sigue sin funcionar

Ejecuta este comando y compárteme el resultado:
```bash
cat .env
```

O en Windows PowerShell:
```powershell
Get-Content .env
```
