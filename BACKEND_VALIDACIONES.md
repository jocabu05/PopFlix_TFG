# Validaciones Backend - popflixTFG_backend

## Ubicación
`C:\popflixTFG_backend\index.js`

## Cambios Necesarios

Tu backend actual tiene las rutas funcionando, pero necesita agregar validaciones en el servidor para asegurar que los datos sean correctos. Esto es **importante por seguridad**.

### 1. Agregar funciones de validación después de `const pool = mysql.createPool({...})`

```javascript
// Funciones de validación
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidName = (name) => {
  return name.length >= 3 && /^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(name);
};

const isValidPhone = (phone) => {
  return phone.length >= 7 && /^\d+$/.test(phone);
};

const isValidPassword = (password) => {
  return password.length >= 8;
};
```

### 2. Actualizar `POST /api/auth/register`

**Reemplazar la función completa con:**

```javascript
app.post("/api/auth/register", async (req, res) => {
  const { name, email, phone, password } = req.body;

  // Validaciones del servidor
  if (!name || !email || !phone || !password) {
    return res.status(400).json({ error: "Todos los campos son obligatorios" });
  }

  if (!isValidName(name)) {
    return res.status(400).json({ 
      error: "Nombre inválido (mínimo 3 caracteres, solo letras y espacios)" 
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Correo electrónico no válido" });
  }

  if (!isValidPhone(phone)) {
    return res.status(400).json({ 
      error: "Número de teléfono no válido (mínimo 7 dígitos, solo números)" 
    });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ 
      error: "Contraseña muy corta (mínimo 8 caracteres)" 
    });
  }

  try {
    // Verificar si el email ya existe
    const [existingUser] = await pool.query(
      "SELECT email FROM users WHERE email = ?",
      [email]
    );

    if (existingUser.length > 0) {
      return res.status(409).json({ error: "Este correo ya está registrado" });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const [rows] = await pool.query(
      "INSERT INTO users (name, email, phone, password_hash, created_at) VALUES (?, ?, ?, ?, NOW())",
      [name, email, phone, password_hash]
    );

    res.status(201).json({ 
      user: { 
        id: rows.insertId, 
        name, 
        email, 
        phone 
      } 
    });
  } catch (err) {
    console.error("Error en registro:", err);
    res.status(500).json({ error: "Error al registrar usuario. Intenta de nuevo más tarde." });
  }
});
```

### 3. Actualizar `POST /api/auth/login`

**Reemplazar la función completa con:**

```javascript
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  // Validaciones del servidor
  if (!email || !password) {
    return res.status(400).json({ error: "Email y contraseña son obligatorios" });
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: "Correo electrónico no válido" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos" });
    }

    res.status(200).json({ 
      user: { 
        id: user.id, 
        name: user.name, 
        email: user.email 
      } 
    });
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error en el servidor. Intenta de nuevo más tarde." });
  }
});
```

## Beneficios

✅ **Seguridad**: Valida los datos en el servidor (nunca confíes solo en el frontend)
✅ **Consistencia**: Las reglas son las mismas en frontend y backend
✅ **Errores Claros**: Los usuarios reciben mensajes específicos de qué falta
✅ **Prevención de Duplicados**: Verifica que el email no esté registrado
✅ **Mejor UX**: Respuestas HTTP correctas (400, 401, 409, 500)

## Resumen de Validaciones

| Campo | Requisito | Error |
|-------|-----------|-------|
| Nombre | Mínimo 3 caracteres, solo letras y espacios | 400 |
| Email | Formato válido (xxx@yyy.zzz) | 400 |
| Teléfono | Mínimo 7 dígitos, solo números | 400 |
| Contraseña (Registro) | Mínimo 8 caracteres | 400 |
| Email Duplicado | No debe existir en BD | 409 |
| Usuario No Encontrado (Login) | Email debe existir | 401 |
| Contraseña Incorrecta (Login) | Debe coincidir con hash | 401 |

## Estado Actual

✅ Frontend: Validaciones completas implementadas
⏳ Backend: Necesita las validaciones arriba

Cuando actualices el backend, el app tendrá validación en **dos capas**:
1. **Frontend**: Feedback inmediato al usuario
2. **Backend**: Protección de seguridad
