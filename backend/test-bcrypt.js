const bcrypt = require("bcrypt");

// Hash almacenado en BD
const storedHash = "$2b$10$bU1UZHEBk1BMuETCh.OOfw5TPoZd4ZHwS2dMGtZPgLPK6zJ4S3W";

// Intentar con contraseñas posibles
const passwords = ["Jorgecast05"];

async function testPasswords() {
  console.log("Testing bcrypt comparison...\n");
  
  for (const pwd of passwords) {
    try {
      const match = await bcrypt.compare(pwd, storedHash);
      console.log(`Password "${pwd}": ${match ? "✓ MATCH" : "✗ NO MATCH"}`);
    } catch (err) {
      console.log(`Password "${pwd}": ERROR - ${err.message}`);
    }
  }
}

testPasswords();
