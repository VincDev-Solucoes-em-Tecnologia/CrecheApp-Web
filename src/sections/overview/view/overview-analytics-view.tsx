import type { UsuarioResponse } from 'src/models/user/usuario-response';
import type { DashboardResponse } from 'src/models/admin/dashboard-response';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import { useTheme } from '@mui/material';
import BookIcon from '@mui/icons-material/Book';
import Typography from '@mui/material/Typography';
import GroupIcon from '@mui/icons-material/Group';
import FamilyIcon from '@mui/icons-material/FamilyRestroom';

import { DashboardContent } from 'src/layouts/dashboard';
import { getDashboard } from 'src/services/admin-service';
import { getUsuarioInfo } from 'src/services/usuario-service';

import { AnalyticsSala } from '../analytics-sala';
import { AnalyticsUserWidget } from '../analytics-users';
import { AnalyticsDiarioWidget } from '../analytics-diarios';
import { AnalyticsEstudanteWidget } from '../analytics-estudantes';
import { AnalyticsUltimosDiarios } from '../analytics-ultimos-diarios';
// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const [user, setUser] = useState<UsuarioResponse | null>(null);
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const recadosCategories = dashboard?.quantidadeRecadosUltimos5DiasUteis.map((item) => {
    const date = new Date(item.data);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });

  const theme = useTheme();

  const recadosSeries = [
    {
      name: 'Diarios Registrados',
      data: dashboard ? dashboard.quantidadeRecadosUltimos5DiasUteis.map((item) => item.total) : [],
    },
  ];

  useEffect(() => {
    getUsuarioInfo().then((r) => {
      setUser(r.data);
      getDashboard().then((r2) => setDashboard(r2.data));
    });
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        Olá {user?.nomeCompleto}, Bem-vindo de volta 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AnalyticsUserWidget
            title="Usuários"
            color="secondary"
            total={dashboard ? dashboard.totalUsuariosAtivos : 0}
            inativos={dashboard ? dashboard.totalUsuarioInativos : 0}
            icon={<GroupIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AnalyticsEstudanteWidget
            title="Crianças"
            total={dashboard ? dashboard.totalEstudantes : 0}
            color="primary"
            icon={<FamilyIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, sm: 6, md: 4 }}>
          <AnalyticsDiarioWidget
            title="Diários registrados hoje"
            color="error"
            total={dashboard ? dashboard.totalDiarios : 0}
            semRegistro={dashboard ? dashboard.totalEstudantesSemDiario : 0}
            icon={<BookIcon fontSize="large" />}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AnalyticsSala
            title="Alunos por sala"
            subheader="Quantidade de alunos por sala"
            chart={{
              categories: dashboard?.alunosPorSala.map((item) => item.nome) || [],
              series: [
                {
                  name: 'Qtd. Alunos',
                  data: dashboard ? dashboard.alunosPorSala.map((item) => item.total) : [],
                },
              ],
              colors: [
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.success.main,
                '#FF6B6B',
                '#4ECDC4',
              ],
              options: {
                plotOptions: {
                  bar: {
                    columnWidth: '50%',
                    distributed: true,
                    borderRadius: 4,
                  },
                },
                legend: { show: false },
                yaxis: {
                  labels: {
                    formatter: (value: number) => value.toFixed(0),
                  },
                },
                tooltip: {
                  y: { formatter: (value: number) => `${value.toFixed(0)}` },
                },
              },
            }}
          />
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <AnalyticsUltimosDiarios
            title="Registros de Diario"
            subheader="Últimos 5 dias úteis"
            chart={{
              categories: recadosCategories,
              series: recadosSeries,
              colors: [
                theme.palette.primary.main,
                theme.palette.info.main,
                theme.palette.error.main,
                theme.palette.warning.main,
                theme.palette.success.main,
                '#FF6B6B',
                '#4ECDC4',
              ],
              options: {
                plotOptions: {
                  bar: {
                    columnWidth: '50%',
                    distributed: true,
                    borderRadius: 4,
                  },
                },
                legend: { show: false },
                yaxis: {
                  labels: {
                    formatter: (value: number) => value.toFixed(0),
                  },
                },
                tooltip: {
                  y: { formatter: (value: number) => `${value.toFixed(0)}` },
                },
              },
            }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}
