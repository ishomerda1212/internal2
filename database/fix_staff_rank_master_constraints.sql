-- staff_rank_masterテーブルの制約を確認
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'staff_rank_master'
ORDER BY tc.constraint_type, kcu.column_name;

-- staff_rankとorganization_idの組み合わせにUNIQUE制約を追加
ALTER TABLE staff_rank_master 
ADD CONSTRAINT staff_rank_master_staff_rank_organization_id_unique 
UNIQUE (staff_rank, organization_id);

-- 制約追加後の確認
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'staff_rank_master'
ORDER BY tc.constraint_type, kcu.column_name; 