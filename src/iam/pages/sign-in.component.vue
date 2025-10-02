<script setup>
import { ref, watch } from 'vue';
import { useAuthenticationStore } from "../services/authentication.store.js";
import { SignInRequest } from "../model/sign-in.request.js";
import { useRouter } from 'vue-router';

const router = useRouter();
const authenticationStore = useAuthenticationStore();

const username = ref('');
const password = ref('');

// Objetos de validación para cada campo
const validation = ref({
  username: { valid: true, message: '', touched: false },
  password: { valid: true, message: '', touched: false }
});

// Validación por campo
const validateField = (field, value) => {
  if (!value || !value.trim()) {
    validation.value[field].valid = false;
    validation.value[field].message = `El campo ${field === 'username' ? 'usuario' : 'contraseña'} es requerido`;
    return false;
  } else {
    validation.value[field].valid = true;
    validation.value[field].message = '';
    return true;
  }
};

// Validar formulario completo
const validateForm = () => {
  const usernameValid = validateField('username', username.value);
  const passwordValid = validateField('password', password.value);
  return usernameValid && passwordValid;
};

// Marcar campo como tocado y validar cuando pierde el foco
const onFieldBlur = (field) => {
  validation.value[field].touched = true;
  validateField(field, field === 'username' ? username.value : password.value);
};

// Observadores para validar en tiempo real cuando cambia el valor
watch(username, (newValue) => {
  if (validation.value.username.touched) {
    validateField('username', newValue);
  }
});

watch(password, (newValue) => {
  if (validation.value.password.touched) {
    validateField('password', newValue);
  }
});

const onSignIn = async () => {
  // Marcar todos los campos como tocados para mostrar todos los errores
  validation.value.username.touched = true;
  validation.value.password.touched = true;
  
  if (!validateForm()) return;

  try {
    const signInRequest = new SignInRequest(username.value, password.value);
    await authenticationStore.signIn(signInRequest, router);
  } catch (error) {
    validation.value.username.valid = false;
    validation.value.username.message = 'Credenciales incorrectas';
    validation.value.password.valid = false;
  }
};
</script>

<template>
  <div class="sign-in-container">
    <div class="sign-in-form">
      <!-- Logo y título, sin cambios -->
      <div class="logo">
        <img src="@/assets/images/icon.svg" alt="Logo Bibflip">
      </div>

      <div class="welcome-text">
        ¡Bienvenido de vuelta!
      </div>

      <div class="signin-title">
        Iniciar Sesión
      </div>

      <form @submit.prevent="onSignIn">
      <div class="form-group">
        <label for="username">Usuario</label>
        <pv-input-text
            id="username"
            v-model="username"
            type="text"
            placeholder="Coloca tu nombre de usuario"
            :class="{'p-invalid': !validation.username.valid && validation.username.touched}"
            @blur="onFieldBlur('username')"
        />
        <small v-if="!validation.username.valid && validation.username.touched" class="error-message">
          {{ validation.username.message }}
        </small>
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <pv-input-text
            id="password"
            v-model="password"
            type="password"
            placeholder="Coloca tu contraseña"
            :class="{'p-invalid': !validation.password.valid && validation.password.touched}"
            @blur="onFieldBlur('password')"
        />
        <small v-if="!validation.password.valid && validation.password.touched" class="error-message">
          {{ validation.password.message }}
        </small>
      </div>

        <div class="form-group button-container">
          <pv-button type="submit" class="signin-button">Iniciar sesión</pv-button>
        </div>

        <div class="register-link">
          ¿No tienes una cuenta todavía?
          <router-link to="/sign-up">Crear cuenta</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.sign-in-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--background-color);
}

.sign-in-form {
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

.signin-title {
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

.sign-in-container .sign-in-form .form-group .p-inputtext:focus {
  outline: none;
  border-color: var(--primaryColor600) ; /* Color más oscuro del borde */
  box-shadow: 0 0 0 2px rgba(172, 131, 98, 0.3) ; /* Efecto de brillo alrededor */
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 32px;
}

.signin-button {
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

.sign-in-container .button-container .signin-button:hover {
  background-color: var(--primaryColor600);
  border-color: var(--primaryColor200);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.sign-in-container .sign-in-form .button-container .p-button.signin-button:active {
  transform: translateY(0);
  background-color: var(--primaryColor700);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}


.register-link {
  text-align: center;
  margin-top: 16px;
  font-size: 14px;
  color: var(--text-secondary);
}

.register-link a {
  color: var(--primaryColor500);
  text-decoration: none;
  font-weight: 600;
  margin-left: 4px;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>