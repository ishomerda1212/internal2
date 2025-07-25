-- シンプルな権限管理システム（auth.usersに依存しない）

-- アプリケーション定義テーブル
CREATE TABLE IF NOT EXISTS applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 権限定義テーブル
CREATE TABLE IF NOT EXISTS permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL,
  action VARCHAR(50) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, resource, action)
);

-- ロール定義テーブル
CREATE TABLE IF NOT EXISTS roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ロール権限関連テーブル
CREATE TABLE IF NOT EXISTS role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- 社員ロール関連テーブル（auth.usersに依存しない）
CREATE TABLE IF NOT EXISTS employee_roles (
  employee_id VARCHAR(50) REFERENCES employees(employee_id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by VARCHAR(100), -- 割り当てた人の名前やID
  PRIMARY KEY (employee_id, role_id)
);

-- 初期データの挿入（既存のデータがある場合はスキップ）
INSERT INTO applications (name, display_name, description) VALUES
('internal', '組織管理システム', '社員・組織管理システム'),
('reservation', '予約管理システム', 'イベント・予定管理システム')
ON CONFLICT (name) DO NOTHING;

-- 組織管理システムの権限
INSERT INTO permissions (application_id, resource, action, display_name) 
SELECT 
  a.id,
  'employees',
  action,
  '社員管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'internal'
ON CONFLICT (application_id, resource, action) DO NOTHING;

INSERT INTO permissions (application_id, resource, action, display_name)
SELECT 
  a.id,
  'organizations',
  action,
  '組織管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'internal'
ON CONFLICT (application_id, resource, action) DO NOTHING;

-- 予約管理システムの権限
INSERT INTO permissions (application_id, resource, action, display_name) 
SELECT 
  a.id,
  'reservations',
  action,
  '予約管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'reservation'
ON CONFLICT (application_id, resource, action) DO NOTHING;

-- ロールの作成
INSERT INTO roles (name, display_name, description) VALUES
('super_admin', 'スーパー管理者', '全システムの管理者権限'),
('hr_admin', '人事管理者', '人事関連の管理権限'),
('hr_user', '人事ユーザー', '人事関連の閲覧・編集権限'),
('manager', 'マネージャー', '部下の管理権限'),
('employee', '一般社員', '基本的な閲覧権限'),
('reservation_admin', '予約管理管理者', '予約管理システムの全権限'),
('reservation_user', '予約管理ユーザー', '予約の作成・閲覧・編集権限')
ON CONFLICT (name) DO NOTHING;

-- ロールに権限を割り当て
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'super_admin' 
  AND p.application_id = a.id
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 人事管理者の権限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'hr_admin' 
  AND p.application_id = a.id
  AND a.name = 'internal'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 社員権限表示用ビュー
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

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_employee_roles_employee_id ON employee_roles(employee_id);
CREATE INDEX IF NOT EXISTS idx_employee_roles_role_id ON employee_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_permissions_application_id ON permissions(application_id); 