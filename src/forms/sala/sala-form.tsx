import type { AlertColor } from '@mui/material';
import type { SalaResponse } from 'src/models/sala/sala-response';
import type { UsuarioResponse } from 'src/models/user/usuario-response';

import * as yup from 'yup';
import { useFormik } from 'formik';
import { useState, useEffect } from 'react';

import Grid from '@mui/material/Grid';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import Autocomplete from '@mui/material/Autocomplete';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { formatTime } from 'src/utils/format-time';
import { capitalizeFirstLetter } from 'src/utils/format-text';

import { saveSala } from 'src/services/sala-service';
import { getUsuarios } from 'src/services/usuario-service';

import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

const validationSchema = yup.object({
  nome: yup.string().required('Nome da sala é obrigatório'),
  horarioInicio: yup.string().required('Horário de início é obrigatório'),
  horarioFim: yup
    .string()
    .required('Horário de fim é obrigatório')
    // eslint-disable-next-line func-names
    .test('is-greater', 'O horário final deve ser maior que o inicial', function (value) {
      const { horarioInicio } = this.parent;
      if (!horarioInicio || !value) return true;
      return value > horarioInicio;
    }),
  professoresResponsaveis: yup.array().min(1, 'Selecione ao menos um professor'),
});

type SalaFormProps = {
  open: boolean;
  onClose: () => void;
  currentData?: SalaResponse | null;
  onSuccess?: () => void;
};

export function SalaFormDialog({ open, onClose, currentData, onSuccess }: SalaFormProps) {
  const [professores, setProfessores] = useState<UsuarioResponse[]>([]);
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
    if (open) {
      getUsuarios(1, 100, 'nome', 'asc', 'Professor').then((r) =>
        setProfessores(r.data?.items || [])
      );
    }
  }, [open]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: currentData?.id || '',
      nome: currentData?.nome || '',
      horarioInicio: formatTime(currentData?.horarioInicio),
      horarioFim: formatTime(currentData?.horarioFim),
      professoresResponsaveis: currentData?.professoresResponsaveis?.map((p) => p.id) || [],
      _professoresObj: currentData?.professoresResponsaveis || [],
    },
    validationSchema,
    onSubmit: async (values) => {
      const payload = {
        ...values,
        horarioInicio:
          values.horarioInicio.length === 5 ? `${values.horarioInicio}:00` : values.horarioInicio,
        horarioFim: values.horarioFim.length === 5 ? `${values.horarioFim}:00` : values.horarioFim,
        professoresResponsaveisIds: values.professoresResponsaveis,
      };
      await saveSala(payload)
        .then(() => {
          onSuccess?.();
          onClose();
        })
        .catch((e) => setNotification({ open: true, message: e.message, severity: 'error' }));
    },
  });

  const isEditing = currentData !== null;

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? 'Editar Sala' : 'Nova Sala'}</DialogTitle>
      <DialogContent sx={{ mt: 1 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid size={12}>
              <TextField
                fullWidth
                name="nome"
                label="Nome da Sala"
                size="small"
                onBlur={(e) => {
                  formik.handleBlur(e);
                  formik.setFieldValue('nome', capitalizeFirstLetter(e.target.value));
                }}
                value={formik.values.nome}
                onChange={formik.handleChange}
                error={formik.touched.nome && Boolean(formik.errors.nome)}
                helperText={formik.touched.nome && formik.errors.nome}
                disabled={isEditing}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                id="horarioInicio"
                name="horarioInicio"
                label="Horário Início"
                type="time"
                InputLabelProps={{ shrink: true }}
                inputProps={{ step: 60 }}
                value={formik.values.horarioInicio}
                onChange={formik.handleChange}
                error={formik.touched.horarioInicio && Boolean(formik.errors.horarioInicio)}
                helperText={formik.touched.horarioInicio && formik.errors.horarioInicio}
                disabled={isEditing}
              />
            </Grid>

            <Grid size={12}>
              <TextField
                fullWidth
                size="small"
                id="horarioFim"
                name="horarioFim"
                label="Horário Fim"
                type="time"
                InputLabelProps={{ shrink: true }}
                value={formik.values.horarioFim}
                onChange={formik.handleChange}
                error={formik.touched.horarioFim && Boolean(formik.errors.horarioFim)}
                helperText={formik.touched.horarioFim && formik.errors.horarioFim}
                disabled={isEditing}
              />
            </Grid>
            <Grid size={12}>
              <Autocomplete
                multiple
                size="small"
                options={professores}
                getOptionLabel={(option) => {
                  const nome = option.nome || '';
                  const sobrenome = option.sobrenome || '';
                  return `${nome} ${sobrenome}`.trim();
                }}
                value={formik.values._professoresObj as UsuarioResponse[]}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                onChange={(_, newValue) => {
                  formik.setFieldValue('_professoresObj', newValue);
                  formik.setFieldValue(
                    'professoresResponsaveis',
                    newValue.map((v) => v.id)
                  );
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Professores Responsáveis"
                    error={
                      formik.touched.professoresResponsaveis &&
                      Boolean(formik.errors.professoresResponsaveis)
                    }
                    helperText={
                      formik.touched.professoresResponsaveis &&
                      (formik.errors.professoresResponsaveis as string)
                    }
                  />
                )}
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
