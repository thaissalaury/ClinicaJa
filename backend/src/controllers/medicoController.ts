import { Request, Response } from 'express';
import { getScopedClient } from '../config/scopedClient';

export const createMedico = async (req: Request, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const supabase = getScopedClient(req.token);
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.' });
    }

    const userId = req.user.id;
    
    const { 
      nome, crm, uf_crm, especialidade, telefone, email, clinica, foto_url 
    } = req.body;

    if (!nome || !crm || !uf_crm || !especialidade || !email) {
      return res.status(400).json({ error: 'Nome, CRM, UF, especialidade e e-mail são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('medicos')
      .insert({
        user_id: userId,
        nome,
        crm,
        uf_crm,
        especialidade,
        telefone,
        email,
        clinica,
        foto_url
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Perfil de médico criado com sucesso', medico: data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};

export const getMedicoMe = async (req: Request, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const supabase = getScopedClient(req.token);
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.' });
    }
    
    const { data, error } = await supabase
      .from('medicos')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Perfil de médico não encontrado para este usuário' });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};

export const getAllMedicos = async (req: Request, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const supabase = getScopedClient(req.token);
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.' });
    }
    
    // Qualquer usuário com token válido (paciente ou médico) pode listar todos os médicos.
    // O RLS (Row Level Security) que configuramos permite SELECT para role 'authenticated'.
    const { data, error } = await supabase
      .from('medicos')
      .select('*')
      .order('nome', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};
