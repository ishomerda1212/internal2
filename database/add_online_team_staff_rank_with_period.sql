-- オンラインチームのスタッフランクマスターを作成（期間管理対応）
-- 2025年度版として作成

-- オンラインチームの既存のスタッフランクマスターを削除（2025年度版）
DELETE FROM staff_rank_master 
WHERE organization_id IN (
  SELECT id FROM organizations 
  WHERE name = 'オンラインチーム' AND level = 2
) AND effective_date = '2025-01-01';

-- オンラインチームのスタッフランクマスターを新規作成（2025年度版）
INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'S', id, 900000, 300000, 0, 250000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'A', id, 900000, 300000, 0, 250000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'B', id, 800000, 250000, 0, 200000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'C', id, 700000, 200000, 0, 150000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'D', id, 600000, 180000, 0, 100000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'E', id, 500000, 160000, 0, 80000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'F', id, 450000, 150000, 0, 60000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'G', id, 400000, 150000, 0, 50000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

INSERT INTO staff_rank_master (
  staff_rank, 
  organization_id, 
  personnel_costs, 
  maintenance_costs, 
  director_cost, 
  ad_costs,
  effective_date,
  end_date,
  is_current
)
SELECT 'H', id, 350000, 150000, 0, 50000, '2025-01-01', NULL, true
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2;

-- 登録確認（現在有効なデータのみ）
SELECT 
  srm.staff_rank,
  o.name as organization_name,
  o.level as organization_level,
  srm.effective_date,
  srm.end_date,
  srm.is_current,
  srm.personnel_costs,
  srm.maintenance_costs,
  srm.director_cost,
  srm.ad_costs,
  (srm.personnel_costs + srm.maintenance_costs + srm.director_cost + srm.ad_costs) as total_cost
FROM staff_rank_master srm
JOIN organizations o ON srm.organization_id = o.id
WHERE o.name = 'オンラインチーム' AND srm.is_current = true
ORDER BY srm.staff_rank DESC; 