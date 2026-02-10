import {
  Button,
  Dialog,
  DialogTitle,
  DialogActions,
  DialogContent,
  DialogContentText,
} from '@mui/material';

type DialogDeleteProps = {
  open: boolean;
  onClose(): void;
  onAfirmative(): void;
};

export default function DialogDelete(props: DialogDeleteProps) {
  const { open, onClose, onAfirmative } = props;
  return (
    <Dialog open={open} keepMounted onClose={onClose}>
      <DialogTitle>Exclusão</DialogTitle>
      <DialogContent>
        <DialogContentText>Deseja realmente excluir o registro selecionado?</DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button color="inherit" variant="text" onClick={onClose}>
          Cancelar
        </Button>
        <Button color="error" variant="contained" onClick={onAfirmative}>
          Excluir
        </Button>
      </DialogActions>
    </Dialog>
  );
}
