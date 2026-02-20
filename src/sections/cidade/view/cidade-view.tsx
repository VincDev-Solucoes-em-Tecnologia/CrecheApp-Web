import type { GridSlots, GridColDef } from '@mui/x-data-grid';
import type { CidadeResponse } from 'src/models/city/city-response';

import { useState, useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { ptBR } from '@mui/x-data-grid/locales';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { Tooltip, type AlertColor } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridToolbarContainer,
  GridToolbarFilterButton,
  GridToolbarColumnsButton,
} from '@mui/x-data-grid';

import { DashboardContent } from 'src/layouts/dashboard';
import { CidadeFormDialog } from 'src/forms/cidade/cidade-form';
import { getCities, removerCidade } from 'src/services/city-service';

import DialogDelete from 'src/components/dialog/dialog-delete';
import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

export function CidadeView() {
  const [cidades, setCidades] = useState<CidadeResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [cidadeSelected, setCidadeSelected] = useState<CidadeResponse | null>(null);
  const [openForm, setOpenForm] = useState(false);

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
    setCidadeSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (row: CidadeResponse) => {
    setCidadeSelected(row);
    setOpenForm(true);
  };

  const handleDelete = (row: CidadeResponse) => {
    setCidadeSelected(row);
    setOpenModalDelete(true);
  };

  const columns: GridColDef<CidadeResponse>[] = [
    { field: 'nome', headerName: 'Nome da Cidade', flex: 1, minWidth: 200, sortable: true },
    { field: 'estado', headerName: 'Estado', flex: 0.5, minWidth: 100, sortable: true },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ row }) => {
        const btnEdit = (
          <GridActionsCellItem
            key="edit"
            icon={<EditIcon />}
            label="Editar"
            onClick={() => handleEdit(row)}
          />
        );

        const btnDelete = row.podeSerExcluido ? (
          <GridActionsCellItem
            key="delete"
            icon={<DeleteIcon color="error" />}
            label="Excluir"
            onClick={() => handleDelete(row)}
          />
        ) : (
          <Tooltip key="delete-tooltip" title="Não é possível excluir pois possui vínculos ativos.">
            <span>
              <GridActionsCellItem
                icon={<DeleteIcon color="disabled" />}
                label="Excluir"
                disabled
              />
            </span>
          </Tooltip>
        );

        return [btnEdit, btnDelete];
      },
    },
  ];

  const getData = useCallback(() => {
    setIsLoading(true);
    getCities()
      .then((r) => {
        setCidades(r.data ? r.data : []);
      })
      .catch((e) => {
        setNotification({ open: true, message: e.message, severity: 'error' });
      })
      .finally(() => setIsLoading(false));
  }, []);

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
          Nova Cidade
        </Button>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  }

  return (
    <DashboardContent disablePadding maxWidth="xl">
      <DataGrid
        rows={cidades}
        columns={columns}
        loading={isLoading}
        density="compact"
        pageSizeOptions={[5, 10, 25, 50]}
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
        <CidadeFormDialog
          open={openForm}
          onClose={() => {
            setOpenForm(false);
            setCidadeSelected(null);
          }}
          currentData={cidadeSelected}
          onSuccess={() => {
            getData();
            setNotification({
              open: true,
              message: `Cidade ${cidadeSelected ? 'editada' : 'criada'} com sucesso!`,
              severity: 'success',
            });
            setCidadeSelected(null);
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
          setCidadeSelected(null);
        }}
        onAfirmative={() => {
          if (!cidadeSelected?.id) return;
          removerCidade(cidadeSelected.id)
            .then(() => getData())
            .catch((e: any) => {
              setNotification({ open: true, message: e.message, severity: 'error' });
            })
            .finally(() => {
              setOpenModalDelete(false);
              setCidadeSelected(null);
            });
        }}
      />
    </DashboardContent>
  );
}
