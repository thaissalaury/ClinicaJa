import { Request, Response } from 'express';
import { getScopedClient } from '../config/scopedClient';

export const createConsulta = async (req: Request, res: Response) => {
  try {
    const supabase = getScopedClient(req.token!);
    
    // 1. Descobrir o paciente_id real a partir do usuário logado
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (pacienteError || !pacienteData) {
      return res.status(403).json({ error: 'Apenas pacientes cadastrados podem agendar consultas' });
    }

    const { medico_id, data_hora, motivo, valor, observacoes } = req.body;

    if (!medico_id || !data_hora || !motivo) {
      return res.status(400).json({ error: 'Médico, data/hora e motivo são obrigatórios' });
    }

    // 2. Criar a consulta
    const { data, error } = await supabase
      .from('consultas')
      .insert({
        paciente_id: pacienteData.id,
        medico_id,
        data_hora,
        motivo,
        valor: valor || null,
        observacoes,
        status: 'Pendente' // Status padrão inicial
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(201).json({ message: 'Consulta agendada com sucesso', consulta: data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};

export const getConsultasPaciente = async (req: Request, res: Response) => {
  try {
    const supabase = getScopedClient(req.token!);
    
    // Busca o paciente ID primeiro
    const { data: pacienteData, error: pacienteError } = await supabase
      .from('pacientes')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (pacienteError || !pacienteData) {
      return res.status(403).json({ error: 'Acesso negado: Perfil de paciente não encontrado' });
    }

    // Busca consultas e traz os dados do médico junto
    const { data, error } = await supabase
      .from('consultas')
      .select(`
        *,
        medicos (nome, especialidade, clinica)
      `)
      .eq('paciente_id', pacienteData.id)
      .order('data_hora', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};

export const getConsultasMedico = async (req: Request, res: Response) => {
  try {
    const supabase = getScopedClient(req.token!);
    
    // Busca o médico ID primeiro
    const { data: medicoData, error: medicoError } = await supabase
      .from('medicos')
      .select('id')
      .eq('user_id', req.user.id)
      .single();

    if (medicoError || !medicoData) {
      return res.status(403).json({ error: 'Acesso negado: Perfil de médico não encontrado' });
    }

    // Busca consultas e traz os dados do paciente junto
    const { data, error } = await supabase
      .from('consultas')
      .select(`
        *,
        pacientes (nome, telefone, foto_url)
      `)
      .eq('medico_id', medicoData.id)
      .order('data_hora', { ascending: true });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};

export const updateStatusConsulta = async (req: Request, res: Response) => {
  try {
    const supabase = getScopedClient(req.token!);
    const { id } = req.params;
    const { status } = req.body;

    const statusPermitidos = ['Pendente', 'Confirmada', 'Cancelada', 'Realizada'];
    if (!statusPermitidos.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    // O RLS garante que só envolvidos podem atualizar
    const { data, error } = await supabase
      .from('consultas')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: 'Não foi possível atualizar a consulta (ela existe e você tem permissão?)' });
    }

    return res.status(200).json({ message: 'Status atualizado', consulta: data });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};

export const deleteConsulta = async (req: Request, res: Response) => {
  try {
    const supabase = getScopedClient(req.token!);
    const { id } = req.params;

    // O RLS garante que só os envolvidos podem deletar
    const { error } = await supabase
      .from('consultas')
      .delete()
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: 'Não foi possível deletar a consulta' });
    }

    return res.status(200).json({ message: 'Consulta removida com sucesso' });
  } catch (error: any) {
    return res.status(500).json({ error: 'Erro interno no servidor', details: error.message });
  }
};
