-- ═══════════════════════════════════════════════════════════════════
-- PsicoApp — Supabase Storage: bucket "avatars"
-- Ejecutar UNA VEZ en el SQL Editor de Supabase
-- ═══════════════════════════════════════════════════════════════════

-- 1. Crear bucket público "avatars"
--    (public = las URLs son accesibles sin auth, ideal para avatares)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  2097152,                                    -- 2 MB máx por archivo (ya comprimido a JPEG)
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = true,
  file_size_limit    = 2097152,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];


-- 2. RLS: Lectura pública (cualquiera puede ver los avatares)
CREATE POLICY "avatars_public_read"
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );


-- 3. RLS: Solo el dueño puede subir/reemplazar su propio avatar
--    El archivo se llama {user_id}.jpg → auth.uid()::text = name
CREATE POLICY "avatars_owner_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND name = auth.uid()::text || '.jpg'
  );


-- 4. RLS: Solo el dueño puede actualizar su avatar
CREATE POLICY "avatars_owner_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND name = auth.uid()::text || '.jpg'
  );


-- 5. RLS: Solo el dueño puede eliminar su avatar
CREATE POLICY "avatars_owner_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND name = auth.uid()::text || '.jpg'
  );
