import { z } from 'zod';

import { UsuarioSchema } from '../user/usuario-response';

const timeSpanRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

export const DiarioAlimentacaoSchema = z.object({
  id: z.string(),
  refeicaoId: z.number(),
  qualidadeId: z.number(),
  refeicao: z.string(),
  qualidade: z.string(),
});

export const DiarioNecessidadeFisiologicaSchema = z.object({
  evacuacaoId: z.number(),
  evacuacao: z.string(),
  fezXixi: z.boolean(),
});

export const DiarioSonoSchema = z.object({
  id: z.string(),
  horarioInicio: z.string().regex(timeSpanRegex),
  horarioFim: z.string().regex(timeSpanRegex),
});

export const DiarioMedicamentoSchema = z.object({
  id: z.string(),
  nome: z.string(),
  doseEmMl: z.number(),
  horario: z.string().regex(timeSpanRegex),
});

export const DiarioMamadeiraSchema = z.object({
  id: z.string(),
  horario: z.string().regex(timeSpanRegex),
  doseEmMl: z.number(),
});

export const DiarioSchema = z.object({
  id: z.string(),
  estudanteId: z.string(),
  nomeCompletoEstudante: z.string(),
  dataHoraUltimaVisualizacao: z.string().nullable().optional(),
  usuarioUltimaVisualizacao: z.string().nullable().optional(),
  dataHora: z.string(),
  sala: z.string().nullable().optional(),
  alimentacoes: z
    .array(DiarioAlimentacaoSchema)
    .nullish()
    .transform((val) => val ?? []),
  necessidadeFisiologica: DiarioNecessidadeFisiologicaSchema.nullable(),
  sonos: z
    .array(DiarioSonoSchema)
    .nullish()
    .transform((val) => val ?? []),
  medicamentos: z
    .array(DiarioMedicamentoSchema)
    .nullish()
    .transform((val) => val ?? []),
  mamadeiras: z
    .array(DiarioMamadeiraSchema)
    .nullish()
    .transform((val) => val ?? []),
  recadoProfessor: z
    .string()
    .nullable()
    .transform((val) => val ?? ''),
  recadoResponsavel: z
    .string()
    .nullable()
    .transform((val) => val ?? ''),
  temDados: z.boolean().default(false),
  paisResponsaveis: z
    .array(UsuarioSchema.partial())
    .optional()
    .nullable()
    .transform((val) => val || []),
});

export type DiarioResponse = z.infer<typeof DiarioSchema>;
