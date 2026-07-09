import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

import authRoutes from './routes/authRoutes';
import pacienteRoutes from './routes/pacienteRoutes';
import medicoRoutes from './routes/medicoRoutes';
import consultaRoutes from './routes/consultaRoutes';

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
  res.json({ status: 'OK', message: 'Backend ClínicaJá está rodando!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
