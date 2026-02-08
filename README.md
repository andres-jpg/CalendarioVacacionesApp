# Sistema de Gestión de Vacaciones

Aplicación web para gestionar las vacaciones de los trabajadores de una empresa.

## Stack Tecnológico

- **Frontend**: Next.js 15 (App Router) + TypeScript + React 19
- **UI Library**: shadcn/ui + Tailwind CSS 4
- **Backend/DB/Auth**: Supabase
- **Librerías adicionales**:
  - `date-fns`: Manejo de fechas
  - `react-day-picker`: Selector de fechas
  - `react-hook-form` + `zod`: Validación de formularios
  - `@tanstack/react-table`: Tablas de datos

## Configuración Inicial

### 1. Configurar Variables de Entorno

Copie el archivo `.env.example` a `.env.local` y configure sus credenciales de Supabase:

```bash
cp .env.example .env.local
```

Edite `.env.local` y agregue sus credenciales:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Configurar Supabase

#### Opción A: Usando Supabase CLI (Recomendado para desarrollo local)

1. Instale Supabase CLI:
```bash
npm install -g supabase
```

2. Inicie sesión en Supabase:
```bash
supabase login
```

3. Enlace con su proyecto:
```bash
supabase link --project-ref your-project-ref
```

4. Ejecute las migraciones:
```bash
supabase db push
```

#### Opción B: Manualmente en Supabase Dashboard

1. Vaya a su proyecto en [Supabase Dashboard](https://app.supabase.com)
2. En el menú lateral, vaya a "SQL Editor"
3. Copie y ejecute el contenido de `supabase/migrations/20260208000000_initial_schema.sql`
4. (Opcional) Ejecute `supabase/seed.sql` para datos de prueba

### 3. Crear Usuario Admin

En Supabase Dashboard:

1. Vaya a "Authentication" > "Users"
2. Click en "Add user" > "Create new user"
3. Ingrese email y contraseña para el administrador
4. Confirme el usuario

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

Abra [http://localhost:3000](http://localhost:3000) en su navegador.

## Estructura del Proyecto

```
calendario-vacaciones-app/
├── app/
│   ├── (auth)/
│   │   └── login/              # Página de login
│   ├── (dashboard)/            # Rutas protegidas
│   │   ├── employees/          # Gestión de empleados
│   │   ├── calendar/           # Calendario de vacaciones
│   │   └── settings/           # Configuración
│   ├── layout.tsx              # Layout principal
│   └── page.tsx                # Dashboard
├── components/
│   ├── ui/                     # Componentes shadcn/ui
│   ├── calendar/               # Componentes del calendario
│   ├── employees/              # Componentes de empleados
│   └── layout/                 # Layout components (Navbar, Sidebar)
├── lib/
│   ├── supabase/               # Clientes Supabase
│   └── utils/                  # Utilidades (cálculos, fechas)
├── hooks/                      # Custom React hooks
├── types/                      # Tipos TypeScript
└── supabase/
    └── migrations/             # Migraciones de base de datos
```

## Funcionalidades

### Gestión de Empleados
- Alta de nuevos empleados
- Edición de datos
- Baja de empleados (soft delete)
- Cálculo automático de días según fecha de ingreso

### Calendario de Vacaciones
- Vista anual del calendario
- Registro de días de vacaciones
- Observaciones por día
- Vista multi-empleado con colores

### Configuración
- Gestión de días de vacaciones por año
- Ajuste manual de balances por empleado

### Cálculo de Días
El sistema calcula automáticamente los días de vacaciones según la fecha de ingreso:
- Si ingresa antes del año actual: días completos
- Si ingresa durante el año: cálculo proporcional por días trabajados
- Fórmula: `(días_anuales / días_del_año) * días_trabajados_en_el_año`

## Scripts Disponibles

- `npm run dev` - Ejecutar en modo desarrollo
- `npm run build` - Compilar para producción
- `npm start` - Ejecutar versión de producción
- `npm run lint` - Ejecutar linter

## Base de Datos

### Tablas Principales

1. **employees** - Información de empleados
2. **vacation_settings** - Configuración de días por año
3. **vacation_days** - Días de vacaciones registrados
4. **vacation_balance** - Balance anual por empleado

Ver `supabase/migrations/20260208000000_initial_schema.sql` para detalles completos del schema.

## Estado del Proyecto

✅ **Fase 1 completada**: Setup del proyecto
✅ **Fase 2 completada**: Configuración base de Supabase
✅ **Fase 3 completada**: Setup de UI base y autenticación

🔄 **En progreso**:
- Fase 4: Gestión completa de empleados
- Fase 5: Calendario de vacaciones
- Fase 6: Tabla resumen
- Fase 7: Panel de administración
- Fase 8: Refinamiento

## Próximos Pasos

1. Implementar CRUD completo de empleados
2. Desarrollar componente de calendario
3. Implementar tabla de resumen de vacaciones
4. Completar panel de administración
5. Añadir tests
6. Desplegar en Vercel

## Licencia

MIT
