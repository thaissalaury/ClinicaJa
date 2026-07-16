import { Medico } from '../types/medico';
import { apiRequest } from './api';

const withTimeout = <T>(promise: Promise<T>, ms = 60000): Promise<T> =>
  new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error('Tempo limite de conexão excedido.')),
      ms
    );
    promise.then(
      (value) => {
        clearTimeout(timeout);
        resolve(value);
      },
      (reason) => {
        clearTimeout(timeout);
        reject(reason);
      }
    );
  });

export const medicosService = {
  /**
   * Cadastra um novo médico.
   * Fluxo: 1) Registra no Supabase Auth → 2) Faz login → 3) Cria o perfil na tabela medicos
   */
  async cadastrar(
    medico: Omit<Medico, 'id' | 'dataCadastro'> & { senha: string }
  ): Promise<Medico> {
    // 1. Registrar no Supabase Auth
    const authResult = await withTimeout(
      apiRequest('/auth/register', 'POST', {
        email: medico.email,
        password: medico.senha,
      })
    );

    if (!authResult.ok) {
      throw new Error(authResult.error || 'Erro ao registrar usuário.');
    }

    // 2. Fazer login para obter o token de sessão
    const loginResult = await withTimeout(
      apiRequest('/auth/login', 'POST', {
        email: medico.email,
        password: medico.senha,
      })
    );

    if (!loginResult.ok) {
      throw new Error(loginResult.error || 'Erro ao autenticar usuário.');
    }

    const token = loginResult.data.session.access_token;

    // 3. Criar o perfil do médico com o token
    const perfilResult = await withTimeout(
      apiRequest(
        '/medicos',
        'POST',
        {
          nome: medico.nome,
          crm: medico.crm,
          uf_crm: medico.ufCrm,
          especialidade: medico.especialidade,
          telefone: medico.telefone,
          email: medico.email,
          clinica: medico.clinica,
        },
        token
      )
    );

    if (!perfilResult.ok) {
      throw new Error(perfilResult.error || 'Erro ao salvar perfil do médico.');
    }

    return perfilResult.data.medico;
  },

  /**
   * Lista todos os médicos cadastrados (para pacientes agendarem)
   */
  async listar(token: string): Promise<Medico[]> {
    const result = await apiRequest('/medicos', 'GET', undefined, token);

    if (!result.ok) {
      throw new Error(result.error || 'Erro ao listar médicos.');
    }

    return result.data;
  },

  /**
   * Busca os dados do médico logado
   */
  async buscarMeuPerfil(token: string): Promise<Medico> {
    const result = await apiRequest('/medicos/me', 'GET', undefined, token);

    if (!result.ok) {
      throw new Error(result.error || 'Erro ao buscar perfil.');
    }

    return result.data;
  },
};

