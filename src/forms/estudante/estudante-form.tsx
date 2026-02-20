import 'dayjs/locale/pt-br';

import type { ChangeEvent } from 'react';
import type { UsuarioResponse } from 'src/models/user/usuario-response';

import dayjs from 'dayjs';
import * as yup from 'yup';
import { useState, useEffect } from 'react';
import { getIn, useFormik, FieldArray, FormikProvider } from 'formik';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import Dialog from '@mui/material/Dialog';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DeleteIcon from '@mui/icons-material/Delete';
import { Badge, Stack, Tooltip } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import { formatTime, getDataSeisMesesAtras } from 'src/utils/format-time';
import { capitalizeWords, capitalizeFirstLetter } from 'src/utils/format-text';

import { getSalas } from 'src/services/sala-service';
import { getUsuarios } from 'src/services/usuario-service';
import { objectToFormData } from 'src/network/api-service';
import { saveEstudanteForm } from 'src/services/estudante-service';
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
  const [previewUrl, setPreviewUrl] = useState<string>('');

  const isEditing = currentData !== null;

  useEffect(() => {
    if (open) {
      getSalas(1, 1000, 'nome', 'asc').then((r) => setSalas(r.data || []));
      getUsuarios(1, 1000, 'nome', 'asc', 'Pai', null, false).then((r) =>
        setPais(r.data?.items || [])
      );
      setPreviewUrl(currentData?.fotoOriginalUrl || '');
    }
  }, [open, currentData]);

  const handlePhotoChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      const sizeInMB = file.size / 1024 / 1024;
      if (sizeInMB > 5) {
        setNotification({
          open: true,
          message: 'A foto deve ter no máximo 5MB.',
          severity: 'warning',
        });
        return;
      }

      if (!file.type.startsWith('image/')) {
        setNotification({
          open: true,
          message: 'O arquivo deve ser uma imagem.',
          severity: 'warning',
        });
        return;
      }

      formik.setFieldValue('fotoArquivo', file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
    }
  };

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
          horarios: m.horarios.map((x) => formatTime(x)) || [],
        })) || [],
      fotoArquivo: null,
      removerFoto: false,
    },
    onSubmit: async (values) => {
      const payload: any = {
        ...values,
        id: values.id,
        dataNascimento: new Date(values.dataNascimento).toISOString(),
        foto: values.fotoArquivo,
        removerFoto: values.removerFoto,
      };

      delete payload._paisObjetos;

      const formData = objectToFormData(payload);

      await saveEstudanteForm(formData, isEditing)
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

  const handleRemovePhoto = () => {
    setPreviewUrl('');
    formik.setFieldValue('fotoArquivo', null);
    formik.setFieldValue('removerFoto', true);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>{isEditing ? 'Editar Criança' : 'Nova Criança'}</DialogTitle>
      <FormikProvider value={formik}>
        <form onSubmit={formik.handleSubmit} noValidate>
          <DialogContent>
            <Grid container spacing={2}>
              {/* --- DADOS PESSOAIS --- */}
              <Grid size={12}>
                <Typography variant="subtitle2" color="primary">
                  Dados Pessoais
                </Typography>
              </Grid>

              <Grid size={{ xs: 12 }}>
                <Grid container spacing={2} alignItems="center">
                  {/* COLUNA 1: FOTO (Ocupa 3/12 do espaço em telas médias+) */}
                  <Grid
                    size={{ xs: 12, sm: 3, md: 3 }}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <Stack direction="column" alignItems="center" spacing={1}>
                      <Badge
                        overlap="circular"
                        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                        badgeContent={
                          <label htmlFor="icon-button-file">
                            <input
                              accept="image/*"
                              id="icon-button-file"
                              type="file"
                              style={{ display: 'none' }}
                              onChange={handlePhotoChange}
                            />
                            <IconButton
                              color="primary"
                              aria-label="enviar foto"
                              component="span"
                              sx={{
                                bgcolor: 'background.paper',
                                boxShadow: 2,
                                '&:hover': { bgcolor: '#f0f0f0' },
                              }}
                            >
                              <PhotoCameraIcon />
                            </IconButton>
                          </label>
                        }
                      >
                        <Avatar
                          alt="Foto da Criança"
                          src={previewUrl}
                          sx={{ width: 150, height: 150, border: '1px solid #e0e0e0' }}
                        >
                          {!previewUrl && formik.values.nome
                            ? formik.values.nome[0].toUpperCase()
                            : ''}
                        </Avatar>
                      </Badge>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography variant="caption" color="textSecondary" align="center">
                          Foto (Máx 5MB)
                        </Typography>
                        {previewUrl && (
                          <Tooltip title="Remover foto">
                            <IconButton size="small" color="error" onClick={handleRemovePhoto}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </Stack>
                  </Grid>

                  {/* COLUNA 2: CAMPOS NOME/SOBRENOME (Ocupa 9/12 do espaço) */}
                  <Grid size={{ xs: 12, sm: 9, md: 9 }}>
                    <Grid container spacing={2}>
                      <Grid size={{ xs: 12 }}>
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
                      <Grid size={{ xs: 12 }}>
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
                      {/* <Grid size={{ xs: 12 }}>
                        <TextField
                          fullWidth
                          size="small"
                          label="Data de Nascimento"
                          name="dataNascimento"
                          type="date"
                          InputLabelProps={{ shrink: true }}
                          value={formik.values.dataNascimento}
                          onChange={formik.handleChange}
                          error={
                            formik.touched.dataNascimento && Boolean(formik.errors.dataNascimento)
                          }
                        />
                      </Grid> */}
                      <Grid size={{ xs: 12 }}>
                        <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
                          <DatePicker
                            label="Data de Nascimento"
                            format="DD/MM/YYYY"
                            minDate={dayjs('0001-01-01')}
                            disableFuture
                            value={
                              formik.values.dataNascimento
                                ? dayjs(formik.values.dataNascimento)
                                : null
                            }
                            onChange={(newValue) => {
                              if (newValue && newValue.isValid()) {
                                formik.setFieldValue(
                                  'dataNascimento',
                                  newValue.format('YYYY-MM-DD')
                                );
                              } else {
                                formik.setFieldValue('dataNascimento', null);
                              }
                            }}
                            slotProps={{
                              textField: {
                                size: 'small',
                                fullWidth: true,
                                error:
                                  formik.touched.dataNascimento &&
                                  Boolean(formik.errors.dataNascimento),
                                helperText:
                                  formik.touched.dataNascimento && formik.errors.dataNascimento,
                              },
                            }}
                          />
                        </LocalizationProvider>
                      </Grid>
                      <Grid size={{ xs: 12 }}>
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
                    </Grid>
                  </Grid>
                </Grid>
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
                  error={formik.touched.nomePediatra && Boolean(formik.errors.nomePediatra)}
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
                  error={formik.touched.planoDeSaude && Boolean(formik.errors.planoDeSaude)}
                  onChange={formik.handleChange}
                />
              </Grid>

              <Grid size={12}>
                <Autocomplete
                  multiple
                  options={pais}
                  size="small"
                  getOptionLabel={(option) => option.nomeCompleto}
                  value={formik.values._paisObjetos as UsuarioResponse[]}
                  isOptionEqualToValue={(option, value) => option.id === value.id}
                  onChange={(_, newValue) => {
                    formik.setFieldValue('_paisObjetos', newValue);
                    formik.setFieldValue(
                      'paisResponsaveisIds',
                      newValue.map((v) => v.id)
                    );
                  }}
                  renderValue={(value, getTagProps) =>
                    value.map((option, index) => {
                      const { key, ...tagProps } = getTagProps({ index });
                      return (
                        <Chip
                          size="small"
                          key={key}
                          label={option.nomeCompleto}
                          {...tagProps}
                          color={option.ativo ? 'default' : 'error'}
                          variant="outlined"
                        />
                      );
                    })
                  }
                  renderOption={(props, option) => {
                    const { key, ...optionProps } = props;
                    return (
                      <li
                        key={key}
                        {...optionProps}
                        style={{ color: option.ativo ? 'inherit' : 'red' }}
                      >
                        {option.nomeCompleto} {option.ativo ? '' : '(Inativo)'}
                      </li>
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
                      const touchedNome = getIn(formik.touched, `medicamentos[${index}].nome`);
                      const errorNome = getIn(formik.errors, `medicamentos[${index}].nome`);

                      const touchedDose = getIn(formik.touched, `medicamentos[${index}].doseEmMl`);
                      const errorDose = getIn(formik.errors, `medicamentos[${index}].doseEmMl`);

                      const touchedHorarios = getIn(
                        formik.touched,
                        `medicamentos[${index}].horarios`
                      );
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
                                error={Boolean(touchedNome && errorNome)}
                                helperText={touchedNome && errorNome}
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
                                error={Boolean(touchedDose && errorDose)}
                                helperText={touchedDose && errorDose}
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
                                    {touchedHorarios &&
                                      errorHorarios &&
                                      typeof errorHorarios === 'string' && (
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
              } as UsuarioResponse,
            ]);
            formik.setFieldValue('paisResponsaveisIds', [
              ...formik.values.paisResponsaveisIds,
              r.id,
            ]);
            getUsuarios(1, 1000, 'nome', 'asc', 'Pai', null, false).then((r2) =>
              setPais(r2.data?.items || [])
            );
          }
        }}
      />
    </Dialog>
  );
}
