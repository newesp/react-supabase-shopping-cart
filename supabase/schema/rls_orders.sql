ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin or owner can manage orders"
on "public"."orders"
as PERMISSIVE
for ALL
to public
using ( ((auth.uid() = user_id) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)))
with check ( ((auth.uid() = user_id) OR (((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text)));