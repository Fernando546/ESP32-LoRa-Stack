import { useState } from 'react';
import { Button, TextField, Typography, Box, CircularProgress } from '@mui/material';

interface LoginProps {
  onLoginSuccess: () => void;
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>; // Dodaj nową właściwość
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, setIsLoggedIn }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState<boolean>(false); 

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true); 

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        throw new Error('Invalid username or password');
      }

      const { token } = await response.json();
      localStorage.setItem('token', token); 
      setIsLoggedIn(true); // Ustaw isLoggedIn na true po udanym logowaniu
      onLoginSuccess(); 
    } catch (error: unknown) {
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Something went wrong'); 
      }
    } finally {
      setIsLoading(false); 
    }
  };

  return (
    <Box
      component="form"
      onSubmit={handleLogin}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: 4,
        bgcolor: 'background.default',
        borderRadius: 1,
        p: 2,
        boxShadow: 3,
      }}
    >
      {error && (
        <Typography color="error" sx={{ mb: 1 }}>
          {error}
        </Typography>
      )}
      <TextField
        label="Nazwa użytkownika"
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        fullWidth
        margin="normal"
        sx={{ bgcolor: 'background.paper' }}
      />
      <TextField
        label="Hasło"
        type="password"
        variant="outlined"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        fullWidth
        margin="normal"
        sx={{ bgcolor: 'background.paper' }}
      />
      <Button type="submit" variant="contained" color="primary" sx={{ mt: 2 }} disabled={isLoading}>
        {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Zaloguj'}
      </Button>
    </Box>
  );
};

export default Login;
