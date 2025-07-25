-- 現在のgmail_user_mappingテーブルを修正

-- 1. 現在のSupabaseユーザーを確認
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at;

-- 2. 現在のgmail_user_mappingを確認
SELECT 
  gm.gmail,
  gm.user_id,
  gm.employee_id,
  e.last_name,
  e.first_name
FROM gmail_user_mapping gm
LEFT JOIN employees e ON gm.employee_id = e.employee_id
ORDER BY gm.gmail;

-- 3. 実際のSupabaseユーザーIDでgmail_user_mappingを更新
-- 以下の例は、実際のユーザーIDに置き換えてください

-- 例: 和田さんのマッピングを更新
-- UPDATE gmail_user_mapping 
-- SET user_id = '実際のSupabaseユーザーID'
-- WHERE gmail = 'is.yoteihyou.wada@gmail.com';

-- 4. 更新後の確認
SELECT 
  gm.gmail,
  gm.user_id,
  gm.employee_id,
  e.last_name,
  e.first_name,
  CASE 
    WHEN u.id IS NOT NULL THEN '有効'
    ELSE '無効'
  END as user_status
FROM gmail_user_mapping gm
LEFT JOIN employees e ON gm.employee_id = e.employee_id
LEFT JOIN auth.users u ON gm.user_id = u.id
ORDER BY gm.gmail; 