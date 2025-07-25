-- 外装・法人チームのスタッフランクマスター作成

-- まず、外装・法人チームの組織IDを取得（存在しない場合は作成）
-- 組織テーブルに外装・法人チームが存在するかチェック
DO $$
DECLARE
    gaiso_houjin_org_id UUID;
BEGIN
    -- 外装・法人チームの組織IDを取得
    SELECT id INTO gaiso_houjin_org_id 
    FROM organizations 
    WHERE name = '外装・法人チーム' 
    AND type = 'チーム' 
    AND is_current = true;
    
    -- 組織が存在しない場合は作成
    IF gaiso_houjin_org_id IS NULL THEN
        INSERT INTO organizations (
            name, 
            level, 
            type, 
            effective_date, 
            is_current
        ) VALUES (
            '外装・法人チーム',
            2, -- チームレベル
            'チーム',
            CURRENT_DATE,
            true
        ) RETURNING id INTO gaiso_houjin_org_id;
        
        RAISE NOTICE '外装・法人チーム組織を作成しました。ID: %', gaiso_houjin_org_id;
    ELSE
        RAISE NOTICE '外装・法人チーム組織が既に存在します。ID: %', gaiso_houjin_org_id;
    END IF;
    
    -- 外装・法人チームのスタッフランクマスターを作成
    -- 水まわりチームと同じ数値を使用
    
    -- Rank S
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'S',
        gaiso_houjin_org_id,
        900000, -- 人件費
        300000, -- 経費保守費
        0,      -- ディレクター費
        250000, -- 広告費
        '2025-01-01',
        true
    );
    
    -- Rank A
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'A',
        gaiso_houjin_org_id,
        900000, -- 人件費
        300000, -- 経費保守費
        0,      -- ディレクター費
        250000, -- 広告費
        '2025-01-01',
        true
    );
    
    -- Rank B
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'B',
        gaiso_houjin_org_id,
        800000, -- 人件費
        250000, -- 経費保守費
        0,      -- ディレクター費
        200000, -- 広告費
        '2025-01-01',
        true
    );
    
    -- Rank C
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'C',
        gaiso_houjin_org_id,
        700000, -- 人件費
        200000, -- 経費保守費
        0,      -- ディレクター費
        150000, -- 広告費
        '2025-01-01',
        true
    );
    
    -- Rank D
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'D',
        gaiso_houjin_org_id,
        600000, -- 人件費
        180000, -- 経費保守費
        0,      -- ディレクター費
        100000, -- 広告費
        '2025-01-01',
        true
    );
    
    -- Rank E
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'E',
        gaiso_houjin_org_id,
        500000, -- 人件費
        160000, -- 経費保守費
        0,      -- ディレクター費
        80000,  -- 広告費
        '2025-01-01',
        true
    );
    
    -- Rank F
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'F',
        gaiso_houjin_org_id,
        450000, -- 人件費
        150000, -- 経費保守費
        0,      -- ディレクター費
        60000,  -- 広告費
        '2025-01-01',
        true
    );
    
    -- Rank G
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'G',
        gaiso_houjin_org_id,
        400000, -- 人件費
        150000, -- 経費保守費
        0,      -- ディレクター費
        50000,  -- 広告費
        '2025-01-01',
        true
    );
    
    -- Rank H
    INSERT INTO staff_rank_master (
        staff_rank,
        organization_id,
        personnel_costs,
        maintenance_costs,
        director_cost,
        ad_costs,
        effective_date,
        is_current
    ) VALUES (
        'H',
        gaiso_houjin_org_id,
        350000, -- 人件費
        150000, -- 経費保守費
        0,      -- ディレクター費
        50000,  -- 広告費
        '2025-01-01',
        true
    );
    
    RAISE NOTICE '外装・法人チームのスタッフランクマスターを作成しました。';
    
END $$;

-- 作成結果の確認
SELECT 
    o.name as organization_name,
    srm.staff_rank,
    srm.personnel_costs,
    srm.maintenance_costs,
    srm.director_cost,
    srm.ad_costs,
    (srm.personnel_costs + srm.maintenance_costs + srm.director_cost + srm.ad_costs) as total_cost,
    srm.effective_date
FROM staff_rank_master srm
JOIN organizations o ON srm.organization_id = o.id
WHERE o.name = '外装・法人チーム'
ORDER BY srm.staff_rank; 