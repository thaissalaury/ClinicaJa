import AsyncStorage from '@react-native-async-storage/async-storage';

const TOKEN_KEY = 'clinicaJa.auth.accessToken';

const isAsyncStorageReady = () => {
  try {
    const ready = Boolean((AsyncStorage as any)?.getItem && (AsyncStorage as any)?.setItem);
    console.log('[authToken.ts] isAsyncStorageReady check:', ready);
    return ready;
  } catch (err) {
    console.error('[authToken.ts] Erro ao verificar disponibilidade do AsyncStorage:', err);
    return false;
  }
};

export async function saveAccessToken(token: string) {
  console.log('[authToken.ts] saveAccessToken chamado com token de tamanho:', token ? token.length : 0);
  try {
    if (!isAsyncStorageReady()) {
      console.warn('[authToken.ts] saveAccessToken falhou: AsyncStorage não está pronto.');
      return;
    }
    await AsyncStorage.setItem(TOKEN_KEY, token);
    console.log('[authToken.ts] saveAccessToken: Token gravado com sucesso no AsyncStorage.');
  } catch (error) {
    console.error('[authToken.ts] Erro crítico ao salvar token no AsyncStorage:', error);
  }
}

export async function getAccessToken(): Promise<string | null> {
  console.log('[authToken.ts] getAccessToken chamado.');
  try {
    if (!isAsyncStorageReady()) {
      console.warn('[authToken.ts] getAccessToken falhou: AsyncStorage não está pronto.');
      return null;
    }
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    console.log('[authToken.ts] getAccessToken retornado. Status:', token ? 'ENCONTRADO' : 'NULO');
    return token;
  } catch (error) {
    console.error('[authToken.ts] Erro crítico ao obter token do AsyncStorage:', error);
    return null;
  }
}

export async function clearAccessToken() {
  console.log('[authToken.ts] clearAccessToken chamado.');
  try {
    if (!isAsyncStorageReady()) {
      console.warn('[authToken.ts] clearAccessToken falhou: AsyncStorage não está pronto.');
      return;
    }
    await AsyncStorage.removeItem(TOKEN_KEY);
    console.log('[authToken.ts] clearAccessToken: Token removido com sucesso do AsyncStorage.');
  } catch (error) {
    console.error('[authToken.ts] Erro crítico ao remover token do AsyncStorage:', error);
  }
}



