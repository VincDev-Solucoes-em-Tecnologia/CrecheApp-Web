import type { AlertColor } from '@mui/material';
import type { SalaResponse } from 'src/models/sala/sala-response';
import type { GridSlots, GridColDef, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';

import { useState, useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { ptBR } from '@mui/x-data-grid/locales';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { formatTime } from 'src/utils/format-time';

import { DashboardContent } from 'src/layouts/dashboard';
import { SalaFormDialog } from 'src/forms/sala/sala-form';
import { getSalas, removerSala } from 'src/services/sala-service';

import DialogDelete from 'src/components/dialog/dialog-delete';
import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

// ----------------------------------------------------------------------

export function SalaView() {
  const [salas, setSalas] = useState<SalaResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [salaSelected, setSalaSelected] = useState<SalaResponse | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 50,
  });

  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleNew = () => {
    setSalaSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (row: SalaResponse) => {
    setSalaSelected(row);
    setOpenForm(true);
  };

  const handleDelete = (user: SalaResponse) => {
    setSalaSelected(user);
    setOpenModalDelete(true);
  };

  const columns: GridColDef<SalaResponse>[] = [
    { field: 'nome', headerName: 'Nome da Sala', flex: 1, minWidth: 150, sortable: false },
    {
      field: 'horarioInicio',
      headerName: 'Horario',
      flex: 1,
      minWidth: 150,
      sortable: false,
      valueGetter: (value, row) =>
        `${formatTime(row.horarioInicio)} até ${formatTime(row.horarioFim)}`,
    },
    {
      field: 'professores',
      headerName: 'Professores Responsáveis',
      flex: 1.5,
      minWidth: 250,
      sortable: false,
      valueGetter: (value, row) => {
        if (!row.professoresResponsaveis || row.professoresResponsaveis.length === 0) return '';
        return row.professoresResponsaveis.map((p) => `${p.nome}`).join(', ');
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Editar " onClick={() => handleEdit(row)} />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Excluir"
          onClick={() => handleDelete(row)}
        />,
      ],
    },
  ];

  const getData = useCallback(() => {
    setIsLoading(true);
    getSalas(
      paginationModel.page + 1,
      paginationModel.pageSize,
      sortModel.length > 0 ? sortModel[0].field : '',
      sortModel.length > 0 ? sortModel[0].sort! : ''
    )
      .then((r) => {
        setSalas(r.data ? r.data : []);
      })
      .catch((e) => {
        setNotification({ open: true, message: e.message, severity: 'error' });
      })
      .finally(() => setIsLoading(false));
  }, [paginationModel, sortModel]);

  useEffect(() => {
    getData();
  }, [getData]);

  const handleCloseNotification = () => {
    setNotification((prev) => ({ ...prev, open: false }));
  };

  function EditToolbar() {
    return (
      <GridToolbarContainer sx={{ padding: 1 }}>
        <Button startIcon={<AddIcon />} onClick={handleNew}>
          Nova Sala
        </Button>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  }

  return (
    <DashboardContent disablePadding maxWidth="xl">
      <DataGrid
        rows={salas}
        columns={columns}
        loading={isLoading}
        density="compact"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25, 50]}
        sortingMode="server"
        onSortModelChange={setSortModel}
        slots={{
          toolbar: EditToolbar as GridSlots['toolbar'],
        }}
        showToolbar
        disableRowSelectionOnClick
        localeText={ptBR.components.MuiDataGrid.defaultProps.localeText}
        sx={{
          border: 'none',
          '& .MuiDataGrid-cell': { borderBottom: '1px dashed #F1F3F4' },
        }}
      />

      {openForm && (
        <SalaFormDialog
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setSalaSelected(null);
          }}
          currentData={salaSelected}
          onSuccess={() => {
            getData();
            setNotification({
              open: true,
              message: `Sala ${salaSelected ? 'editada' : 'criada'} com sucesso!`,
              severity: 'success',
            });
            setSalaSelected(null);
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
          setSalaSelected(null);
        }}
        onAfirmative={() => {
          if (!salaSelected?.id) return;
          removerSala(salaSelected.id)
            .then(() => getData())
            .catch((e) => {
              setNotification({ open: true, message: e.message, severity: 'error' });
            })
            .finally(() => {
              setOpenModalDelete(false);
              setSalaSelected(null);
            });
        }}
      />
    </DashboardContent>
  );
}
