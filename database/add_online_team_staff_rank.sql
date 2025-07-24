-- オンラインチームのスタッフランクマスターを作成（水まわりチームと同じ数値）
-- オンラインチームの組織IDを取得してスタッフランクマスターを追加

-- オンラインチームのスタッフランクマスター（水まわりチームと同じ数値）
INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'S', id, 900000, 300000, 0, 250000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'A', id, 900000, 300000, 0, 250000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'B', id, 800000, 250000, 0, 200000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'C', id, 700000, 200000, 0, 150000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'D', id, 600000, 180000, 0, 100000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'E', id, 500000, 160000, 0, 80000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'F', id, 450000, 150000, 0, 60000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'G', id, 400000, 150000, 0, 50000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'H', id, 350000, 150000, 0, 50000
FROM organizations 
WHERE name = 'オンラインチーム' AND level = 2
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

-- 登録確認
SELECT 
  srm.staff_rank,
  o.name as organization_name,
  o.level as organization_level,
  srm.personnel_costs,
  srm.maintenance_costs,
  srm.director_cost,
  srm.ad_costs,
  (srm.personnel_costs + srm.maintenance_costs + srm.director_cost + srm.ad_costs) as total_cost
FROM staff_rank_master srm
JOIN organizations o ON srm.organization_id = o.id
WHERE o.name = 'オンラインチーム'
ORDER BY srm.staff_rank DESC; 