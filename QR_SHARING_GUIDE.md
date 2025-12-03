# 📱 Guía: Compartir popFlix por QR

## Resumen Rápido

Para compartir la APK de popFlix con tus amigos mediante un código QR:

### 1️⃣ Generar la APK

**Opción A: Usando el script PowerShell (Recomendado)**

```powershell
cd c:\popFlix_TFG
.\build-apk.ps1
```

**Opción B: Manual paso a paso**

```powershell
cd c:\popFlix_TFG

# Preparar proyecto (crea la carpeta android/)
expo prebuild --clean --npm

# Compilar APK
cd android
.\gradlew assembleDebug
cd ..
```

La APK se generará en: `android/app/build/outputs/apk/debug/app-debug.apk`

---

### 2️⃣ Generar el QR

**Opción A: Usando un servicio online**

1. Ve a https://qr-code-generator.com/ o similar
2. Sube tu APK a un servidor (ver opciones abajo)
3. Copia la URL pública
4. Genera un QR con esa URL

**Opción B: Usando la pantalla en la app**

1. Navega a `/share-apk` en la app
2. Toca "Generar APK y QR"
3. Escanea el código QR con otro dispositivo

**Opción C: Generar QR en PowerShell**

```powershell
# Instalar herramienta
dotnet tool install -g qrcode

# Generar QR
qrcode -o apk-qr.png "https://tu-url-del-apk.com/app-debug.apk"
```

---

### 3️⃣ Subir APK a un Servidor

**Opción 1: Google Drive (Más Fácil)**

```
1. Ve a https://drive.google.com
2. Sube el archivo app-debug.apk
3. Click derecho → Compartir
4. Copia el link de compartición
5. En la URL, extrae el ID del archivo (la parte larga)
6. Usa este formato: https://drive.google.com/uc?export=download&id=<ID>
```

**Opción 2: Firebase Storage**

```bash
# Instalar Firebase CLI
npm install -g firebase-tools

# Login
firebase login

# Subir archivo
firebase storage:upload app-debug.apk --token <tu-token>
```

**Opción 3: Servidor Web Personal**

```
1. Copia app-debug.apk a tu servidor web
2. Obtén la URL pública (ej: https://miservidor.com/apk/app-debug.apk)
3. Asegúrate que sea públicamente descargable
```

---

## 📱 Instalación en Dispositivo

### Para instalar desde el QR:

1. **En tu móvil Android:**
   - Abre Google Chrome o la cámara
   - Escanea el QR
   - Se abrirá el link de descarga
   - Toca descargar
   - Cuando termine, instala el APK

2. **Si pide permiso:**
   - Ve a Ajustes → Seguridad
   - Activa "Aplicaciones desconocidas"
   - Intenta de nuevo

### Para instalar vía ADB (Desde PC):

```powershell
# Conectar dispositivo por USB y activar Modo Desarrollador

# Instalar
adb install -r android/app/build/outputs/apk/debug/app-debug.apk

# Si quieres desinstalar después:
adb uninstall com.ejemplo.popflix_tfg
```

---

## 🔗 URL Formatos Útiles

### Google Drive (Recomendado)
```
https://drive.google.com/uc?export=download&id=TU_ID_AQUI
```

### GitHub Releases
```
https://github.com/TU_USUARIO/TU_REPO/releases/download/v1.0/app-debug.apk
```

### Firebase Hosting
```
https://tu-proyecto.firebaseapp.com/apk/app-debug.apk
```

---

## 🎯 Flujo Completo (Ejemplo)

```powershell
# 1. Construir APK
cd c:\popFlix_TFG
.\build-apk.ps1

# 2. Subir a Google Drive y obtener URL

# 3. Generar QR online con la URL

# 4. Compartir QR en WhatsApp, Telegram, etc.

# 5. Tus amigos escanean el QR → Descargan e instalan
```

---

## ⚠️ Requisitos Previos

- ✅ Java 11+ instalado
- ✅ Android SDK instalado (vía Android Studio)
- ✅ ANDROID_HOME configurado en variables de entorno
- ✅ Node.js y npm instalados
- ✅ Expo CLI: `npm install -g expo-cli`

### Verificar requisitos:

```powershell
# Java
java -version

# Android SDK
echo $env:ANDROID_HOME

# Node/npm
node -v
npm -v
```

---

## 🚀 Tips Adicionales

1. **Reducir tamaño del APK:**
   ```powershell
   # Compilar release (más pequeño pero sin debug)
   cd android
   .\gradlew assembleRelease
   ```

2. **Firmar APK para producción:**
   ```bash
   expo build:android -t apk
   ```

3. **Actualizar app sin desinstalar:**
   ```powershell
   adb install -r app-debug.apk
   ```

4. **Ver logs en tiempo real:**
   ```powershell
   adb logcat
   ```

---

## 📞 Soporte

Si tienes problemas:

1. Verifica que la URL del APK sea accesible
2. Comprueba que el código QR sea legible
3. En Android, habilita instalación de fuentes desconocidas
4. Revisa los logs: `expo start -c`

¡Listo! 🎉 Ya puedes compartir popFlix con tus amigos por QR
