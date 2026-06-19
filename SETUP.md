# CineSync - Guia de Configuração e Execução 🎬

Este guia contém todo o passo a passo necessário para configurar as variáveis de ambiente, o banco de dados Supabase, a API do TMDB e como rodar os módulos Web e Android localmente.

---

## 1. Pré-requisitos
- **Node.js** (v18 ou superior)
- Conta gratuita no [Supabase](https://supabase.com/)
- Conta no [TMDB (The Movie Database)](https://www.themoviedb.org/) para gerar a API Key
- **Android Studio** (para rodar o módulo Android)
- Supabase CLI (opcional, para fazer o deploy das Edge Functions)

---

## 2. Configuração do Backend (Supabase)

### 2.1 Criando o Projeto
1. Acesse o Supabase e crie um novo projeto.
2. Anote sua **Project URL** e a **anon/public key** (encontradas em *Project Settings* > *API*).
3. Vá em *Authentication* > *Providers* e certifique-se de que o provedor **Email** está habilitado.
4. (Opcional para testes) Desative a opção *Confirm email* em *Auth* > *Providers* > *Email*, para não precisar validar e-mail na hora de testar localmente.

### 2.2 Rodando o Banco de Dados (Migrations)
Você precisa criar as tabelas e políticas de segurança RLS:

1. Abra o painel do seu projeto no Supabase, e vá na aba **SQL Editor**.
2. Clique em *New Query*.
3. Copie todo o conteúdo do arquivo que geramos em `supabase/schema.sql` e cole no editor.
4. Clique no botão **Run** para executar. Isso criará todas as tabelas (profiles, media, user_media, reviews, etc), triggers de autenticação e regras de segurança!

### 2.3 Edge Functions (Motor de Recomendações)
As funções serverless rodam em Deno na nuvem do Supabase:
1. Instale a [Supabase CLI](https://supabase.com/docs/guides/cli).
2. Abra o terminal na raiz do projeto (`movie/`) e faça login:
   ```bash
   supabase login
   supabase link --project-ref <seu-project-ref-aqui>
   ```
3. Faça o deploy das funções construídas no Bloco 11:
   ```bash
   supabase functions deploy update-taste-profile
   supabase functions deploy generate-recommendations
   ```

---

## 3. Configuração do Módulo Web (Next.js)

### 3.1 Variáveis de Ambiente
Navegue até a pasta web:
```bash
cd cinesync-web
```
Crie um arquivo chamado `.env.local` na raiz desta pasta e preencha com suas chaves:

```env
# Chaves públicas do Supabase (Project Settings > API)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJh...

# TMDB API (Crie em themoviedb.org > Configurações > API)
# Você deve usar o token do tipo "API Read Access Token (v4 auth)" (começa com eyJ)
TMDB_API_TOKEN=eyJhbG...

# Supabase Service Role (Para o Prisma/Server-Side se precisar bypassar o RLS)
SUPABASE_SERVICE_ROLE_KEY=eyJh...
```

### 3.2 Prisma ORM (Seção Types/Server)
No Bloco 1 configuramos o Prisma. Se você quiser que o Prisma gere as tipagens em TypeScript:
```bash
npm install
npx prisma generate
```

### 3.3 Rodando o Projeto Web
Com as dependências instaladas e o `.env.local` configurado:
```bash
npm run dev
```
Abra o navegador em [http://localhost:3000](http://localhost:3000). A aplicação Next.js já estará funcionando!

---

## 4. Configuração do Módulo Android (Kotlin + Compose)

### 4.1 Configurando o Supabase no App
O app nativo não enxerga o `.env.local` do Next.js. Para conectar o App ao seu Supabase, você precisa inserir as chaves na inicialização do client.

1. Navegue até: `cinesync-android/app/src/main/java/com/cinesync/app/data/api/SupabaseService.kt` (Você vai criar este arquivo quando implementar as chamadas de rede com Retrofit/Ktor/Supabase-kt).
2. Crie um objeto seguro (ex: `Constants.kt`) ou injete via Build Config:
```kotlin
object Constants {
    const val SUPABASE_URL = "https://xxxxxxxxxxxx.supabase.co"
    const val SUPABASE_ANON_KEY = "eyJh..."
}
```

### 4.2 Rodando o App
1. Abra o **Android Studio**.
2. Clique em **File > Open...** e aponte para a pasta `cinesync-android/`.
3. Aguarde o **Gradle Sync** terminar de processar (ele vai baixar o Jetpack Compose, Hilt, Coil, etc).
4. No topo, selecione um emulador ativo (Virtual Device) ou conecte o seu smartphone Android via cabo.
5. Clique no botão de ▶️ **Run 'app'** ou aperte `Shift + F10`.

---

## 5. Dica Mágica para testar o Painel Admin

1. Inicie o Web App e crie uma conta acessando `http://localhost:3000/register`.
2. Vá até o painel do Supabase, no menu **Table Editor**.
3. Abra a tabela `profiles`.
4. Procure a linha referente ao seu usuário e altere o valor da coluna `role` de `user` para `admin`.
5. Volte para o site e acesse a URL `http://localhost:3000/admin` (ou clique no link oculto). O painel de dashboard com as estatísticas aparecerá protegido nativamente.

Happy Coding! 🚀
