-- 実際のSupabaseユーザーを作成し、gmail_user_mappingを更新

-- 注意: このスクリプトは管理者権限で実行する必要があります

-- 1. 現在のSupabaseユーザーを確認
SELECT 
  id,
  email,
  created_at,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at;

-- 2. 社員テーブルのGmailアドレスを確認
SELECT 
  employee_id,
  last_name,
  first_name,
  gmail
FROM employees 
WHERE gmail IS NOT NULL 
  AND gmail != '' 
  AND gmail != 'EMPTY' 
  AND gmail != 'NULL'
ORDER BY employee_id;

-- 3. 新しいSupabaseユーザーを作成（手動で実行）
-- 以下のコマンドをSupabaseのダッシュボードまたはAPIで実行

-- 例: 和田さんのユーザーを作成
-- INSERT INTO auth.users (
--   instance_id,
--   id,
--   aud,
--   role,
--   email,
--   encrypted_password,
--   email_confirmed_at,
--   created_at,
--   updated_at,
--   raw_user_meta_data,
--   is_super_admin,
--   confirmed_at,
--   email_change,
--   email_change_token_new,
--   recovery_sent_at,
--   last_sign_in_at,
--   raw_app_meta_data,
--   is_sso_user,
--   deleted_at,
--   phone,
--   phone_confirmed_at,
--   phone_change,
--   phone_change_token,
--   email_change_confirm_status,
--   banned_until,
--   reauthentication_sent_at,
--   reauthentication_sent_at
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'is.yoteihyou.wada@gmail.com',
--   crypt('password123', gen_salt('bf')),
--   NOW(),
--   NOW(),
--   NOW(),
--   '{"role": "hr_admin"}',
--   false,
--   NOW(),
--   '',
--   '',
--   NULL,
--   NULL,
--   '{"provider": "email", "providers": ["email"]}',
--   false,
--   NULL,
--   NULL,
--   NULL,
--   '',
--   '',
--   0,
--   NULL,
--   NULL
-- );

-- 4. 作成したユーザーIDを取得してgmail_user_mappingを更新
-- 実際のユーザーIDに置き換えてください

-- UPDATE gmail_user_mapping 
-- SET user_id = '実際のSupabaseユーザーID'
-- WHERE gmail = 'is.yoteihyou.wada@gmail.com';

-- 5. ログイン権限チェック用のビューを作成
CREATE OR REPLACE VIEW user_login_permissions AS
SELECT 
  u.id as user_id,
  u.email,
  gm.employee_id,
  e.last_name,
  e.first_name,
  CASE 
    WHEN COUNT(ur.role_id) > 0 THEN true 
    ELSE false 
  END as has_login_permission,
  array_agg(r.name) as roles
FROM auth.users u
LEFT JOIN gmail_user_mapping gm ON u.email = gm.gmail
LEFT JOIN employees e ON gm.employee_id = e.employee_id
LEFT JOIN user_roles ur ON u.id = ur.user_id
LEFT JOIN roles r ON ur.role_id = r.id
WHERE u.deleted_at IS NULL
GROUP BY u.id, u.email, gm.employee_id, e.last_name, e.first_name;

-- 6. ログイン権限チェック用の関数を作成
CREATE OR REPLACE FUNCTION check_user_login_permission(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  has_permission BOOLEAN;
BEGIN
  SELECT has_login_permission INTO has_permission
  FROM user_login_permissions
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(has_permission, false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 