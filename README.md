# CineSync 🎬✨

[![License: Custom](https://img.shields.io/badge/License-Custom-red.svg)](#license)

CineSync é uma plataforma premium e moderna para amantes de cinema e séries. Ele permite buscar mídias através da API do TMDB, organizar o que você está assistindo em listas personalizadas, escrever reviews, se conectar com amigos e receber recomendações inteligentes baseadas no seu perfil de gosto.

## 🚀 Tecnologias

O projeto é dividido em três grandes módulos, adotando uma arquitetura de alta performance e código limpo:

### 1. Web App
- **Framework:** Next.js 16.2 (App Router)
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS v4 + UI Components customizados
- **Animações:** `motion/react` + View Transitions API nativa para fluidez de navegação.
- **Estado/Data Fetching:** Zustand + TanStack Query

### 2. Mobile App (Android)
- **Linguagem:** Kotlin
- **UI Toolkit:** Jetpack Compose
- **Arquitetura:** Clean Architecture + MVVM
- **Injeção de Dependências:** Dagger Hilt
- **Imagens:** Coil

### 3. Backend (Supabase)
- **Banco de Dados:** PostgreSQL hospedado no Supabase
- **Autenticação:** Supabase Auth (E-mail / OAuth)
- **Segurança:** RLS (Row Level Security) e controle de RBAC para Painel de Admin.
- **Serverless:** Edge Functions rodando Deno/TypeScript para os algoritmos de recomendação.

---

## 🛠️ Como Rodar Localmente

Nós preparamos um guia detalhado, passo a passo, para você configurar o banco de dados, chaves de API e rodar a aplicação. 

👉 Consulte o arquivo [SETUP.md](./SETUP.md) para instruções completas.

---

## 🛡️ Principais Funcionalidades
- **Autenticação Segura:** Sessão interceptada via Middleware em Edge Runtime (Cookies HttpOnly).
- **Integração TMDB:** Busca super rápida em tempo real (com debouncing) e visualização rica.
- **Social:** Conexão com amigos e sistema de reviews em painel modal interativo com spring physics.
- **Recomendações Inteligentes:** Motor híbrido no backend que analisa o "Taste Profile" dos seus Likes e Assistidos.
- **Painel Administrativo:** Dashboard seguro com moderação de conteúdo (RBAC `admin`).

---

## 📄 Licença

**Atenção:** Este projeto está sob uma licença restrita.

O uso, estudo, cópia e modificação do código fonte para fins puramente **pessoais e educacionais** são permitidos. 

⚠️ **É expressamente proibido o uso comercial deste software sem a autorização prévia por escrito.**

Para mais detalhes sobre as restrições e ausência de garantias legais, veja o arquivo [LICENSE](./LICENSE).
