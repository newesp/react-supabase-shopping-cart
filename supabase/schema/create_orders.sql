CREATE TABLE public.orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL, 
  status text DEFAULT '已成立',
  items jsonb,
  total numeric,
  created_at timestamp DEFAULT now()
);