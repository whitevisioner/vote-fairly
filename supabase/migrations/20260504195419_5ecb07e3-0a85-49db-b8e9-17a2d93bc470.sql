
INSERT INTO storage.buckets (id, name, public) VALUES ('candidate-photos', 'candidate-photos', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "candidate_photos_public_read" ON storage.objects FOR SELECT USING (bucket_id = 'candidate-photos');
CREATE POLICY "candidate_photos_admin_write" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'candidate-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "candidate_photos_admin_update" ON storage.objects FOR UPDATE USING (bucket_id = 'candidate-photos' AND public.has_role(auth.uid(), 'admin'));
CREATE POLICY "candidate_photos_admin_delete" ON storage.objects FOR DELETE USING (bucket_id = 'candidate-photos' AND public.has_role(auth.uid(), 'admin'));
