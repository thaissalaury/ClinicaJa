import { Request, Response } from 'express';
import { getScopedClient } from '../config/scopedClient';

export const createPaciente = async (req: Request, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const supabase = getScopedClient(req.token);
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.' });
    }
    
    // O id do usuário autenticado vem do middleware
    const userId = req.user.id;
    
    const { 
      nome, cpf, data_nascimento, email, telefone, sexo, 
      cep, endereco, numero, complemento, bairro, cidade, estado, foto_url 
    } = req.body;

    if (!nome || !cpf || !data_nascimento || !email) {
      return res.status(400).json({ error: 'Nome, CPF, data de nascimento e e-mail são obrigatórios' });
    }

    const { data, error } = await supabase
      .from('pacientes')
      .insert({
        user_id: userId,
        nome,
        cpf,
        data_nascimento,
        email,
        telefone,
        sexo,
        cep,
        endereco,
        numero,
        complemento,
        bairro,
        cidade,
        estado,
        foto_url
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Perfil de paciente criado com sucesso', paciente: data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};

export const getPacienteMe = async (req: Request, res: Response) => {
  try {
    if (!req.token) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }

    const supabase = getScopedClient(req.token);
    if (!supabase) {
      return res.status(503).json({ error: 'Supabase não está configurado. Defina SUPABASE_URL e SUPABASE_ANON_KEY no arquivo .env.' });
    }
    
    // O banco já filtrará automaticamente pelo user_id do token logado via RLS!
    // Pegamos o primeiro perfil que a política RLS permitir visualizar.
    const { data, error } = await supabase
      .from('pacientes')
      .select('*')
      .eq('user_id', req.user.id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Perfil de paciente não encontrado para este usuário' });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};
