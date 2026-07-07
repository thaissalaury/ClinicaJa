export interface Paciente {
  id: string;
  nome: string;
  cpf: string;
  dataNascimento: string;
  email: string;
  telefone: string;
  sexo: 'Masculino' | 'Feminino' | 'Outro';
  cep: string;
  endereco: string;
  numero: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  estado: string;
  dataCadastro: string;
}
