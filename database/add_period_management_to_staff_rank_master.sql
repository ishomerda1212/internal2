-- staff_rank_masterテーブルに期間管理のカラムを追加

-- 既存のUNIQUE制約を削除（存在する場合）
ALTER TABLE staff_rank_master 
DROP CONSTRAINT IF EXISTS staff_rank_master_staff_rank_organization_id_unique;

-- 期間管理のカラムを追加
ALTER TABLE staff_rank_master 
ADD COLUMN IF NOT EXISTS effective_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS is_current BOOLEAN DEFAULT true;

-- 既存データの期間を設定（2025年1月1日から開始）
UPDATE staff_rank_master 
SET 
  effective_date = '2025-01-01',
  end_date = NULL,
  is_current = true
WHERE effective_date IS NULL;

-- 新しいUNIQUE制約を追加（期間を考慮）
-- 同じ組織・ランク・期間で重複しないようにする
ALTER TABLE staff_rank_master 
ADD CONSTRAINT staff_rank_master_staff_rank_organization_id_period_unique 
UNIQUE (staff_rank, organization_id, effective_date);

-- 期間の重複チェック制約を追加
-- 同じ組織・ランクで期間が重複しないようにする
ALTER TABLE staff_rank_master 
ADD CONSTRAINT staff_rank_master_no_overlapping_periods 
CHECK (
  NOT EXISTS (
    SELECT 1 FROM staff_rank_master srm2
    WHERE srm2.staff_rank = staff_rank_master.staff_rank
      AND srm2.organization_id = staff_rank_master.organization_id
      AND srm2.id != staff_rank_master.id
      AND (
        (staff_rank_master.effective_date <= srm2.effective_date AND 
         (staff_rank_master.end_date IS NULL OR staff_rank_master.end_date >= srm2.effective_date))
        OR
        (srm2.effective_date <= staff_rank_master.effective_date AND 
         (srm2.end_date IS NULL OR srm2.end_date >= staff_rank_master.effective_date))
      )
  )
);

-- 制約確認
SELECT 
  tc.constraint_name,
  tc.constraint_type,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'staff_rank_master'
ORDER BY tc.constraint_type, kcu.column_name;

-- 現在のデータ構造確認
SELECT 
  staff_rank,
  organization_id,
  effective_date,
  end_date,
  is_current,
  personnel_costs,
  maintenance_costs,
  director_cost,
  ad_costs
FROM staff_rank_master
ORDER BY organization_id, staff_rank, effective_date
LIMIT 10; 