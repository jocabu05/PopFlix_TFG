# Guía para Compilar en Android - popFlix

## ✅ Cambios Realizados

He corregido los siguientes problemas que impedían la compilación en Android:

### 1. **API URL para Android** 
   - **Problema**: IP hardcodeada `172.20.10.2` no funciona en Android
   - **Solución**: Ahora usa `10.0.2.2` para emulador y puedes cambiar a tu IP local para dispositivo real
   - **Archivo**: `services/authService.js`

### 2. **Función de Login/Register**
   - **Problema**: `login(email, password)` recibía dos parámetros pero se llamaba con un objeto
   - **Solución**: Ahora reciben un objeto `credentials` para mayor flexibilidad
   - **Archivos**: `services/authService.js`, `app/login.tsx`

### 3. **AuthContext vacío**
   - **Problema**: El archivo estaba vacío
   - **Solución**: Implementado contexto de autenticación completo
   - **Archivo**: `context/AuthContext.tsx`

### 4. **Componentes Link no válidos en Expo Router**
   - **Problema**: `Link.Trigger`, `Link.Preview`, `Link.Menu` no existen
   - **Solución**: Simplificado a componente `Link` básico
   - **Archivo**: `app/(tabs)/index.tsx`

### 5. **Registro incompleto**
   - **Problema**: `handleRegister` vacío en `app/register.tsx`
   - **Solución**: Implementada lógica completa con validaciones
   - **Archivo**: `app/register.tsx`

## 🚀 Cómo Compilar en Android

### Opción 1: Emulador Android (Recomendado para desarrollo)

```bash
# 1. Inicia el emulador de Android desde Android Studio o línea de comandos

# 2. Ejecuta el proyecto
npm run android

# O usa:
expo start --android
```

### Opción 2: Dispositivo Real

```bash
# 1. Conecta tu dispositivo vía USB
# 2. Activa el Modo de Desarrollador en tu dispositivo
# 3. En PowerShell:

cd c:\popFlix_TFG
npm run android

# O usa:
expo start --android
```

### Opción 3: Build APK para distribución

```bash
# Crear un APK de desarrollo
eas build --platform android --local

# O si lo prefieres sin EAS:
expo prebuild --clean
cd android
.\gradlew assembleDebug
```

## ⚠️ Importante: Configurar IP del Backend

Edita `services/authService.js` según tu entorno:

```javascript
// Para Android emulador (por defecto):
const API_URL = "http://10.0.2.2:4000/api/auth";

// Para dispositivo real, cambia a tu IP local:
const API_URL = "http://192.168.X.X:4000/api/auth"; // Tu IP local
```

Para encontrar tu IP local en Windows:
```powershell
ipconfig
# Busca "IPv4" en la sección de tu red WiFi/Ethernet
```

## 🔍 Verificación

Ejecuta esto para verificar que no hay errores de TypeScript:

```bash
cd c:\popFlix_TFG
npx tsc --noEmit
```

## 📋 Checklist Antes de Compilar

- ✅ Dependencias instaladas: `npm install` ✓
- ✅ TypeScript compila sin errores ✓
- ✅ Backend API corriendo en `http://localhost:4000/api/auth`
- ✅ IP correcta en `authService.js` (10.0.2.2 para emulador, tu IP para dispositivo)
- ✅ Android SDK instalado y configurado en Android Studio

## 🐛 Troubleshooting

### "Cannot connect to API"
- Verifica que el backend esté corriendo
- Revisa la IP en `authService.js`
- En emulador, usa `10.0.2.2` (no localhost)

### "Module not found" errors
- Ejecuta: `npm install`
- Limpia caché: `expo start -c`

### "Java/Gradle errors"
- Asegúrate que Java 11+ está instalado
- Ejecuta: `cd android && .\gradlew clean`

## 📚 Documentación

- [Expo Docs - Android](https://docs.expo.dev/build-reference/apk/)
- [React Native - Android Setup](https://reactnative.dev/docs/environment-setup)
- [Expo Router - Deployment](https://docs.expo.dev/router/deployment/)
