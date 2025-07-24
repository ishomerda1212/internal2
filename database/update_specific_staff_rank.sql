-- 特定のスタッフランクを指定してstaff_rank_master_idを更新するSQL
-- 実行前にバックアップを取得してください

-- 1. 営業1課の社員をCランクに設定
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  WHERE srm.organization_id = transfer_histories.organization_level_3_id 
    AND srm.staff_rank = 'C'
    AND srm.is_current = true
  LIMIT 1
)
WHERE organization_level_3_id = (
  SELECT id FROM organizations WHERE name = '営業1課' AND is_current = true LIMIT 1
)
AND staff_rank_master_id IS NULL;

-- 2. フロントエンドチームの社員をDランクに設定
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  WHERE srm.organization_id = transfer_histories.organization_level_3_id 
    AND srm.staff_rank = 'D'
    AND srm.is_current = true
  LIMIT 1
)
WHERE organization_level_3_id = (
  SELECT id FROM organizations WHERE name = 'フロントエンドチーム' AND is_current = true LIMIT 1
)
AND staff_rank_master_id IS NULL;

-- 3. 特別プロジェクト推進室の社員をAランクに設定
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  WHERE srm.organization_id = transfer_histories.organization_level_3_id 
    AND srm.staff_rank = 'A'
    AND srm.is_current = true
  LIMIT 1
)
WHERE organization_level_3_id = (
  SELECT id FROM organizations WHERE name = '特別プロジェクト推進室' AND is_current = true LIMIT 1
)
AND staff_rank_master_id IS NULL;

-- 4. バックエンドチームの社員をBランクに設定
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  WHERE srm.organization_id = transfer_histories.organization_level_3_id 
    AND srm.staff_rank = 'B'
    AND srm.is_current = true
  LIMIT 1
)
WHERE organization_level_3_id = (
  SELECT id FROM organizations WHERE name = 'バックエンドチーム' AND is_current = true LIMIT 1
)
AND staff_rank_master_id IS NULL;

-- 5. 更新結果の確認
SELECT 
  o3.name as organization_name,
  srm.staff_rank,
  COUNT(*) as employee_count
FROM transfer_histories th
JOIN organizations o3 ON th.organization_level_3_id = o3.id
JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id
WHERE o3.name IN ('営業1課', 'フロントエンドチーム', '特別プロジェクト推進室', 'バックエンドチーム')
GROUP BY o3.name, srm.staff_rank
ORDER BY o3.name;

-- 6. 未設定のレコードを確認
SELECT 
  o3.name as organization_name,
  COUNT(*) as unset_count
FROM transfer_histories th
LEFT JOIN organizations o3 ON th.organization_level_3_id = o3.id
WHERE th.staff_rank_master_id IS NULL
  AND o3.name IS NOT NULL
GROUP BY o3.name
ORDER BY unset_count DESC; 