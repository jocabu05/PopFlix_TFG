import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { register } from "../services/authService";

const NETFLIX_RED = "#DC2F1D";

// Ruta del logo
const logo = require("../assets/images/popflix-logo.png");

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
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Animated.Image 
          source={logo} 
          style={[styles.logoImage, { transform: [{ scale: logoScale }] }]} 
          resizeMode="contain" 
        />
      </View>

      <View style={styles.formContainer}>
        {/* NOMBRE */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="account" size={16} color={NETFLIX_RED} />
            <Text style={styles.labelText}>Nombre</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'firstName' && styles.inputFocused,
              firstName && styles.inputFilled,
              firstNameError && styles.inputError,
            ]}
            placeholder="Juan"
            placeholderTextColor="#A0A0A0"
            value={firstName}
            onChangeText={(text) => {
              setFirstName(text);
              if (text && !isValidName(text)) {
                setFirstNameError("Nombre inválido (mínimo 2 caracteres, solo letras)");
              } else {
                setFirstNameError("");
              }
            }}
            onFocus={() => setFocusedInput('firstName')}
            onBlur={() => setFocusedInput(null)}
          />
          {firstNameError ? <Text style={styles.errorText}>{firstNameError}</Text> : null}
        </View>

        {/* APELLIDO */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="account" size={16} color={NETFLIX_RED} />
            <Text style={styles.labelText}>Apellido</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'lastName' && styles.inputFocused,
              lastName && styles.inputFilled,
              lastNameError && styles.inputError,
            ]}
            placeholder="García"
            placeholderTextColor="#A0A0A0"
            value={lastName}
            onChangeText={(text) => {
              setLastName(text);
              if (text && !isValidName(text)) {
                setLastNameError("Apellido inválido (mínimo 2 caracteres, solo letras)");
              } else {
                setLastNameError("");
              }
            }}
            onFocus={() => setFocusedInput('lastName')}
            onBlur={() => setFocusedInput(null)}
          />
          {lastNameError ? <Text style={styles.errorText}>{lastNameError}</Text> : null}
        </View>

        {/* EMAIL */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="email" size={16} color={NETFLIX_RED} />
            <Text style={styles.labelText}>Correo electrónico</Text>
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

        {/* TELÉFONO */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="phone" size={18} color={NETFLIX_RED} />
            <Text style={styles.labelText}>Teléfono</Text>
          </View>
          <TextInput
            style={[
              styles.input,
              focusedInput === 'phone' && styles.inputFocused,
              phone && styles.inputFilled,
              phoneError && styles.inputError,
            ]}
            placeholder="612 345 678"
            placeholderTextColor="#A0A0A0"
            value={phone}
            onChangeText={(text) => {
              const cleanedPhone = text.replace(/\D/g, '');
              setPhone(cleanedPhone);
              if (cleanedPhone && !isValidPhone(cleanedPhone)) {
                setPhoneError('Teléfono inválido (mínimo 7 dígitos)');
              } else {
                setPhoneError('');
              }
            }}
            onFocus={() => setFocusedInput('phone')}
            onBlur={() => setFocusedInput(null)}
            keyboardType="phone-pad"
            maxLength={15}
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        </View>

        {/* CONTRASEÑA */}
        <View style={styles.inputGroup}>
          <View style={styles.labelWithIcon}>
            <MaterialCommunityIcons name="lock" size={16} color={NETFLIX_RED} />
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
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#A0A0A0"
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
            <TouchableOpacity style={styles.eyeIcon} onPress={() => setShowPassword(v => !v)}>
              <MaterialCommunityIcons
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color={NETFLIX_RED}
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
          {loading ? (
            <ActivityIndicator color="white" size="large" />
          ) : (
            <>
              <MaterialCommunityIcons name="account-plus" size={22} color="white" style={{ marginRight: 10 }} />
              <Text style={styles.buttonText}>CREAR CUENTA</Text>
            </>
          )}
        </TouchableOpacity>

        {/* LOGIN LINK */}
        <View style={styles.loginLinkContainer}>
          <Text style={styles.loginLinkText}>¿Ya tienes cuenta? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginLinkBold}>Inicia sesión</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#0F0F0F" 
  },
  contentContainer: { 
    paddingHorizontal: 20, 
    paddingVertical: 16,
    paddingBottom: 40,
  },
  header: { 
    alignItems: "center", 
    marginBottom: 35, 
    marginTop: 20 
  },
  logoImage: { 
    width: 320, 
    height: 220 
  },
  formContainer: { 
    width: "100%" 
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
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
    marginLeft: 8,
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  input: {
    backgroundColor: "#1A1A1A",
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: "#FFFFFF",
    borderColor: "#333333",
    borderWidth: 1.5,
    fontSize: 15,
    fontWeight: "500",
    height: 50,
    minHeight: 50,
  },
  inputFocused: {
    borderColor: NETFLIX_RED,
    backgroundColor: "#1A1A1A",
    shadowColor: NETFLIX_RED,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  inputFilled: {
    borderColor: NETFLIX_RED,
  },
  passwordInputWrapper: { 
    position: "relative", 
    justifyContent: "center",
  },
  eyeIcon: { 
    position: "absolute", 
    right: 14, 
    height: "100%", 
    justifyContent: "center", 
    paddingHorizontal: 4 
  },
  button: {
    backgroundColor: NETFLIX_RED,
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    shadowColor: NETFLIX_RED,
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
    flexDirection: "row",
  },
  buttonDisabled: { 
    backgroundColor: "#5A5A5A", 
    shadowOpacity: 0.2 
  },
  buttonText: { 
    color: "#FFFFFF", 
    fontWeight: "800", 
    fontSize: 15, 
    letterSpacing: 1.2,
  },
  loginLinkContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
  },
  loginLinkText: {
    color: "#A0A0A0",
    fontSize: 14,
  },
  loginLinkBold: {
    color: NETFLIX_RED,
    fontSize: 14,
    fontWeight: "700",
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
