import type { AlertColor } from '@mui/material';
import type { GridSlots, GridColDef } from '@mui/x-data-grid';
import type { DiarioResponse } from 'src/models/diario/diario-response';

import dayjs from 'dayjs';
import * as Yup from 'yup';
import utc from 'dayjs/plugin/utc';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import { ptBR } from '@mui/x-data-grid/locales';
import SearchIcon from '@mui/icons-material/Search';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import {
  DataGrid,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { getDiarios } from 'src/services/diario-service';
import { getEstudantes } from 'src/services/estudante-service';

import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

// ----------------------------------------------------------------------

dayjs.extend(utc);

interface EstudanteOption {
  id: string;
  nomeCompleto: string;
}

export function DiarioView() {
  const [diarios, setDiarios] = useState<DiarioResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [estudantes, setEstudantes] = useState<EstudanteOption[]>([]);

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  useEffect(() => {
    getEstudantes(1, 1000, 'nome', 'asc', null)
      .then((res) => {
        setEstudantes(res.data?.items || []);
      })
      .catch((err) => console.error('Erro ao buscar estudantes', err));
  }, []);

  const formik = useFormik({
    initialValues: {
      dataInicial: dayjs(),
      dataFinal: dayjs(),
      estudante: null as EstudanteOption | null,
    },
    validationSchema: Yup.object({
      dataInicial: Yup.date()
        .nullable()
        .required('Data inicial é obrigatória')
        .typeError('Data inválida'),
      dataFinal: Yup.date()
        .nullable()
        .required('Data final é obrigatória')
        .typeError('Data inválida'),
    }),
    onSubmit: (values) => {
      setIsLoading(true);

      const dtInicial = values.dataInicial ? values.dataInicial.format('YYYY-MM-DD') : '';
      const dtFinal = values.dataFinal ? values.dataFinal.format('YYYY-MM-DD') : '';
      const estudanteId = values.estudante ? values.estudante.id : '';

      getDiarios(dtInicial, dtFinal, estudanteId)
        .then((r) => {
          setDiarios(r.data!);
        })
        .catch((e) => {
          setNotification({ open: true, message: e.message, severity: 'error' });
        })
        .finally(() => setIsLoading(false));
    },
  });

  const columns: GridColDef<DiarioResponse>[] = [
    {
      field: 'dataHora',
      headerName: 'Data',
      minWidth: 150,
      valueGetter: (value, row) => dayjs(row.dataHora).format('DD-MM-YYYY'),
    },

    {
      field: 'nomeCompletoEstudante',
      headerName: 'Nome criança',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'sala',
      headerName: 'Sala',
      flex: 1,
      minWidth: 100,
    },
    {
      field: 'paisResponsaveis',
      headerName: 'Responsáveis',
      flex: 1.5,
      minWidth: 250,
      sortable: false,
      filterable: false,
      valueGetter: (value, row) => {
        if (!row.paisResponsaveis || row.paisResponsaveis.length === 0) return '';
        return row.paisResponsaveis.map((p) => `${p.nomeCompleto}`).join(', ');
      },
      renderCell: (params) => {
        const lista = params.row.paisResponsaveis || [];

        return (
          <div style={{ lineHeight: '1.2em', padding: '5px 0' }}>
            {lista.map((pai, idx) => (
              <div
                key={pai.id || idx}
                style={{
                  fontSize: '0.85rem',
                  color: pai.ativo === false ? '#d32f2f' : 'inherit',
                }}
              >
                {`• ${pai.nomeCompleto}`}
              </div>
            ))}
          </div>
        );
      },
    },
    {
      field: 'evacuacao',
      headerName: 'Evacuação',
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => row.necessidadeFisiologica?.evacuacao,
    },
    {
      field: 'diurese',
      headerName: 'Fez xixi?',
      width: 120,
      type: 'boolean',
      valueGetter: (value, row) => row.necessidadeFisiologica?.fezXixi,
      cellClassName: 'alinhamento-topo',
    },
    {
      field: 'alimentacoes',
      headerName: 'Alimentação',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <div style={{ lineHeight: '1.2em', padding: '5px 0' }}>
          {params.row.alimentacoes.map((s, idx) => (
            <div key={s.id || idx} style={{ fontSize: '0.85rem' }}>
              {`• ${s.refeicao} - ${s.qualidade}`}
            </div>
          ))}
        </div>
      ),
    },
    {
      field: 'sonos',
      headerName: 'Sonos',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <div style={{ lineHeight: '1.2em', padding: '5px 0' }}>
          {params.row.sonos.map((s, idx) => (
            <div key={s.id || idx} style={{ fontSize: '0.85rem' }}>
              {`• ${s.horarioInicio.substring(0, 5)} - ${s.horarioFim.substring(0, 5)}`}
            </div>
          ))}
        </div>
      ),
    },
    {
      field: 'medicamentos',
      headerName: 'Medicamentos',
      flex: 1.5,
      minWidth: 200,
      renderCell: (params) => (
        <div style={{ lineHeight: '1.2em', padding: '5px 0' }}>
          {params.row.medicamentos.map((m, idx) => (
            <div key={m.id || idx} style={{ fontSize: '0.85rem' }}>
              {`• ${m.nome} (${m.doseEmMl}ml) - ${m.horario.substring(0, 5)}`}
            </div>
          ))}
        </div>
      ),
    },
    {
      field: 'mamadeiras',
      headerName: 'Mamadeiras',
      flex: 1.2,
      minWidth: 200,
      renderCell: (params) => (
        <div style={{ lineHeight: '1.2em', padding: '5px 0' }}>
          {params.row.mamadeiras.map((mam, idx) => (
            <div key={mam.id || idx} style={{ fontSize: '0.85rem' }}>
              {`• ${mam.horario.substring(0, 5)} - ${mam.doseEmMl}ml`}
            </div>
          ))}
        </div>
      ),
    },
    {
      field: 'recadoResponsavel',
      headerName: 'Recado responsavel',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            lineHeight: '1.4em',
            padding: '8px 0',
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: 'recadoProfessor',
      headerName: 'Recado professor',
      flex: 1,
      minWidth: 200,
      renderCell: (params) => (
        <div
          style={{
            whiteSpace: 'normal',
            wordWrap: 'break-word',
            lineHeight: '1.4em',
            padding: '8px 0',
          }}
        >
          {params.value}
        </div>
      ),
    },
    {
      field: 'usuarioUltimaVisualizacao',
      headerName: 'Ultima visualização',
      flex: 1,
      minWidth: 200,
    },
    {
      field: 'dataHoraUltimaVisualizacao',
      headerName: 'Data Ultima visualização',
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) =>
        row.dataHoraUltimaVisualizacao
          ? dayjs.utc(row.dataHoraUltimaVisualizacao).local().format('DD-MM-YYYY HH:mm')
          : '',
    },
  ];

  function CustomToolbar() {
    return (
      <GridToolbarContainer sx={{ padding: 1 }}>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  }

  return (
    <DashboardContent disablePadding maxWidth="xl">
      <Card sx={{ mb: 3, p: 2 }}>
        {/* Adicionado o form com o onSubmit do formik */}
        <form onSubmit={formik.handleSubmit}>
          {/* alignItems ajustado para flex-start para não quebrar o layout se o Yup disparar mensagens de erro sob os inputs */}
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="flex-start">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <DatePicker
                label="Data Inicial"
                format="DD/MM/YYYY"
                minDate={dayjs('0001-01-01')}
                disableFuture
                value={formik.values.dataInicial}
                onChange={(newValue) => formik.setFieldValue('dataInicial', newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.dataInicial && Boolean(formik.errors.dataInicial),
                    helperText: formik.touched.dataInicial && (formik.errors.dataInicial as string),
                  },
                }}
              />
            </LocalizationProvider>

            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
              <DatePicker
                label="Data Final"
                format="DD/MM/YYYY"
                minDate={dayjs('0001-01-01')}
                disableFuture
                value={formik.values.dataFinal}
                onChange={(newValue) => formik.setFieldValue('dataFinal', newValue)}
                slotProps={{
                  textField: {
                    size: 'small',
                    fullWidth: true,
                    error: formik.touched.dataFinal && Boolean(formik.errors.dataFinal),
                    helperText: formik.touched.dataFinal && (formik.errors.dataFinal as string),
                  },
                }}
              />
            </LocalizationProvider>

            {/* Autocomplete para Estudantes */}
            <Autocomplete
              fullWidth
              size="small"
              options={estudantes}
              getOptionLabel={(option) => option.nomeCompleto}
              value={formik.values.estudante}
              onChange={(e, newValue) => formik.setFieldValue('estudante', newValue)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Criança (Opcional)"
                  error={formik.touched.estudante && Boolean(formik.errors.estudante)}
                  helperText={formik.touched.estudante && (formik.errors.estudante as string)}
                />
              )}
            />

            {/* Botão ajustado para variant="outlined" e size="medium", sem o height fixo */}
            <Button
              type="submit"
              size="medium"
              variant="outlined"
              startIcon={<SearchIcon />}
              disabled={isLoading}
              sx={{ minWidth: 120 }}
            >
              Buscar
            </Button>
          </Stack>
        </form>
      </Card>

      <Box sx={{ height: 600, width: '100%' }}>
        <DataGrid
          rows={diarios}
          columns={columns}
          loading={isLoading}
          density="compact"
          getRowHeight={() => 'auto'}
          getRowId={(row) => row.id}
          slots={{ toolbar: CustomToolbar as GridSlots['toolbar'] }}
          localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
          pageSizeOptions={[5, 10, 25, 50]}
          showToolbar
          disableRowSelectionOnClick
          sx={{
            border: 'none',
            '& .MuiDataGrid-cell': { borderBottom: '1px dashed #F1F3F4' },
            '& .alinhamento-topo': {
              alignItems: 'flex-start',
              paddingTop: '8px', // Mesmo padding superior da coluna de texto
            },
          }}
          initialState={{
            columns: {
              columnVisibilityModel: {
                alimentacoes: false,
                sonos: false,
                mamadeiras: false,
                medicamentos: false,
                recadoProfessor: false,
                evacuacao: false,
                diurese: false,
              },
            },
          }}
        />
      </Box>

      <DefaultSnackBar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification((prev) => ({ ...prev, open: false }))}
      />
    </DashboardContent>
  );
}
