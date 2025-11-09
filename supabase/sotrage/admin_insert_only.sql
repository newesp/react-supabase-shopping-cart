create policy "Admin Insert Only"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'product-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);