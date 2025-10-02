-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum for tenant status
CREATE TYPE tenant_status AS ENUM ('active', 'inactive', 'pending');

-- Create apartments table
CREATE TABLE apartments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_number VARCHAR(20) NOT NULL UNIQUE,
  floor INTEGER,
  square_meters DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tenants table
CREATE TABLE tenants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(50),
  move_in_date DATE NOT NULL,
  move_out_date DATE,
  monthly_rent DECIMAL(10,2) NOT NULL DEFAULT 0,
  status tenant_status DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create utility prices table
CREATE TABLE utility_prices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  water_price_per_unit DECIMAL(10,4) NOT NULL DEFAULT 0,
  electricity_price_per_unit DECIMAL(10,4) NOT NULL DEFAULT 0,
  gas_price DECIMAL(10,2) NOT NULL DEFAULT 0,
  monthly_maintenance_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_building_water DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_building_electricity DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(month, year)
);

-- Create utility consumption table
CREATE TABLE utility_consumption (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  apartment_id UUID REFERENCES apartments(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  water_consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  electricity_consumption DECIMAL(10,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(apartment_id, month, year)
);

-- Create billing records table
CREATE TABLE billing_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  rent_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  water_individual DECIMAL(10,2) NOT NULL DEFAULT 0,
  water_shared DECIMAL(10,2) NOT NULL DEFAULT 0,
  electricity_individual DECIMAL(10,2) NOT NULL DEFAULT 0,
  electricity_shared DECIMAL(10,2) NOT NULL DEFAULT 0,
  gas_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  maintenance_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
  total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  paid_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  payment_date DATE,
  days_occupied INTEGER NOT NULL DEFAULT 30,
  total_days_in_month INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(tenant_id, month, year)
);

-- Enable Row Level Security
ALTER TABLE apartments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE utility_consumption ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_records ENABLE ROW LEVEL SECURITY;

-- Create policies for authenticated users (admin access)
CREATE POLICY "Enable all operations for authenticated users" ON apartments
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON tenants
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON utility_prices
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON utility_consumption
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Enable all operations for authenticated users" ON billing_records
  FOR ALL USING (auth.role() = 'authenticated');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_apartments_updated_at BEFORE UPDATE ON apartments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tenants_updated_at BEFORE UPDATE ON tenants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utility_prices_updated_at BEFORE UPDATE ON utility_prices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_utility_consumption_updated_at BEFORE UPDATE ON utility_consumption
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_billing_records_updated_at BEFORE UPDATE ON billing_records
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert some sample data
INSERT INTO apartments (apartment_number, floor, square_meters) VALUES
  ('A101', 1, 75.5),
  ('A102', 1, 82.0),
  ('A201', 2, 75.5),
  ('A202', 2, 82.0),
  ('A301', 3, 90.0);

-- Insert utility prices for current month
INSERT INTO utility_prices (month, year, water_price_per_unit, electricity_price_per_unit, gas_price, monthly_maintenance_fee, total_building_water, total_building_electricity)
VALUES (
  EXTRACT(MONTH FROM CURRENT_DATE)::INTEGER,
  EXTRACT(YEAR FROM CURRENT_DATE)::INTEGER,
  2.5,
  0.15,
  45.00,
  150.00,
  500.00,
  800.00
);