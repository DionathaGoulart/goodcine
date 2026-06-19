-- =============================================================================
-- Trigger: handle_new_user
-- Cria automaticamente um registro em public.profiles sempre que um novo
-- usuário é inserido em auth.users (cadastro via email/senha ou OAuth).
--
-- IMPORTANTE: Roda com SECURITY DEFINER (service_role), portanto bypassa RLS.
-- Execute este SQL no Supabase SQL Editor:
-- https://supabase.com/dashboard/project/agfsfqgbnkmlsbnatgjw/sql/new
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username)
  VALUES (
    NEW.id,
    -- Usa o username passado nos metadata do signUp, ou gera um a partir do email
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

-- Trigger que chama a função sempre que um usuário é criado
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
