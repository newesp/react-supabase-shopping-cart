create policy "Public Read Access"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'product-images'
);