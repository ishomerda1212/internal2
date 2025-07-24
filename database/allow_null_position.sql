-- positionカラムをNULL許可に変更
ALTER TABLE transfer_histories 
ALTER COLUMN position DROP NOT NULL;

-- 既存の空文字列をNULLに更新（オプション）
UPDATE transfer_histories 
SET position = NULL 
WHERE position = '';

-- 変更確認
SELECT column_name, is_nullable, data_type 
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' AND column_name = 'position'; 