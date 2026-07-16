# ClínicaJá — Resumo de arquitetura e construção (frontend + backend)

Este documento é apenas para leitura rápida (não é para integrar ao código).

## 1) Visão geral do projeto
O projeto é uma aplicação **Expo (React Native) com Expo Router** (frontend) que conversa com um **backend Express (TypeScript)**. O backend usa o **Supabase**:
- **Auth** (login/registro)
- **Tabelas** para perfis de **pacientes**, **médicos** e **consultas**.

O frontend organiza as telas no diretório `app/` e separa lógica de rede em `services/`.

---

## 2) Frontend (Expo / Expo Router)

### 2.1 Rotas e navegação
- `app/_layout.tsx`: define o “root layout” usando `ThemeProvider` e um `Stack` do `expo-router`.
  - Mostra as rotas principais:
    - `(tabs)` (sem header)
    - `medico`, `cliente`
    - `modal` (apresentação modal)

- `app/(tabs)/_layout.tsx`: configura o `Tabs` com:
  - ícones (com `IconSymbol`)
  - tabBar com botão com haptics (`HapticTab`)
  - estilo: `tabBarStyle.display = 'none'` (essa configuração depende do comportamento esperado do layout do app).

### 2.2 Telas de cadastro
As telas de cadastro são formulários controlados por `useState`:

- `app/cadastro-paciente.tsx`
  - Campos: nome, CPF, nascimento, e-mail, telefone, sexo, endereço (CEP/rua/número...), senha.
  - Aplica máscaras em campos (ex: CPF/CEP/data/telefone) via `utils/masks.ts`.
  - Valida campos (CPF, e-mail, data, telefone, CEP) via `utils/validators.ts`.
  - Ao salvar, chama `pacientesService.cadastrar(...)` e exibe `Alert` de sucesso/erro.

- `app/cadastro-medico.tsx`
  - Campos: nome, CRM, UF CRM, especialidade, telefone, e-mail, clínica, senha.
  - Usa `FormDropdown` para **UF** e **especialidade**.
  - Valida e então chama `medicosService.cadastrar(...)`.

### 2.3 Componentes reutilizáveis
- `components/form/FormInput.tsx`
  - Campo de input com `label`, ícone, mensagem de erro e suporte a `mask`.
  - Ajusta estilos por tema (dark/light) e foco/erro.

- `components/form/FormDropdown.tsx`
  - Dropdown com modal para selecionar opções.
  - Mantém o estado via `selectedValue` e `onValueChange`.

### 2.4 Serviços e chamadas HTTP
- `services/api.ts`
  - Define `BASE_URL`.
  - Preferência: `process.env.EXPO_PUBLIC_API_URL`.
  - Fallback: `http://192.168.100.69:3000/api`.
  - Exporta `apiRequest(endpoint, method, body, token)`
    - injeta `Content-Type: application/json`
    - se `token` existir: `Authorization: Bearer <token>`
    - parseia `response.json()`
    - retorna `{ ok, data?, error? }`

- `services/pacientesService.ts`
  - Função principal: `cadastrar(paciente)` com fluxo em 3 passos:
    1. `POST /auth/register` (Supabase Auth)
    2. `POST /auth/login` (para obter `access_token`)
    3. `POST /pacientes` com o token para criar o perfil na tabela
  - Usa `withTimeout` (timeout de ~10s) para evitar travas.

- `services/medicosService.ts`
  - Similar ao pacientes, com fluxo:
    1. `POST /auth/register`
    2. `POST /auth/login`
    3. `POST /medicos` com token
  - Também possui `listar(token)` e `buscarMeuPerfil(token)`.

### 2.5 Tipos e utilitários
- Tipos:
  - `types/paciente.ts` e `types/medico.ts`
  - definem os campos esperados no frontend.

- Utilitários:
  - `utils/masks.ts`: máscaras de CPF, telefone, CEP e data.
  - `utils/validators.ts`: valida CPF (algoritmo), valida e-mail, valida data (DD/MM/AAAA) e telefone/CEP.

---

## 3) Backend (Express + TypeScript)

### 3.1 Scripts e scripts de execução
No `backend/package.json`:
- `dev`: `tsx watch src/index.ts`
- `build`: `tsc`
- `start`: `node dist/index.js`

Ou seja:
- desenvolvimento usa TypeScript em modo watch
- produção usa build em `dist/`.

### 3.2 Supabase (configuração)
- `backend/src/config/supabaseClient.ts`
  - Carrega `.env`.
  - Cria:
    - `supabase` (anon key para operações necessárias)
    - `supabaseAdmin` (service role key) *apenas se configurado*

### 3.3 Middleware de autenticação
- `backend/src/middlewares/authMiddleware.ts` (não foi lido aqui no detalhe, mas é o que protege rotas)
  - Verifica token
  - injeta `req.token` e `req.user` (usado nos controllers)
  - impede acesso sem autenticação.

### 3.4 Cliente “escopado” ao token
- `backend/src/config/scopedClient.ts`
  - Responsável por criar um client Supabase “com RLS efetivo”, usando o token do usuário.

---

## 4) Controllers e rotas

### 4.1 AuthController
- `backend/src/controllers/authController.ts`
  - `register(req, res)`:
    - recebe `{ email, password }`
    - se Supabase estiver configurado:
      - se não houver `supabaseAdmin`:
        - usa `publicClient.auth.signUp`
        - trata o erro de `email rate limit exceeded` retornando **HTTP 429** e mensagem clara
      - se houver `supabaseAdmin`:
        - torna o registro “idempotente”:
          1. lista usuários (admin)
          2. se achar usuário com mesmo e-mail:
             - faz login com password (public)
             - retorna sessão
          3. se não existir:
             - cria usuário (admin) com `email_confirm: true`
             - faz login e retorna sessão
    - trata `email rate limit exceeded` (regex) e retorna payload padronizado

  - `login(req, res)`:
    - `supabase.auth.signInWithPassword({ email, password })`
    - se erro de e-mail não confirmado: retorna HTTP 401 com código `email_not_confirmed`
    - sucesso retorna `session` e `user`.

- `backend/src/routes/authRoutes.ts`
  - `POST /auth/register` → `register`
  - `POST /auth/login` → `login`

### 4.2 PacientesController
- `backend/src/controllers/pacienteController.ts`
  - `createPaciente`:
    - requer `req.token`
    - cria registro em `pacientes` com `user_id` = `req.user.id`
    - campos como `nome`, `cpf`, `data_nascimento`, `email`, `telefone`, `sexo`, `cep`, `endereco`, etc.

  - `getPacienteMe`:
    - busca `pacientes` filtrando `user_id` (RLS também ajuda)

- `backend/src/routes/pacienteRoutes.ts`
  - todas as rotas usam `authMiddleware`
  - `POST /pacientes` → `createPaciente`
  - `GET /pacientes/me` → `getPacienteMe`

### 4.3 MedicoController
- `backend/src/controllers/medicoController.ts`
  - `createMedico`:
    - insere `medicos` com `user_id` = `req.user.id`
    - campos: `nome`, `crm`, `uf_crm`, `especialidade`, `telefone`, `email`, `clinica`, `foto_url`

  - `getMedicoMe`:
    - busca `medicos` por `user_id`

  - `getAllMedicos`:
    - lista médicos ordenados por `nome`
    - depende do RLS/permissions para autorizar SELECT para authenticated

- `backend/src/routes/medicoRoutes.ts`
  - usa `authMiddleware`
  - `POST /medicos`
  - `GET /medicos/me`
  - `GET /medicos` (listar)

### 4.4 ConsultaController
- `backend/src/controllers/consultaController.ts`
  - `createConsulta`:
    - exige autenticação
    - encontra `paciente_id` via `pacientes` filtrando `user_id`
    - cria registro em `consultas`:
      - `paciente_id`, `medico_id`, `data_hora`, `motivo`, `valor`, `observacoes`, `status: 'Pendente'`

  - `getConsultasPaciente`:
    - encontra `paciente.id` via `user_id`
    - consulta `consultas` e faz join com `medicos` (nome/especialidade/clinica)

  - `getConsultasMedico`:
    - encontra `medico.id`
    - consulta `consultas` e faz join com `pacientes` (nome/telefone/foto_url)

  - `updateStatusConsulta`:
    - valida status permitidos: `Pendente`, `Confirmada`, `Cancelada`, `Realizada`
    - atualiza por `id` (o RLS garante permissões)

  - `deleteConsulta`:
    - deleta por `id` (RLS garante permissões)

- `backend/src/routes/consultaRoutes.ts`
  - todas as rotas usam `authMiddleware`
  - `POST /consultas`
  - `GET /consultas/paciente`
  - `GET /consultas/medico`
  - `PATCH /consultas/:id/status`
  - `DELETE /consultas/:id`

---

## 5) Como é o ciclo completo “Cadastrar” (fim-a-fim)
1. Usuário preenche o formulário (frontend) e valida com `utils/validators.ts`.
2. Frontend chama `pacientesService.cadastrar` ou `medicosService.cadastrar`.
3. Service faz:
   - `POST /auth/register` no backend
   - `POST /auth/login` no backend para obter token
   - `POST /pacientes` ou `POST /medicos` com token para criar perfil
4. Backend autentica via middleware e usa um Supabase “escopado” ao token.
5. Supabase grava em tabelas sujeitas a RLS.
6. Backend retorna o objeto salvo; frontend mostra `Alert` e retorna para a tela anterior.

---

## 6) Notas rápidas sobre decisões importantes
- Timeout no frontend (`withTimeout`) para reduzir travas silenciosas.
- `register` no backend foi feito para tratar `email rate limit exceeded` com HTTP 429 e mensagem amigável.
- Quando existe `supabaseAdmin`, o `register` tenta ser idempotente (reaproveita sessão se o usuário já existir).
- Perfis de paciente/médico e consultas dependem do **RLS** para garantir que cada usuário só veja/altere o que deve.

