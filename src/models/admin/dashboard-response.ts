import { z } from 'zod';

// ==========================================
// 1. SCHEMAS DE RESPOSTA (Dashboard)
// ==========================================

export const DashboardAlunosPorSalaResponseSchema = z.object({
  total: z.number().default(0),
  nome: z
    .string()
    .nullable()
    .transform((val) => val || 'Sem Nome'),
});

export const DashboardRecadoPorDiaResponseSchema = z.object({
  total: z.number().default(0),
  data: z.string(), // C# DateTime ISO String
});

export const DashboardResponseSchema = z.object({
  totalUsuariosAtivos: z.number().default(0),
  totalUsuarioInativos: z.number().default(0),
  totalEstudantes: z.number().default(0),
  totalDiarios: z.number().default(0),
  totalEstudantesSemDiario: z.number().default(0),

  // Mapeamento de listas com fallback para array vazio (IEnumerable C#)
  quantidadeRecadosUltimos5DiasUteis: z
    .array(DashboardRecadoPorDiaResponseSchema)
    .nullable()
    .transform((val) => val || []),

  alunosPorSala: z
    .array(DashboardAlunosPorSalaResponseSchema)
    .nullable()
    .transform((val) => val || []),
});

// ==========================================
// 2. TYPES INFERIDOS
// ==========================================

export type DashboardResponse = z.infer<typeof DashboardResponseSchema>;
