-- ====================================================================
-- SCRIPT DE MIGRACIÓN: FORTALECIMIENTO DE SEGURIDAD (RLS)
-- ====================================================================

-- 1. Habilitar RLS en todas las tablas críticas si no está habilitado ya
ALTER TABLE public.suites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reservaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.disponibilidad_bloqueada ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tarifas_temporada ENABLE ROW LEVEL SECURITY;

-- 2. Limpiar políticas existentes para evitar duplicados o colisiones
DROP POLICY IF EXISTS "Permitir lectura pública de suites" ON public.suites;
DROP POLICY IF EXISTS "Permitir gestión de suites a administradores" ON public.suites;
DROP POLICY IF EXISTS "Permitir lectura de reservaciones" ON public.reservaciones;
DROP POLICY IF EXISTS "Permitir inserción de reservaciones" ON public.reservaciones;
DROP POLICY IF EXISTS "Permitir eliminación de reservaciones pendientes" ON public.reservaciones;
DROP POLICY IF EXISTS "Permitir lectura de disponibilidad" ON public.disponibilidad_bloqueada;
DROP POLICY IF EXISTS "Permitir lectura pública de tarifas" ON public.tarifas_temporada;
DROP POLICY IF EXISTS "Permitir gestión total a administradores" ON public.tarifas_temporada;

-- 3. Crear políticas para SUITES
CREATE POLICY "Permitir lectura pública de suites"
ON public.suites FOR SELECT
USING (true);

-- 4. Crear políticas para RESERVACIONES
CREATE POLICY "Permitir lectura de reservaciones"
ON public.reservaciones FOR SELECT
USING (true);

CREATE POLICY "Permitir inserción de reservaciones"
ON public.reservaciones FOR INSERT
WITH CHECK (true);

CREATE POLICY "Permitir eliminación de reservaciones pendientes"
ON public.reservaciones FOR DELETE
USING (estado = 'pendiente');

-- 5. Crear políticas para DISPONIBILIDAD_BLOQUEADA
CREATE POLICY "Permitir lectura de disponibilidad"
ON public.disponibilidad_bloqueada FOR SELECT
USING (true);

-- 6. Crear políticas para TARIFAS_TEMPORADA
CREATE POLICY "Permitir lectura pública de tarifas"
ON public.tarifas_temporada FOR SELECT
USING (true);

-- Nota: No se definen políticas de inserción, actualización o eliminación para el rol público (anon)
-- en admin_users, disponibilidad_bloqueada, suites o tarifas_temporada.
-- Todas las operaciones de modificación de estas tablas se canalizan de forma segura a través del servidor
-- (API routes) utilizando la Service Role Key, la cual elude automáticamente las restricciones RLS.
