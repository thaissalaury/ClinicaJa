const normalizeBaseUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
};

const getBaseUrl = (): string => {
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  console.log('[api.ts] EXPO_PUBLIC_API_URL obtido do process.env:', envUrl);

  if (envUrl) {
    const normalized = normalizeBaseUrl(envUrl);
    console.log('[api.ts] BASE_URL calculada via EXPO_PUBLIC_API_URL:', normalized);
    return normalized;
  }

  const host = process.env.EXPO_PUBLIC_API_HOST?.trim();
  console.log('[api.ts] EXPO_PUBLIC_API_HOST obtido do process.env (fallback):', host);

  if (host) {
    const normalized = normalizeBaseUrl(host);
    console.log('[api.ts] BASE_URL calculada via EXPO_PUBLIC_API_HOST:', normalized);
    return normalized;
  }

  console.error('[api.ts] Nenhuma variável de ambiente de API foi encontrada!');
  throw new Error(
    'EXPO_PUBLIC_API_URL não está configurada no APK. Defina EXPO_PUBLIC_API_URL apontando para o backend (inclua/ajuste a URL) e gere um novo build.'
  );
};

const BASE_URL = getBaseUrl();
console.log('[api.ts] BASE_URL carregada no escopo do módulo:', BASE_URL);

interface ApiResponse {
  ok: boolean;
  data?: any;
  error?: string;
}

/**
 * Função genérica para chamadas à API do backend.
 * Centraliza headers, tratamento de erros e parsing do JSON.
 */
export async function apiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  body?: any,
  token?: string
): Promise<ApiResponse> {
  const fullUrl = `${BASE_URL}${endpoint}`;
  console.log(`[api.ts] apiRequest -> Chamando URL: ${fullUrl} | Método: ${method}`);
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
      console.log('[api.ts] apiRequest -> Bearer Token anexado ao cabeçalho.');
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
      // Evita logar a senha em texto puro em logs de produção, logando apenas as chaves
      const loggedBody = { ...body };
      if (loggedBody.password) loggedBody.password = '********';
      console.log('[api.ts] apiRequest -> Corpo enviado:', loggedBody);
    }

    console.log(`[api.ts] apiRequest -> Iniciando fetch para: ${fullUrl}`);
    const response = await fetch(fullUrl, config);
    console.log(`[api.ts] apiRequest -> Fetch concluído. Status: ${response.status} (${response.statusText})`);

    const data = await response.json();
    console.log('[api.ts] apiRequest -> Resposta JSON convertida:', data);

    if (!response.ok) {
      console.warn(`[api.ts] apiRequest -> Resposta com erro HTTP ${response.status}:`, data.error);
      return { ok: false, error: data.error || 'Erro desconhecido no servidor' };
    }

    return { ok: true, data };
  } catch (error: any) {
    console.error('[api.ts] apiRequest -> Exceção capturada no fluxo de fetch:', error);
    return { ok: false, error: 'Não foi possível conectar ao servidor. Verifique sua conexão.' };
  }
}
