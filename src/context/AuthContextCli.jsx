import { createContext, useContext, useState, useEffect } from 'react';
import { saveToken, getToken, logout, getUsuarioById } from '../services/authService-cliente';

const AuthContextCli = createContext();

export function AuthProviderCli({ children }) {
  const [token, setToken] = useState(getToken());
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ nuevo estado

  const login = async (token) => {
    saveToken(token);
    setToken(token);
    setLoading(true); // ✅ comienza carga

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const usuario = await getUsuarioById(payload.id, token);
      setUser(usuario);
    } catch (err) {
      console.error('Error al obtener usuario:', err);
      logout();
      setToken(null);
    } finally {
      setLoading(false); // ✅ termina carga
    }
  };

  const signout = () => {
    logout();
    setToken(null);
    setUser(null);
    setLoading(false); // ✅ asegura que loading se apague
  };

  useEffect(() => {
    if (token && !user) {
      setLoading(true); // ✅ comienza carga
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        getUsuarioById(payload.id, token)
          .then(setUser)
          .catch(signout)
          .finally(() => setLoading(false)); // ✅ termina carga
      } catch {
        signout();
        setLoading(false); // ✅ termina carga en caso de error
      }
    } else {
      setLoading(false); // ✅ si no hay token, no hay carga
    }
  }, [token]);

  return (
    <AuthContextCli.Provider value={{ token, user, login, signout, loading }}>
      {children}
    </AuthContextCli.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContextCli);
}