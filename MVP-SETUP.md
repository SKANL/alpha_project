# 🏛️ Lawyer Client Management System - MVP

Sistema de gestión de clientes para despachos de abogados con experiencia "Omotenashi". Portal de bienvenida de alta calidad para convertir prospectos calificados en clientes formales.

## 🎯 Características Principales

### Para el Abogado (Dashboard SaaS)

1. **Gestión de Perfil**
   - Personalizar nombre del despacho
   - Subir logo (se muestra en la PWA del cliente)
   - Configurar link de agenda (Calendly, Google Calendar, etc.)

2. **Plantillas Reutilizables**
   - **Contratos**: Subir y gestionar plantillas de contratos en PDF
   - **Cuestionarios**: Crear cuestionarios personalizados con múltiples preguntas

3. **Gestión de Clientes**
   - Crear "Salas de Bienvenida" con link mágico de un solo uso
   - Ver lista de clientes (pendientes/completados)
   - Ver expedientes digitales completos con:
     - Contrato firmado + sello de evidencia (timestamp, IP, hash SHA-256)
     - Documentos subidos por el cliente
     - Respuestas al cuestionario
   - Eliminar expedientes (con confirmación)

### Para el Cliente (PWA - Portal de Bienvenida)

Flujo guiado de 5 pasos con experiencia "Omotenashi":

1. **Bienvenida**: Logo y nombre del despacho personalizado
2. **Contrato**: Ver PDF y firma digital con canvas
3. **Documentos**: Subir documentos solicitados (INE, RFC, Acta, Comprobante)
4. **Hechos**: Responder cuestionario personalizado
5. **Cierre**: Confirmación + link a agenda para primera reunión

## 🚀 Setup Rápido

### 1. Configurar Supabase

1. Crea un proyecto en [Supabase](https://supabase.com)
2. Ve a SQL Editor y pega todo el contenido de `supabase-schema.sql`
3. Ejecuta el script completo
4. Ve a **Storage** y verifica que el bucket `firm-assets` fue creado y es público
5. Copia tus credenciales (URL y Anon Key)

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_ANON_KEY=tu-anon-key
```

También actualiza `src/env.d.ts` si es necesario.

### 3. Instalar Dependencias

```bash
npm install
```

Dependencias necesarias (ya deberían estar en package.json):
- `@supabase/supabase-js` - Cliente de Supabase
- `astro` - Framework
- Cualquier otra dependencia del proyecto base

### 4. Ejecutar en Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:4321`

## 📁 Estructura del Proyecto

```
src/
├── components/
│   ├── Navigation.astro           # Navegación del dashboard
│   └── Welcome.astro              # (Original)
├── layouts/
│   ├── DashboardLayout.astro      # Layout para páginas del dashboard
│   └── Layout.astro               # Layout base
├── lib/
│   ├── supabase.ts                # Cliente de Supabase
│   └── types.ts                   # Tipos TypeScript para la BD
├── pages/
│   ├── index.astro                # Landing page
│   ├── signin.astro               # Login
│   ├── register.astro             # Registro
│   ├── dashboard.astro            # Dashboard principal
│   ├── dashboard/
│   │   ├── profile.astro          # Perfil del despacho
│   │   ├── clients.astro          # Lista de clientes
│   │   ├── clients/
│   │   │   ├── new.astro          # Crear sala de bienvenida
│   │   │   └── expediente.astro   # Ver expediente completo
│   │   └── templates/
│   │       ├── contracts.astro    # Gestión de contratos
│   │       └── questionnaires.astro # Gestión de cuestionarios
│   ├── welcome/
│   │   └── [token].astro          # PWA del cliente (link mágico)
│   └── api/
│       ├── auth/                  # Endpoints de autenticación
│       ├── profile/               # Endpoints de perfil
│       ├── templates/             # Endpoints de plantillas
│       ├── clients/               # Endpoints de clientes
│       └── portal/                # Endpoints públicos para PWA
└── styles/
    └── global.css                 # Estilos globales
```

## 🎨 Diseño y UX

El diseño sigue los principios de:
- **Minimalismo Zen**: Interfaces limpias, espaciado generoso
- **Omotenashi**: Experiencia hospitalaria japonesa - guiar al cliente paso a paso
- **Animaciones sutiles**: fadeInUp, transiciones suaves
- **Modo oscuro**: Paleta de colores oscuros con acento rojo (#C84C4C)
- **Tipografía**: System fonts, letra espaciada, uppercase en labels

## 🔐 Seguridad

- **RLS (Row Level Security)** habilitado en todas las tablas
- Los abogados solo pueden ver/editar sus propios datos
- El portal del cliente usa el token mágico para acceso
- Sello de evidencia en firmas digitales:
  - Timestamp
  - IP del cliente
  - Hash SHA-256 de firma + timestamp + IP

## 🗄️ Base de Datos

### Tablas Principales

1. **profiles** - Información del despacho
2. **contract_templates** - Plantillas de contratos
3. **questionnaire_templates** - Plantillas de cuestionarios
4. **questions** - Preguntas de cada cuestionario
5. **clients** - Clientes y salas de bienvenida
6. **client_documents** - Documentos subidos por clientes
7. **client_answers** - Respuestas a cuestionarios

### Storage

- **firm-assets** bucket (público):
  - `logos/` - Logos de despachos
  - `contracts/` - Plantillas de contratos
  - `signed-contracts/` - Contratos firmados
  - `client-files/` - Documentos de clientes

## 📝 Flujo de Uso

### Como Abogado

1. **Configuración inicial**:
   - Regístrate en `/register`
   - Ve a `/dashboard/profile` y configura tu despacho (logo, nombre, agenda)
   
2. **Crear plantillas**:
   - Ve a `/dashboard/templates/contracts` y sube tus contratos
   - Ve a `/dashboard/templates/questionnaires` y crea cuestionarios
   
3. **Crear sala de bienvenida**:
   - Ve a `/dashboard/clients/new`
   - Completa el formulario (nombre cliente, caso, plantillas, documentos)
   - Copia el link mágico generado
   
4. **Enviar al cliente**:
   - Envía el link por WhatsApp, email, etc.
   - El cliente completa el proceso
   
5. **Revisar expediente**:
   - En `/dashboard/clients` verás cuando el cliente complete el proceso
   - Haz clic en "Ver Expediente" para acceder al expediente digital
   - Revisa contrato firmado, documentos y respuestas

### Como Cliente

1. Recibe el link mágico del abogado
2. Abre el link (formato: `/welcome/{token}`)
3. Sigue los 5 pasos:
   - ✓ Lee la bienvenida
   - ✓ Firma el contrato
   - ✓ Sube documentos
   - ✓ Responde cuestionario
   - ✓ Agenda reunión (opcional)
4. Link se invalida automáticamente

## 🔄 API Endpoints

### Autenticación
- `POST /api/auth/register` - Registro
- `POST /api/auth/signin` - Login
- `POST /api/auth/signout` - Logout

### Perfil
- `GET /api/profile/get` - Obtener perfil
- `POST /api/profile/update` - Actualizar perfil (con logo)

### Plantillas - Contratos
- `GET /api/templates/contracts/list` - Listar
- `POST /api/templates/contracts/create` - Crear
- `DELETE /api/templates/contracts/delete` - Eliminar

### Plantillas - Cuestionarios
- `GET /api/templates/questionnaires/list` - Listar
- `POST /api/templates/questionnaires/create` - Crear
- `DELETE /api/templates/questionnaires/delete` - Eliminar

### Clientes
- `POST /api/clients/create` - Crear sala de bienvenida
- `GET /api/clients/list` - Listar clientes
- `GET /api/clients/expediente?id={id}` - Ver expediente
- `DELETE /api/clients/delete` - Eliminar cliente

### Portal (Público)
- `GET /api/portal/validate?token={token}` - Validar y obtener datos
- `POST /api/portal/sign` - Guardar firma
- `POST /api/portal/upload-document` - Subir documento
- `POST /api/portal/submit-answers` - Enviar respuestas
- `POST /api/portal/complete` - Completar proceso

## 🚧 Roadmap (Post-MVP)

### Fase 2 - Pagos
- [ ] Integración con Stripe/MercadoPago
- [ ] Planes de suscripción (Básico, Pro, Enterprise)
- [ ] Límites por plan (clientes, almacenamiento)

### Fase 3 - Notificaciones
- [ ] Email notifications (SendGrid/Resend)
- [ ] WhatsApp notifications
- [ ] Push notifications

### Fase 4 - Colaboración
- [ ] Múltiples usuarios por despacho
- [ ] Roles (Admin, Abogado, Asistente)
- [ ] Asignación de casos

### Fase 5 - Inteligencia
- [ ] OCR para validar documentos
- [ ] IA para análisis de respuestas
- [ ] Generación automática de contratos
- [ ] Analytics dashboard

## 🐛 Troubleshooting

### Error: "Cannot find module supabase"
- Verifica que `@supabase/supabase-js` esté instalado
- Ejecuta `npm install`

### Error: "Unauthorized" en las APIs
- Verifica que las cookies de sesión existan
- Revisa que el RLS esté configurado correctamente

### El logo no se sube
- Verifica que el bucket `firm-assets` exista y sea público
- Revisa las políticas de Storage en Supabase

### El link mágico no funciona
- Verifica que el token sea válido en la tabla `clients`
- Revisa que `link_used` sea `false`

## 📄 Licencia

Proyecto privado. Todos los derechos reservados.

## 👨‍💻 Autor

Sistema desarrollado con Astro + Supabase para despachos de abogados.

---

**¡Importante!**: Este es un MVP. La gestión de suscripciones está simulada. Para producción, implementa Stripe/MercadoPago antes de lanzar.
