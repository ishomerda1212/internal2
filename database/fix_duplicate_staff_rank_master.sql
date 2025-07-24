-- staff_rank_masterテーブルの重複データを確認
SELECT 
  staff_rank,
  organization_id,
  COUNT(*) as duplicate_count
FROM staff_rank_master
GROUP BY staff_rank, organization_id
HAVING COUNT(*) > 1
ORDER BY staff_rank, organization_id;

-- 重複データの詳細を確認
SELECT 
  srm.id,
  srm.staff_rank,
  srm.organization_id,
  o.name as organization_name,
  srm.personnel_costs,
  srm.maintenance_costs,
  srm.director_cost,
  srm.ad_costs,
  srm.created_at
FROM staff_rank_master srm
JOIN organizations o ON srm.organization_id = o.id
WHERE (srm.staff_rank, srm.organization_id) IN (
  SELECT staff_rank, organization_id
  FROM staff_rank_master
  GROUP BY staff_rank, organization_id
  HAVING COUNT(*) > 1
)
ORDER BY srm.staff_rank, srm.organization_id, srm.created_at;

-- 重複データを削除（最新のデータ以外を削除）
DELETE FROM staff_rank_master 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY staff_rank, organization_id 
             ORDER BY created_at DESC
           ) as rn
    FROM staff_rank_master
  ) ranked
  WHERE rn > 1
);

-- 重複データ削除後の確認
SELECT 
  staff_rank,
  organization_id,
  COUNT(*) as count
FROM staff_rank_master
GROUP BY staff_rank, organization_id
HAVING COUNT(*) > 1
ORDER BY staff_rank, organization_id;

-- 重複が解消されたらUNIQUE制約を追加
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