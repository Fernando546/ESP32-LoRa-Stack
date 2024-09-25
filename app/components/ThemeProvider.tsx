// components/ThemeProvider.tsx
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material';
import { ReactNode } from 'react';

type ThemeProviderProps = {
  children: ReactNode;
  darkMode: boolean; // Dodaj prop dla darkMode
};

const ThemeProviderComponent = ({ children, darkMode }: ThemeProviderProps) => {
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
    },
  });

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  );
};

export default ThemeProviderComponent;
