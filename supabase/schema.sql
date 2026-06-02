-- Enable UUID-OSSP extension for generating UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Categories Table
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to categories" ON categories FOR SELECT USING (true);

-- Hero Settings Table (single row for homepage hero)
CREATE TABLE hero_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title VARCHAR(500) NOT NULL DEFAULT 'Bienvenue',
  subtitle TEXT,
  button_text VARCHAR(255) DEFAULT 'Découvrir',
  button_link VARCHAR(500) DEFAULT '/categories',
  image_url TEXT,
  text_color VARCHAR(10) DEFAULT 'white' CHECK (text_color IN ('white', 'black')),
  title_size INTEGER DEFAULT 64 CHECK (title_size BETWEEN 24 AND 120),
  subtitle_size INTEGER DEFAULT 20 CHECK (subtitle_size BETWEEN 12 AND 48),
  button_size INTEGER DEFAULT 16 CHECK (button_size BETWEEN 12 AND 32),
  is_active BOOLEAN DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

ALTER TABLE hero_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read access to hero_settings" ON hero_settings FOR SELECT USING (true);

-- Products Table
CREATE TABLE products (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  image_url TEXT,
  images TEXT[] DEFAULT '{}',
  category VARCHAR(100),
  sizes TEXT[] DEFAULT '{}',
  colors TEXT[] DEFAULT '{}',
  color_images JSONB DEFAULT '{}'::jsonb,
  in_stock BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Orders Table (Cash on Delivery)
CREATE TABLE orders (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  phone_number VARCHAR(50) NOT NULL,
  wilaya VARCHAR(100) NOT NULL,
  commune VARCHAR(100) NOT NULL,
  address TEXT NOT NULL,
  total_amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending', -- pending, confirmed, shipped, delivered, cancelled
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Order Items Table
CREATE TABLE order_items (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  size VARCHAR(50),
  color VARCHAR(50),
  price DECIMAL(10, 2) NOT NULL
);

-- Setup RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Product Policies
CREATE POLICY "Allow public read access to products" 
ON products FOR SELECT USING (true);

CREATE POLICY "Allow admin insert products" ON products FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update products" ON products FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete products" ON products FOR DELETE USING (auth.role() = 'authenticated');

-- Order Policies
CREATE POLICY "Allow public insert to orders" 
ON orders FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public insert to order_items" 
ON order_items FOR INSERT WITH CHECK (true);

-- Admin Order Policies
CREATE POLICY "Allow admin read orders" ON orders FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin update orders" ON orders FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin delete orders" ON orders FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow admin read order_items" ON order_items FOR SELECT USING (auth.role() = 'authenticated');
