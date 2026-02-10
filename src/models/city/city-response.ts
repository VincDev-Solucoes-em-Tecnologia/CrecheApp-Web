import { z } from 'zod';

export const CidadeSchema = z.object({
  id: z.string().uuid(),
  nome: z.string(),
  estado: z.string(),
});

export type CidadeResponse = z.infer<typeof CidadeSchema>;
