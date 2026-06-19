-- 1. Alterar tabela user_media
ALTER TABLE public.user_media ADD COLUMN IF NOT EXISTS rating_reaction TEXT;
ALTER TABLE public.user_media ADD COLUMN IF NOT EXISTS started_at TIMESTAMPTZ;
ALTER TABLE public.user_media ADD COLUMN IF NOT EXISTS finished_at TIMESTAMPTZ;

-- Migrar a avaliação antiga (liked) para o novo formato de reação (opcional)
-- Se liked for TRUE, vira 'good'. Se FALSE, vira 'bad'.
UPDATE public.user_media 
SET rating_reaction = CASE 
  WHEN liked = true THEN 'good'
  WHEN liked = false THEN 'bad'
  ELSE null
END
WHERE rating_reaction IS NULL AND liked IS NOT NULL;

-- 2. Criar a nova tabela watch_history
CREATE TABLE IF NOT EXISTS public.watch_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_media_id UUID NOT NULL REFERENCES public.user_media(id) ON DELETE CASCADE,
  season_number INTEGER,
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  is_rewatch BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS para watch_history
ALTER TABLE public.watch_history ENABLE ROW LEVEL SECURITY;

-- Policy: Usuário pode fazer CRUD apenas no seu próprio histórico
-- Como watch_history está ligado a user_media, precisamos fazer um JOIN na policy,
-- ou de forma mais simples (já que é só RLS para o usuário logado):
CREATE POLICY "Users can manage own watch_history." ON public.watch_history
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_media
      WHERE id = watch_history.user_media_id
      AND user_id = auth.uid()
    )
  );
