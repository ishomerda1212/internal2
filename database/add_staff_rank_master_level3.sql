-- 第3階層の組織にもスタッフランクマスターを登録
-- 管理部の第3階層組織にスタッフランクマスターを追加

-- 特別プロジェクト推進室のスタッフランクマスター
INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'S', id, 2500000, 500000, 800000, 300000
FROM organizations 
WHERE name = '特別プロジェクト推進室' AND level = 3
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'A', id, 2000000, 400000, 600000, 250000
FROM organizations 
WHERE name = '特別プロジェクト推進室' AND level = 3
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'B', id, 1600000, 300000, 400000, 200000
FROM organizations 
WHERE name = '特別プロジェクト推進室' AND level = 3
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

-- 総合リフォーム部の第3階層組織にスタッフランクマスターを追加
-- 堺北店のスタッフランクマスター
INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'S', id, 2200000, 450000, 700000, 280000
FROM organizations 
WHERE name = '堺北店' AND level = 3
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'A', id, 1800000, 350000, 550000, 220000
FROM organizations 
WHERE name = '堺北店' AND level = 3
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs)
SELECT 'B', id, 1400000, 250000, 350000, 180000
FROM organizations 
WHERE name = '堺北店' AND level = 3
ON CONFLICT (staff_rank, organization_id) DO NOTHING;

-- 登録確認
SELECT 
  srm.staff_rank,
  o.name as organization_name,
  o.level as organization_level,
  srm.personnel_costs,
  srm.maintenance_costs,
  srm.director_cost,
  srm.ad_costs
FROM staff_rank_master srm
JOIN organizations o ON srm.organization_id = o.id
WHERE o.level = 3
ORDER BY o.name, srm.staff_rank DESC; 