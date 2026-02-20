import { z } from 'zod';

import { UsuarioSchema } from '../user/usuario-response';

const timeSpanRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

// ==========================================
// 1. SCHEMAS DE RESPOSTA (Backend -> Frontend)
// Espelham exatamente suas classes C# de Response
// ==========================================

const SalaResponseSchema = z.object({
  id: z
    .string()
    .or(z.null())
    .transform((val) => val || ''),
  nome: z.string().nullable().optional(),
});

const IntoleranciaResponseSchema = z.object({
  nome: z.string().nullable().optional(),
  tipo: z.string().nullable().optional(),
});

const MedicamentoResponseSchema = z.object({
  nome: z.string().nullable().optional(),
  doseEmMl: z.number().nullable().optional(),
  observacao: z.string().nullable().optional(),
  horarios: z.array(z.string()).optional().default([]),
});

export const EstudanteResponseSchema = z.object({
  id: z
    .string()
    .or(z.null())
    .transform((val) => val || ''),
  nome: z.string().nullable(),
  sobrenome: z.string().nullable(),
  dataNascimento: z.string(), // C# DateTime vem como ISO String
  nomePediatra: z.string().nullable(),
  planoDeSaude: z.string().nullable(),
  sala: SalaResponseSchema.nullable().optional(),
  paisResponsaveis: z
    .array(UsuarioSchema.partial())
    .optional()
    .nullable()
    .transform((val) => val || []),
  intoleranciasAlimentares: z.array(IntoleranciaResponseSchema).nullable().optional(),
  medicamentos: z.array(MedicamentoResponseSchema).nullable().optional(),
  fotoOriginalUrl: z.string().nullable(),
  fotoThumbnailUrl: z.string().nullable(),
  nomeCompleto: z.string(),
});

export type EstudanteResponse = z.infer<typeof EstudanteResponseSchema>;

export const PagedUsuarioSchema = z.object({
  items: z.array(EstudanteResponseSchema),
  totalItems: z.number(),
  totalReturned: z.number(),
  currentPage: z.number(),
  hasNextPage: z.boolean(),
});

export type PagedEstudanteResponse = z.infer<typeof PagedUsuarioSchema>;

// ==========================================
// 2. SCHEMAS DE FORMULÁRIO (Frontend -> Backend)
// Usado para validação do Formik/React Hook Form
// ==========================================

const IntoleranciaFormSchema = z.object({
  nome: z.string().min(1, 'Nome do alimento é obrigatório'),
  tipo: z.string().min(1, 'Tipo da intolerância é obrigatório'),
});

const MedicamentoFormSchema = z.object({
  nome: z.string().min(1, 'Nome do medicamento é obrigatório'),
  doseEmMl: z.coerce.number().min(0.1, 'A dose deve ser maior que 0'),
  observacao: z.string().optional().default(''),
  horarios: z
    .array(z.string().regex(timeSpanRegex, 'Formato inválido (HH:mm)'))
    .min(1, 'Adicione ao menos um horário'),
});

export const EstudanteFormSchema = z.object({
  id: z.string().optional(),

  nome: z.string().min(1, 'Nome é obrigatório'),
  sobrenome: z.string().min(1, 'Sobrenome é obrigatório'),
  dataNascimento: z.string().min(1, 'Data de nascimento é obrigatória'),
  nomePediatra: z.string().min(1, 'Nome do pediatra é obrigatório'),
  planoDeSaude: z.string().min(1, 'Plano de saúde é obrigatório'),
  salaId: z.string().min(1, 'Selecione uma sala'),
  paisResponsaveisIds: z.array(z.string()).min(1, 'Selecione ao menos um responsável'),
  intoleranciasAlimentares: z.array(IntoleranciaFormSchema).default([]),
  medicamentos: z.array(MedicamentoFormSchema).default([]),
});

export type EstudanteFormValues = z.infer<typeof EstudanteFormSchema>;
