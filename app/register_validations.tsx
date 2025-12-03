// Validation functions
export const isValidEmail = (email: string) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidName = (name: string) => {
  return name.length >= 3 && /^[a-záéíóúàèìòùäëïöüñ\s]+$/i.test(name);
};

export const isValidPhone = (phone: string) => {
  return phone.length >= 7 && /^\d+$/.test(phone);
};
