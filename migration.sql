-- ====================================================================
-- SCRIPT DE MIGRACIÓN: TARIFAS DINÁMICAS (CASA D'ORO)
-- ====================================================================
-- Instrucciones:
-- 1. Copia todo el contenido de este archivo.
-- 2. Ve a tu panel de Supabase -> SQL Editor.
-- 3. Crea una consulta nueva (New query), pega este código y haz clic en "Run".
-- ====================================================================

-- 1. Crear tabla de tarifas de temporada
CREATE TABLE IF NOT EXISTS public.tarifas_temporada (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suite_id UUID REFERENCES public.suites(id) ON DELETE CASCADE NOT NULL,
  nombre VARCHAR(100) NOT NULL, -- Ej: "Semana Santa", "Fin de Semana Verano"
  
  -- Fechas límites (Si son NULL, la regla aplica todo el año basándose en días de semana)
  fecha_inicio DATE,
  fecha_fin DATE,
  
  -- Días de la semana que aplica (0 = Domingo, 6 = Sábado)
  dias_semana INT[] DEFAULT '{0,1,2,3,4,5,6}' NOT NULL,
  
  -- Tipo de ajuste
  tipo_ajuste VARCHAR(20) CHECK (tipo_ajuste IN ('tarifa_fija', 'porcentaje_incremento', 'monto_incremento')) NOT NULL,
  valor NUMERIC(10, 2) NOT NULL,
  
  -- Prioridad (Reglas de mayor número ganan ante colisiones de fechas)
  prioridad INT DEFAULT 1 NOT NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Habilitar RLS (Row Level Security)
ALTER TABLE public.tarifas_temporada ENABLE ROW LEVEL SECURITY;

-- 3. Crear políticas para lectura pública y escritura/gestión
-- Nota: Para simplificar la conexión del admin en el frontend, habilitamos permisos completos
CREATE POLICY "Permitir lectura pública de tarifas"
ON public.tarifas_temporada FOR SELECT
USING (true);

CREATE POLICY "Permitir gestión total a administradores"
ON public.tarifas_temporada FOR ALL
USING (true)
WITH CHECK (true);
