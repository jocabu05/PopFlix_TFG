const bcrypt = require("bcrypt");
const mysql = require("mysql2/promise");

async function createTestUser() {
  try {
    // Generar hash para "Jorgecast05"
    const password = "Jorgecast05";
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log("Hash generado:", hashedPassword);

    // Conectar a BD
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "1234",
      database: "popflix",
    });

    const connection = await pool.getConnection();

    // Insertar usuario
    const [result] = await connection.query(
      "INSERT INTO users (firstName, lastName, email, phone, password) VALUES (?, ?, ?, ?, ?)",
      ["Jorge", "Castera", "jorgecasterabueno@gmail.com", "674692531", hashedPassword]
    );

    console.log("Usuario creado con ID:", result.insertId);
    connection.release();
    pool.end();

  } catch (error) {
    console.error("Error:", error.message);
  }
}

createTestUser();
