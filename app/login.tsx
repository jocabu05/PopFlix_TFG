import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuthContext } from "../context/AuthContext";
import { login as loginService } from "../services/authService";

// Ruta correcta del logo
const logo = require("../assets/images/popflix-logo.png");
const PRIMARY_BLUE = "#1976D2";

// Paleta cinematográfica profesional tipo streaming
const BG_DARK = "#0F0F0F";              // Negro profundo (Netflix-style)
const BG_ACCENT = "#1A1A1A";            // Gris oscuro
const NEON_RED = "#B20710";             // Rojo Netflix oscuro
const NEON_ORANGE = "#D97706";          // Naranja cálido suave
const TEXT_LIGHT = "#FFFFFF";
const TEXT_MUTED = "#B0B0B0";

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function LoginScreen() {
  const router = useRouter();
  const { login: contextLogin } = useAuthContext();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Animación del fondo
  const bgAnimation = new Animated.Value(0);
  
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgAnimation, {
          toValue: 1,
          duration: 6000,
          useNativeDriver: false,
        }),
        Animated.timing(bgAnimation, {
          toValue: 0,
          duration: 6000,
          useNativeDriver: false,
        }),
      ])
    ).start();
  }, []);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Animación del logo
  const logoScale = new Animated.Value(1);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.05,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const handleLogin = async () => {
    let isValid = true;
    
    if (!email) {
      setEmailError("El correo es obligatorio");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Correo electrónico no válido");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("La contraseña es obligatoria");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Contraseña muy corta (mínimo 6 caracteres)");
      isValid = false;
    } else {
      setPasswordError("");
    }

    if (!isValid) return;

    setLoading(true);
    try {
      const response = await loginService({ email, password });
      
      if (response.user) {
        contextLogin(response.user);
        const userName = response.user?.firstName || response.user?.name || "Usuario";
        alert(`✅ Bienvenido ${userName}`);
        router.push("/select-platforms");
      } else {
        alert("❌ Error: No se recibieron datos del usuario");
      }
    } catch (err) {
      if (err instanceof Error) {
        alert(`❌ Credenciales incorrectas: ${err.message}`);
      } else {
        alert("❌ Error desconocido. Inténtalo de nuevo");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          backgroundColor: bgAnimation.interpolate({
            inputRange: [0, 0.5, 1],
            outputRange: [BG_DARK, BG_ACCENT, BG_DARK],
          }),
        }
      ]}
    >
      {/* HEADER CON LOGO */}
      <View style={styles.headerContainer}>
        <Animated.Image 
          source={logo} 
          style={[styles.logo, { transform: [{ scale: logoScale }] }]} 
          resizeMode="contain" 
        />
        <Text style={styles.subtitle}>Disfruta de tus películas favoritas</Text>
      </View>

      {/* FORMULARIO */}
      <View style={styles.formContainer}>
        {/* EMAIL */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="email" size={16} color={NEON_RED} />
            <Text style={styles.labelText}>Email</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'email' && styles.inputFocused,
              email && styles.inputFilled,
              emailError && styles.inputError,
            ]}
            placeholder="tu@email.com"
            placeholderTextColor="#A0A0A0"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (text && !isValidEmail(text)) {
                setEmailError("Correo electrónico no válido");
              } else {
                setEmailError("");
              }
            }}
            onFocus={() => setFocusedInput('email')}
            onBlur={() => setFocusedInput(null)}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* CONTRASEÑA */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="lock" size={16} color={NEON_RED} />
            <Text style={styles.labelText}>Contraseña</Text>
          </View>
          <View style={styles.passwordInputWrapper}>
            <TextInput
              style={[
                styles.input,
                focusedInput === 'password' && styles.inputFocused,
                password && styles.inputFilled,
                passwordError && styles.inputError,
              ]}
              placeholder="Tu contraseña"
              placeholderTextColor="#A0A0A0"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (text.length > 0 && text.length < 6) {
                  setPasswordError("Contraseña muy corta (mínimo 6 caracteres)");
                } else {
                  setPasswordError("");
                }
              }}
              onFocus={() => setFocusedInput('password')}
              onBlur={() => setFocusedInput(null)}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity 
              style={styles.eyeIcon} 
              onPress={() => setShowPassword(v => !v)}
            >
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={NEON_RED}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* BOTÓN INICIAR SESIÓN */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <>
              <MaterialCommunityIcons name="login" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </>
          )}
        </TouchableOpacity>

        {/* FORGOT PASSWORD */}
        <TouchableOpacity
          onPress={() => alert("Funcionalidad de recuperación en desarrollo")}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>¿Has olvidado tu contraseña?</Text>
        </TouchableOpacity>

        {/* REGISTRO LINK */}
        <View style={styles.registerLinkContainer}>
          <Text style={styles.registerLinkText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.registerLinkBold}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
    justifyContent: "flex-start",
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  gradientOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "#1976D2",
    zIndex: -1,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 25,
  },
  logo: {
    width: 350,
    height: 220,
    marginBottom: 15,
  },
  welcomeTitle: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    letterSpacing: 0.3,
    fontWeight: "500",
  },
  formContainer: {
    width: "100%",
  },
  inputGroup: {
    marginBottom: 18,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  labelText: {
    color: TEXT_LIGHT,
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.4,
  },
  passwordInputWrapper: {
    position: "relative",
    justifyContent: "center",
  },
  input: {
    backgroundColor: "rgba(255,255,255,0.08)",
    color: TEXT_LIGHT,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 0,
    borderWidth: 1.5,
    borderColor: "rgba(196,30,58,0.3)",
    fontSize: 15,
    fontWeight: "500",
    height: 50,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: NEON_RED,
    backgroundColor: "rgba(255,255,255,0.12)",
    shadowColor: "transparent",
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  inputFilled: {
    borderColor: NEON_RED,
  },
  eyeIcon: {
    position: "absolute",
    right: 14,
    height: "100%",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  button: {
    backgroundColor: NEON_RED,
    paddingVertical: 16,
    borderRadius: 0,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 20,
    flexDirection: "row",
    minHeight: 52,
  },
  buttonDisabled: {
    backgroundColor: "#5A5A5A",
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
    letterSpacing: 1.1,
    fontFamily: "System",
  },
  registerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 18,
  },
  registerLinkText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  registerLinkBold: {
    color: NEON_RED,
    fontSize: 14,
    fontWeight: "700",
  },
  forgotPasswordContainer: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 8,
  },
  forgotPasswordText: {
    color: NEON_RED,
    fontSize: 13,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  linkText: {
    color: "#aaa",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
  },
  inputError: {
    borderColor: "#FF6B6B",
    backgroundColor: "rgba(255, 107, 107, 0.1)",
  },
  errorText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 4,
  },
});

