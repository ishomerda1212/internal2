-- Organizations table
CREATE TABLE IF NOT EXISTS organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  level INTEGER NOT NULL DEFAULT 1,
  type VARCHAR(50) NOT NULL DEFAULT 'department',
  representative_id UUID REFERENCES employees(id),
  parent_id UUID REFERENCES organizations(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX IF NOT EXISTS idx_organizations_level ON organizations(level);
CREATE INDEX IF NOT EXISTS idx_organizations_type ON organizations(type);

-- Enable Row Level Security (RLS)
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Create policies for organizations table
-- Allow all authenticated users to read organizations
CREATE POLICY "Allow authenticated users to read organizations" ON organizations
  FOR SELECT USING (auth.role() = 'authenticated');

-- Allow authenticated users to insert organizations
CREATE POLICY "Allow authenticated users to insert organizations" ON organizations
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Allow authenticated users to update organizations
CREATE POLICY "Allow authenticated users to update organizations" ON organizations
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Allow authenticated users to delete organizations
CREATE POLICY "Allow authenticated users to delete organizations" ON organizations
  FOR DELETE USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO organizations (name, level, type, parent_id) VALUES
  ('本社', 1, 'headquarters', NULL),
  ('営業部', 2, 'department', (SELECT id FROM organizations WHERE name = '本社')),
  ('開発部', 2, 'department', (SELECT id FROM organizations WHERE name = '本社')),
  ('人事部', 2, 'department', (SELECT id FROM organizations WHERE name = '本社')),
  ('営業1課', 3, 'section', (SELECT id FROM organizations WHERE name = '営業部')),
  ('営業2課', 3, 'section', (SELECT id FROM organizations WHERE name = '営業部')),
  ('フロントエンドチーム', 3, 'team', (SELECT id FROM organizations WHERE name = '開発部')),
  ('バックエンドチーム', 3, 'team', (SELECT id FROM organizations WHERE name = '開発部'))
ON CONFLICT DO NOTHING; 