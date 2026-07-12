import { Request, Response } from 'express';
import { supabase, supabaseAdmin } from '../config/supabaseClient';

const isEmailRateLimitExceeded = (message?: string) => {
  if (!message) return false;
  return /email rate limit exceeded/i.test(message);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (!supabase) {
      return res.status(503).json({
        error:
          'Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.',
      });
    }

    const publicClient = supabase;
    const adminClient = supabaseAdmin;

    // Se não houver admin, não dá para fazer verificação confiável do usuário.
    // Mantemos o signUp, mas tratamos o erro de rate limit.
    if (!adminClient) {
      try {
        const { data, error } = await publicClient.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: process.env.SUPABASE_REDIRECT_URL || undefined,
            data: {
              email_confirmed: true,
            },
          },
        });

        if (error) {
          if (isEmailRateLimitExceeded(error.message)) {
            return res.status(429).json({
              error:
                'Muitas tentativas com este e-mail. Aguarde alguns minutos e tente novamente.',
              code: 'email_rate_limit_exceeded',
            });
          }
          return res.status(400).json({ error: error.message });
        }

        return res.status(201).json({
          message: 'Usuário registrado com sucesso',
          user: data.user,
          session: data.session,
          needsEmailConfirmation: !data.session,
        });
      } catch (e: any) {
        if (isEmailRateLimitExceeded(e?.message)) {
          return res.status(429).json({
            error:
              'Muitas tentativas com este e-mail. Aguarde alguns minutos e tente novamente.',
            code: 'email_rate_limit_exceeded',
          });
        }
        throw e;
      }
    }

    // Com admin: torna register idempotente.
    // 1) Verifica se o usuário com o e-mail já existe
    // 2) Se existir, tenta login e retorna session
    // 3) Se não existir, cria (email_confirm) e depois faz login
    try {
      const { data: existingUser, error: listError } =
        await adminClient.auth.admin.listUsers({
          page: 1,
          perPage: 50,
        });

      if (listError) {
        return res.status(500).json({
          error: 'Erro ao verificar usuário no Supabase',
          details: listError.message,
        });
      }

      const users = existingUser?.users ?? [];
      const match = users.find((u) => u.email === email);

      if (match) {
        const { data: loginData, error: loginError } =
          await publicClient.auth.signInWithPassword({ email, password });

        if (loginError) {
          return res.status(400).json({ error: loginError.message });
        }

        return res.status(200).json({
          message: 'Usuário já existe. Login realizado com sucesso.',
          user: loginData.user,
          session: loginData.session,
          needsEmailConfirmation: false,
        });
      }

      const { error: adminError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { email_verified: true },
      });

      if (adminError) {
        if (isEmailRateLimitExceeded(adminError.message)) {
          return res.status(429).json({
            error:
              'Muitas tentativas com este e-mail. Aguarde alguns minutos e tente novamente.',
            code: 'email_rate_limit_exceeded',
          });
        }
        return res.status(400).json({ error: adminError.message });
      }

      const { data: loginData, error: loginError } =
        await publicClient.auth.signInWithPassword({ email, password });

      if (loginError) {
        return res.status(400).json({ error: loginError.message });
      }

      return res.status(201).json({
        message: 'Usuário registrado com sucesso',
        user: loginData.user,
        session: loginData.session,
        needsEmailConfirmation: false,
      });
    } catch (e: any) {
      if (isEmailRateLimitExceeded(e?.message)) {
        return res.status(429).json({
          error:
            'Muitas tentativas com este e-mail. Aguarde alguns minutos e tente novamente.',
          code: 'email_rate_limit_exceeded',
        });
      }

      return res.status(500).json({
        error: 'Erro interno no servidor',
        details: e?.message,
      });
    }
  } catch (error: any) {
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details: error.message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (!supabase) {
      return res.status(503).json({
        error:
          'Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.',
      });
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      if (error.message === 'Email not confirmed') {
        return res.status(401).json({
          error: 'Confirme seu e-mail antes de entrar.',
          code: 'email_not_confirmed',
        });
      }

      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    return res.status(200).json({
      message: 'Login realizado com sucesso',
      session: data.session,
      user: data.user,
    });
  } catch (error: any) {
    return res.status(500).json({
      error: 'Erro interno no servidor',
      details: error.message,
    });
  }
};

