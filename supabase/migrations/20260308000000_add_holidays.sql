CREATE TABLE holidays (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date       DATE NOT NULL,
  name       TEXT NOT NULL,
  type       TEXT NOT NULL CHECK (type IN ('nacional', 'autonomico', 'local')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX holidays_date_idx ON holidays (date);
CREATE INDEX holidays_year_idx ON holidays (EXTRACT(YEAR FROM date));

ALTER TABLE holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated users can read holidays"
  ON holidays FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can manage holidays"
  ON holidays FOR ALL TO authenticated USING (true);

CREATE TRIGGER set_holidays_updated_at
  BEFORE UPDATE ON holidays
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed 2026 holidays
INSERT INTO holidays (date, name, type) VALUES
  -- Nacionales
  ('2026-01-01', 'Año Nuevo',                        'nacional'),
  ('2026-01-06', 'Epifanía del Señor',               'nacional'),
  ('2026-04-03', 'Viernes Santo',                    'nacional'),
  ('2026-05-01', 'Día del Trabajo',                  'nacional'),
  ('2026-08-15', 'Asunción de la Virgen',            'nacional'),
  ('2026-10-12', 'Día de la Hispanidad',             'nacional'),
  ('2026-12-08', 'Inmaculada Concepción',            'nacional'),
  ('2026-12-25', 'Navidad',                          'nacional'),
  -- Autonómicos
  ('2026-04-02', 'Jueves Santo',                     'autonomico'),
  ('2026-06-09', 'Día de la Comunidad',              'autonomico'),
  ('2026-12-07', 'Puente Inmaculada',                'autonomico'),
  -- Locales
  ('2026-03-27', 'Viernes de Dolores',               'local'),
  ('2026-09-25', 'Cartagineses y Romanos',           'local');
