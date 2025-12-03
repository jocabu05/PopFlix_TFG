# ✅ popFlix - Configuración QR Completada

## 🎉 ¿Qué se ha hecho?

He añadido funcionalidad completa para **compartir la APK por QR**:

### ✨ Nuevas Features:

1. **Componente QRGenerator** (`components/QRGenerator.tsx`)
   - Genera códigos QR lindos y profesionales
   - Personalizable con colores y tamaños

2. **Pantalla Compartir por QR** (`app/share-apk.tsx`)
   - Interfaz intuitiva para generar QR
   - Instrucciones paso a paso para construir APK
   - Botón para acceder desde el home

3. **Script de Construcción** (`build-apk.ps1`)
   - Automático, solo ejecutar en PowerShell
   - Genera APK con un comando

4. **Guía Completa** (`QR_SHARING_GUIDE.md`)
   - Instrucciones detalladas
   - Opciones para subir a la nube
   - Troubleshooting

---

## 🚀 Cómo Usar

### Paso 1: Generar la APK

**Opción A (Recomendada - Automático):**
```powershell
cd c:\popFlix_TFG
.\build-apk.ps1
```

**Opción B (Manual):**
```powershell
cd c:\popFlix_TFG
expo prebuild --clean --npm
cd android
.\gradlew assembleDebug
cd ..
```

### Paso 2: Subir APK a la Nube (Google Drive)

```
1. Ve a https://drive.google.com
2. Sube: android/app/build/outputs/apk/debug/app-debug.apk
3. Click derecho → Compartir
4. Copia el link de compartición
5. Extrae el ID del archivo (la parte larga en la URL)
```

### Paso 3: Generar QR

**Opción A (Online - Más fácil):**
- Ve a https://qr-code-generator.com/
- Pega la URL del APK de Google Drive
- Descarga el QR

**Opción B (En la app):**
- Abre popFlix en emulador
- Tap "🏠 Bienvenido a POPFLIX"
- Tap "📱 Compartir por QR"
- Sigue las instrucciones

### Paso 4: Compartir el QR

- Por WhatsApp, Telegram, Discord, etc.
- Tus amigos escanean → Descargan e instalan

---

## 📱 Instalación por QR

### En el móvil del usuario final:

1. **Escanea el QR** con cámara o Google Lens
2. **Se abrirá el link** en Chrome
3. **Toca descargar** el APK
4. **Espera** a que se descargue
5. **Instala** el archivo APK
   - Si pide permisos, ve a Ajustes → Seguridad → Permitir fuentes desconocidas
6. **¡Listo!** Abre popFlix

---

## 🔗 URL Recomendada para Google Drive

Usa este formato (reemplaza con tu ID):
```
https://drive.google.com/uc?export=download&id=TU_ID_AQUI
```

Ejemplo:
```
https://drive.google.com/uc?export=download&id=1aB2cD3eF4gH5iJ6kL7mN8oP9qR0sT1uV
```

---

## 📦 Tamaño Estimado

- APK de debug: ~50-100 MB (desarrollo)
- APK de release: ~30-50 MB (producción)

---

## ⚙️ Configuración Necesaria

✅ Java 11+
✅ Android SDK
✅ Node.js y npm
✅ Expo CLI

### Verificar:
```powershell
java -version
node -v
npm -v
echo $env:ANDROID_HOME
```

---

## 🎯 Flujo Completo

```
1. Generar APK:      .\build-apk.ps1
                     ↓
2. Subir a Drive:    Copia el archivo
                     ↓
3. Generar QR:       qr-code-generator.com
                     ↓
4. Compartir QR:     WhatsApp/Telegram/Discord
                     ↓
5. Usuarios escanean → Descargan → Instalan
```

---

## 🔗 Archivos Principales

- `components/QRGenerator.tsx` - Componente QR
- `app/share-apk.tsx` - Pantalla de compartir
- `build-apk.ps1` - Script de construcción
- `QR_SHARING_GUIDE.md` - Guía completa
- `app/home.tsx` - Home con botón de compartir

---

## 💡 Tips

### Para Producción:

```powershell
cd android
.\gradlew assembleRelease
# APK más pequeño: app/build/outputs/apk/release/
```

### Firmar APK para Google Play:

```bash
expo build:android -t apk
```

### Ver en tiempo real:

```powershell
adb logcat
```

---

## ✅ Checklist

- [ ] ¿Tienes Java 11+ instalado?
- [ ] ¿Está configurado ANDROID_HOME?
- [ ] ¿Ejecutaste `npm install`?
- [ ] ¿Corriste `.\build-apk.ps1`?
- [ ] ¿Subiste el APK a Google Drive?
- [ ] ¿Generaste el QR?
- [ ] ¿Testaste en un dispositivo/emulador?

---

## 📞 Si Hay Problemas

### "No encuentra gradlew"
```powershell
# Asegúrate de estar en la carpeta correcta
cd c:\popFlix_TFG
expo prebuild --clean
```

### "Port 8081 already in use"
```powershell
# Mata los procesos de Node
Get-Process node | Stop-Process -Force
```

### "Cannot download APK"
- Verifica que la URL de Drive es pública
- Usa: https://drive.google.com/uc?export=download&id=...

### "Installation failed"
- Desinstala versión anterior: `adb uninstall com.ejemplo.popflix_tfg`
- Activa "Fuentes desconocidas" en Ajustes de Android

---

## 🎉 ¡Listo!

Ya puedes compartir popFlix con tus amigos por QR. 

¿Preguntas? Revisa `QR_SHARING_GUIDE.md` para más detalles.
