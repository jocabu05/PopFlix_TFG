import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { useAuthContext } from "../context/AuthContext";
import { login as loginService } from "../services/authService";

const logo = require("../assets/images/popflix-logo.png");

// Paleta unificada con la interfaz principal
const BG_DARK = "#0d1b2a";
const BG_CARD = "#1a2f45";
const GRADIENT_BLUE = "#0f3460";
const GRADIENT_PURPLE = "#533483";
const ACCENT_CYAN = "#00d9ff";
const ACCENT_PINK = "#ff006e";
const ACCENT_ORANGE = "#ff6b35";
const TEXT_LIGHT = "#ffffff";
const TEXT_MUTED = "#b0b9c1";

const { width: screenWidth } = Dimensions.get("window");

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
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Animación del logo
  const logoScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScale, {
          toValue: 1.03,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(logoScale, {
          toValue: 1,
          duration: 2500,
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
        router.push("/(tabs)");
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
    <View style={styles.container}>
      {/* Fondo con gradiente */}
      <LinearGradient
        colors={[BG_DARK, GRADIENT_BLUE, GRADIENT_PURPLE]}
        style={styles.gradientBackground}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />

      {/* HEADER CON LOGO */}
      <View style={styles.headerContainer}>
        <Animated.Image 
          source={logo} 
          style={[styles.logo, { transform: [{ scale: logoScale }] }]} 
          resizeMode="contain" 
        />
        <Text style={styles.welcomeText}>Bienvenido de nuevo</Text>
        <Text style={styles.subtitle}>Inicia sesión para continuar</Text>
      </View>

      {/* FORMULARIO */}
      <View style={styles.formContainer}>
        {/* EMAIL */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="email-outline" size={18} color={ACCENT_CYAN} />
            <Text style={styles.labelText}>Email</Text>
          </View>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'email' && styles.inputWrapperFocused,
            emailError && styles.inputWrapperError,
          ]}>
            <TextInput
              style={styles.input}
              placeholder="tu@email.com"
              placeholderTextColor={TEXT_MUTED}
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
          </View>
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        {/* CONTRASEÑA */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="lock-outline" size={18} color={ACCENT_CYAN} />
            <Text style={styles.labelText}>Contraseña</Text>
          </View>
          <View style={[
            styles.inputWrapper,
            focusedInput === 'password' && styles.inputWrapperFocused,
            passwordError && styles.inputWrapperError,
          ]}>
            <TextInput
              style={styles.input}
              placeholder="Tu contraseña"
              placeholderTextColor={TEXT_MUTED}
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
                size={22}
                color={ACCENT_CYAN}
              />
            </TouchableOpacity>
          </View>
          {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
        </View>

        {/* FORGOT PASSWORD */}
        <TouchableOpacity
          onPress={() => alert("Funcionalidad de recuperación en desarrollo")}
          style={styles.forgotPasswordContainer}
        >
          <Text style={styles.forgotPasswordText}>¿Has olvidado tu contraseña?</Text>
        </TouchableOpacity>

        {/* BOTÓN INICIAR SESIÓN */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={loading ? ['#555', '#444'] : [ACCENT_PINK, ACCENT_ORANGE]}
            style={styles.buttonGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            {loading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <MaterialCommunityIcons name="login" size={22} color="white" style={{ marginRight: 10 }} />
                <Text style={styles.buttonText}>Iniciar sesión</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* DIVISOR */}
        <View style={styles.dividerContainer}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>o</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* REGISTRO LINK */}
        <View style={styles.registerLinkContainer}>
          <Text style={styles.registerLinkText}>¿No tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/register")}>
            <Text style={styles.registerLinkBold}>Regístrate</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG_DARK,
  },
  gradientBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 50,
    paddingBottom: 20,
  },
  logo: {
    width: screenWidth * 0.7,
    height: 160,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginBottom: 8,
    textShadowColor: ACCENT_CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
  },
  formContainer: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  labelText: {
    color: TEXT_LIGHT,
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: BG_CARD,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "rgba(0, 217, 255, 0.2)",
    flexDirection: "row",
    alignItems: "center",
    overflow: "hidden",
  },
  inputWrapperFocused: {
    borderColor: ACCENT_CYAN,
    shadowColor: ACCENT_CYAN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  inputWrapperError: {
    borderColor: "#ff4757",
  },
  input: {
    flex: 1,
    color: TEXT_LIGHT,
    paddingHorizontal: 18,
    paddingVertical: 16,
    fontSize: 16,
    fontWeight: "500",
  },
  eyeIcon: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 24,
  },
  forgotPasswordText: {
    color: ACCENT_CYAN,
    fontSize: 14,
    fontWeight: "600",
  },
  button: {
    borderRadius: 14,
    overflow: "hidden",
    marginBottom: 24,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: TEXT_LIGHT,
    fontWeight: "800",
    fontSize: 17,
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  },
  dividerText: {
    color: TEXT_MUTED,
    paddingHorizontal: 16,
    fontSize: 14,
  },
  registerLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  registerLinkText: {
    color: TEXT_MUTED,
    fontSize: 15,
  },
  registerLinkBold: {
    color: ACCENT_PINK,
    fontSize: 15,
    fontWeight: "700",
  },
  errorText: {
    color: "#ff4757",
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
    marginLeft: 4,
  },
});

