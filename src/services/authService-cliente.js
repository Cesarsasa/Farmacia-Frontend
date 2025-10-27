import { API_URL } from "../../src/config/api";
// src/services/authService.js
 // cambia esto por tu dominio real

export async function loginCliente(correo, contrasena) {
  const res = await fetch(`${API_URL}/auth/login-cliente`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ correo, contrasena }),
  });

  if (!res.ok) throw new Error('Error al iniciar sesión');
  return await res.json();
}

export function saveToken(token) {
  localStorage.setItem('authTokenCli', token);
}

export function getToken() {
  return localStorage.getItem('authTokenCli');
}

export function logout() {
  localStorage.removeItem('authTokenCli');
}

// src/services/authService.js
const API_USER_URL = `${API_URL}/customer`;

export async function getUsuarioById(id, token) {
  const res = await fetch(`${API_USER_URL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) throw new Error('No se pudo obtener el usuario');
  return await res.json();
}