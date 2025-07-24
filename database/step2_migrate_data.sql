-- 第2段階: 既存データを新しい階層別カラムに移行
-- 第1段階が完了してから実行してください

-- 1. 既存データの移行（現在のorganization_idを第三階層として設定）
UPDATE transfer_histories 
SET 
  organization_level_3_id = organization_id,
  organization_level_2_id = (
    SELECT parent_id FROM organizations 
    WHERE id = organization_id AND is_current = true
  ),
  organization_level_1_id = (
    SELECT parent_id FROM organizations 
    WHERE id = (
      SELECT parent_id FROM organizations 
      WHERE id = organization_id AND is_current = true
    ) AND is_current = true
  )
WHERE organization_id IS NOT NULL;

-- 2. 移行結果の確認
SELECT 
  th.id,
  e.employee_id,
  e.last_name || ' ' || e.first_name as employee_name,
  th.organization_id as old_org_id,
  o_old.name as old_org_name,
  th.organization_level_1_id,
  o1.name as level_1_name,
  th.organization_level_2_id,
  o2.name as level_2_name,
  th.organization_level_3_id,
  o3.name as level_3_name
FROM transfer_histories th
JOIN employees e ON th.employee_id = e.id
LEFT JOIN organizations o_old ON th.organization_id = o_old.id
LEFT JOIN organizations o1 ON th.organization_level_1_id = o1.id
LEFT JOIN organizations o2 ON th.organization_level_2_id = o2.id
LEFT JOIN organizations o3 ON th.organization_level_3_id = o3.id
ORDER BY th.start_date DESC
LIMIT 10;

-- 3. 移行統計
SELECT 
  COUNT(*) as total_records,
  COUNT(organization_level_1_id) as level_1_set,
  COUNT(organization_level_2_id) as level_2_set,
  COUNT(organization_level_3_id) as level_3_set
FROM transfer_histories; 