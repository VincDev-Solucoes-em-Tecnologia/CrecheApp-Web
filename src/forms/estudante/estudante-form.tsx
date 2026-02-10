import type { UsuarioResponse } from 'src/models/user/usuario-response';

import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { getIn, useFormik, FieldArray, FormikProvider } from 'formik';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { Tooltip } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // ou outro ícone

import { getDataSeisMesesAtras } from 'src/utils/format-time';
import { capitalizeWords, capitalizeFirstLetter } from 'src/utils/format-text';

import { getSalas } from 'src/services/sala-service';
import { getUsuarios } from 'src/services/usuario-service';
import { saveEstudante } from 'src/services/estudante-service';
import {
  EstudanteFormSchema,
  type EstudanteResponse,
} from 'src/models/estudante/estudante-reponse';

import { DefaultSnackBar } from 'src/components/snackbar/default-snackbar';

import { UserFormDialog } from '../user/user-form';

const validationSchema = yup.object({
  nome: yup.string().required('Nome é obrigatório'),
  sobrenome: yup.string().required('Sobrenome é obrigatório'),
  dataNascimento: yup.string().required('Data de nascimento obrigatória'),
  salaId: yup.string().required('Selecione uma sala'),
  paisResponsaveisIds: yup.array().min(1, 'Selecione ao menos um responsável'),
  medicamentos: yup.array().of(
    yup.object({
      nome: yup.string().required('Nome do medicamento obrigatório'),
      doseEmMl: yup.number().typeError('Deve ser número').required('Dose obrigatória'),
      horarios: yup.array().min(1, 'Adicione ao menos um horário'),
    })
  ),
  intoleranciasAlimentares: yup.array().of(
    yup.object({
      nome: yup.string().required('Nome do alimento obrigatório'),
      tipo: yup.string().required('Tipo obrigatório'),
    })
  ),
});

type Props = {
  open: boolean;
  onClose: () => void;
  currentData?: EstudanteResponse | null;
  onSuccess?: () => void;
};

export function EstudanteFormDialog({ open, onClose, currentData, onSuccess }: Props) {
  const [salas, setSalas] = useState<any[]>([]);
  const [pais, setPais] = useState<any[]>([]);
  const [notification, setNotification] = useState<any>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [openFormUsuario, setOpenFormUsuario] = useState(false);

  useEffect(() => {
    if (open) {
      getSalas(1, 100, 'nome', 'asc').then((r) => setSalas(r.data || []));
      getUsuarios(1, 100, 'nome', 'asc', 'Pai').then((r) => setPais(r.data?.items || []));
    }
  }, [open]);

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      id: currentData?.id || '',
      nome: currentData?.nome || '',
      sobrenome: currentData?.sobrenome || '',
      dataNascimento: currentData?.dataNascimento
        ? currentData.dataNascimento.split('T')[0]
        : getDataSeisMesesAtras(),
      nomePediatra: currentData?.nomePediatra || '',
      planoDeSaude: currentData?.planoDeSaude || '',
      salaId: currentData?.sala?.id || '',
      paisResponsaveisIds: currentData?.paisResponsaveis?.map((p) => p.id) || [],
      _paisObjetos: currentData?.paisResponsaveis || [],
      intoleranciasAlimentares:
        currentData?.intoleranciasAlimentares?.map((i) => ({
          nome: i.nome || '',
          tipo: i.tipo || '',
        })) || [],
      medicamentos:
        currentData?.medicamentos?.map((m) => ({
          nome: m.nome || '',
          doseEmMl: m.doseEmMl || 0,
          observacao: m.observacao || '',
          horarios: m.horarios || [],
        })) || [],
    },
    onSubmit: async (values) => {
      const payload: any = {
        ...values,
        id: values.id,
        dataNascimento: new Date(values.dataNascimento).toISOString(),
      };

      delete payload._paisObjetos;

      await saveEstudante(payload)
        .then(() => {
          onSuccess?.();
          onClose();
        })
        .catch((e) => setNotification({ open: true, message: e.message, severity: 'error' }));
    },
    validate: (values) => {
      const result = EstudanteFormSchema.safeParse(values);
      if (result.success) return {};
      const errors: any = {};
      result.error.issues.forEach((issue) => {
        const path = issue.path.join('.');
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const setObjValue = (obj: any, path: (string | number)[], value: string) => {
          const [head, ...rest] = path;
          if (rest.length === 0) {
            obj[head] = value;
          } else {
            if (!obj[head]) obj[head] = typeof rest[0] === 'number' ? [] : {};
            setObjValue(obj[head], rest, value);
          }
        };
        setObjValue(errors, issue.path as any, issue.message);
      });
      return errors;
    },
  });

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{currentData ? 'Editar Criança' : 'Nova Criança'}</DialogTitle>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <DialogContent dividers>
            <Grid container spacing={2}>
              {/* --- DADOS PESSOAIS --- */}
              <Grid size={12}>
                <Typography variant="subtitle2" color="primary">
                  Dados Pessoais
                </Typography>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome"
                  name="nome"
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
                  size="small"
                  label="Sobrenome"
                  name="sobrenome"
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    formik.setFieldValue('sobrenome', capitalizeWords(e.target.value));
                  }}
                  value={formik.values.sobrenome}
                  onChange={formik.handleChange}
                  error={formik.touched.sobrenome && Boolean(formik.errors.sobrenome)}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Data de Nascimento"
                  name="dataNascimento"
                  type="date"
                  InputLabelProps={{ shrink: true }}
                  value={formik.values.dataNascimento}
                  onChange={formik.handleChange}
                  error={formik.touched.dataNascimento && Boolean(formik.errors.dataNascimento)}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Sala"
                  name="salaId"
                  value={formik.values.salaId}
                  onChange={formik.handleChange}
                  error={formik.touched.salaId && Boolean(formik.errors.salaId)}
                >
                  {salas.map((s) => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.nome}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>

              {/* --- SAÚDE & RESPONSÁVEIS --- */}
              <Grid size={12} sx={{ mt: 1 }}>
                <Typography variant="subtitle2" color="primary">
                  Saúde & Família
                </Typography>
              </Grid>

              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Nome do Pediatra"
                  name="nomePediatra"
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    formik.setFieldValue('nomePediatra', capitalizeWords(e.target.value));
                  }}
                  value={formik.values.nomePediatra}
                  onChange={formik.handleChange}
                />
              </Grid>
              <Grid size={12}>
                <TextField
                  fullWidth
                  size="small"
                  label="Plano de Saúde"
                  name="planoDeSaude"
                  onBlur={(e) => {
                    formik.handleBlur(e);
                    formik.setFieldValue('planoDeSaude', capitalizeFirstLetter(e.target.value));
                  }}
                  value={formik.values.planoDeSaude}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={pais}
                  size="small"
                  getOptionLabel={(option) => {
                    const nome = option.nome || '';
                    const sobrenome = option.sobrenome || '';
                    return `${nome} ${sobrenome}`.trim();
                  }}
                  value={formik.values._paisObjetos as UsuarioResponse[]}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('_paisObjetos', newValue);
                    formik.setFieldValue(
                      'paisResponsaveisIds',
                      newValue.map((v) => v.id)
                    );
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Pais/Responsáveis"
                      error={
                        formik.touched.paisResponsaveisIds &&
                        Boolean(formik.errors.paisResponsaveisIds)
                      }
                      InputProps={{
                        ...params.InputProps,
                        endAdornment: (
                          <>
                            {params.InputProps.endAdornment}{' '}
                            <Tooltip title="Cadastrar novo responsável">
                              <IconButton
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenFormUsuario(true);
                                }}
                                size="small"
                                color="primary"
                                sx={{ marginRight: -1 }}
                              >
                                <AddCircleOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </>
                        ),
                      }}
                    />
                  )}
                />
              </Grid>

              {/* --- LISTA: INTOLERÂNCIAS --- */}
              <Grid size={12} sx={{ mt: 2 }}>
                <Divider textAlign="left">
                  <Typography variant="caption">INTOLERÂNCIAS ALIMENTARES</Typography>
                </Divider>
              </Grid>

              <FieldArray name="intoleranciasAlimentares">
                {({ push, remove }) => (
                  <Grid size={12}>
                    {formik.values.intoleranciasAlimentares.map((_: any, index: any) => (
                      <Box
                        key={index}
                        sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}
                      >
                        <TextField
                          size="small"
                          placeholder="Alimento (ex: Leite)"
                          fullWidth
                          onBlur={(e) => {
                            formik.handleBlur(e);
                            formik.setFieldValue(
                              `intoleranciasAlimentares[${index}].nome`,
                              capitalizeFirstLetter(e.target.value)
                            );
                          }}
                          name={`intoleranciasAlimentares[${index}].nome`}
                          value={formik.values.intoleranciasAlimentares[index].nome}
                          onChange={formik.handleChange}
                        />
                        <TextField
                          size="small"
                          placeholder="Tipo (ex: Lactose)"
                          fullWidth
                          onBlur={(e) => {
                            formik.handleBlur(e);
                            formik.setFieldValue(
                              `intoleranciasAlimentares[${index}].tipo`,
                              capitalizeFirstLetter(e.target.value)
                            );
                          }}
                          name={`intoleranciasAlimentares[${index}].tipo`}
                          value={formik.values.intoleranciasAlimentares[index].tipo}
                          onChange={formik.handleChange}
                        />
                        <IconButton color="error" onClick={() => remove(index)}>
                          <DeleteIcon />
                        </IconButton>
                      </Box>
                    ))}
                    <Button
                      startIcon={<AddCircleIcon />}
                      size="small"
                      onClick={() => push({ nome: '', tipo: '' })}
                      type="button"
                    >
                      Adicionar Intolerância
                    </Button>
                  </Grid>
                )}
              </FieldArray>

              {/* --- LISTA: MEDICAMENTOS --- */}
              <Grid size={12} sx={{ mt: 2 }}>
                <Divider textAlign="left">
                  <Typography variant="caption">MEDICAMENTOS CONTÍNUOS</Typography>
                </Divider>
              </Grid>

              <FieldArray name="medicamentos">
                {({ push, remove }) => (
                  <Grid size={12}>
                    {formik.values.medicamentos.map((medicamento: any, index: any) => {
                      const errorNome = getIn(formik.errors, `medicamentos[${index}].nome`);
                      const errorDose = getIn(formik.errors, `medicamentos[${index}].doseEmMl`);
                      const errorHorarios = getIn(formik.errors, `medicamentos[${index}].horarios`);

                      return (
                        <Paper
                          key={index}
                          variant="outlined"
                          sx={{ p: 2, mb: 2, bgcolor: '#F9FAFB' }}
                        >
                          <Grid container spacing={2}>
                            <Grid
                              size={12}
                              sx={{ display: 'flex', justifyContent: 'space-between' }}
                            >
                              <Typography variant="subtitle2">Medicamento #{index + 1}</Typography>
                              <IconButton size="small" color="error" onClick={() => remove(index)}>
                                <DeleteIcon />
                              </IconButton>
                            </Grid>

                            <Grid size={8}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Nome Medicamento"
                                name={`medicamentos[${index}].nome`}
                                onBlur={(e) => {
                                  formik.handleBlur(e);
                                  formik.setFieldValue(
                                    `medicamentos[${index}].nome`,
                                    capitalizeFirstLetter(e.target.value)
                                  );
                                }}
                                value={medicamento.nome}
                                onChange={formik.handleChange}
                                error={Boolean(errorNome)}
                                helperText={errorNome}
                              />
                            </Grid>
                            <Grid size={4}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Dose (ml)"
                                type="number"
                                name={`medicamentos[${index}].doseEmMl`}
                                value={medicamento.doseEmMl}
                                onChange={formik.handleChange}
                                error={Boolean(errorDose)}
                              />
                            </Grid>
                            <Grid size={12}>
                              <TextField
                                fullWidth
                                size="small"
                                label="Observação"
                                onBlur={(e) => {
                                  formik.handleBlur(e);
                                  formik.setFieldValue(
                                    `medicamentos[${index}].observacao`,
                                    capitalizeFirstLetter(e.target.value)
                                  );
                                }}
                                name={`medicamentos[${index}].observacao`}
                                value={medicamento.observacao}
                                onChange={formik.handleChange}
                              />
                            </Grid>

                            {/* Sub-lista de Horários */}
                            <Grid size={12}>
                              <FieldArray name={`medicamentos[${index}].horarios`}>
                                {({ push: pushHora, remove: removeHora }) => (
                                  <Box>
                                    <Typography variant="caption" display="block">
                                      Horários (HH:mm):
                                    </Typography>
                                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 1 }}>
                                      {medicamento.horarios &&
                                        medicamento.horarios.map(
                                          (hora: string, idxHora: number) => (
                                            <Chip
                                              key={idxHora}
                                              label={hora}
                                              onDelete={() => removeHora(idxHora)}
                                              size="small"
                                            />
                                          )
                                        )}
                                    </Box>
                                    {/* Input temporário para adicionar hora */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                      <TextField
                                        id={`temp-hora-${index}`}
                                        type="time"
                                        size="small"
                                        sx={{ width: 120 }}
                                        InputLabelProps={{ shrink: true }}
                                      />
                                      <Button
                                        variant="outlined"
                                        size="small"
                                        type="button"
                                        onClick={() => {
                                          const input = document.getElementById(
                                            `temp-hora-${index}`
                                          ) as HTMLInputElement;
                                          if (input.value) {
                                            pushHora(input.value);
                                            input.value = '';
                                          }
                                        }}
                                      >
                                        Adicionar Hora
                                      </Button>
                                    </Box>
                                    {errorHorarios && typeof errorHorarios === 'string' && (
                                      <Typography variant="caption" color="error">
                                        {errorHorarios}
                                      </Typography>
                                    )}
                                  </Box>
                                )}
                              </FieldArray>
                            </Grid>
                          </Grid>
                        </Paper>
                      );
                    })}
                    <Button
                      startIcon={<AddCircleIcon />}
                      size="small"
                      onClick={() => push({ nome: '', doseEmMl: 0, observacao: '', horarios: [] })}
                    >
                      Adicionar Medicamento
                    </Button>
                  </Grid>
                )}
              </FieldArray>
            </Grid>
          </DialogContent>

          <DialogActions>
            <Button onClick={onClose} color="inherit">
              Cancelar
            </Button>
            <LoadingButton type="submit" variant="contained" loading={formik.isSubmitting}>
              Salvar
            </LoadingButton>
          </DialogActions>
        </form>
      </FormikProvider>

      <DefaultSnackBar
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={() => setNotification({ ...notification, open: false })}
      />

      <UserFormDialog
        open={openFormUsuario}
        onClose={() => setOpenFormUsuario(false)}
        currentUser={null}
        forceDisableType
        onSuccess={(r) => {
          if (r !== null) {
            formik.setFieldValue('_paisObjetos', [
              ...formik.values._paisObjetos,
              {
                id: r.id,
                nome: r.nome,
                sobrenome: r.sobrenome,
              } as UsuarioResponse, // O cast deve ser no objeto inteiro, se necessário
            ]);
            formik.setFieldValue('paisResponsaveisIds', [
              ...formik.values.paisResponsaveisIds,
              r.id,
            ]);
            getUsuarios(1, 100, 'nome', 'asc', 'Pai').then((r2) => setPais(r2.data?.items || []));
          }
        }}
      />
    </Dialog>
  );
}
