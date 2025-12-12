# Memoria (autenticación)

## Usuarios predefinidos
- admin / 123456 — rol: admin
- cliente_demo / 123456 — rol: customer

## Roles disponibles
- admin
- customer

## Rutas protegidas
- `/admin/dashboard` → solo rol admin
- `/cliente/home` → solo rol customer
- Middleware redirige a `/login?from=...` si no hay sesión o si hay desajuste de rol.

## Almacenamiento de usuarios
- In-memory en `lib/auth/users.ts` con hash SHA-256 de la contraseña (solo para uso local/dev).
- Sesión minimalista en cookie httpOnly `auth_session` (Base64 del payload `{ username, role, iat }`, expiración 1 día, SameSite=Lax).


