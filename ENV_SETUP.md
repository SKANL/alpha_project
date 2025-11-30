# Instrucciones de Configuración de Variables de Entorno

## 📝 Configuración Inicial

1. **Copia el archivo de ejemplo**:
   ```bash
   cp .env.example .env
   ```

2. **Obtén tus credenciales de Supabase**:
   - Ve a [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Selecciona tu proyecto
   - Ve a Settings > API
   - Copia:
     - `Project URL` → PUBLIC_SUPABASE_URL
     - `anon/public key` → PUBLIC_SUPABASE_ANON_KEY

3. **Edita el archivo `.env`** y añade las variables con el prefijo PUBLIC_:
   ```env
   PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
   PUBLIC_SUPABASE_ANON_KEY=tu-clave-aqui
   ```

4. **Reinicia el servidor de desarrollo**:
   ```bash
   npm run dev
   ```

## ⚠️ Importante

### Prefijo PUBLIC_
Las variables de Supabase DEBEN tener el prefijo `PUBLIC_` porque:
- El cliente Supabase se usa tanto en el servidor como en el navegador
- En Astro, solo las variables con `PUBLIC_` están disponibles en el cliente
- La clave "anon" es segura de exponer (diseñada para uso público)

### Seguridad
- El archivo `.env` NO debe ser commiteado al repositorio (ya está en `.gitignore`)
- La clave "anon" de Supabase está diseñada para ser pública
- Supabase maneja la seguridad con Row Level Security (RLS)

## 🐛 Debugging (Opcional)

Si necesitas ver logs de autenticación, añade (SIN el prefijo PUBLIC_):
```env
DEBUG_AUTH=true
```

Esto mostrará información detallada solo en la consola del servidor.
