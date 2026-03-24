-- ==========================================
-- MULTI-TENANCY: companies + user_profiles
-- ==========================================

-- 1. Create companies table
CREATE TABLE companies (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- 2. Create user_profiles table (links auth.uid → company_id)
CREATE TABLE user_profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- 3. Helper function — returns the company_id for the current request's user.
--    SECURITY DEFINER allows it to read user_profiles bypassing RLS.
--    STABLE tells the planner to cache the result within a single query.
CREATE OR REPLACE FUNCTION get_user_company_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id FROM user_profiles WHERE id = auth.uid() LIMIT 1;
$$;

-- 4. RLS policies for new tables
CREATE POLICY "users_see_own_company"
  ON companies FOR SELECT
  USING (id = get_user_company_id());

CREATE POLICY "users_read_own_profile"
  ON user_profiles FOR SELECT
  USING (id = auth.uid());

-- 5. Add company_id columns (nullable first so we can back-fill data)
ALTER TABLE employees         ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE vacation_settings ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE holidays           ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;
ALTER TABLE comments           ADD COLUMN company_id UUID REFERENCES companies(id) ON DELETE CASCADE;

-- 6. Insert the two tenant companies with deterministic UUIDs
INSERT INTO companies (id, name) VALUES
  ('00000000-0000-0000-0000-000000000001', 'fpmsystems'),
  ('00000000-0000-0000-0000-000000000002', 'progesnor');

-- 7. Assign all existing data to fpmsystems
UPDATE employees         SET company_id = '00000000-0000-0000-0000-000000000001';
UPDATE vacation_settings SET company_id = '00000000-0000-0000-0000-000000000001';
UPDATE holidays           SET company_id = '00000000-0000-0000-0000-000000000001';
UPDATE comments           SET company_id = '00000000-0000-0000-0000-000000000001';

-- 8. Make company_id NOT NULL after back-fill
ALTER TABLE employees         ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE vacation_settings ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE holidays           ALTER COLUMN company_id SET NOT NULL;
ALTER TABLE comments           ALTER COLUMN company_id SET NOT NULL;

-- 9. Fix employees.email uniqueness: unique per company, not globally
ALTER TABLE employees DROP CONSTRAINT IF EXISTS employees_email_key;
ALTER TABLE employees ADD CONSTRAINT employees_company_email_key UNIQUE (company_id, email);

-- 10. Fix vacation_settings UNIQUE constraint (year → company_id + year)
ALTER TABLE vacation_settings DROP CONSTRAINT vacation_settings_year_key;
ALTER TABLE vacation_settings ADD CONSTRAINT vacation_settings_company_year_key UNIQUE (company_id, year);

-- 11. Fix holidays UNIQUE index (date → company_id + date)
DROP INDEX holidays_date_idx;
CREATE UNIQUE INDEX holidays_company_date_idx ON holidays (company_id, date);

-- 12. Drop old permissive RLS policies
DROP POLICY "Enable all operations for authenticated users" ON employees;
DROP POLICY "Enable all operations for authenticated users" ON vacation_settings;
DROP POLICY "Enable all operations for authenticated users" ON vacation_days;
DROP POLICY "Enable all operations for authenticated users" ON vacation_balance;
DROP POLICY "Authenticated users can read holidays"  ON holidays;
DROP POLICY "Authenticated users can manage holidays" ON holidays;
-- comments: name unknown (table was created outside migrations), drop by common names
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON comments;
DROP POLICY IF EXISTS "Authenticated users can manage comments"       ON comments;

-- 13. New company-scoped RLS policies

CREATE POLICY "company_isolation_employees"
  ON employees FOR ALL
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "company_isolation_vacation_settings"
  ON vacation_settings FOR ALL
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "company_isolation_holidays"
  ON holidays FOR ALL
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

CREATE POLICY "company_isolation_comments"
  ON comments FOR ALL
  USING (company_id = get_user_company_id())
  WITH CHECK (company_id = get_user_company_id());

-- vacation_days and vacation_balance have no company_id column directly;
-- isolation is enforced via the employees join.
CREATE POLICY "company_isolation_vacation_days"
  ON vacation_days FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = vacation_days.employee_id
        AND e.company_id = get_user_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = vacation_days.employee_id
        AND e.company_id = get_user_company_id()
    )
  );

CREATE POLICY "company_isolation_vacation_balance"
  ON vacation_balance FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = vacation_balance.employee_id
        AND e.company_id = get_user_company_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = vacation_balance.employee_id
        AND e.company_id = get_user_company_id()
    )
  );

-- 14. Performance indexes
CREATE INDEX idx_employees_company_id         ON employees(company_id);
CREATE INDEX idx_vacation_settings_company_id ON vacation_settings(company_id);
CREATE INDEX idx_holidays_company_id          ON holidays(company_id);
CREATE INDEX idx_comments_company_id          ON comments(company_id);
