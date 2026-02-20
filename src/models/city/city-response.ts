import { z } from 'zod';

export const CidadeSchema = z.object({
  id: z
    .string()
    .or(z.null())
    .transform((val) => val || ''),
  nome: z.string(),
  estado: z.string(),
  podeSerExcluido: z.boolean(),
});

export type CidadeResponse = z.infer<typeof CidadeSchema>;
