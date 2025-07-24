-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  type VARCHAR(50) NOT NULL DEFAULT 'department',
  representative_id UUID REFERENCES employees(id),
  parent_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX IF NOT EXISTS idx_organizations_level ON organizations(level);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations table
-- Allow all authenticated users to read organizations
CREATE POLICY "Allow authenticated users to read organizations" ON organizations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert organizations
CREATE POLICY "Allow authenticated users to insert organizations" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update organizations
CREATE POLICY "Allow authenticated users to update organizations" ON organizations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete organizations
CREATE POLICY "Allow authenticated users to delete organizations" ON organizations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO organizations (name, level, type, parent_id) VALUES
  ('本社', 1, 'headquarters', NULL),
  ('営業部', 2, 'department', (SELECT id FROM organizations WHERE name = '本社')),
  ('開発部', 2, 'department', (SELECT id FROM organizations WHERE name = '本社')),
  ('人事部', 2, 'department', (SELECT id FROM organizations WHERE name = '本社')),
  ('営業1課', 3, 'section', (SELECT id FROM organizations WHERE name = '営業部')),
  ('営業2課', 3, 'section', (SELECT id FROM organizations WHERE name = '営業部')),
  ('フロントエンドチーム', 3, 'team', (SELECT id FROM organizations WHERE name = '開発部')),
  ('バックエンドチーム', 3, 'team', (SELECT id FROM organizations WHERE name = '開発部'))
ON CONFLICT DO NOTHING;

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id TEXT UNIQUE NOT NULL CHECK (employee_id ~ '^[0-9]{5}$'),
  last_name VARCHAR(100) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name_kana VARCHAR(100),
  first_name_kana VARCHAR(100),
  roman_name VARCHAR(200),
  gender VARCHAR(10),
  email VARCHAR(255),
  gmail VARCHAR(255),
  is_mail VARCHAR(255),
  common_password VARCHAR(255),
  phone VARCHAR(20),
  hire_date DATE,
  resign_date DATE,
  job_type VARCHAR(50),
  employment_type VARCHAR(50),
  status VARCHAR(20) DEFAULT 'active',
  remarks TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for employees table
CREATE INDEX IF NOT EXISTS idx_employees_employee_id ON employees(employee_id);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_hire_date ON employees(hire_date);

-- Enable Row Level Security (RLS)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- Create policies for employees table
CREATE POLICY "Allow authenticated users to read employees" ON employees
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert employees" ON employees
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update employees" ON employees
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete employees" ON employees
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Transfer History table
CREATE TABLE IF NOT EXISTS transfer_histories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  position VARCHAR(100),
  staff_rank VARCHAR(10),
  transfer_type VARCHAR(20) DEFAULT 'transfer',
  start_date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for transfer_histories table
CREATE INDEX IF NOT EXISTS idx_transfer_histories_employee_id ON transfer_histories(employee_id);
CREATE INDEX IF NOT EXISTS idx_transfer_histories_organization_id ON transfer_histories(organization_id);
CREATE INDEX IF NOT EXISTS idx_transfer_histories_start_date ON transfer_histories(start_date);

-- Enable Row Level Security (RLS)
ALTER TABLE transfer_histories ENABLE ROW LEVEL SECURITY;

-- Create policies for transfer_histories table
CREATE POLICY "Allow authenticated users to read transfer_histories" ON transfer_histories
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to insert transfer_histories" ON transfer_histories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update transfer_histories" ON transfer_histories
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to delete transfer_histories" ON transfer_histories
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_transfer_histories_updated_at
  BEFORE UPDATE ON transfer_histories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample employee data
INSERT INTO employees (employee_id, last_name, first_name, last_name_kana, first_name_kana, email, hire_date, job_type, employment_type, status) VALUES
  ('00001', '田中', '太郎', 'タナカ', 'タロウ', 'tanaka@example.com', '2020-04-01', '営業', '正社員', 'active'),
  ('00002', '佐藤', '花子', 'サトウ', 'ハナコ', 'sato@example.com', '2021-07-01', '開発', '正社員', 'active'),
  ('00003', '鈴木', '次郎', 'スズキ', 'ジロウ', 'suzuki@example.com', '2019-10-01', '営業', '正社員', 'active'),
  ('00004', '高橋', '美咲', 'タカハシ', 'ミサキ', 'takahashi@example.com', '2022-01-15', '開発', '契約社員', 'active'),
  ('00005', '伊藤', '健一', 'イトウ', 'ケンイチ', 'ito@example.com', '2018-03-01', '営業', '正社員', 'resigned'),
  ('14005', '和田', '紘俊', 'ワダ', 'ヒロトシ', 'wada@example.com', '2014-04-01', '営業', '正社員', 'active')
ON CONFLICT (employee_id) DO NOTHING;

-- Insert sample transfer history data
INSERT INTO transfer_histories (employee_id, organization_id, position, staff_rank, transfer_type, start_date) VALUES
  ((SELECT id FROM employees WHERE employee_id = '00001'), (SELECT id FROM organizations WHERE name = '営業1課'), '営業担当', 'C', 'hire', '2020-04-01'),
  ((SELECT id FROM employees WHERE employee_id = '00002'), (SELECT id FROM organizations WHERE name = 'フロントエンドチーム'), 'エンジニア', 'D', 'hire', '2021-07-01'),
  ((SELECT id FROM employees WHERE employee_id = '00003'), (SELECT id FROM organizations WHERE name = '営業2課'), '営業担当', 'C', 'hire', '2019-10-01'),
  ((SELECT id FROM employees WHERE employee_id = '00004'), (SELECT id FROM organizations WHERE name = 'バックエンドチーム'), 'エンジニア', 'E', 'hire', '2022-01-15'),
  ((SELECT id FROM employees WHERE employee_id = '00005'), (SELECT id FROM organizations WHERE name = '営業1課'), '営業担当', 'B', 'hire', '2018-03-01'),
  ((SELECT id FROM employees WHERE employee_id = '14005'), (SELECT id FROM organizations WHERE name = '営業部'), '室長', 'A', 'hire', '2014-04-01')
ON CONFLICT DO NOTHING; 