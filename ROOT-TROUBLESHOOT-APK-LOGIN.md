# ClínicaJá — Troubleshoot: APK “Não foi possível fazer login. Verifique sua conexão.”

## Causa mais provável (do código)
O texto exato aparece no `catch` de `services/api.ts`, então significa que o app **não conseguiu conectar** ao backend via `fetch`.

No seu `services/api.ts`, não existe fallback automático: ele exige `process.env.EXPO_PUBLIC_API_URL`.

Trecho lógico:
- `const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();`
- se não existir, `throw new Error('EXPO_PUBLIC_API_URL não está configurada...')`
- o `catch` devolve: **“Não foi possível conectar ao servidor. Verifique sua conexão.”**

✅ Logo: no APK, a variável `EXPO_PUBLIC_API_URL` provavelmente **não foi carregada na build** (ou ficou vazia/indefinida).

---

## 1) Verificar se a env está correta
1. Garanta que existe um valor real para `EXPO_PUBLIC_API_URL`.
   - Ex.: `http://SEU_HOST:3000/api` (ou a URL pública do túnel, se usar Cloudflared).
2. Confirme o formato:
   - se não terminar com `/api`, o código adiciona `'/api'`.

---

## 2) Rebuild obrigatório do APK
Variáveis `EXPO_PUBLIC_*` no Expo são “build-time”. Se você alterou depois de gerar o APK:
- pare o processo
- gere um novo build (APK novo)

---

## 3) Como setar no projeto (sem depender do ambiente global)
### Opção A — usando `.env` (recomendado)
1. Crie/ajuste um arquivo `.env` na raiz do projeto.
2. Adicione:
   ```env
   EXPO_PUBLIC_API_URL=http://SEU_HOST:3000
   ```
   (Pode colocar com ou sem `/api`; o `services/api.ts` normaliza.)
3. Reinicie o build do APK.

> Se você já usa `.env`, apenas confirme se o valor está correto e se o arquivo está sendo considerado no build.

---

## 4) Teste rápido para confirmar conexão no APK
No celular (ou pelo log do app):
- Verifique se o backend responde na URL configurada.
- Ex.: abra no navegador do celular:
  - `http://SEU_HOST:3000/api`

Se o navegador do celular não abre, o APK também não vai abrir.

---

## 5) Correção extra (boa prática)
Para tornar o erro mais claro no app, você pode (opcionalmente) exibir a mensagem real do `throw` quando `EXPO_PUBLIC_API_URL` não existir.

Hoje o `catch` engole e retorna sempre a mesma frase. Isso mascara a causa raiz.

---

## Arquivo que causa o comportamento
- `services/api.ts`

---

## Checklist final
- [ ] `EXPO_PUBLIC_API_URL` está com valor correto
- [ ] APK foi feito **depois** de setar a env
- [ ] celular consegue acessar a URL do backend na mesma rede (ou URL pública via túnel)

