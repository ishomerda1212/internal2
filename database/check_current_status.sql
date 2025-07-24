-- 現在のデータベース構造を確認

-- 1. transfer_historiesテーブルの全カラム確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
ORDER BY ordinal_position;

-- 2. 組織関連カラムの確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
  AND column_name LIKE 'organization%'
ORDER BY column_name;

-- 3. スタッフランク関連カラムの確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
  AND column_name LIKE '%staff%'
ORDER BY column_name;

-- 4. 既存データの確認（エラーを避けるため）
SELECT 
  COUNT(*) as total_records
FROM transfer_histories;

-- 5. サンプルデータの確認（エラーを避けるため）
SELECT 
  id,
  employee_id,
  position,
  start_date
FROM transfer_histories
ORDER BY start_date DESC
LIMIT 3; 