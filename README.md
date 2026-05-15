# Auto Wax South Florida — Sistema Completo

## Stack
- Next.js 16 + TypeScript
- MySQL 2 (sin Prisma — queries SQL directas)
- Tailwind CSS + shadcn/ui
- JWT para auth de vendedores (PWA)

---

## Setup — Paso a paso

### 1. MySQL Workbench

Abrí MySQL Workbench y ejecutá en orden:

```sql
-- Primero:
SOURCE /ruta/al/proyecto/database/schema.sql

-- Después:
SOURCE /ruta/al/proyecto/database/seed.sql
```

O abrí los archivos desde: File → Open SQL Script → Run

### 2. Variables de entorno

Copiá `.env.local` y completá con tu contraseña de MySQL:

```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=TU_PASSWORD_AQUI
DB_NAME=autowax_db
NEXTAUTH_SECRET=autowax-super-secret-key-2025
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Instalar dependencias y correr

```bash
npm install
npm run dev
```

### 4. Acceder al sistema

| URL | Descripción |
|-----|-------------|
| `localhost:3000` | Landing page pública |
| `localhost:3000/book` | Formulario de turno |
| `localhost:3000/book?ref=SELLER_JL001` | Turno con referido |
| `localhost:3000/login` | Login admin / vendedor |
| `localhost:3000/admin` | Panel admin |
| `localhost:3000/seller` | App vendedor (PWA) |

### 5. Credenciales de prueba

**Admin:**
- Email: `admin@autowax.com`
- Password: `password` (cambiar en producción)

**Vendedor (login por teléfono):**
- Phone: `15612000001` (Javier Lopez)
- Phone: `15612000002` (Maria Garcia)

---

## Estructura del proyecto

```
/app
  /admin          → Panel administración
  /seller         → App vendedor (PWA)
  /book           → Formulario de turno público
  /login          → Login
  /api
    /appointments → CRUD turnos + tracking de referidos
    /sellers      → CRUD vendedores + generación QR
    /commissions  → Gestión comisiones + pagos
    /invoices     → Facturación + auto-generación comisiones
    /clients      → Gestión clientes
    /auth         → Login admin (NextAuth) + seller (JWT)

/lib
  /db             → Conexión MySQL pool
  /queries        → Todas las queries SQL organizadas

/database
  schema.sql      → Crear todas las tablas
  seed.sql        → Datos de prueba

/public
  manifest.json   → PWA config (instalable en celular)
```

---

## Flujo del QR

1. Vendedor muestra su QR al cliente
2. Cliente escanea → va a `localhost:3000/?ref=SELLER_JL001`
3. Landing muestra banner "Referred by Javier Lopez"
4. Cliente hace click en "Book Now" → va a `/book?ref=SELLER_JL001`
5. Al enviar el form:
   - Si el cliente es nuevo → se crea y queda vinculado al vendedor
   - Si el cliente ya existe sin vendedor → se le asigna el vendedor
   - Si ya tiene vendedor → mantiene el anterior
6. Cuando se factura y se marca como pagado → comisión generada automáticamente
7. Vendedor ve la comisión en tiempo real en su PWA

---

## Comisiones — cómo funciona

```
1. Admin crea factura y marca como "Paid"
2. API detecta si el cliente tiene vendedor asignado
3. Calcula comisión según config del vendedor (% o $ fijo)
4. Guarda en tabla commissions con status = 'pending'
5. Vendedor ve la comisión en su app inmediatamente
6. Admin puede pagar comisiones en bulk desde el panel
7. Al pagar → status = 'paid' + fecha + quién pagó
```
