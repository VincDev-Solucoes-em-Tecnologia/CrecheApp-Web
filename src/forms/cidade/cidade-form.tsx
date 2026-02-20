import type { AlertColor } from '@mui/material';
import type { CidadeResponse } from 'src/models/city/city-response';

import * as yup from 'yup';
import { useState } from 'react';
import { useFormik } from 'formik';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { capitalizeWords } from 'src/utils/format-text';

import { saveCidade } from 'src/services/city-service';

import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

const validationSchema = yup.object({
  nome: yup.string().required('Nome da cidade é obrigatório'),
  estado: yup
    .string()
    .required('Estado é obrigatório')
    .length(2, 'O estado deve conter exatamente 2 caracteres (Sigla)'),
});

type CidadeFormProps = {
  open: boolean;
  onClose: () => void;
  currentData?: CidadeResponse | null;
  onSuccess?: () => void;
};

export function CidadeFormDialog({ open, onClose, currentData, onSuccess }: CidadeFormProps) {
  const [notification, setNotification] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: currentData?.id || '',
      nome: currentData?.nome || '',
      estado: currentData?.estado || '',
    },
    validationSchema,
    onSubmit: async (values) => {
      await saveCidade(values)
        .then(() => {
          onSuccess?.();
          onClose();
        })
        .catch((e) => setNotification({ open: true, message: e.message, severity: 'error' }));
    },
  });

  const isEditing = currentData !== null && currentData !== undefined;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Cidade' : 'Nova Cidade'}</DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                name="nome"
                label="Nome da Cidade"
                size="small"
                onBlur={(e) => {
                  formik.handleBlur(e);
                  formik.setFieldValue('nome', capitalizeWords(e.target.value));
                }}
                value={formik.values.nome}
                onChange={formik.handleChange}
                error={formik.touched.nome && Boolean(formik.errors.nome)}
                helperText={formik.touched.nome && formik.errors.nome}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                name="estado"
                label="Estado (UF)"
                size="small"
                value={formik.values.estado}
                onChange={(e) => {
                  formik.setFieldValue('estado', e.target.value.toUpperCase().slice(0, 2));
                }}
                error={formik.touched.estado && Boolean(formik.errors.estado)}
                helperText={formik.touched.estado && formik.errors.estado}
              />
            </Grid>
          </Grid>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
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
        onClose={() => setNotification((p) => ({ ...p, open: false }))}
      />
    </Dialog>
  );
}
