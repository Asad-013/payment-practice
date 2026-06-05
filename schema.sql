-- schema.sql
-- Run this in your Supabase SQL Editor to initialize the database schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Users table (linked to Supabase auth.users)
create table public.users (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  role text default 'customer' check (role in ('admin', 'customer')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Products table
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price numeric(10, 2) not null check (price >= 0),
  stock integer not null default 0 check (stock >= 0),
  image_url text,
  is_active boolean default true not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Orders table
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  shipping_address text not null,
  total_amount numeric(10, 2) not null check (total_amount >= 0),
  status text default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Order Items table
create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete restrict not null,
  quantity integer not null check (quantity > 0),
  price numeric(10, 2) not null check (price >= 0)
);

-- 5. Transactions table
create table public.transactions (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  payment_method text not null, -- e.g., 'bkash'
  transaction_id text unique,   -- UddoktaPay transaction ID (provided after payment callback)
  payment_reference text unique not null, -- Unique internal reference (invoice id)
  amount numeric(10, 2) not null check (amount >= 0),
  status text default 'pending' check (status in ('pending', 'completed', 'failed')),
  raw_webhook_payload jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Indexes for optimal querying
create index idx_orders_status on public.orders(status);
create index idx_transactions_reference on public.transactions(payment_reference);
create index idx_products_active on public.products(is_active);

-- Enable Row Level Security (RLS) on critical tables
alter table public.users enable row level security;
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.transactions enable row level security;

-- Setup RLS Policies

-- Users policies
create policy "Allow users to read their own user record"
  on public.users for select
  using (auth.uid() = id);

-- Products policies
create policy "Allow public to read active products"
  on public.products for select
  using (is_active = true);

create policy "Allow admin to manage products"
  on public.products for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- Orders policies
create policy "Allow order creation by anyone (public checkout)"
  on public.orders for insert
  with check (true);

create policy "Allow admin to read/write all orders"
  on public.orders for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- Order Items policies
create policy "Allow public to insert order items"
  on public.order_items for insert
  with check (true);

create policy "Allow admin to read/write order items"
  on public.order_items for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- Transactions policies
create policy "Allow transactions insertion"
  on public.transactions for insert
  with check (true);

create policy "Allow admin to read/write transactions"
  on public.transactions for all
  using (
    exists (
      select 1 from public.users
      where users.id = auth.uid() and users.role = 'admin'
    )
  );

-- 6. RPC Function for Atomic Stock Deduction and Order Update (Industry Standard)
create or replace function public.process_completed_payment(
  p_payment_reference text,
  p_transaction_id text,
  p_raw_payload jsonb
)
returns jsonb
language plpgsql
security definer -- bypasses RLS for system operations
as $$
declare
  v_transaction record;
  v_item record;
  v_product_stock integer;
  v_error_message text;
begin
  -- 1. Get and lock transaction row to prevent concurrent webhook execution
  select * into v_transaction 
  from public.transactions 
  where payment_reference = p_payment_reference 
  for update;

  if not found then
    return json_build_object('success', false, 'message', 'Transaction reference not found');
  end if;

  -- 2. Check if already completed (Duplicate payment protection)
  if v_transaction.status = 'completed' then
    return json_build_object('success', true, 'message', 'Transaction already completed previously');
  end if;

  -- 3. Loop through order items and verify stock availability before reducing
  for v_item in 
    select product_id, quantity 
    from public.order_items 
    where order_id = v_transaction.order_id
  loop
    select stock into v_product_stock 
    from public.products 
    where id = v_item.product_id 
    for update;

    if v_product_stock < v_item.quantity then
      -- Mark transaction as failed due to stock out
      update public.transactions 
      set status = 'failed', 
          raw_webhook_payload = p_raw_payload,
          updated_at = now()
      where id = v_transaction.id;
      
      update public.orders 
      set status = 'cancelled', 
          updated_at = now()
      where id = v_transaction.order_id;

      return json_build_object('success', false, 'message', 'Out of stock for product ' || v_item.product_id);
    end if;

    -- Reduce stock
    update public.products 
    set stock = stock - v_item.quantity,
        updated_at = now()
    where id = v_item.product_id;
  end loop;

  -- 4. Update transaction status
  update public.transactions 
  set status = 'completed',
      transaction_id = p_transaction_id,
      raw_webhook_payload = p_raw_payload,
      updated_at = now()
  where id = v_transaction.id;

  -- 5. Update order status
  update public.orders 
  set status = 'processing',
      updated_at = now()
  where id = v_transaction.order_id;

  return json_build_object('success', true, 'message', 'Order processed successfully');
exception
  when others then
    get stacked diagnostics v_error_message = message_text;
    return json_build_object('success', false, 'message', 'Database error: ' || v_error_message);
end;
$$;

