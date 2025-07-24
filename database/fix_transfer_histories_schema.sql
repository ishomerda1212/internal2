-- transfer_historiesテーブルの不足しているカラムを追加
-- 実行前にバックアップを取得してください

-- 1. transfer_typeカラムを追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfer_histories' 
    AND column_name = 'transfer_type'
  ) THEN
    ALTER TABLE transfer_histories 
    ADD COLUMN transfer_type VARCHAR(50) DEFAULT 'transfer';
  END IF;
END $$;

-- 2. end_dateカラムを追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfer_histories' 
    AND column_name = 'end_date'
  ) THEN
    ALTER TABLE transfer_histories 
    ADD COLUMN end_date DATE;
  END IF;
END $$;

-- 3. reasonカラムを追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfer_histories' 
    AND column_name = 'reason'
  ) THEN
    ALTER TABLE transfer_histories 
    ADD COLUMN reason TEXT;
  END IF;
END $$;

-- 4. notesカラムを追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfer_histories' 
    AND column_name = 'notes'
  ) THEN
    ALTER TABLE transfer_histories 
    ADD COLUMN notes TEXT;
  END IF;
END $$;

-- 5. organization_snapshotカラムを追加（存在しない場合）
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfer_histories' 
    AND column_name = 'organization_snapshot'
  ) THEN
    ALTER TABLE transfer_histories 
    ADD COLUMN organization_snapshot JSONB;
  END IF;
END $$;

-- 6. 確認用クエリ
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
  AND column_name IN ('transfer_type', 'end_date', 'reason', 'notes', 'organization_snapshot')
ORDER BY column_name; 