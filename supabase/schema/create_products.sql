CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamp DEFAULT now(),
  name text NOT NULL,
  description text,
  price numeric NOT NULL CHECK (price >= 0),
  featured boolean DEFAULT false,
  image_urls text[],
  updated_at timestamp DEFAULT now()
);