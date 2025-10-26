<script setup>
import { ref, watch, computed } from 'vue';
import { useAuthenticationStore } from "../services/authentication.store.js";
import { SignUpRequest } from "../model/sign-up.request.js";
import { useRouter } from 'vue-router';

const router = useRouter();
const authenticationStore = useAuthenticationStore();

const username = ref('');
const password = ref('');
const confirmPassword = ref('');
const email = ref('');

// Objetos de validación para cada campo
const validation = ref({
  username: { valid: true, message: '', touched: false },
  password: { valid: true, message: '', touched: false },
  confirmPassword: { valid: true, message: '', touched: false },
  email: { valid: true, message: '', touched: false }
});

// Validación de complejidad de contraseña
const validatePasswordComplexity = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  const hasMinLength = password.length >= 8;

  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasMinLength;
};

// Validación de email UPC
const validateEmailUPC = (email) => {
  const emailPattern = /^u20\d{7}@upc\.edu\.pe$/i;
  return emailPattern.test(email);
};

// Mostrar requisitos de contraseña
const showPasswordRequirements = computed(() => {
  return validation.value.password.touched && !validatePasswordComplexity(password.value) && password.value;
});

// Validación por campo
const validateField = (field, value) => {
  // Validación básica de campos vacíos
  if (!value || !value.trim()) {
    validation.value[field].valid = false;
    validation.value[field].message = `El campo ${
        field === 'username' ? 'usuario' :
            field === 'password' ? 'contraseña' :
                field === 'email' ? 'correo' :
                    'confirmar contraseña'
    } es requerido`;
    return false;
  }

  // Validaciones específicas por campo
  if (field === 'password') {
    // Validar complejidad si hay contenido
    if (!validatePasswordComplexity(value)) {
      validation.value[field].valid = false;
      validation.value[field].message = 'La contraseña no cumple los requisitos mínimos';
      return false;
    }
  } else if (field === 'confirmPassword') {
    // Validar que las contraseñas coincidan
    if (value !== password.value) {
      validation.value[field].valid = false;
      validation.value[field].message = 'Las contraseñas no coinciden';
      return false;
    }
  } else if (field === 'email') {
    // Validar formato de email UPC
    if (!validateEmailUPC(value)) {
      validation.value[field].valid = false;
      validation.value[field].message = 'El correo debe tener el formato u20xxxxxxx@upc.edu.pe';
      return false;
    }
  }

  // Si pasa todas las validaciones
  validation.value[field].valid = true;
  validation.value[field].message = '';
  return true;
};

// Validar formulario completo
const validateForm = () => {
  const usernameValid = validateField('username', username.value);
  const passwordValid = validateField('password', password.value);
  const confirmPasswordValid = validateField('confirmPassword', confirmPassword.value);
  const emailValid = validateField('email', email.value);

  return usernameValid && passwordValid && confirmPasswordValid && emailValid;
};

// Marcar campo como tocado y validar cuando pierde el foco
const onFieldBlur = (field) => {
  validation.value[field].touched = true;
  validateField(field, field === 'username' ? username.value :
      field === 'password' ? password.value :
          field === 'email' ? email.value :
              confirmPassword.value);
};

// Observadores para validar en tiempo real
watch(username, (newValue) => {
  if (validation.value.username.touched) {
    validateField('username', newValue);
  }
});

watch(password, (newValue) => {
  if (validation.value.password.touched) {
    validateField('password', newValue);
    // Si la contraseña cambia, revalidar la confirmación si ya está tocada
    if (validation.value.confirmPassword.touched) {
      validateField('confirmPassword', confirmPassword.value);
    }
  }
});

watch(confirmPassword, (newValue) => {
  if (validation.value.confirmPassword.touched) {
    validateField('confirmPassword', newValue);
  }
});

watch(email, (newValue) => {
  if (validation.value.email.touched) {
    validateField('email', newValue);
  }
});

const onSignUp = async () => {
  // Marcar todos los campos como tocados para mostrar todos los errores
  validation.value.username.touched = true;
  validation.value.password.touched = true;
  validation.value.confirmPassword.touched = true;
  validation.value.email.touched = true;

  if (!validateForm()) return;

  try {
    const signUpRequest = new SignUpRequest(username.value, password.value, email.value);
    await authenticationStore.signUp(signUpRequest, router);
  } catch (error) {
    validation.value.username.valid = false;
    validation.value.username.message = 'Error al crear la cuenta';
  }
};
</script>

<template>
  <div class="sign-up-container">
    <div class="sign-up-form">
      <!-- Logo y título -->
      <div class="logo">
        <img src="@/assets/images/icon.svg" alt="Logo Bibflip">
      </div>

      <div class="welcome-text">
        ¡Bienvenido!
      </div>

      <div class="signup-title">
        Registrarse
      </div>

      <form @submit.prevent="onSignUp">
        <div class="form-group">
          <label for="username">Usuario</label>
          <pv-input-text
              id="username"
              v-model="username"
              type="text"
              placeholder="Crea tu nombre de usuario"
              :class="{'p-invalid': !validation.username.valid && validation.username.touched}"
              @blur="onFieldBlur('username')"
          />
          <small v-if="!validation.username.valid && validation.username.touched" class="error-message">
            {{ validation.username.message }}
          </small>
        </div>

        <div class="form-group">
          <label for="email">Correo UPC</label>
          <pv-input-text
              id="email"
              v-model="email"
              type="text"
              placeholder="u20xxxxxxx@upc.edu.pe"
              :class="{'p-invalid': !validation.email.valid && validation.email.touched}"
              @blur="onFieldBlur('email')"
          />
          <small v-if="!validation.email.valid && validation.email.touched" class="error-message">
            {{ validation.email.message }}
          </small>
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <pv-input-text
              id="password"
              v-model="password"
              type="password"
              placeholder="Crea tu contraseña"
              :class="{'p-invalid': !validation.password.valid && validation.password.touched}"
              @blur="onFieldBlur('password')"
          />
          <small v-if="!validation.password.valid && validation.password.touched" class="error-message">
            {{ validation.password.message }}
          </small>
          <div v-if="showPasswordRequirements" class="error-message">
            La contraseña debe contener:
            <ul>
              <li>Al menos 8 caracteres</li>
              <li>Una mayúscula</li>
              <li>Una minúscula</li>
              <li>Un número</li>
              <li>Un carácter especial</li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <pv-input-text
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              placeholder="Confirma tu contraseña"
              :class="{'p-invalid': !validation.confirmPassword.valid && validation.confirmPassword.touched}"
              @blur="onFieldBlur('confirmPassword')"
          />
          <small v-if="!validation.confirmPassword.valid && validation.confirmPassword.touched" class="error-message">
            {{ validation.confirmPassword.message }}
          </small>
        </div>

        <div class="form-group button-container">
          <pv-button type="submit" class="signup-button">Crear cuenta</pv-button>
        </div>

        <div class="login-link">
          ¿Ya tienes una cuenta?
          <router-link to="/sign-in">Iniciar sesión</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.sign-up-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
  padding: 20px;
}

.sign-up-form {
  width: 100%;
  max-width: 400px;
  padding: 32px;
  text-align: center;
  background: var(--surface-color);
  border-radius: 8px;
}

.logo {
  margin-bottom: 6px;
}

.logo img {
  height: 150px;
  width: auto;
}

.welcome-text {
  font-size: 14px;
  color: var(--text-primary);
  margin-bottom: 16px;
}

.signup-title {
  font-size: 36px;
  color: var(--text-primary);
  margin-bottom: 32px;
  font-weight: 600;
}

.form-group {
  margin-bottom: 24px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-weight: 500;
  color: var(--text-primary);
  font-size: 14px;
}

.p-inputtext {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--primaryColor200);
  border-radius: 4px;
  font-size: 16px;
  color: var(--text-primary);
  background-color: var(--primaryColor50);
  transition: all 0.3s ease;
}

.sign-up-container .sign-up-form .form-group .p-inputtext:focus {
  outline: none;
  border-color: var(--primaryColor600);
  box-shadow: 0 0 0 2px rgba(172, 131, 98, 0.3);
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.error-message ul {
  margin: 4px 0;
  padding-left: 20px;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 32px;
}

.signup-button {
  min-width: 160px;
  padding: 12px 32px;
  background-color: var(--text-primary);
  color: white;
  border: none;
  border-radius: 30px;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sign-up-container .button-container .signup-button:hover {
  background-color: var(--primaryColor600);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.sign-up-container .sign-up-form .button-container .p-button.signup-button:active {
  transform: translateY(0);
  background-color: var(--primaryColor700);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.sign-up-container .button-container .signup-button:focus {
  outline: none;
  background-color: var(--primaryColor600);
  box-shadow: 0 0 0 2px rgba(172, 131, 98, 0.3);
}

.login-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.login-link a {
  color: var(--primaryColor500);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>