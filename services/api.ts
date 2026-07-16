defina 
const normalizeBaseUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  return trimmed.endsWith('/api') ? trimmed : `${trimmed.replace(/\/$/, '')}/api`;
};

const getBaseUrl = (): string => {
  // Expo publica (ideal)
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (envUrl) return normalizeBaseUrl(envUrl);

  // Fallback por URL pública via tunnel/host (se você preferir configurar runtime)
  // Observação: em produção real, isso deve ser removido/ajustado.
  const host = process.env.EXPO_PUBLIC_API_HOST?.trim();
  if (host) return normalizeBaseUrl(host);

  // Último recurso: falha com mensagem que ajuda a diagnosticar.
  throw new Error(
    'EXPO_PUBLIC_API_URL não está configurada no APK. Defina EXPO_PUBLIC_API_URL apontando para o backend (inclua/ajuste a URL) e gere um novo build.'
  );
};

const BASE_URL = getBaseUrl();


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
  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const config: RequestInit = {
      method,
      headers,
    };

    if (body) {
      config.body = JSON.stringify(body);
    }

    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      return { ok: false, error: data.error || 'Erro desconhecido no servidor' };
    }

    return { ok: true, data };
  } catch (error: any) {
    return { ok: false, error: 'Não foi possível conectar ao servidor. Verifique sua conexão.' };
  }
}
