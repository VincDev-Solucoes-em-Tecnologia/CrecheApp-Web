import { z } from 'zod';

export const UsuarioSchema = z.object({
  id: z
    .string()
    .or(z.null())
    .transform((val) => val || ''),
  email: z.string().email(),
  nome: z.string(),
  sobrenome: z.string(),
  endereco: z.string(),
  bairro: z.string(),
  numero: z.number(),
  cidade: z.string(),
  cidadeId: z.string(),
  estado: z.string(),
  tipo: z.string(),
});

export type UsuarioResponse = z.infer<typeof UsuarioSchema>;

export const PagedUsuarioSchema = z.object({
  items: z.array(UsuarioSchema),
  totalItems: z.number(),
  totalReturned: z.number(),
  currentPage: z.number(),
  hasNextPage: z.boolean(),
});

export type PagedUsuarioResponse = z.infer<typeof PagedUsuarioSchema>;
