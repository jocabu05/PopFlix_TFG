// Conectar a backend desde dispositivo físico
const API_URL = "http://192.168.68.103:9999/api/auth";

export async function login(credentials) {
  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Credenciales incorrectas" }));
      throw new Error(error.message || "Credenciales incorrectas");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}

export async function register(credentials) {
  try {
    const response = await fetch(`${API_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: "Error en registro" }));
      throw new Error(error.message || "Error en registro");
    }

    return await response.json();
  } catch (error) {
    throw error;
  }
}
