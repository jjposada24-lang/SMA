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
- Supabase: cliente `@supabase/supabase-js` con helpers `lib/supabase-browser.ts` y `lib/supabase-server.ts`; variables en `.env.local` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

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
  - Sin backend externo; APIs de Next para login, logout, gestión de usuarios/clientes (solo dev/local).

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
- Aún en `data/clients.json` (pendiente migrar a Supabase). Inicial `cliente_demo` con `{ usuarios: true, grabaciones: false, movimientos: true }`.
- Módulos: `usuarios`, `grabaciones`, `movimientos`. Funciones: `getClients()`, `toggleModule()`, `addClient()`.
- API admin: `GET/POST /api/admin/clients`. UI: `AdminClientsManager` muestra listado, búsqueda y toggles; incluye eliminar cliente/usuario; botón de logout.
- Módulo “usuarios” se activa por defecto al crear cliente. Para rol 2, los módulos activos se consultan desde `/api/admin/clients` (que ahora devuelve el cliente del propio userId/username) para pintar el sidebar. Root (rol 1) sigue viendo todos.

## Creación de usuarios (admin)
- Persistentes en Supabase (`users`). API `POST /api/admin/users` acepta `{ nombre, cedula, mail, password, roleId }`. Reglas: admin_root (1) crea admin_customer (2); admin_customer (2) crea sub_customer (3). `parent_id` = `user_id` del creador. Si se crea admin_customer, se agrega cliente en JSON con su `user_id` (para módulos) hasta migrar módulos a BD.

## Módulo Grabaciones → Tipos de máquina (rol 2)
- BD: tabla `machine_types` (`id` bigserial, `owner_id` FK a `users.user_id`, `machine_id` smallint NOT NULL, `name` text, `deleted` timestamptz, `created_at`). Índice único `(owner_id, machine_id)` ignorando deleted.
- Borrado lógico (`deleted` con timestamp). `machine_id` validado como entero 1..32767; `name` se almacena en mayúsculas.
- API `/api/machine-types` (solo rol 2):  
  - `GET` lista del owner.  
  - `POST {name, machineId}` crea.  
  - `PUT {id, name, machineId}` edita.  
  - `DELETE {id}` soft delete.
- Front: en `AdminClientsManager`, el bloque “Grabaciones” muestra opción “Tipos de máquina” y carga formulario/lista en panel central. Campo único numérico para ID de máquina; listado muestra Machine ID y BD ID; edición/eliminación disponibles.

## UI/UX de módulos y sidebar
- Sidebar: “Usuarios” con subopciones “Crear usuario” y “Mis Usuarios”; “Grabaciones” con “Tipos de máquina”; “Movimientos” placeholder.
- Para rol 2, se muestran módulos activos (usuarios/grabaciones/movimientos) según cliente asociado. Para rol 1, vista de clientes y módulos completa.

