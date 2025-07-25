-- Supabase Admin APIを使用するための設定
-- 注意: この設定は本番環境では適切な権限管理が必要です

-- サービスロールキーを使用するための設定
-- 実際の実装では、環境変数でSUPABASE_SERVICE_ROLE_KEYを設定する必要があります

-- 権限チェック関数（Admin API使用時）
CREATE OR REPLACE FUNCTION check_employee_permission(employee_id VARCHAR, required_permission TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  -- 社員に権限があるかチェック
  RETURN EXISTS (
    SELECT 1 
    FROM employee_permissions ep
    WHERE ep.employee_id = check_employee_permission.employee_id
    AND ep.permission_name = required_permission
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Authユーザー作成のためのヘルパー関数
CREATE OR REPLACE FUNCTION create_auth_user_for_employee(
  employee_email VARCHAR,
  employee_password VARCHAR,
  employee_id VARCHAR
)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- この関数はSupabase Admin APIを使用するため、
  -- 実際の実装では適切な権限チェックが必要です
  
  -- 社員が存在するかチェック
  IF NOT EXISTS (SELECT 1 FROM employees WHERE employee_id = create_auth_user_for_employee.employee_id) THEN
    RAISE EXCEPTION 'Employee not found: %', employee_id;
  END IF;
  
  -- 成功レスポンス（実際のAuthユーザー作成はフロントエンドで行う）
  result := json_build_object(
    'success', true,
    'message', 'Auth user creation initiated',
    'employee_id', employee_id,
    'email', employee_email
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Authユーザー無効化のためのヘルパー関数
CREATE OR REPLACE FUNCTION disable_auth_user_for_employee(employee_email VARCHAR)
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  -- 成功レスポンス（実際のAuthユーザー無効化はフロントエンドで行う）
  result := json_build_object(
    'success', true,
    'message', 'Auth user disable initiated',
    'email', employee_email
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 