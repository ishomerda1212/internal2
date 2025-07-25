-- GmailとユーザーIDのマッピングテーブル修正

-- 現在のマッピングデータを確認
SELECT 
  gm.gmail,
  gm.user_id,
  gm.employee_id,
  e.last_name,
  e.first_name
FROM gmail_user_mapping gm
LEFT JOIN employees e ON gm.employee_id = e.employee_id
ORDER BY gm.gmail;

-- 現在のSupabaseユーザーを確認
-- 注意: このクエリは管理者権限が必要です
SELECT 
  id,
  email,
  raw_user_meta_data
FROM auth.users
ORDER BY created_at;

-- マッピングテーブルをクリア（必要に応じて）
-- DELETE FROM gmail_user_mapping;

-- 実際のSupabaseユーザーIDを使用してマッピングを再作成
-- 以下の例は、実際のユーザーIDに置き換えてください

-- 例: 実際のSupabaseユーザーIDを使用
-- INSERT INTO gmail_user_mapping (gmail, user_id, employee_id) VALUES
-- ('is.yoteihyou.wada@gmail.com', '実際のSupabaseユーザーID', '14005')
-- ON CONFLICT (gmail) DO UPDATE SET
--   user_id = EXCLUDED.user_id,
--   employee_id = EXCLUDED.employee_id,
--   updated_at = NOW();

-- または、テスト用に一時的にマッピングを無効化
-- 権限管理コンポーネントでテスト用IDを使用するように修正 