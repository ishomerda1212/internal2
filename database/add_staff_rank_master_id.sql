-- staff_rank_master_idカラムを追加
-- 実行前にバックアップを取得してください

-- 1. staff_rank_master_idカラムを追加
ALTER TABLE transfer_histories 
ADD COLUMN staff_rank_master_id UUID REFERENCES staff_rank_master(id);

-- 2. インデックスを追加
CREATE INDEX IF NOT EXISTS idx_transfer_histories_staff_rank_master_id 
ON transfer_histories(staff_rank_master_id);

-- 3. 確認用クエリ
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
  AND column_name = 'staff_rank_master_id'; 