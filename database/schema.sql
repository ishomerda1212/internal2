-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  type VARCHAR(50) NOT NULL DEFAULT 'department',
  representative_id UUID REFERENCES employees(id),
  parent_id UUID REFERENCES organizations(id),
  -- 履歴管理用カラム
  effective_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  is_current BOOLEAN DEFAULT true,
  -- 履歴追跡用カラム
  original_id UUID, -- 元の組織ID（名前変更前のID）
  previous_name TEXT, -- 変更前の名前
  change_type TEXT, -- 変更タイプ: 'name_change', 'parent_change', 'both'
  change_date DATE, -- 変更日
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX IF NOT EXISTS idx_organizations_level ON organizations(level);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);
CREATE INDEX IF NOT EXISTS idx_organizations_effective_date ON organizations(effective_date);
CREATE INDEX IF NOT EXISTS idx_organizations_is_current ON organizations(is_current);

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

-- Function to manage organization history (改善版)
CREATE OR REPLACE FUNCTION update_organization_history()
RETURNS TRIGGER AS $$
DECLARE
  change_type_val TEXT := 'name_change';
BEGIN
  -- When updating an organization, create a history record
  IF TG_OP = 'UPDATE' THEN
    -- 変更タイプを判定
    IF OLD.name != NEW.name AND OLD.parent_id != NEW.parent_id THEN
      change_type_val := 'both';
    ELSIF OLD.name != NEW.name THEN
      change_type_val := 'name_change';
    ELSIF OLD.parent_id != NEW.parent_id THEN
      change_type_val := 'parent_change';
    END IF;
    
    -- Set end_date for the old record
    UPDATE organizations 
    SET end_date = CURRENT_DATE, is_current = false
    WHERE id = NEW.id AND is_current = true;
    
    -- Insert new record with history tracking
    INSERT INTO organizations (
      id, name, level, type, representative_id, parent_id,
      effective_date, end_date, is_current,
      original_id, previous_name, change_type, change_date,
      created_at, updated_at
    ) VALUES (
      gen_random_uuid(), NEW.name, NEW.level, NEW.type, NEW.representative_id, NEW.parent_id,
      CURRENT_DATE, NULL, true,
      OLD.id, OLD.name, change_type_val, CURRENT_DATE,
      NOW(), NOW()
    );
    
    RETURN NEW;
  END IF;
  
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for organization history management
CREATE TRIGGER update_organization_history_trigger
  AFTER UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_organization_history();

-- Insert sample data
INSERT INTO organizations (name, level, type, parent_id, effective_date, is_current) VALUES
  ('営業部', 1, 'department', NULL, '2020-01-01', true),
  ('開発部', 1, 'department', NULL, '2020-01-01', true),
  ('人事部', 1, 'department', NULL, '2020-01-01', true),
  ('営業チーム', 2, 'team', (SELECT id FROM organizations WHERE name = '営業部'), '2020-01-01', true),
  ('開発チーム', 2, 'team', (SELECT id FROM organizations WHERE name = '開発部'), '2020-01-01', true),
  ('営業1課', 3, 'section', (SELECT id FROM organizations WHERE name = '営業チーム'), '2020-01-01', true),
  ('営業2課', 3, 'section', (SELECT id FROM organizations WHERE name = '営業チーム'), '2020-01-01', true),
  ('フロントエンド課', 3, 'section', (SELECT id FROM organizations WHERE name = '開発チーム'), '2020-01-01', true),
  ('バックエンド課', 3, 'section', (SELECT id FROM organizations WHERE name = '開発チーム'), '2020-01-01', true),
  ('特別プロジェクト推進室', 3, 'room', (SELECT id FROM organizations WHERE name = '営業チーム'), '2020-01-01', true)
ON CONFLICT DO NOTHING;

-- Insert past organization history with improved tracking
-- マンション → 水まわり
INSERT INTO organizations (name, level, type, parent_id, effective_date, end_date, is_current, change_type, change_date) VALUES
  ('マンション', 3, 'section', (SELECT id FROM organizations WHERE name = '営業チーム'), '2020-01-01', '2023-12-31', false, 'name_change', '2023-12-31')
ON CONFLICT DO NOTHING;

INSERT INTO organizations (name, level, type, parent_id, effective_date, is_current, original_id, previous_name, change_type, change_date) VALUES
  ('水まわり', 3, 'section', (SELECT id FROM organizations WHERE name = '営業チーム'), '2024-01-01', true, 
   (SELECT id FROM organizations WHERE name = 'マンション' AND is_current = false), 'マンション', 'name_change', '2023-12-31')
ON CONFLICT DO NOTHING;

-- 不動産販売 → 不動産
INSERT INTO organizations (name, level, type, parent_id, effective_date, end_date, is_current, change_type, change_date) VALUES
  ('不動産販売', 3, 'section', (SELECT id FROM organizations WHERE name = '営業チーム'), '2020-01-01', '2023-12-31', false, 'name_change', '2023-12-31')
ON CONFLICT DO NOTHING;

INSERT INTO organizations (name, level, type, parent_id, effective_date, is_current, original_id, previous_name, change_type, change_date) VALUES
  ('不動産', 3, 'section', (SELECT id FROM organizations WHERE name = '営業チーム'), '2024-01-01', true,
   (SELECT id FROM organizations WHERE name = '不動産販売' AND is_current = false), '不動産販売', 'name_change', '2023-12-31')
ON CONFLICT DO NOTHING;

-- 営業設計 → リノベーション
INSERT INTO organizations (name, level, type, parent_id, effective_date, end_date, is_current, change_type, change_date) VALUES
  ('営業設計', 3, 'section', (SELECT id FROM organizations WHERE name = '営業チーム'), '2020-01-01', '2023-12-31', false, 'name_change', '2023-12-31')
ON CONFLICT DO NOTHING;

INSERT INTO organizations (name, level, type, parent_id, effective_date, is_current, original_id, previous_name, change_type, change_date) VALUES
  ('リノベーション', 3, 'section', (SELECT id FROM organizations WHERE name = '営業チーム'), '2024-01-01', true,
   (SELECT id FROM organizations WHERE name = '営業設計' AND is_current = false), '営業設計', 'name_change', '2023-12-31')
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
  -- 組織情報のスナップショット（異動時の組織状態を保存）
  organization_snapshot JSONB,
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
INSERT INTO transfer_histories (employee_id, organization_id, position, staff_rank_master_id, transfer_type, start_date) VALUES
  ((SELECT id FROM employees WHERE employee_id = '00001'), (SELECT id FROM organizations WHERE name = '営業1課'), '営業担当', (SELECT id FROM staff_rank_master WHERE organization_id = (SELECT id FROM organizations WHERE name = '営業1課') AND staff_rank = 'C' AND is_current = true LIMIT 1), 'hire', '2020-04-01'),
  ((SELECT id FROM employees WHERE employee_id = '00002'), (SELECT id FROM organizations WHERE name = 'フロントエンドチーム'), 'エンジニア', (SELECT id FROM staff_rank_master WHERE organization_id = (SELECT id FROM organizations WHERE name = 'フロントエンドチーム') AND staff_rank = 'D' AND is_current = true LIMIT 1), 'hire', '2021-07-01'),
  ((SELECT id FROM employees WHERE employee_id = '00003'), (SELECT id FROM organizations WHERE name = '営業2課'), '営業担当', (SELECT id FROM staff_rank_master WHERE organization_id = (SELECT id FROM organizations WHERE name = '営業2課') AND staff_rank = 'C' AND is_current = true LIMIT 1), 'hire', '2019-10-01'),
  ((SELECT id FROM employees WHERE employee_id = '00004'), (SELECT id FROM organizations WHERE name = 'バックエンドチーム'), 'エンジニア', (SELECT id FROM staff_rank_master WHERE organization_id = (SELECT id FROM organizations WHERE name = 'バックエンドチーム') AND staff_rank = 'E' AND is_current = true LIMIT 1), 'hire', '2022-01-15'),
  ((SELECT id FROM employees WHERE employee_id = '00005'), (SELECT id FROM organizations WHERE name = '営業1課'), '営業担当', (SELECT id FROM staff_rank_master WHERE organization_id = (SELECT id FROM organizations WHERE name = '営業1課') AND staff_rank = 'B' AND is_current = true LIMIT 1), 'hire', '2018-03-01'),
  ((SELECT id FROM employees WHERE employee_id = '14005'), (SELECT id FROM organizations WHERE name = '特別プロジェクト推進室'), '室長', (SELECT id FROM staff_rank_master WHERE organization_id = (SELECT id FROM organizations WHERE name = '特別プロジェクト推進室') AND staff_rank = 'A' AND is_current = true LIMIT 1), 'hire', '2014-04-01')
ON CONFLICT DO NOTHING;

-- Create view for employees with current assignment
CREATE OR REPLACE VIEW employees_with_current_assignment AS
SELECT 
  e.id,
  e.employee_id,
  e.last_name,
  e.first_name,
  e.last_name_kana,
  e.first_name_kana,
  e.roman_name,
  e.gender,
  e.gmail,
  e.is_mail,
  e.common_password,
  e.phone,
  e.hire_date,
  e.resign_date,
  e.job_type,
  e.employment_type,
  e.status,
  e.created_at,
  e.updated_at,
  th.id as current_assignment_id,
  th.position as current_position,
  srm.staff_rank as current_staff_rank,
  th.start_date as current_assignment_start_date,
  o.id as current_organization_id,
  o.name as current_organization_name,
  o.level as current_organization_level,
  o.type as current_organization_type
FROM employees e
LEFT JOIN LATERAL (
  SELECT *
  FROM transfer_histories th2
  WHERE th2.employee_id = e.id
  ORDER BY th2.start_date DESC
  LIMIT 1
) th ON true
LEFT JOIN organizations o ON th.organization_id = o.id
LEFT JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id;

-- Enable RLS for the view
ALTER VIEW employees_with_current_assignment ENABLE ROW LEVEL SECURITY;

-- Create policies for the view
CREATE POLICY "Allow authenticated users to read employees_with_current_assignment" ON employees_with_current_assignment
  FOR SELECT USING (auth.role() = 'authenticated'); 