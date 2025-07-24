-- 現在のデータベース構造を確認するSQL

-- 1. transfer_historiesテーブルの構造確認
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
ORDER BY ordinal_position;

-- 2. 既存の異動履歴データ確認
SELECT 
  COUNT(*) as total_records,
  COUNT(organization_id) as records_with_org_id,
  COUNT(staff_rank_master_id) as records_with_staff_rank_id
FROM transfer_histories;

-- 3. サンプルデータ確認
SELECT 
  th.id,
  e.employee_id,
  e.last_name || ' ' || e.first_name as employee_name,
  th.organization_id,
  o.name as organization_name,
  th.staff_rank_master_id,
  srm.staff_rank,
  th.position,
  th.start_date
FROM transfer_histories th
JOIN employees e ON th.employee_id = e.id
LEFT JOIN organizations o ON th.organization_id = o.id
LEFT JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id
ORDER BY th.start_date DESC
LIMIT 5;

-- 4. employees_with_current_assignmentビューの存在確認
SELECT 
  table_name,
  table_type
FROM information_schema.tables 
WHERE table_name = 'employees_with_current_assignment';

-- 5. 社員データ確認
SELECT 
  COUNT(*) as total_employees,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees,
  COUNT(CASE WHEN status = 'upcoming' THEN 1 END) as upcoming_employees,
  COUNT(CASE WHEN status = 'resigned' THEN 1 END) as resigned_employees
FROM employees; 