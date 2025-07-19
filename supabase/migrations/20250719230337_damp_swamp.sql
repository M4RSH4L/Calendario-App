/*
  # Create products and sales tracking tables

  1. New Tables
    - `products`
      - `id` (uuid, primary key)
      - `name` (text)
      - `description` (text)
      - `price` (decimal)
      - `image_url` (text)
      - `platform` (text) - mercadolibre, tiendanube, shopify
      - `platform_id` (text) - ID del producto en la plataforma
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)
    
    - `sales`
      - `id` (uuid, primary key)
      - `product_id` (uuid, foreign key)
      - `quantity` (integer)
      - `total_amount` (decimal)
      - `sale_date` (date)
      - `platform` (text)
      - `user_id` (uuid, foreign key)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own data
</sql>

-- Create products table
CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text DEFAULT '',
  price decimal(10,2) NOT NULL DEFAULT 0,
  image_url text DEFAULT '',
  platform text NOT NULL CHECK (platform IN ('mercadolibre', 'tiendanube', 'shopify')),
  platform_id text NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create sales table
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 1,
  total_amount decimal(10,2) NOT NULL DEFAULT 0,
  sale_date date NOT NULL DEFAULT CURRENT_DATE,
  platform text NOT NULL CHECK (platform IN ('mercadolibre', 'tiendanube', 'shopify')),
  user_id uuid NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;

-- Create policies for products
CREATE POLICY "Users can view their own products"
  ON products
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own products"
  ON products
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own products"
  ON products
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own products"
  ON products
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create policies for sales
CREATE POLICY "Users can view their own sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_user_id ON products(user_id);
CREATE INDEX IF NOT EXISTS idx_products_platform ON products(platform);
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_product_id ON sales(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(sale_date);
CREATE INDEX IF NOT EXISTS idx_sales_platform ON sales(platform);