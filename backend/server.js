const express = require("express");
const mysql = require("mysql2/promise");
const bcrypt = require("bcrypt");
const cors = require("cors");

const app = express();
const PORT = 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuración de la conexión a MySQL
const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "1234",
  database: "popflix",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Validaciones
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidName = (name) => {
  return name.length >= 3 && /^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(name);
};

const isValidPhone = (phone) => {
  return phone.length >= 7 && /^\d+$/.test(phone.replace(/\D/g, ""));
};

const isValidPassword = (password) => {
  return password.length >= 8;
};

// Rutas
app.post("/api/auth/register", async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body;

    // Validar que todos los campos estén presentes
    if (!firstName || !lastName || !email || !phone || !password) {
      return res.status(400).json({ message: "Todos los campos son obligatorios" });
    }

    // Validar formato de datos
    if (firstName.length < 2 || !/^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(firstName)) {
      return res.status(400).json({ message: "Nombre inválido (mínimo 2 caracteres, solo letras)" });
    }

    if (lastName.length < 2 || !/^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(lastName)) {
      return res.status(400).json({ message: "Apellido inválido (mínimo 2 caracteres, solo letras)" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    if (!isValidPhone(phone)) {
      return res.status(400).json({ message: "Teléfono inválido (mínimo 7 dígitos)" });
    }

    if (!isValidPassword(password)) {
      return res.status(400).json({ message: "Contraseña muy corta (mínimo 8 caracteres)" });
    }

    const connection = await pool.getConnection();

    // Verificar si el email ya existe
    const [rows] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);

    if (rows.length > 0) {
      connection.release();
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Encriptar contraseña
    let hashedPassword;
    try {
      hashedPassword = await bcrypt.hash(password, 10);
      console.log("Contraseña hasheada:", hashedPassword.substring(0, 20) + "...");
    } catch (hashError) {
      console.error("Error al hashear contraseña:", hashError);
      connection.release();
      return res.status(500).json({ message: "Error al procesar contraseña" });
    }

    // Insertar usuario
    const [result] = await connection.query(
      "INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)",
      [firstName, lastName, email, phone, hashedPassword]
    );

    connection.release();

    return res.status(201).json({
      message: "Usuario registrado exitosamente",
      userId: result.insertId,
    });
  } catch (error) {
    console.error("Error en registro:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email y contraseña requeridos" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Email inválido" });
    }

    const connection = await pool.getConnection();

    const [rows] = await connection.query("SELECT id, firstName, lastName, email, password FROM users WHERE email = ?", [email]);

    if (rows.length === 0) {
      connection.release();
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    const user = rows[0];
    console.log("=== LOGIN DEBUG ===");
    console.log("Email encontrado:", user.email);
    console.log("Password de BD (primeros 30 chars):", user.password.substring(0, 30));
    console.log("Password enviado:", password);
    console.log("Tipo de password en BD:", typeof user.password);
    
    let passwordMatch = false;
    try {
      passwordMatch = await bcrypt.compare(password, user.password);
      console.log("Resultado bcrypt.compare:", passwordMatch);
    } catch (compareError) {
      console.error("Error en bcrypt.compare:", compareError.message);
      console.log("Intentando comparación directa...");
      passwordMatch = password === user.password;
      console.log("Comparación directa:", passwordMatch);
    }
    console.log("=== FIN DEBUG ===");

    connection.release();

    if (!passwordMatch) {
      return res.status(401).json({ message: "Credenciales incorrectas" });
    }

    return res.status(200).json({
      message: "Login exitoso",
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({ message: "Error en el servidor" });
  }
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({ message: "Backend running" });
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});
