-- シンプルな権限管理システムのスキーマ

-- アプリケーション定義テーブル
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 権限定義テーブル
CREATE TABLE permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
  resource VARCHAR(100) NOT NULL, -- 'employees', 'organizations', 'transfers', etc.
  action VARCHAR(50) NOT NULL,    -- 'create', 'read', 'update', 'delete'
  display_name VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(application_id, resource, action)
);

-- ロール定義テーブル
CREATE TABLE roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL UNIQUE,
  display_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ロール権限関連テーブル
CREATE TABLE role_permissions (
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- ユーザーロール関連テーブル
CREATE TABLE user_roles (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
  PRIMARY KEY (user_id, role_id)
);

-- 初期データの挿入

-- アプリケーションの作成
INSERT INTO applications (name, display_name, description) VALUES
('internal', '組織管理システム', '社員・組織管理システム'),
('event', 'イベント管理システム', 'イベント・予定管理システム'),
('hr', '人事管理システム', '人事・給与管理システム'),
('sales', '営業管理システム', '営業・顧客管理システム');

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
WHERE a.name = 'internal';

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
WHERE a.name = 'internal';

INSERT INTO permissions (application_id, resource, action, display_name)
SELECT 
  a.id,
  'transfers',
  action,
  '異動管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'internal';

INSERT INTO permissions (application_id, resource, action, display_name)
SELECT 
  a.id,
  'company_cars',
  action,
  '社用車管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'internal';

INSERT INTO permissions (application_id, resource, action, display_name)
SELECT 
  a.id,
  'staff_rank_master',
  action,
  'スタッフランクマスター - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'internal';

-- 基本ロールの作成
INSERT INTO roles (name, display_name, description) VALUES
('super_admin', 'スーパー管理者', '全権限を持つシステム管理者'),
('hr_admin', '人事管理者', '人事関連の全権限'),
('hr_user', '人事担当者', '人事データの閲覧・編集権限'),
('manager', 'マネージャー', '部下の情報閲覧権限'),
('employee', '一般社員', '自分の情報のみ閲覧');

-- スーパー管理者に全権限を付与
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'super_admin';

-- 人事管理者の権限（組織管理システムの全権限）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'hr_admin' 
  AND p.application_id = (SELECT id FROM applications WHERE name = 'internal');

-- 人事担当者の権限（閲覧・編集のみ、削除は不可）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'hr_user' 
  AND p.application_id = (SELECT id FROM applications WHERE name = 'internal')
  AND p.action IN ('read', 'update', 'create');

-- マネージャーの権限（閲覧のみ）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'manager' 
  AND p.application_id = (SELECT id FROM applications WHERE name = 'internal')
  AND p.action = 'read';

-- 一般社員の権限（自分の情報のみ閲覧）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p
WHERE r.name = 'employee' 
  AND p.application_id = (SELECT id FROM applications WHERE name = 'internal')
  AND p.resource = 'employees'
  AND p.action = 'read';

-- 権限チェック用のビュー
CREATE OR REPLACE VIEW user_permissions AS
SELECT 
  ur.user_id,
  r.name as role_name,
  p.resource,
  p.action,
  a.name as application_name
FROM user_roles ur
JOIN roles r ON ur.role_id = r.id
JOIN role_permissions rp ON r.id = rp.role_id
JOIN permissions p ON rp.permission_id = p.id
JOIN applications a ON p.application_id = a.id
WHERE r.is_active = true
  AND a.is_active = true;

-- 権限チェック関数
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

-- ユーザーのロール取得関数
CREATE OR REPLACE FUNCTION get_user_roles(p_user_id UUID)
RETURNS TABLE(role_name VARCHAR(100)) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT r.name
  FROM user_roles ur
  JOIN roles r ON ur.role_id = r.id
  WHERE ur.user_id = p_user_id
    AND r.is_active = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_permissions_application_id ON permissions(application_id); 