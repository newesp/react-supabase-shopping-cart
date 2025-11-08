-- 啟用 RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public 使用者可以查詢所有商品
CREATE POLICY "Public can select products"
  ON public.products
  FOR SELECT
  TO public
  USING (true);

-- Admin 使用者可以新增/刪除/更新商品
create policy "Admin can insert products"
on "public"."products"
as PERMISSIVE
for ALL
to authenticated
using (
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
)
with check (
  (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)
);