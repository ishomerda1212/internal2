-- 第二階層（チーム）のスタッフランクマスターを追加
-- 2025年1月1日からの現在のデータ

-- 水まわりチーム
INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs, effective_date, is_current) VALUES
('S', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 900000, 300000, 0, 250000, '2025-01-01', true),
('A', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 900000, 300000, 0, 250000, '2025-01-01', true),
('B', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 800000, 250000, 0, 200000, '2025-01-01', true),
('C', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 700000, 200000, 0, 150000, '2025-01-01', true),
('D', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 600000, 180000, 0, 100000, '2025-01-01', true),
('E', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 500000, 160000, 0, 80000, '2025-01-01', true),
('F', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 450000, 150000, 0, 60000, '2025-01-01', true),
('G', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 400000, 150000, 0, 50000, '2025-01-01', true),
('H', (SELECT id FROM organizations WHERE name = '水まわりチーム' AND is_current = true), 350000, 150000, 0, 50000, '2025-01-01', true);

-- 総合チーム
INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs, effective_date, is_current) VALUES
('S', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 900000, 300000, 150000, 250000, '2025-01-01', true),
('A', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 900000, 300000, 150000, 250000, '2025-01-01', true),
('B', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 800000, 250000, 150000, 200000, '2025-01-01', true),
('C', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 700000, 200000, 150000, 150000, '2025-01-01', true),
('D', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 600000, 180000, 0, 100000, '2025-01-01', true),
('E', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 500000, 160000, 0, 80000, '2025-01-01', true),
('F', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 450000, 150000, 0, 60000, '2025-01-01', true),
('G', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 400000, 150000, 0, 50000, '2025-01-01', true),
('H', (SELECT id FROM organizations WHERE name = '総合チーム' AND is_current = true), 350000, 150000, 0, 50000, '2025-01-01', true);

-- リノベーションチーム
INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs, effective_date, is_current) VALUES
('S', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 900000, 300000, 400000, 250000, '2025-01-01', true),
('A', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 900000, 300000, 400000, 250000, '2025-01-01', true),
('B', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 800000, 250000, 400000, 200000, '2025-01-01', true),
('C', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 700000, 200000, 400000, 150000, '2025-01-01', true),
('D', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 600000, 180000, 0, 100000, '2025-01-01', true),
('E', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 500000, 160000, 0, 80000, '2025-01-01', true),
('F', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 450000, 150000, 0, 60000, '2025-01-01', true),
('G', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 400000, 150000, 0, 50000, '2025-01-01', true),
('H', (SELECT id FROM organizations WHERE name = 'リノベーションチーム' AND is_current = true), 350000, 150000, 0, 50000, '2025-01-01', true);

-- 不動産チーム
INSERT INTO staff_rank_master (staff_rank, organization_id, personnel_costs, maintenance_costs, director_cost, ad_costs, effective_date, is_current) VALUES
('S', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 900000, 300000, 400000, 250000, '2025-01-01', true),
('A', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 900000, 300000, 400000, 250000, '2025-01-01', true),
('B', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 800000, 250000, 400000, 200000, '2025-01-01', true),
('C', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 700000, 200000, 400000, 150000, '2025-01-01', true),
('D', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 600000, 180000, 0, 100000, '2025-01-01', true),
('E', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 500000, 160000, 0, 80000, '2025-01-01', true),
('F', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 450000, 150000, 0, 60000, '2025-01-01', true),
('G', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 400000, 150000, 0, 50000, '2025-01-01', true),
('H', (SELECT id FROM organizations WHERE name = '不動産チーム' AND is_current = true), 350000, 150000, 0, 50000, '2025-01-01', true);

-- 確認用クエリ
SELECT 
  srm.staff_rank,
  o.name as organization_name,
  o.level as organization_level,
  srm.personnel_costs,
  srm.maintenance_costs,
  srm.director_cost,
  srm.ad_costs,
  srm.personnel_costs + srm.maintenance_costs + srm.director_cost + srm.ad_costs as total_cost,
  srm.is_current
FROM staff_rank_master srm
JOIN organizations o ON srm.organization_id = o.id
WHERE o.level IN (1, 2)
ORDER BY o.level, o.name, srm.staff_rank; 