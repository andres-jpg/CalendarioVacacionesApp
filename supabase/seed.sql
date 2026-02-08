-- Seed data for testing

-- Insert default vacation settings for current year
INSERT INTO vacation_settings (year, default_days) VALUES
  (2026, 22),
  (2025, 22);

-- Insert sample employees (optional - for testing)
-- Uncomment if you want sample data
/*
INSERT INTO employees (full_name, email, hire_date, is_active) VALUES
  ('Juan Pérez', 'juan.perez@example.com', '2020-01-15', true),
  ('María García', 'maria.garcia@example.com', '2021-06-01', true),
  ('Carlos López', 'carlos.lopez@example.com', '2022-03-10', true);
*/
