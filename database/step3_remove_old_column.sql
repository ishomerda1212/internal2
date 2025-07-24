-- 第3段階: 古いorganization_idカラムを削除
-- 第2段階が完了してから実行してください

-- 1. 古いorganization_idカラムを削除（CASCADEで依存関係も削除）
ALTER TABLE transfer_histories 
DROP COLUMN organization_id CASCADE;

-- 2. employees_with_current_assignmentビューを更新
CREATE OR REPLACE VIEW employees_with_current_assignment AS
SELECT 
  e.id,
  e.employee_id,
  e.last_name,
  e.first_name,
  e.last_name_kana,
  e.first_name_kana,
  e.roman_name,
  e.gender,
  e.gmail,
  e.is_mail,
  e.common_password,
  e.phone,
  e.hire_date,
  e.resign_date,
  e.job_type,
  e.employment_type,
  e.status,
  e.created_at,
  e.updated_at,
  th.id as current_assignment_id,
  th.position as current_position,
  srm.staff_rank as current_staff_rank,
  th.start_date as current_assignment_start_date,
  -- 第三階層を優先、なければ第二階層、なければ第一階層
  COALESCE(th.organization_level_3_id, th.organization_level_2_id, th.organization_level_1_id) as current_organization_id,
  CASE 
    WHEN th.organization_level_3_id IS NOT NULL THEN o3.name
    WHEN th.organization_level_2_id IS NOT NULL THEN o2.name
    WHEN th.organization_level_1_id IS NOT NULL THEN o1.name
    ELSE NULL
  END as current_organization_name,
  CASE 
    WHEN th.organization_level_3_id IS NOT NULL THEN o3.level
    WHEN th.organization_level_2_id IS NOT NULL THEN o2.level
    WHEN th.organization_level_1_id IS NOT NULL THEN o1.level
    ELSE NULL
  END as current_organization_level,
  CASE 
    WHEN th.organization_level_3_id IS NOT NULL THEN o3.type
    WHEN th.organization_level_2_id IS NOT NULL THEN o2.type
    WHEN th.organization_level_1_id IS NOT NULL THEN o1.type
    ELSE NULL
  END as current_organization_type
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
LEFT JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id;

-- 3. 最終確認
SELECT 
  th.id,
  e.employee_id,
  e.last_name || ' ' || e.first_name as employee_name,
  o1.name as level_1_org,
  o2.name as level_2_org,
  o3.name as level_3_org,
  srm.staff_rank,
  th.position,
  th.start_date
FROM transfer_histories th
JOIN employees e ON th.employee_id = e.id
LEFT JOIN organizations o1 ON th.organization_level_1_id = o1.id
LEFT JOIN organizations o2 ON th.organization_level_2_id = o2.id
LEFT JOIN organizations o3 ON th.organization_level_3_id = o3.id
LEFT JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id
ORDER BY th.start_date DESC
LIMIT 5; 