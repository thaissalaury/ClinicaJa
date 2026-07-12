import { NextFunction, Request, Response } from 'express';
import { supabase } from '../config/supabaseClient';

// Estende a tipagem do Request do Express para aceitar user e token
declare global {
  namespace Express {
    interface Request {
      user?: any;
      token?: string;
    }
  }
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido ou inválido' });
    }

    const token = authHeader.split(' ')[1];

    if (!supabase) {
      return res.status(503).json({
        error: 'Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.'
      });
    }

    // Verifica o token no Supabase Auth
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      return res.status(401).json({ error: 'Sessão inválida ou expirada' });
    }

    // Injeta os dados na requisição para o controller poder usar
    req.user = data.user;
    req.token = token;

    next();
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro ao validar autenticação', details: error.message });
  }
};
