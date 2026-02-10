import { z } from 'zod';

import { UsuarioSchema } from '../user/usuario-response';

const timeSpanRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;

export const SalaSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, 'Nome é obrigatório'),
  horarioInicio: z
    .string()
    .regex(timeSpanRegex, 'Formato inválido (HH:mm)')
    .nullable()
    .optional()
    .transform((val) => val || ''),

  horarioFim: z
    .string()
    .regex(timeSpanRegex, 'Formato inválido (HH:mm)')
    .nullable()
    .optional()
    .transform((val) => val || ''),
  professoresResponsaveis: z
    .array(UsuarioSchema.partial())
    .optional()
    .nullable()
    .transform((val) => val || []),
});

export type SalaResponse = z.infer<typeof SalaSchema>;
