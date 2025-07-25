-- 権限管理システムのスキーマ

-- アプリケーション定義テーブル
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 権限定義テーブル
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  resource VARCHAR(100) NOT NULL, -- 'employees', 'organizations', etc.
  action VARCHAR(50) NOT NULL,    -- 'create', 'read', 'update', 'delete'
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, name)
);

-- ロール定義テーブル
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT false, -- システムロール（削除不可）
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ロール権限関連テーブル
CREATE TABLE role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),
  UNIQUE(role_id, permission_id)
);

-- ユーザーロール関連テーブル
CREATE TABLE user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  assigned_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMP WITH TIME ZONE, -- 権限の有効期限
  UNIQUE(user_id, role_id)
);

-- 従業員テーブルに権限関連カラムを追加
ALTER TABLE employees ADD COLUMN IF NOT EXISTS access_level VARCHAR(50) DEFAULT 'employee';
ALTER TABLE employees ADD COLUMN IF NOT EXISTS custom_permissions JSONB DEFAULT '{}';

-- 初期データの挿入
INSERT INTO applications (name, display_name, description) VALUES
('internal', '組織管理システム', '社員・組織管理システム'),
('event', 'イベント管理システム', 'イベント・予定管理システム'),
('hr', '人事管理システム', '人事・給与管理システム'),
('sales', '営業管理システム', '営業・顧客管理システム');

-- 基本権限の定義
INSERT INTO permissions (application_id, name, display_name, resource, action) 
SELECT 
  a.id,
  'employees_' || action,
  '社員管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END,
  'employees',
  action
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'internal';

-- 組織管理権限
INSERT INTO permissions (application_id, name, display_name, resource, action)
SELECT 
  a.id,
  'organizations_' || action,
  '組織管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END,
  'organizations',
  action
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'internal';

-- 基本ロールの作成
INSERT INTO roles (name, display_name, description, is_system_role) VALUES
('super_admin', 'スーパー管理者', '全権限を持つシステム管理者', true),
('hr_admin', '人事管理者', '人事関連の全権限', false),
('hr_user', '人事担当者', '人事データの閲覧・編集権限', false),
('manager', 'マネージャー', '部下の情報閲覧権限', false),
('employee', '一般社員', '自分の情報のみ閲覧', false);

-- スーパー管理者に全権限を付与
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin';

-- 人事管理者の権限
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'hr_admin' 
  AND p.application_id = (SELECT id FROM applications WHERE name = 'internal')
  AND p.resource IN ('employees', 'organizations');

-- マネージャーの権限（閲覧のみ）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager' 
  AND p.application_id = (SELECT id FROM applications WHERE name = 'internal')
  AND p.resource IN ('employees', 'organizations')
  AND p.action = 'read';

-- 一般社員の権限（自分の情報のみ）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'employee' 
  AND p.application_id = (SELECT id FROM applications WHERE name = 'internal')
  AND p.resource = 'employees'
  AND p.action = 'read';

-- ビューの作成（権限チェック用）
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
  ur.user_id,
  r.name as role_name,
  p.name as permission_name,
  p.resource,
  p.action,
  a.name as application_name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
JOIN applications a ON p.application_id = a.id
WHERE (ur.expires_at IS NULL OR ur.expires_at > NOW())
  AND r.is_active = true
  AND p.is_active = true
  AND a.is_active = true;

-- 関数：ユーザーの権限チェック
CREATE OR REPLACE FUNCTION check_user_permission(
  p_user_id UUID,
  p_application VARCHAR(100),
  p_resource VARCHAR(100),
  p_action VARCHAR(50)
) RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM user_permissions
    WHERE user_id = p_user_id
      AND application_name = p_application
      AND resource = p_resource
      AND action = p_action
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 関数：ユーザーのロール取得
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE(role_name VARCHAR(100)) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT r.name
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND (ur.expires_at IS NULL OR ur.expires_at > NOW())
    AND r.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 