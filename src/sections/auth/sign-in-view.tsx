import { useState } from 'react';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/config-global';
import { auth, appleProvider, googleProvider, microsoftProvider } from 'src/lib/firebase';

import { Logo } from 'src/components/logo';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function SignInView() {
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError('');

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const idToken = await user.getIdToken();
      localStorage.setItem('accessToken', idToken);

      router.push('/');
    } catch (err: any) {
      switch (err.code) {
        case 'auth/invalid-credential':
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          setError('Email ou senha incorretos.');
          break;
        case 'auth/too-many-requests':
          setError('Muitas tentativas falhas. Tente novamente mais tarde.');
          break;
        default:
          setError('Ocorreu um erro ao fazer login.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: any) => {
    try {
      setError('');

      const userCredential = await signInWithPopup(auth, provider);
      const token = await userCredential.user.getIdToken();
      localStorage.setItem('accessToken', token);
      router.push('/');
    } catch (err: any) {
      setError(err.message || 'Erro na autenticação.');
    }
  };

  const renderForm = (
    <Box
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        handleSignIn();
      }}
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        flexDirection: 'column',
      }}
    >
      <TextField
        fullWidth
        name="email"
        label="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        sx={{ mb: 3 }}
        slotProps={{
          inputLabel: { shrink: true },
        }}
      />

      {/* <Link variant="body2" color="inherit" sx={{ mb: 1.5 }}>
        Forgot password?
      </Link> */}

      <TextField
        fullWidth
        name="password"
        label="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type={showPassword ? 'text' : 'password'}
        slotProps={{
          inputLabel: { shrink: true },
          input: {
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                  <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                </IconButton>
              </InputAdornment>
            ),
          },
        }}
        sx={{ mb: 3 }}
      />

      {/* Feedback de erro visual */}
      {!!error && (
        <Alert severity="error" sx={{ mb: 3, width: '100%' }}>
          {error}
        </Alert>
      )}

      <Button
        fullWidth
        size="large"
        type="submit"
        color="inherit"
        variant="contained"
        disabled={loading}
      >
        {loading ? 'Entrando...' : 'Entrar'}
      </Button>
    </Box>
  );

  return (
    <>
      <Box
        sx={{
          gap: 1.5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          mb: 5,
        }}
      >
        {/* OPÇÃO 1: Logo Pequeno (Padrão) */}
        {/* <Logo /> */}

        {/* OPÇÃO 2: Logo Grande/Completo (Se você configurou o isSingle={false}) 
      Recomendado para Login se quiser destaque.
  */}
        {/* <Logo isSingle={false} sx={{ width: 120, height: 40, mb: 2 }} /> */}

        {/* OPÇÃO 3: Só o ícone mas maior */}
        <Logo sx={{ width: 150, height: 150, mb: 1 }} />
        <Typography variant="h5">{`Admin - ${CONFIG.appName}`}</Typography>
        {/* <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
          }}
        >
          Don’t have an account?
          <Link variant="subtitle2" sx={{ ml: 0.5 }}>
            Get started
          </Link>
        </Typography> */}
      </Box>
      {renderForm}
      <Divider sx={{ my: 3, '&::before, &::after': { borderTopStyle: 'dashed' } }}>
        <Typography
          variant="overline"
          sx={{ color: 'text.secondary', fontWeight: 'fontWeightMedium' }}
        >
          OU
        </Typography>
      </Divider>
      <Box sx={{ gap: 1, display: 'flex', justifyContent: 'center', mb: 3 }}>
        {/* Google */}
        <IconButton color="inherit" onClick={() => handleSocialLogin(googleProvider)}>
          <Iconify width={22} icon="logos:google-icon" />
        </IconButton>

        {/* Microsoft */}
        <IconButton color="inherit" onClick={() => handleSocialLogin(microsoftProvider)}>
          <Iconify width={22} icon="logos:microsoft-icon" />
        </IconButton>

        {/* Apple */}
        <IconButton color="inherit" onClick={() => handleSocialLogin(appleProvider)}>
          <Iconify width={22} icon="mdi:apple" />
        </IconButton>
      </Box>
    </>
  );
}
