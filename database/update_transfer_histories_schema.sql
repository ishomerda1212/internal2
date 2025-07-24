-- transfer_historiesテーブルのstaff_rankフィールドをstaff_rank_master_idに変更
-- このSQLは既存のデータを保持しながらスキーマを変更します

-- 1. 新しいカラムを追加
ALTER TABLE transfer_histories 
ADD COLUMN staff_rank_master_id UUID REFERENCES staff_rank_master(id);

-- 2. 既存のデータを移行（組織とスタッフランクに基づいてstaff_rank_master_idを設定）
UPDATE transfer_histories 
SET staff_rank_master_id = (
  SELECT srm.id 
  FROM staff_rank_master srm 
  WHERE srm.organization_id = transfer_histories.organization_id 
    AND srm.staff_rank = transfer_histories.staff_rank
    AND srm.is_current = true
  LIMIT 1
)
WHERE staff_rank IS NOT NULL AND staff_rank != '';

-- 3. 古いstaff_rankカラムを削除
ALTER TABLE transfer_histories 
DROP COLUMN staff_rank;

-- 4. インデックスを追加
CREATE INDEX IF NOT EXISTS idx_transfer_histories_staff_rank_master_id 
ON transfer_histories(staff_rank_master_id);

-- 5. 確認用クエリ
SELECT 
  th.id,
  e.employee_id,
  e.last_name || ' ' || e.first_name as employee_name,
  o.name as organization_name,
  srm.staff_rank,
  th.position,
  th.start_date
FROM transfer_histories th
JOIN employees e ON th.employee_id = e.id
JOIN organizations o ON th.organization_id = o.id
LEFT JOIN staff_rank_master srm ON th.staff_rank_master_id = srm.id
ORDER BY th.start_date DESC; 