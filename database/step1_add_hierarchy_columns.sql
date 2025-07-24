-- 第1段階: 階層別カラムを追加（既存データは保持）
-- 実行前にバックアップを取得してください

-- 1. 新しいカラムを追加
ALTER TABLE transfer_histories 
ADD COLUMN organization_level_1_id UUID REFERENCES organizations(id),
ADD COLUMN organization_level_2_id UUID REFERENCES organizations(id),
ADD COLUMN organization_level_3_id UUID REFERENCES organizations(id);

-- 2. インデックスを追加
CREATE INDEX IF NOT EXISTS idx_transfer_histories_org_level_1 ON transfer_histories(organization_level_1_id);
CREATE INDEX IF NOT EXISTS idx_transfer_histories_org_level_2 ON transfer_histories(organization_level_2_id);
CREATE INDEX IF NOT EXISTS idx_transfer_histories_org_level_3 ON transfer_histories(organization_level_3_id);

-- 3. 確認用クエリ
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'transfer_histories' 
  AND column_name LIKE 'organization_level%'
ORDER BY column_name; 