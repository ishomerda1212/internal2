-- 社員と現在の配属先情報を結合したビュー
CREATE OR REPLACE VIEW employees_with_current_assignments AS
SELECT 
  e.*,
  th.id as transfer_history_id,
  th.position,
  th.start_date as assignment_start_date,
  th.staff_rank_master_id,
  -- 第一階層組織
  o1.id as org_level_1_id,
  o1.name as org_level_1_name,
  o1.type as org_level_1_type,
  o1.level as org_level_1_level,
  -- 第二階層組織
  o2.id as org_level_2_id,
  o2.name as org_level_2_name,
  o2.type as org_level_2_type,
  o2.level as org_level_2_level,
  -- 第三階層組織
  o3.id as org_level_3_id,
  o3.name as org_level_3_name,
  o3.type as org_level_3_type,
  o3.level as org_level_3_level,
  -- スタッフランク
  srm.staff_rank,
  srm.personnel_costs,
  srm.maintenance_costs,
  srm.director_cost,
  srm.ad_costs
FROM employees e
LEFT JOIN LATERAL (
  SELECT *
  FROM transfer_histories th2
  WHERE th2.employee_id = e.id
  ORDER BY th2.start_date DESC
  LIMIT 1
) th ON true
LEFT JOIN organizations o1 ON th.organization_level_1_id = o1.id
LEFT JOIN organizations o2 ON th.organization_level_2_id = o2.id
LEFT JOIN organizations o3 ON th.organization_level_3_id = o3.id
LEFT JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id
WHERE e.is_current = true;

-- RLSポリシーを設定
ALTER VIEW employees_with_current_assignments ENABLE ROW LEVEL SECURITY;

-- 全ユーザーが読み取り可能
CREATE POLICY "Allow read access to employees_with_current_assignments" 
ON employees_with_current_assignments 
FOR SELECT 
USING (true); 