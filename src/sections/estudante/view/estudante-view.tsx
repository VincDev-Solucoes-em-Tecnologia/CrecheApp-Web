import type { AlertColor } from '@mui/material';
import type {
  EstudanteResponse,
  PagedEstudanteResponse,
} from 'src/models/estudante/estudante-reponse';
import type {
  GridSlots,
  GridColDef,
  GridSortModel,
  GridFilterModel,
  GridPaginationModel,
} from '@mui/x-data-grid';

import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Avatar from '@mui/material/Avatar';
import AddIcon from '@mui/icons-material/Add';
import { ptBR } from '@mui/x-data-grid/locales';
import EditIcon from '@mui/icons-material/Edit';
import Typography from '@mui/material/Typography';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { remover } from 'src/services/common-service';
import { DashboardContent } from 'src/layouts/dashboard';
import { getEstudantes } from 'src/services/estudante-service';
import { EstudanteFormDialog } from 'src/forms/estudante/estudante-form';

import DialogDelete from 'src/components/dialog/dialog-delete';
import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

export function EstudanteView() {
  const [estudantes, setEstudantes] = useState<PagedEstudanteResponse>(
    {} as PagedEstudanteResponse
  );
  const [isLoading, setIsLoading] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  });

  const [filterModel, setFilterModel] = useState<GridFilterModel>();

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<EstudanteResponse | null>(null);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const columns: GridColDef<EstudanteResponse>[] = [
    {
      field: 'nome',
      headerName: 'Nome completo',
      flex: 1,
      minWidth: 150,
      valueGetter: (value, row) => row.nomeCompleto,
      renderCell: (params) => (
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ height: '100%' }}>
          <Avatar
            alt={params.row.nome!}
            src={params.row.fotoThumbnailUrl!}
            sx={{ width: 30, height: 30, fontSize: '0.9rem' }}
          >
            {params.row.nome ? params.row.nome[0] : ''}
          </Avatar>
          <Typography variant="body2" noWrap>
            {params.row.nome} {params.row.sobrenome}
          </Typography>
        </Stack>
      ),
    },
    {
      field: 'dataNascimento',
      headerName: 'Data Nascimento',
      flex: 1,
      valueFormatter: (value: string) => {
        if (!value) return '';
        return new Date(value).toLocaleDateString('pt-BR');
      },
      sortable: false,
      filterable: false,
    },
    { field: 'nomePediatra', headerName: 'Pediatra', flex: 1 },
    { field: 'planoDeSaude', headerName: 'Plano de saúde', flex: 1 },
    {
      field: 'sala',
      headerName: 'Sala',
      flex: 1,
      valueGetter: (value, row) => `${row.sala?.nome}`,
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
          <div style={{ whiteSpace: 'normal', lineHeight: '1.5em' }}>
            {lista.map((p, index) => (
              <span
                key={p.id || index}
                style={{
                  color: p.ativo ? 'inherit' : '#d32f2f',
                }}
              >
                {p.nomeCompleto}
                {index < lista.length - 1 ? ', ' : ''}
              </span>
            ))}
          </div>
        );
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleEdit(row)} />,
        <GridActionsCellItem
          icon={<DeleteIcon color="error" />}
          label="Delete"
          onClick={() => handleDelete(row)}
        />,
      ],
    },
  ];

  const getData = useCallback(() => {
    setIsLoading(true);
    getEstudantes(
      paginationModel.page + 1,
      paginationModel.pageSize,
      sortModel.length > 0 ? sortModel[0].field : '',
      sortModel.length > 0 ? sortModel[0].sort! : '',
      filterModel?.items
    )
      .then((r) => setEstudantes(r.data ? r.data : ({} as PagedEstudanteResponse)))
      .finally(() => setIsLoading(false));
  }, [paginationModel, sortModel, filterModel]);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleNew = () => {
    setSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (row: EstudanteResponse) => {
    setSelected(row);
    setOpenForm(true);
  };

  const handleDelete = (row: EstudanteResponse) => {
    setSelected(row);
    setOpenModalDelete(true);
  };

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  function EditToolbar() {
    return (
      <GridToolbarContainer sx={{ padding: 1 }}>
        <Button startIcon={<AddIcon />} onClick={handleNew}>
          Nova Criança
        </Button>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  }

  return (
    <DashboardContent disablePadding maxWidth="xl">
      <DataGrid
        rows={estudantes.items}
        columns={columns}
        loading={isLoading}
        density="compact"
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        filterMode="server"
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        pageSizeOptions={[5, 10, 25, 50]}
        sortingMode="server"
        onSortModelChange={setSortModel}
        slots={{
          toolbar: EditToolbar as GridSlots['toolbar'],
        }}
        rowCount={estudantes.totalItems ? estudantes.totalItems : 0}
        showToolbar
        disableRowSelectionOnClick
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': { borderBottom: '1px dashed #F1F3F4' },
        }}
        initialState={{
          columns: {
            columnVisibilityModel: {
              nomePediatra: false,
              planoDeSaude: false,
            },
          },
        }}
      />

      {openForm && (
        <EstudanteFormDialog
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setSelected(null);
          }}
          currentData={selected}
          onSuccess={() => {
            getData();
            setNotification({
              open: true,
              message: `Criança ${selected ? 'editada' : 'criada'} com sucesso!`,
              severity: 'success',
            });
            setSelected(null);
          }}
        />
      )}

      <DefaultSnackBar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />

      <DialogDelete
        open={openModalDelete}
        onClose={() => {
          setOpenModalDelete(false);
          setSelected(null);
        }}
        onAfirmative={() => {
          remover('estudante', selected!.id!)
            .then(() => getData())
            .catch((e) => {
              setNotification({ open: true, message: e.message, severity: 'error' });
            })
            .finally(() => {
              setOpenModalDelete(false);
              setSelected(null);
            });
        }}
      />
    </DashboardContent>
  );
}
