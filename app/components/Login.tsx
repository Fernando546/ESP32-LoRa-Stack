import { useState } from 'react';

const Login = ({ onLoginSuccess }: { onLoginSuccess: () => void }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string>(''); // Określenie typu jako string

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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
      localStorage.setItem('token', token); // Przechowaj token w localStorage
      onLoginSuccess(); // Wywołaj funkcję callback po pomyślnym zalogowaniu
    } catch (error: unknown) { // Określenie typu jako unknown
      if (error instanceof Error) {
        setError(error.message); // Użyj message, jeśli error jest instancją Error
      } else {
        setError('Something went wrong'); // W przypadku innego typu błędu
      }
    }
  };

  return (
    <form onSubmit={handleLogin} className="mt-4 flex flex-col items-center">
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="text"
        placeholder="Nazwa użytkownika"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        className="border rounded mb-2 p-2"
      />
      <input
        type="password"
        placeholder="Hasło"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border rounded mb-2 p-2"
      />
      <button type="submit" className="bg-blue-500 text-white px-4 py-2 rounded-lg">Zaloguj</button>
    </form>
  );
};

export default Login;
