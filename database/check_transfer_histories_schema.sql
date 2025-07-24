-- transfer_historiesテーブルの現在の構造を確認

-- 1. 全カラムの確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
ORDER BY ordinal_position;

-- 2. 必須カラムの存在確認
SELECT 
  column_name,
  CASE 
    WHEN column_name = 'transfer_type' THEN 'transfer_type'
    WHEN column_name = 'organization_level_1_id' THEN 'organization_level_1_id'
    WHEN column_name = 'organization_level_2_id' THEN 'organization_level_2_id'
    WHEN column_name = 'organization_level_3_id' THEN 'organization_level_3_id'
    WHEN column_name = 'staff_rank_master_id' THEN 'staff_rank_master_id'
    ELSE 'other'
  END as required_column
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
  AND column_name IN ('transfer_type', 'organization_level_1_id', 'organization_level_2_id', 'organization_level_3_id', 'staff_rank_master_id');

-- 3. サンプルデータの確認
SELECT 
  id,
  employee_id,
  position,
  start_date,
  transfer_type,
  created_at
FROM transfer_histories
ORDER BY created_at DESC
LIMIT 3; 