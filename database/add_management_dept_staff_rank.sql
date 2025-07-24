-- 管理部のスタッフランクマスターデータを追加
-- 実行前にバックアップを取得してください

-- 1. 管理部の組織IDを取得
SELECT id, name, level, type 
FROM organizations 
WHERE name LIKE '%管理部%' 
  AND is_current = true 
  AND level = 1;

-- 2. 管理部のスタッフランクマスターデータを追加
INSERT INTO staff_rank_master (
  staff_rank,
  organization_id,
  personnel_costs,
  maintenance_costs,
  director_cost,
  ad_costs,
  is_current,
  effective_date,
  end_date
)
SELECT 
  'S' as staff_rank,
  id as organization_id,
  800000 as personnel_costs,
  200000 as maintenance_costs,
  500000 as director_cost,
  100000 as ad_costs,
  true as is_current,
  '2024-01-01' as effective_date,
  null as end_date
FROM organizations 
WHERE name = '管理部' 
  AND is_current = true 
  AND level = 1

UNION ALL

SELECT 
  'A' as staff_rank,
  id as organization_id,
  600000 as personnel_costs,
  150000 as maintenance_costs,
  300000 as director_cost,
  80000 as ad_costs,
  true as is_current,
  '2024-01-01' as effective_date,
  null as end_date
FROM organizations 
WHERE name = '管理部' 
  AND is_current = true 
  AND level = 1

UNION ALL

SELECT 
  'B' as staff_rank,
  id as organization_id,
  450000 as personnel_costs,
  120000 as maintenance_costs,
  200000 as director_cost,
  60000 as ad_costs,
  true as is_current,
  '2024-01-01' as effective_date,
  null as end_date
FROM organizations 
WHERE name = '管理部' 
  AND is_current = true 
  AND level = 1

UNION ALL

SELECT 
  'C' as staff_rank,
  id as organization_id,
  350000 as personnel_costs,
  100000 as maintenance_costs,
  150000 as director_cost,
  50000 as ad_costs,
  true as is_current,
  '2024-01-01' as effective_date,
  null as end_date
FROM organizations 
WHERE name = '管理部' 
  AND is_current = true 
  AND level = 1

UNION ALL

SELECT 
  'D' as staff_rank,
  id as organization_id,
  250000 as personnel_costs,
  80000 as maintenance_costs,
  100000 as director_cost,
  40000 as ad_costs,
  true as is_current,
  '2024-01-01' as effective_date,
  null as end_date
FROM organizations 
WHERE name = '管理部' 
  AND is_current = true 
  AND level = 1;

-- 3. 管理部のスタッフランクマスターデータを確認
SELECT 
  srm.staff_rank,
  o.name as organization_name,
  srm.personnel_costs,
  srm.maintenance_costs,
  srm.director_cost,
  srm.ad_costs,
  (srm.personnel_costs + srm.maintenance_costs + srm.director_cost + srm.ad_costs) as total_cost
FROM staff_rank_master srm
JOIN organizations o ON srm.organization_id = o.id
WHERE o.name = '管理部'
  AND srm.is_current = true
ORDER BY srm.staff_rank DESC;

-- 4. 管理部の異動履歴にスタッフランクIDを設定
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  JOIN organizations o ON srm.organization_id = o.id
  WHERE o.name = '管理部' 
    AND srm.staff_rank = 'C'  -- デフォルトでCランク
    AND srm.is_current = true
  LIMIT 1
)
WHERE organization_level_1_id = (
  SELECT id FROM organizations WHERE name = '管理部' AND is_current = true LIMIT 1
)
AND staff_rank_master_id IS NULL;

-- 5. 更新結果の確認
SELECT 
  o.name as organization_name,
  srm.staff_rank,
  COUNT(*) as employee_count
FROM transfer_histories th
JOIN organizations o ON th.organization_level_1_id = o.id
JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id
WHERE o.name = '管理部'
GROUP BY o.name, srm.staff_rank
ORDER BY srm.staff_rank DESC; 