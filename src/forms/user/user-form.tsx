import type { CidadeResponse } from 'src/models/city/city-response';
import type { UsuarioResponse } from 'src/models/user/usuario-response';

import * as yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import { type AlertColor, CircularProgress } from '@mui/material';

import { capitalizeWords, capitalizeFirstLetter } from 'src/utils/format-text';

import { getCities } from 'src/services/city-service';
import { USER_TYPES } from 'src/constants/user-constants';
import { addUsuario, updateUsuario } from 'src/services/usuario-service';

import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

export type UserFormData = {
  id?: string;
  email?: string;
  nome?: string;
  sobrenome?: string;
  endereco?: string;
  bairro?: string;
  numero?: string | number;
  cidadeId?: number | string;
  tipo?: number;
};

type UserFormDialogProps = {
  open: boolean;
  onClose: () => void;
  currentUser?: UserFormData | null;
  onSuccess?: (response: UsuarioResponse | null) => void;
  forceDisableType?: boolean;
};

const validationSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  sobrenome: yup.string().required('Sobrenome é obrigatório'),
  email: yup.string().email('Email inválido').required('Email é obrigatório'),
  endereco: yup.string().required('Endereço é obrigatório'),
  bairro: yup.string().required('Bairro é obrigatório'),
  numero: yup.number().typeError('Deve ser um número').required('Número é obrigatório'),
  tipo: yup.number().required('Selecione um tipo'),
  cidadeId: yup.string().required('Selecione uma cidade'),
});

export function UserFormDialog({
  open,
  onClose,
  currentUser,
  onSuccess,
  forceDisableType = false,
}: UserFormDialogProps) {
  const [cities, setCities] = useState<CidadeResponse[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleCloseNotification = () => setNotification((prev) => ({ ...prev, open: false }));

  useEffect(() => {
    if (open) {
      setLoadingCities(true);
      getCities()
        .then((r) => setCities(r.data!))
        .finally(() => setLoadingCities(false));
    }
  }, [open]);

  const formik = useFormik<UserFormData>({
    enableReinitialize: true,
    initialValues: {
      id: currentUser?.id || '',
      nome: currentUser?.nome || '',
      sobrenome: currentUser?.sobrenome || '',
      email: currentUser?.email || '',
      endereco: currentUser?.endereco || '',
      bairro: currentUser?.bairro || '',
      numero: currentUser?.numero ?? '',
      tipo: currentUser?.tipo || 2,
      cidadeId: currentUser?.cidadeId || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        numero: Number(values.numero),
      };

      const userTypeLabel = USER_TYPES.find((x) => x.value == values.tipo)!.label!;

      if (values.id) {
        await updateUsuario(payload)
          .then(() => {
            if (onSuccess) onSuccess(null);
            handleClose();
          })
          .catch((e) => {
            setNotification({ open: true, message: e.message, severity: 'error' });
          });
      } else {
        await addUsuario(userTypeLabel, payload)
          .then((r) => {
            if (onSuccess) onSuccess(r.data!);
            handleClose();
          })
          .catch((e) => {
            setNotification({ open: true, message: e.message, severity: 'error' });
          });
      }
    },
  });

  const handleClose = () => {
    formik.resetForm();
    onClose();
  };

  const isEditing = currentUser !== null;

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditing ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                select
                fullWidth
                size="small"
                id="tipo"
                name="tipo"
                label="Tipo de Usuário"
                value={formik.values.tipo}
                onChange={formik.handleChange}
                error={formik.touched.tipo && Boolean(formik.errors.tipo)}
                helperText={formik.touched.tipo && formik.errors.tipo}
                disabled={isEditing || forceDisableType}
              >
                {USER_TYPES.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label == 'Pai' ? 'Responsável' : option.label}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                id="email"
                name="email"
                label="Email"
                value={formik.values.email}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.email && Boolean(formik.errors.email)}
                helperText={formik.touched.email && formik.errors.email}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                id="nome"
                name="nome"
                label="Nome"
                value={formik.values.nome}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  formik.setFieldValue('nome', capitalizeWords(e.target.value));
                }}
                error={formik.touched.nome && Boolean(formik.errors.nome)}
                helperText={formik.touched.nome && formik.errors.nome}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                size="small"
                id="sobrenome"
                name="sobrenome"
                label="Sobrenome"
                value={formik.values.sobrenome}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  formik.setFieldValue('sobrenome', capitalizeWords(e.target.value));
                }}
                error={formik.touched.sobrenome && Boolean(formik.errors.sobrenome)}
                helperText={formik.touched.sobrenome && formik.errors.sobrenome}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                select
                fullWidth
                size="small"
                id="cidadeId"
                name="cidadeId"
                label="Cidade"
                value={formik.values.cidadeId}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.cidadeId && Boolean(formik.errors.cidadeId)}
                helperText={formik.touched.cidadeId && formik.errors.cidadeId}
                disabled={loadingCities}
                InputLabelProps={{ shrink: true }}
                slotProps={{
                  select: {
                    displayEmpty: true,
                    IconComponent: loadingCities
                      ? () => <CircularProgress size={20} sx={{ mr: 2 }} />
                      : undefined,
                  },
                }}
              >
                <MenuItem value="" disabled>
                  <em>Selecione uma cidade</em>
                </MenuItem>
                {cities.map((city) => (
                  <MenuItem key={city.id} value={city.id}>
                    {city.nome}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid size={{ xs: 12, sm: 8 }}>
              <TextField
                fullWidth
                size="small"
                id="endereco"
                name="endereco"
                label="Endereço"
                value={formik.values.endereco}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  formik.setFieldValue('endereco', capitalizeWords(e.target.value));
                }}
                error={formik.touched.endereco && Boolean(formik.errors.endereco)}
                helperText={formik.touched.endereco && formik.errors.endereco}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 4 }}>
              <TextField
                fullWidth
                size="small"
                id="numero"
                name="numero"
                label="Número"
                type="number"
                value={formik.values.numero}
                onChange={formik.handleChange}
                onBlur={formik.handleBlur}
                error={formik.touched.numero && Boolean(formik.errors.numero)}
                helperText={formik.touched.numero && formik.errors.numero}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                id="bairro"
                name="bairro"
                label="Bairro"
                value={formik.values.bairro}
                onChange={formik.handleChange}
                onBlur={(e) => {
                  formik.handleBlur(e);
                  formik.setFieldValue('bairro', capitalizeFirstLetter(e.target.value));
                }}
                error={formik.touched.bairro && Boolean(formik.errors.bairro)}
                helperText={formik.touched.bairro && formik.errors.bairro}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button onClick={handleClose} color="inherit">
          Cancelar
        </Button>
        <LoadingButton
          loading={formik.isSubmitting}
          onClick={() => formik.handleSubmit()}
          variant="contained"
          color="primary"
          type="submit"
        >
          Salvar
        </LoadingButton>
      </DialogActions>
      <DefaultSnackBar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleCloseNotification}
      />
    </Dialog>
  );
}
