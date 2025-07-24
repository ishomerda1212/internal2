-- transfer_typeカラムを削除
-- 実行前にバックアップを取得してください

-- 1. transfer_typeカラムが存在するか確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
  AND column_name = 'transfer_type';

-- 2. transfer_typeカラムを削除（存在する場合のみ）
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'transfer_histories' 
    AND column_name = 'transfer_type'
  ) THEN
    ALTER TABLE transfer_histories 
    DROP COLUMN transfer_type;
  END IF;
END $$;

-- 3. 削除後の確認
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
ORDER BY ordinal_position; 