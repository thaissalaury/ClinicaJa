import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';

dotenv.config();

import { isSupabaseConfigured } from './config/supabaseClient';
import authRoutes from './routes/authRoutes';
import consultaRoutes from './routes/consultaRoutes';
import medicoRoutes from './routes/medicoRoutes';
import pacienteRoutes from './routes/pacienteRoutes';

const app = express();

// Middlewares globais
app.use(cors());
app.use(express.json());

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/pacientes', pacienteRoutes);
app.use('/api/medicos', medicoRoutes);
app.use('/api/consultas', consultaRoutes);

// Rota de Healthcheck
app.get('/health', (req, res) => {
  if (!isSupabaseConfigured) {
    return res.status(503).json({
      status: 'MISCONFIGURED',
      message: 'Backend ClínicaJá está rodando, mas o Supabase ainda não está configurado.',
      supabase: {
        configured: false,
        requiredEnvVars: ['SUPABASE_URL', 'SUPABASE_ANON_KEY']
      }
    });
  }

  return res.json({
    status: 'OK',
    message: 'Backend ClínicaJá está rodando e o Supabase está configurado.',
    supabase: {
      configured: true
    }
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
