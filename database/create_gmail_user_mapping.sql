-- GmailとユーザーIDのマッピングテーブル作成

-- マッピングテーブルが存在しない場合は作成
CREATE TABLE IF NOT EXISTS gmail_user_mapping (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gmail VARCHAR(255) NOT NULL UNIQUE,
  user_id UUID NOT NULL,
  employee_id VARCHAR(50),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_gmail_user_mapping_gmail ON gmail_user_mapping(gmail);
CREATE INDEX IF NOT EXISTS idx_gmail_user_mapping_user_id ON gmail_user_mapping(user_id);
CREATE INDEX IF NOT EXISTS idx_gmail_user_mapping_employee_id ON gmail_user_mapping(employee_id);

-- 既存のユーザーデータをマッピングテーブルに挿入
-- 実際のSupabaseユーザーIDに合わせて調整してください

INSERT INTO gmail_user_mapping (gmail, user_id, employee_id) VALUES
('hr@example.com', 'a85ff2d0-d6ab-4478-ba31-c5da8c0a2f07', 'hr001'),
('is.yoteihyou.wada@gmail.com', 'b85ff2d0-d6ab-4478-ba31-c5da8c0a2f08', '14005'),
('is.yoteihyou.yamamoto@gmail.com', 'c85ff2d0-d6ab-4478-ba31-c5da8c0a2f09', '20007')
ON CONFLICT (gmail) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  employee_id = EXCLUDED.employee_id,
  updated_at = NOW();

-- 社員テーブルのGmailアドレスからマッピングを自動生成
-- 既存の社員データをマッピングテーブルに追加
INSERT INTO gmail_user_mapping (gmail, user_id, employee_id)
SELECT 
  e.gmail,
  gen_random_uuid() as user_id,
  e.employee_id
FROM employees e
WHERE e.gmail IS NOT NULL 
  AND e.gmail != ''
  AND e.gmail != 'EMPTY'
  AND e.gmail != 'NULL'
  AND NOT EXISTS (
    SELECT 1 FROM gmail_user_mapping gm WHERE gm.gmail = e.gmail
  );

-- マッピング結果の確認
SELECT 
  gm.gmail,
  gm.user_id,
  gm.employee_id,
  e.last_name,
  e.first_name,
  CASE 
    WHEN e.gmail IS NULL OR e.gmail = '' OR e.gmail = 'EMPTY' OR e.gmail = 'NULL' THEN '未設定'
    ELSE '設定済み'
  END as gmail_status
FROM gmail_user_mapping gm
LEFT JOIN employees e ON gm.employee_id = e.employee_id
ORDER BY gm.gmail; 