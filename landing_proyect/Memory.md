# Memoria del proyecto

## Propósito del proyecto
- Landing page para SMA Ingeniería & Software, enfocada en presentar soluciones de gestión de flotas y maquinaria pesada, con modo claro/oscuro e internacionalización (ES/EN).
- Experiencia responsive, con animaciones y componentes de marketing (Hero, About, Features, Clients, WhyChoose, Pricing, Contact) y controles flotantes de tema e idioma.

## Lista inicial de decisiones técnicas (a completar)
- Framework: Next.js 16 (app router) con React 19.
- Estilos: Tailwind CSS v4 (uso de `@import "tailwindcss"` y utilidades; variables CSS para tema).
- Animaciones: framer-motion.
- Iconos: lucide-react.
- Tipografía: Geist (Next font).
- Gestión de tema/idioma: estado global en `app/page.tsx`, persistido en `localStorage`, aplicado vía `data-theme` y props de idioma.
- Controles de tema/idioma: componente flotante fijo (`FloatingControls`), siempre visible.
- Pendiente: pruebas E2E / unitarias; pipeline CI; lint/format.
- Supabase: cliente `@supabase/supabase-js` y `@supabase/ssr` con helpers `lib/supabase-browser.ts` y `lib/supabase-server.ts`; variables en `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

## Estructura inicial del front y backend
- Frontend (actual):
  - `app/` (Next app router)
    - `page.tsx`: orquestación de estado global (tema/idioma) y composición de secciones.
    - `layout.tsx`: metadatos y fuentes; favicon `mini_logo.png`.
    - `globals.css`: base Tailwind v4, variables de tema, utilidades personalizadas.
  - `components/`: Hero, Header, About, Features, Clients, WhyChoose, Pricing, Contact, Footer, LoginModal, BackgroundAnimation, FloatingControls, AdminClientsManager, LogoutButton.
  - `lib/ui-types.ts`: tipos para tema e idioma.
  - `public/`: logos y assets estáticos.
- Backend (actual):
  - Integrado en Next.js (Server Actions y Route Handlers).
  - APIs de login, logout, gestión de usuarios, clientes, tipos de máquina y máquinas.

## Estrategia inicial de manejo de PDFs
- Pendiente de definir. Opciones:
  - Cliente: `pdfmake`/`jsPDF` para brochures/cotizaciones simples.
  - Servidor/serverless: `pdfkit` o render HTML→PDF con `puppeteer/playwright` para fidelidad de diseño.
  - Archivos estáticos: almacenar/servir desde bucket (S3/GCS/Azure).

## Autenticación (Supabase)
- Usuarios ahora en Supabase (`public.users`), roles numéricos en `public.roles` (1=admin_root, 2=admin_customer, 3=sub_customer). `user_id` identity desde 1000.
- Campos: `nombre`, `cedula`, `mail`, `password_hash` (SHA-256), `parent_id`, `role_id`, timestamps.
- Semillas: user_id 1000 (admin_root, parent null), 1001 (admin_customer, parent 1000), contraseña `@Pojuan24@` (hash).
- Sesión: cookie httpOnly `auth_session` con `{ userId, roleId, role, username, displayName?, iat }`, expira en 1 día, SameSite=Lax.
- Login: `POST /api/login` valida contra Supabase y setea cookie; logout: `POST /api/logout` limpia cookie.
- Rutas protegidas por `middleware.ts`:
  - `/admin/dashboard` → solo rol admin
  - `/cliente/home` → solo rol customer
  - Sin sesión o rol incorrecto → `/login?from=...`.

## Clientes y módulos (admin)
- Configuración de módulos en `data/clients.json` (usuarios, grabaciones, movimientos).
- La gestión de usuarios y clientes ahora consulta directamente la tabla `users` de Supabase para obtener todos los registros (roles 1, 2 y 3) y combina esta información con la configuración de módulos del JSON.
- API admin: `GET/POST /api/admin/clients` y `GET/POST/PUT/DELETE /api/admin/users`.
- UI: `AdminClientsManager` permite ver y gestionar usuarios con su jerarquía (mostrando Parent ID y Rol), y asignar módulos tanto a Admin Customer como Sub Customer.

## Creación de usuarios (admin)
- Persistentes en Supabase (`users`). API `POST /api/admin/users`.
- Reglas: admin_root (1) crea admin_customer (2); admin_customer (2) crea sub_customer (3). `parent_id` = `user_id` del creador.

## Módulo Grabaciones (Rol 2 - Admin Customer)
Funcionalidad exclusiva para usuarios con Rol 2. Incluye:

### 1. Tipos de máquina
- BD: tabla `machine_types` (`id`, `owner_id`, `machine_id` numérico, `name`, `deleted`).
- CRUD completo via `/api/machine-types`.
- Frontend: Gestión en pestaña "Tipos de máquina".

### 2. Máquinas (Nueva Funcionalidad)
- BD: 
  - Tabla `machines`: almacena datos generales (`owner_id`, `machine_type_id`, `name`, `brand`, `model`, `serial_number`, etc.).
  - Tabla `machine_engines`: relación 1:N con máquinas, almacena detalles de motores.
  - Tabla `machine_files`: almacena referencias a archivos adjuntos (manuales, planos, etc.) subidos a Storage.
- Storage: Bucket `machine-files` en Supabase para documentos (PDFs, imágenes). Acceso público para lectura, autenticado para escritura.
- API: `/api/machines` soporta operaciones CRUD completas, incluyendo gestión transaccional de motores y archivos.
- Frontend: 
  - Formulario detallado tipo "ficha técnica" con campos de control (horómetro/kilometraje), combustible, mantenimientos, etc.
  - Sub-formulario dinámico para agregar múltiples motores.
  - Botón "Adjuntar Archivos" que permite subir múltiples documentos directamente a Supabase Storage y visualizarlos en lista.
  - Vista de lista tipo tarjetas para visualizar máquinas creadas, editar o eliminar.

## UI/UX de módulos y sidebar
- Sidebar dinámico:
  - "Usuarios": con subopciones "Crear usuario" y "Mis Usuarios" (para Rol 2).
  - "Grabaciones": despliega opciones "Tipos de máquina" y "Máquinas".
  - "Movimientos": placeholder por implementar.
- Para rol 2, se muestran módulos activos (usuarios/grabaciones/movimientos) según cliente asociado. Para rol 1, vista de clientes y módulos completa.
