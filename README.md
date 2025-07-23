# CRM3 - 社用車管理システム

## 環境設定

### Supabase接続設定

このプロジェクトはSupabaseを使用しています。以下の手順で環境変数を設定してください：

1. `env.example`ファイルをコピーして`.env`ファイルを作成：
```bash
cp env.example .env
```

2. `.env`ファイルを編集して、実際のSupabase設定値を入力：

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Optional: Service Role Key (for server-side operations only)
# VITE_SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration (if needed)
# VITE_DATABASE_URL=your_database_connection_string

# Authentication Configuration
VITE_AUTH_REDIRECT_URL=http://localhost:5173/auth/callback

# Environment
NODE_ENV=development
```

### Supabase設定値の取得方法

1. [Supabase](https://supabase.com)にログイン
2. プロジェクトを作成または選択
3. Settings > API から以下を取得：
   - Project URL
   - anon/public key

### データベースセットアップ

1. Supabaseダッシュボードで「SQL Editor」を開く
2. `database/schema.sql`ファイルの内容をコピーして実行
3. これにより以下のテーブルが作成されます：
   - `organizations` - 組織テーブル
   - `employees` - 社員テーブル
   - `transfer_history` - 異動履歴テーブル
   - サンプルデータも自動的に挿入されます

## 開発サーバーの起動

```bash
npm install
npm run dev
```

## ビルド

```bash
npm run build
```
