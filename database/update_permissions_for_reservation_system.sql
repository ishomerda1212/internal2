-- 予約管理システムの権限を追加

-- 予約管理システムのアプリケーションが存在しない場合は作成
INSERT INTO applications (name, display_name, description) 
VALUES ('reservation', '予約管理システム', 'イベント・予定管理システム')
ON CONFLICT (name) DO NOTHING;

-- 予約管理システムの権限を追加
-- 予約管理
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

-- イベント管理
INSERT INTO permissions (application_id, resource, action, display_name)
SELECT 
  a.id,
  'events',
  action,
  'イベント管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'reservation'
ON CONFLICT (application_id, resource, action) DO NOTHING;

-- 施設管理
INSERT INTO permissions (application_id, resource, action, display_name)
SELECT 
  a.id,
  'facilities',
  action,
  '施設管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'reservation'
ON CONFLICT (application_id, resource, action) DO NOTHING;

-- ユーザー管理（予約システム内）
INSERT INTO permissions (application_id, resource, action, display_name)
SELECT 
  a.id,
  'users',
  action,
  'ユーザー管理 - ' || CASE action 
    WHEN 'create' THEN '作成'
    WHEN 'read' THEN '閲覧'
    WHEN 'update' THEN '編集'
    WHEN 'delete' THEN '削除'
  END
FROM applications a, (VALUES ('create'), ('read'), ('update'), ('delete')) AS actions(action)
WHERE a.name = 'reservation'
ON CONFLICT (application_id, resource, action) DO NOTHING;

-- 既存のロールに予約管理システムの権限を追加

-- スーパー管理者に予約管理システムの全権限を付与
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'super_admin' 
  AND p.application_id = a.id
  AND a.name = 'reservation'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 人事管理者に予約管理システムの閲覧・編集権限を付与
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'hr_admin' 
  AND p.application_id = a.id
  AND a.name = 'reservation'
  AND p.action IN ('read', 'update', 'create')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- マネージャーに予約管理システムの閲覧権限を付与
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'manager' 
  AND p.application_id = a.id
  AND a.name = 'reservation'
  AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 一般社員に予約管理システムの閲覧権限を付与（自分の予約のみ）
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'employee' 
  AND p.application_id = a.id
  AND a.name = 'reservation'
  AND p.resource = 'reservations'
  AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 予約管理専用ロールを作成
INSERT INTO roles (name, display_name, description) VALUES
('reservation_admin', '予約管理管理者', '予約管理システムの全権限'),
('reservation_user', '予約管理ユーザー', '予約の作成・閲覧・編集権限'),
('reservation_viewer', '予約管理閲覧者', '予約の閲覧のみ')
ON CONFLICT (name) DO NOTHING;

-- 予約管理管理者に全権限を付与
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'reservation_admin' 
  AND p.application_id = a.id
  AND a.name = 'reservation'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 予約管理ユーザーに作成・閲覧・編集権限を付与
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'reservation_user' 
  AND p.application_id = a.id
  AND a.name = 'reservation'
  AND p.action IN ('create', 'read', 'update')
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 予約管理閲覧者に閲覧権限のみを付与
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r, permissions p, applications a
WHERE r.name = 'reservation_viewer' 
  AND p.application_id = a.id
  AND a.name = 'reservation'
  AND p.action = 'read'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- 更新結果の確認
SELECT 
  a.display_name as application_name,
  r.display_name as role_name,
  p.resource,
  p.action,
  p.display_name as permission_name
FROM role_permissions rp
JOIN roles r ON rp.role_id = r.id
JOIN permissions p ON rp.permission_id = p.id
JOIN applications a ON p.application_id = a.id
WHERE a.name = 'reservation'
ORDER BY r.display_name, p.resource, p.action; 