// components/Login.tsx

import { useState } from 'react';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';

type LoginProps = {
  setIsLoggedIn: React.Dispatch<React.SetStateAction<boolean>>;
  closeDialog: () => void; // Dodanie prop `closeDialog`
};

const Login: React.FC<LoginProps> = ({ setIsLoggedIn, closeDialog }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Logika logowania
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
      const { token } = await response.json();
      localStorage.setItem('token', token);
      setIsLoggedIn(true);
      closeDialog(); // Zamknij dialog po udanym logowaniu
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <TextField
        label="Username"
        variant="outlined"
        fullWidth
        margin="normal"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />
      <TextField
        label="Password"
        type="password"
        variant="outlined"
        fullWidth
        margin="normal"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <Button type="submit" variant="contained" color="primary">
        Login
      </Button>
    </form>
  );
};

export default Login;
