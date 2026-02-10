import { useNavigate } from 'react-router-dom';
import { getAuth, signOut } from 'firebase/auth';

import { Box, Button } from '@mui/material';

export const LogoutButton = () => {
  const navigate = useNavigate();
  const auth = getAuth();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      localStorage.removeItem('accessToken');
      navigate('/sign-in');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <Box sx={{ p: 1 }}>
      <Button fullWidth color="error" size="medium" variant="text" onClick={handleLogout}>
        Logout
      </Button>
    </Box>
  );
};
