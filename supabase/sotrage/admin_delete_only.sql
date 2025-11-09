create policy "Admin Delete Only"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'product-images'
  and (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
);