import type { AlertColor } from '@mui/material';
import type { UsuarioResponse, PagedUsuarioResponse } from 'src/models/user/usuario-response';
import type { GridSlots, GridColDef, GridSortModel, GridPaginationModel } from '@mui/x-data-grid';

import { useState, useEffect, useCallback } from 'react';

import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import { ptBR } from '@mui/x-data-grid/locales';
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
import { UserFormDialog } from 'src/forms/user/user-form';
import { USER_TYPES } from 'src/constants/user-constants';
import { getUsuarios } from 'src/services/usuario-service';

import DialogDelete from 'src/components/dialog/dialog-delete';
import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

// ----------------------------------------------------------------------

export function UserView() {
  const [users, setUsers] = useState<PagedUsuarioResponse>({} as PagedUsuarioResponse);
  const [isLoading, setIsLoading] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [userSelected, setUserSelected] = useState<UsuarioResponse | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [sortModel, setSortModel] = useState<GridSortModel>([]);

  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
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
    setUserSelected(null);
    setOpenForm(true);
  };

  const handleEdit = (user: UsuarioResponse) => {
    setUserSelected(user);
    setOpenForm(true);
  };

  const handleDelete = (user: UsuarioResponse) => {
    setUserSelected(user);
    setOpenModalDelete(true);
  };

  const columns: GridColDef<UsuarioResponse>[] = [
    { field: 'nome', headerName: 'Nome', flex: 1, minWidth: 150 },
    { field: 'sobrenome', headerName: 'Sobrenome', flex: 1, minWidth: 150 },
    { field: 'email', headerName: 'Email', flex: 1, minWidth: 200 },
    { field: 'cidade', headerName: 'Cidade', width: 150 },
    { field: 'estado', headerName: 'Estado', width: 150 },
    { field: 'endereco', headerName: 'Endereço', width: 200 },
    { field: 'bairro', headerName: 'Bairro', width: 150 },
    { field: 'numero', headerName: 'Número', width: 100 },
    {
      field: 'tipo',
      headerName: 'Tipo',
      width: 120,
      sortable: false,
      valueGetter: (value, row) => (row.tipo === 'Pai' ? 'Responsável' : row.tipo),
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'Ações',
      width: 100,
      cellClassName: 'actions',
      getActions: ({ row }) => [
        <GridActionsCellItem icon={<EditIcon />} label="Edit" onClick={() => handleEdit(row)} />,
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDelete(row)}
        />,
      ],
    },
  ];

  const getData = useCallback(() => {
    setIsLoading(true);
    getUsuarios(
      paginationModel.page + 1,
      paginationModel.pageSize,
      sortModel.length > 0 ? sortModel[0].field : '',
      sortModel.length > 0 ? sortModel[0].sort! : ''
    )
      .then((r) => {
        setUsers(r.data ? r.data : ({} as PagedUsuarioResponse));
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
          Novo Usuário
        </Button>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  }

  return (
    <DashboardContent disablePadding maxWidth="xl">
      <DataGrid
        rows={users.items}
        columns={columns}
        loading={isLoading}
        density="compact"
        paginationMode="server"
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        pageSizeOptions={[5, 10, 25, 50]}
        sortingMode="server"
        onSortModelChange={setSortModel}
        slots={{
          toolbar: EditToolbar as GridSlots['toolbar'],
        }}
        rowCount={users?.totalItems ? users.totalItems : 0}
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
              estado: false,
              bairro: false,
              numero: false,
            },
          },
        }}
      />

      <UserFormDialog
        open={openForm}
        onClose={() => setOpenForm(false)}
        currentUser={
          userSelected
            ? {
                ...userSelected,
                tipo: USER_TYPES.find((t) => t.label === userSelected.tipo)?.value || 2,
              }
            : null
        }
        onSuccess={() => {
          getData();
          setNotification({
            open: true,
            message: `Usuário ${userSelected ? 'editado' : 'criado'} com sucesso!`,
            severity: 'success',
          });
        }}
      />

      <DefaultSnackBar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
      <DialogDelete
        open={openModalDelete}
        onClose={() => setOpenModalDelete(false)}
        onAfirmative={() => {
          remover('usuario', userSelected!.id!)
            .then(() => getData())
            .catch((e) => {
              setNotification({ open: true, message: e.message, severity: 'error' });
            })
            .finally(() => setOpenModalDelete(false));
        }}
      />
    </DashboardContent>
  );
}
