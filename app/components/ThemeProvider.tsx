// components/ThemeProvider.tsx
"use client"; // Upewnij się, że ten plik jest używany jako klient

import { createTheme, ThemeProvider, CssBaseline, Button } from '@mui/material';
import { useState, ReactNode } from 'react';

type ThemeProviderProps = {
  children: ReactNode; // Typ dla children
};

const ThemeProviderComponent = ({ children }: ThemeProviderProps) => {
  const [darkMode, setDarkMode] = useState(false); // Domyślny tryb

  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  const toggleTheme = () => {
    setDarkMode((prev) => !prev); // Przełącz tryb
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline /> {/* Resetuje stylowanie, aby uniknąć problemów z różnicami w przeglądarkach */}
      <Button onClick={toggleTheme} variant="contained" color="primary" sx={{ mb: 2 }}>
        {darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} {/* Tekst przycisku */}
      </Button>
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderComponent;
