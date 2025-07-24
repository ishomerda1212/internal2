-- スタッフランクと組織IDを参照してスタッフランクIDを登録するSQL
-- 実行前にバックアップを取得してください

-- 1. 現在の状況を確認
SELECT 
  th.id,
  e.employee_id,
  e.last_name || ' ' || e.first_name as employee_name,
  th.organization_level_3_id,
  o3.name as organization_name,
  th.staff_rank_master_id,
  srm.staff_rank as current_staff_rank
FROM transfer_histories th
JOIN employees e ON th.employee_id = e.id
LEFT JOIN organizations o3 ON th.organization_level_3_id = o3.id
LEFT JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id
ORDER BY th.start_date DESC
LIMIT 10;

-- 2. 組織IDとスタッフランクに基づいてstaff_rank_master_idを更新
-- 第三階層の組織IDを使用
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  WHERE srm.organization_id = transfer_histories.organization_level_3_id 
    AND srm.is_current = true
  LIMIT 1
)
WHERE organization_level_3_id IS NOT NULL 
  AND staff_rank_master_id IS NULL;

-- 3. 第二階層の組織IDを使用（第三階層がない場合）
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  WHERE srm.organization_id = transfer_histories.organization_level_2_id 
    AND srm.is_current = true
  LIMIT 1
)
WHERE organization_level_2_id IS NOT NULL 
  AND organization_level_3_id IS NULL
  AND staff_rank_master_id IS NULL;

-- 4. 第一階層の組織IDを使用（第二階層、第三階層がない場合）
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  WHERE srm.organization_id = transfer_histories.organization_level_1_id 
    AND srm.is_current = true
  LIMIT 1
)
WHERE organization_level_1_id IS NOT NULL 
  AND organization_level_2_id IS NULL
  AND organization_level_3_id IS NULL
  AND staff_rank_master_id IS NULL;

-- 5. 更新結果の確認
SELECT 
  COUNT(*) as total_records,
  COUNT(staff_rank_master_id) as staff_rank_set,
  COUNT(CASE WHEN staff_rank_master_id IS NULL THEN 1 END) as staff_rank_null
FROM transfer_histories;

-- 6. 詳細確認
SELECT 
  th.id,
  e.employee_id,
  e.last_name || ' ' || e.first_name as employee_name,
  o1.name as level_1_org,
  o2.name as level_2_org,
  o3.name as level_3_org,
  srm.staff_rank,
  th.position,
  th.start_date,
  CASE 
    WHEN th.staff_rank_master_id IS NULL THEN '未設定'
    ELSE '設定済み'
  END as status
FROM transfer_histories th
JOIN employees e ON th.employee_id = e.id
LEFT JOIN organizations o1 ON th.organization_level_1_id = o1.id
LEFT JOIN organizations o2 ON th.organization_level_2_id = o2.id
LEFT JOIN organizations o3 ON th.organization_level_3_id = o3.id
LEFT JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id
ORDER BY th.start_date DESC
LIMIT 10;

-- 7. 未設定のレコードを確認
SELECT 
  th.id,
  e.employee_id,
  e.last_name || ' ' || e.first_name as employee_name,
  o1.name as level_1_org,
  o2.name as level_2_org,
  o3.name as level_3_org,
  th.position,
  th.start_date
FROM transfer_histories th
JOIN employees e ON th.employee_id = e.id
LEFT JOIN organizations o1 ON th.organization_level_1_id = o1.id
LEFT JOIN organizations o2 ON th.organization_level_2_id = o2.id
LEFT JOIN organizations o3 ON th.organization_level_3_id = o3.id
WHERE th.staff_rank_master_id IS NULL
ORDER BY th.start_date DESC; 