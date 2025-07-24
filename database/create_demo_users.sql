-- デモ用ユーザーの作成
-- 注意: 実際の運用では、Supabaseのダッシュボードからユーザーを作成することを推奨します

-- HRユーザー（管理者権限）
-- メール: hr@example.com
-- パスワード: password123
-- ロール: hr

-- マネージャーユーザー
-- メール: manager@example.com
-- パスワード: password123
-- ロール: manager

-- 一般社員ユーザー
-- メール: employee@example.com
-- パスワード: password123
-- ロール: employee

-- Supabaseのダッシュボードで以下の手順でユーザーを作成してください：

-- 1. Supabaseダッシュボードにログイン
-- 2. プロジェクトを選択
-- 3. Authentication > Users に移動
-- 4. "Add user" をクリック
-- 5. 以下のユーザーを追加：

-- User 1:
-- Email: hr@example.com
-- Password: password123
-- User Metadata: {"role": "hr"}

-- User 2:
-- Email: manager@example.com
-- Password: password123
-- User Metadata: {"role": "manager"}

-- User 3:
-- Email: employee@example.com
-- Password: password123
-- User Metadata: {"role": "employee"}

-- または、以下のSQLコマンドでユーザーを作成できます（管理者権限が必要）：

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
--   raw_app_meta_data,
--   raw_user_meta_data,
--   is_super_admin,
--   confirmation_token,
--   email_change,
--   email_change_token_new,
--   recovery_token
-- ) VALUES (
--   '00000000-0000-0000-0000-000000000000',
--   gen_random_uuid(),
--   'authenticated',
--   'authenticated',
--   'hr@example.com',
--   crypt('password123', gen_salt('bf')),
--   now(),
--   now(),
--   now(),
--   '{"provider": "email", "providers": ["email"], "role": "hr"}',
--   '{"role": "hr"}',
--   false,
--   '',
--   '',
--   '',
--   ''
-- );

-- 注意: 上記のSQLは管理者権限が必要で、実際の環境では推奨されません。
-- 代わりにSupabaseダッシュボードまたはAuth APIを使用してください。 