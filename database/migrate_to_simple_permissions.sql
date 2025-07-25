-- 権限管理システムをauth.usersに依存しない形に移行

-- 1. 新しいemployee_rolesテーブルを作成
CREATE TABLE IF NOT EXISTS employee_roles (
  employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by VARCHAR(100), -- 割り当てた人の名前やID
  PRIMARY KEY (employee_id, role_id)
);

-- 2. 既存のuser_rolesデータをemployee_rolesに移行（可能な場合）
-- 注意: この部分は、gmail_user_mappingが正しく設定されている場合のみ実行
INSERT INTO employee_roles (employee_id, role_id, assigned_at, assigned_by)
SELECT 
  gm.employee_id,
  ur.role_id,
  NOW(),
  'システム移行'
FROM user_roles ur
JOIN gmail_user_mapping gm ON ur.user_id = gm.user_id
WHERE gm.employee_id IS NOT NULL
ON CONFLICT (employee_id, role_id) DO NOTHING;

-- 3. 社員権限表示用ビューを作成
CREATE OR REPLACE VIEW employee_permissions AS
SELECT 
  er.employee_id,
  e.last_name,
  e.first_name,
  e.gmail,
  r.name as role_name,
  r.display_name as role_display_name,
  a.name as application_name,
  a.display_name as application_display_name,
  p.resource,
  p.action,
  p.display_name as permission_display_name
FROM employee_roles er
JOIN employees e ON er.employee_id = e.employee_id
JOIN roles r ON er.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
JOIN applications a ON p.application_id = a.id
WHERE r.is_active = true AND a.is_active = true;

-- 4. インデックスの作成
CREATE INDEX IF NOT EXISTS idx_employee_roles_employee_id ON employee_roles(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_roles_role_id ON employee_roles(role_id);

-- 5. 移行結果の確認
SELECT 
  'employee_roles' as table_name,
  COUNT(*) as record_count
FROM employee_roles
UNION ALL
SELECT 
  'user_roles' as table_name,
  COUNT(*) as record_count
FROM user_roles;

-- 6. 社員別権限確認
SELECT 
  e.employee_id,
  e.last_name,
  e.first_name,
  e.gmail,
  COUNT(er.role_id) as role_count,
  array_agg(r.display_name) as roles
FROM employees e
LEFT JOIN employee_roles er ON e.employee_id = er.employee_id
LEFT JOIN roles r ON er.role_id = r.id
WHERE e.gmail IS NOT NULL 
  AND e.gmail != '' 
  AND e.gmail != 'EMPTY' 
  AND e.gmail != 'NULL'
GROUP BY e.employee_id, e.last_name, e.first_name, e.gmail
ORDER BY e.last_name, e.first_name; 