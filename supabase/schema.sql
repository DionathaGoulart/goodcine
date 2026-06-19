-- Perfis de usuário (extende auth.users)
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  username    TEXT UNIQUE NOT NULL,
  avatar_url  TEXT,
  bio         TEXT,
  role        TEXT DEFAULT 'user', -- 'user' | 'admin'
  is_banned   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Mídia (filmes e séries)
CREATE TABLE media (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tmdb_id         INTEGER,            -- null se customizado
  type            TEXT NOT NULL,      -- 'movie' | 'series'
  title           TEXT NOT NULL,
  overview        TEXT,
  poster_url      TEXT,
  backdrop_url    TEXT,
  genres          TEXT[],
  release_year    INTEGER,
  is_custom       BOOLEAN DEFAULT false,
  custom_status   TEXT DEFAULT 'approved', -- 'pending'|'approved'|'rejected'
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- Lista pessoal do usuário
CREATE TABLE user_media (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id    UUID REFERENCES media(id) ON DELETE CASCADE,
  status      TEXT NOT NULL, -- 'watching'|'watched'|'want_to_watch'
  liked       BOOLEAN,       -- true=like, false=dislike, null=sem opinião
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, media_id)
);

-- Reviews
CREATE TABLE reviews (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id    UUID REFERENCES media(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  rating      SMALLINT CHECK (rating >= 1 AND rating <= 10),
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, media_id)
);

-- Perfil de gostos (alimentado pelo algoritmo)
CREATE TABLE user_taste_profile (
  user_id       UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  genre_scores  JSONB DEFAULT '{}', -- { "Action": 0.8, "Drama": 0.3 }
  tag_scores    JSONB DEFAULT '{}', -- keywords do TMDB
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- Recomendações geradas
CREATE TABLE recommendations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  media_id    UUID REFERENCES media(id) ON DELETE CASCADE,
  score       FLOAT NOT NULL,
  reason      TEXT, -- ex: "Baseado no seu gosto por Ação"
  seen        BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Amizades
CREATE TABLE friendships (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  addressee   UUID REFERENCES profiles(id) ON DELETE CASCADE,
  status      TEXT DEFAULT 'pending', -- 'pending'|'accepted'|'blocked'
  created_at  TIMESTAMPTZ DEFAULT now(),
  UNIQUE(requester, addressee)
);

-- Listas compartilhadas
CREATE TABLE shared_lists (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id    UUID REFERENCES profiles(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  description TEXT,
  is_public   BOOLEAN DEFAULT false,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE shared_list_items (
  list_id     UUID REFERENCES shared_lists(id) ON DELETE CASCADE,
  media_id    UUID REFERENCES media(id) ON DELETE CASCADE,
  added_by    UUID REFERENCES profiles(id),
  added_at    TIMESTAMPTZ DEFAULT now(),
  PRIMARY KEY (list_id, media_id)
);

-- Log de moderação
CREATE TABLE moderation_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id    UUID REFERENCES profiles(id),
  target_user UUID REFERENCES profiles(id),
  media_id    UUID REFERENCES media(id),
  action      TEXT NOT NULL, -- 'approve'|'reject'|'ban'|'unban'
  reason      TEXT,
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_taste_profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE friendships ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_list_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_log ENABLE ROW LEVEL SECURITY;

-- Políticas RLS

-- profiles: leitura pública, escrita só pelo próprio user
CREATE POLICY "Public profiles are viewable by everyone." ON profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile." ON profiles FOR UPDATE USING (auth.uid() = id);

-- media: leitura pública, insert autenticado, update/delete pelo criador ou admin
CREATE POLICY "Media is viewable by everyone." ON media FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert media." ON media FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "Users can update own media." ON media FOR UPDATE USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Users can delete own media." ON media FOR DELETE USING (auth.uid() = created_by OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- user_media: CRUD só pelo próprio user
CREATE POLICY "Users can manage own user_media." ON user_media FOR ALL USING (auth.uid() = user_id);

-- reviews: leitura pública, CRUD pelo próprio user
CREATE POLICY "Reviews are viewable by everyone." ON reviews FOR SELECT USING (true);
CREATE POLICY "Users can manage own reviews." ON reviews FOR ALL USING (auth.uid() = user_id);

-- user_taste_profile: gerenciamento interno e visualização própria
CREATE POLICY "Users can view own taste profile." ON user_taste_profile FOR SELECT USING (auth.uid() = user_id);

-- recommendations: visível só pelo próprio user
CREATE POLICY "Users can view own recommendations." ON recommendations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own recommendations (e.g. seen status)." ON recommendations FOR UPDATE USING (auth.uid() = user_id);

-- friendships: visível pelos dois lados da relação
CREATE POLICY "Users can view own friendships." ON friendships FOR SELECT USING (auth.uid() = requester OR auth.uid() = addressee);
CREATE POLICY "Users can insert friendships." ON friendships FOR INSERT WITH CHECK (auth.uid() = requester);
CREATE POLICY "Users can update own friendships." ON friendships FOR UPDATE USING (auth.uid() = requester OR auth.uid() = addressee);

-- shared_lists: públicas visíveis por todos, privadas só pelos membros
CREATE POLICY "Public lists are viewable by everyone." ON shared_lists FOR SELECT USING (is_public = true);
CREATE POLICY "Owner can view own lists." ON shared_lists FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Owner can manage own lists." ON shared_lists FOR ALL USING (auth.uid() = owner_id);

-- shared_list_items: visualização segue a lista, adição por quem tem permissão
CREATE POLICY "Anyone can view items of public lists." ON shared_list_items FOR SELECT USING (EXISTS (SELECT 1 FROM shared_lists WHERE id = list_id AND (is_public = true OR owner_id = auth.uid())));
CREATE POLICY "Owner can manage list items." ON shared_list_items FOR ALL USING (EXISTS (SELECT 1 FROM shared_lists WHERE id = list_id AND owner_id = auth.uid()));

-- moderation_log: visível só por admins
CREATE POLICY "Admins can view moderation log." ON moderation_log FOR SELECT USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
CREATE POLICY "Admins can insert moderation log." ON moderation_log FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));
