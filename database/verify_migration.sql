-- データベース移行状況の確認SQL

-- 1. transfer_historiesテーブルの構造確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
  AND column_name LIKE 'organization%'
ORDER BY column_name;

-- 2. 既存データの確認
SELECT 
  COUNT(*) as total_records,
  COUNT(organization_level_1_id) as level_1_set,
  COUNT(organization_level_2_id) as level_2_set,
  COUNT(organization_level_3_id) as level_3_set
FROM transfer_histories;

-- 3. サンプルデータの確認
SELECT 
  th.id,
  e.employee_id,
  e.last_name || ' ' || e.first_name as employee_name,
  th.organization_level_1_id,
  o1.name as level_1_name,
  th.organization_level_2_id,
  o2.name as level_2_name,
  th.organization_level_3_id,
  o3.name as level_3_name,
  th.position,
  th.start_date
FROM transfer_histories th
JOIN employees e ON th.employee_id = e.id
LEFT JOIN organizations o1 ON th.organization_level_1_id = o1.id
LEFT JOIN organizations o2 ON th.organization_level_2_id = o2.id
LEFT JOIN organizations o3 ON th.organization_level_3_id = o3.id
ORDER BY th.start_date DESC
LIMIT 5;

-- 4. 社員データの確認
SELECT 
  COUNT(*) as total_employees,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_employees
FROM employees;

-- 5. 組織データの確認
SELECT 
  level,
  COUNT(*) as count
FROM organizations 
WHERE is_current = true
GROUP BY level
ORDER BY level; 