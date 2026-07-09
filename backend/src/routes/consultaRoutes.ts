import { Router } from 'express';
import { 
  createConsulta, 
  getConsultasPaciente, 
  getConsultasMedico,
  updateStatusConsulta,
  deleteConsulta
} from '../controllers/consultaController';
import { authMiddleware } from '../middlewares/authMiddleware';

const router = Router();

// Protege todas as rotas de consultas
router.use(authMiddleware);

router.post('/', createConsulta);
router.get('/paciente', getConsultasPaciente);
router.get('/medico', getConsultasMedico);
router.patch('/:id/status', updateStatusConsulta);
router.delete('/:id', deleteConsulta);

export default router;
