import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
    ActivityIndicator,
    Animated,
    Dimensions,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import { register } from "../services/authService";

const logo = require("../assets/images/popflix-logo.png");

// Paleta unificada con la interfaz principal
const BG_DARK = "#0d1b2a";
const BG_CARD = "#1a2f45";
const GRADIENT_BLUE = "#0f3460";
const GRADIENT_PURPLE = "#533483";
const ACCENT_CYAN = "#00d9ff";
const ACCENT_PINK = "#ff006e";
const ACCENT_ORANGE = "#ff6b35";
const ACCENT_LIME = "#39ff14";
const TEXT_LIGHT = "#ffffff";
const TEXT_MUTED = "#b0b9c1";

const { width: screenWidth } = Dimensions.get("window");

const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const isValidName = (name: string) => {
  return name.length >= 2 && /^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(name);
};

const isValidPhone = (phone: string) => {
  return phone.length >= 7 && /^\d+$/.test(phone);
};

export default function RegisterScreen() {
  const router = useRouter();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Estados para errores
  const [firstNameError, setFirstNameError] = useState("");
  const [lastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
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

  const handleRegister = async () => {
    let isValid = true;
    
    // Validar nombre
    if (!firstName) {
      setFirstNameError("El nombre es obligatorio");
      isValid = false;
    } else if (!isValidName(firstName)) {
      setFirstNameError("Nombre inválido (mínimo 2 caracteres, solo letras)");
      isValid = false;
    } else {
      setFirstNameError("");
    }
    
    // Validar apellido
    if (!lastName) {
      setLastNameError("El apellido es obligatorio");
      isValid = false;
    } else if (!isValidName(lastName)) {
      setLastNameError("Apellido inválido (mínimo 2 caracteres, solo letras)");
      isValid = false;
    } else {
      setLastNameError("");
    }
    
    // Validar email
    if (!email) {
      setEmailError("El correo es obligatorio");
      isValid = false;
    } else if (!isValidEmail(email)) {
      setEmailError("Correo electrónico no válido");
      isValid = false;
    } else {
      setEmailError("");
    }
    
    // Validar teléfono
    if (!phone) {
      setPhoneError("El teléfono es obligatorio");
      isValid = false;
    } else if (!isValidPhone(phone)) {
      setPhoneError("Número de teléfono no válido (mínimo 7 dígitos)");
      isValid = false;
    } else {
      setPhoneError("");
    }
    
    // Validar contraseña
    if (!password) {
      setPasswordError("La contraseña es obligatoria");
      isValid = false;
    } else if (password.length < 8) {
      setPasswordError("Contraseña muy corta (mínimo 8 caracteres)");
      isValid = false;
    } else {
      setPasswordError("");
    }
    
    if (!isValid) return;

    setLoading(true);
    try {
      await register({ firstName, lastName, email, phone, password });
      alert("✅ Cuenta creada exitosamente");
      router.push("/login");
    } catch (err) {
      if (err instanceof Error) {
        alert(`❌ Error al registrar usuario: ${err.message}`);
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

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HEADER CON LOGO */}
        <View style={styles.headerContainer}>
          <Animated.Image 
            source={logo} 
            style={[styles.logo, { transform: [{ scale: logoScale }] }]} 
            resizeMode="contain" 
          />
          <Text style={styles.welcomeText}>Crear cuenta</Text>
          <Text style={styles.subtitle}>Únete a PopFlix hoy</Text>
        </View>

        {/* FORMULARIO */}
        <View style={styles.formContainer}>
          {/* NOMBRE */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <MaterialCommunityIcons name="account-outline" size={18} color={ACCENT_CYAN} />
              <Text style={styles.labelText}>Nombre</Text>
            </View>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'firstName' && styles.inputWrapperFocused,
              firstNameError && styles.inputWrapperError,
            ]}>
              <TextInput
                style={styles.input}
                placeholder="Juan"
                placeholderTextColor={TEXT_MUTED}
                value={firstName}
                onChangeText={(text) => {
                  setFirstName(text);
                  if (text && !isValidName(text)) {
                    setFirstNameError("Nombre inválido");
                  } else {
                    setFirstNameError("");
                  }
                }}
                onFocus={() => setFocusedInput('firstName')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
          </View>

          {/* APELLIDO */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <MaterialCommunityIcons name="account-outline" size={18} color={ACCENT_CYAN} />
              <Text style={styles.labelText}>Apellido</Text>
            </View>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'lastName' && styles.inputWrapperFocused,
              lastNameError && styles.inputWrapperError,
            ]}>
              <TextInput
                style={styles.input}
                placeholder="García"
                placeholderTextColor={TEXT_MUTED}
                value={lastName}
                onChangeText={(text) => {
                  setLastName(text);
                  if (text && !isValidName(text)) {
                    setLastNameError("Apellido inválido");
                  } else {
                    setLastNameError("");
                  }
                }}
                onFocus={() => setFocusedInput('lastName')}
                onBlur={() => setFocusedInput(null)}
              />
            </View>
            {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
          </View>

          {/* EMAIL */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <MaterialCommunityIcons name="email-outline" size={18} color={ACCENT_CYAN} />
              <Text style={styles.labelText}>Correo electrónico</Text>
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
                    setEmailError("Correo no válido");
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

          {/* TELÉFONO */}
          <View style={styles.inputGroup}>
            <View style={styles.labelWithIcon}>
              <MaterialCommunityIcons name="phone-outline" size={18} color={ACCENT_CYAN} />
              <Text style={styles.labelText}>Teléfono</Text>
            </View>
            <View style={[
              styles.inputWrapper,
              focusedInput === 'phone' && styles.inputWrapperFocused,
              phoneError && styles.inputWrapperError,
            ]}>
              <TextInput
                style={styles.input}
                placeholder="612 345 678"
                placeholderTextColor={TEXT_MUTED}
                value={phone}
                onChangeText={(text) => {
                  const cleanedPhone = text.replace(/\D/g, '');
                  setPhone(cleanedPhone);
                  if (cleanedPhone && !isValidPhone(cleanedPhone)) {
                    setPhoneError('Teléfono inválido');
                  } else {
                    setPhoneError('');
                  }
                }}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
                keyboardType="phone-pad"
                maxLength={15}
              />
            </View>
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
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
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor={TEXT_MUTED}
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (text && text.length < 8) {
                    setPasswordError('Mínimo 8 caracteres');
                  } else {
                    setPasswordError('');
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

          {/* BOTÓN REGISTRAR */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleRegister}
            disabled={loading}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={loading ? ['#555', '#444'] : [ACCENT_LIME, ACCENT_CYAN]}
              style={styles.buttonGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              {loading ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <MaterialCommunityIcons name="account-plus" size={22} color={BG_DARK} style={{ marginRight: 10 }} />
                  <Text style={styles.buttonText}>Crear cuenta</Text>
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

          {/* LOGIN LINK */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text style={styles.loginLinkBold}>Inicia sesión</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  headerContainer: {
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 10,
  },
  logo: {
    width: screenWidth * 0.6,
    height: 130,
    marginBottom: 15,
  },
  welcomeText: {
    fontSize: 26,
    fontWeight: "800",
    color: TEXT_LIGHT,
    marginBottom: 6,
    textShadowColor: ACCENT_CYAN,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 15,
    color: TEXT_MUTED,
    letterSpacing: 0.5,
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingTop: 15,
  },
  inputGroup: {
    marginBottom: 16,
  },
  labelWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  labelText: {
    color: TEXT_LIGHT,
    fontSize: 13,
    fontWeight: "600",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
  inputWrapper: {
    backgroundColor: BG_CARD,
    borderRadius: 12,
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
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    fontWeight: "500",
  },
  eyeIcon: {
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  button: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 24,
    marginBottom: 20,
  },
  buttonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: BG_DARK,
    fontWeight: "800",
    fontSize: 16,
    letterSpacing: 1,
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
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
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  loginLinkText: {
    color: TEXT_MUTED,
    fontSize: 14,
  },
  loginLinkBold: {
    color: ACCENT_PINK,
    fontSize: 14,
    fontWeight: "700",
  },
  errorText: {
    color: "#ff4757",
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
    marginLeft: 4,
  },
});
