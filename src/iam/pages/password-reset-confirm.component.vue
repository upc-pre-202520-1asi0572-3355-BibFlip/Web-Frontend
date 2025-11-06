<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PasswordResetService } from '../services/password-reset.service.js';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const passwordResetService = new PasswordResetService();

const email = ref('');
const code = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const loading = ref(false);
const showPassword = ref(false);

const validation = ref({
  code: { valid: true, message: '', touched: false },
  newPassword: { valid: true, message: '', touched: false },
  confirmPassword: { valid: true, message: '', touched: false }
});

onMounted(() => {
  if (route.query.email) {
    email.value = route.query.email;
  } else {
    router.push({ name: 'password-reset-request' });
  }
});

const validatePasswordComplexity = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+/.test(password);
  const hasMinLength = password.length >= 8;

  return hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar && hasMinLength;
};

const showPasswordRequirements = computed(() => {
  return validation.value.newPassword.touched &&
      !validatePasswordComplexity(newPassword.value) &&
      newPassword.value;
});

const validateField = (field, value) => {
  if (field === 'code') {
    if (!value || value.length !== 6) {
      validation.value[field].valid = false;
      validation.value[field].message = 'El código debe tener 6 dígitos';
      return false;
    }
  } else if (field === 'newPassword') {
    if (!value) {
      validation.value[field].valid = false;
      validation.value[field].message = 'La contraseña es requerida';
      return false;
    }
    if (!validatePasswordComplexity(value)) {
      validation.value[field].valid = false;
      validation.value[field].message = 'La contraseña no cumple los requisitos';
      return false;
    }
  } else if (field === 'confirmPassword') {
    if (!value) {
      validation.value[field].valid = false;
      validation.value[field].message = 'Confirma tu contraseña';
      return false;
    }
    if (value !== newPassword.value) {
      validation.value[field].valid = false;
      validation.value[field].message = 'Las contraseñas no coinciden';
      return false;
    }
  }

  validation.value[field].valid = true;
  validation.value[field].message = '';
  return true;
};

const validateForm = () => {
  const codeValid = validateField('code', code.value);
  const passwordValid = validateField('newPassword', newPassword.value);
  const confirmPasswordValid = validateField('confirmPassword', confirmPassword.value);

  return codeValid && passwordValid && confirmPasswordValid;
};

const onFieldBlur = (field) => {
  validation.value[field].touched = true;

  if (field === 'code') {
    validateField(field, code.value);
  } else if (field === 'newPassword') {
    validateField(field, newPassword.value);
    // Revalidar confirmación si ya fue tocada
    if (validation.value.confirmPassword.touched) {
      validateField('confirmPassword', confirmPassword.value);
    }
  } else if (field === 'confirmPassword') {
    validateField(field, confirmPassword.value);
  }
};

const onSubmit = async () => {
  validation.value.code.touched = true;
  validation.value.newPassword.touched = true;
  validation.value.confirmPassword.touched = true;

  if (!validateForm()) {
    toast.add({
      severity: 'error',
      summary: 'Error de validación',
      detail: 'Por favor corrige los errores en el formulario',
      life: 3000
    });
    return;
  }

  loading.value = true;

  try {
    await passwordResetService.confirmPasswordReset(
        email.value,
        code.value,
        newPassword.value
    );

    toast.add({
      severity: 'success',
      summary: '¡Éxito!',
      detail: 'Contraseña actualizada exitosamente',
      life: 3000
    });

    // Redirigir al login después de 2 segundos
    setTimeout(() => {
      router.push({ name: 'sign-in' });
    }, 2000);
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Error al restablecer la contraseña';

    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage,
      life: 4000
    });

    // Si el código es inválido, limpiar el campo
    if (errorMessage.includes('código')) {
      code.value = '';
      validation.value.code.valid = false;
      validation.value.code.message = 'Código inválido o expirado';
    }
  } finally {
    loading.value = false;
  }
};

// Formatear el código mientras se escribe
const onCodeInput = (event) => {
  code.value = event.target.value.replace(/\D/g, '').slice(0, 6);
};

const resendCode = async () => {
  try {
    await passwordResetService.requestPasswordReset(email.value);
    toast.add({
      severity: 'success',
      summary: 'Código reenviado',
      detail: 'Revisa tu correo electrónico',
      life: 3000
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo reenviar el código',
      life: 3000
    });
  }
};
</script>

<template>
  <div class="password-confirm-container">
    <pv-toast />
    <div class="password-confirm-form">
      <div class="logo">
        <img src="@/assets/images/icon.svg" alt="Logo Bibflip">
      </div>

      <div class="title">
        Restablecer Contraseña
      </div>

      <div class="subtitle">
        Ingresa el código de 6 dígitos enviado a <strong>{{ email }}</strong>
      </div>

      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="code">Código de Verificación</label>
          <pv-input-text
              id="code"
              v-model="code"
              type="text"
              placeholder="000000"
              maxlength="6"
              :class="{'p-invalid': !validation.code.valid && validation.code.touched, 'code-input': true}"
              @input="onCodeInput"
              @blur="onFieldBlur('code')"
          />
          <small v-if="!validation.code.valid && validation.code.touched" class="error-message">
            {{ validation.code.message }}
          </small>
          <div class="resend-code">
            <a href="#" @click.prevent="resendCode">
              <i class="pi pi-refresh"></i> Reenviar código
            </a>
          </div>
        </div>

        <div class="form-group">
          <label for="newPassword">Nueva Contraseña</label>
          <div class="password-input-wrapper">
            <pv-input-text
                id="newPassword"
                v-model="newPassword"
                :type="showPassword ? 'text' : 'password'"
                placeholder="Mínimo 8 caracteres"
                :class="{'p-invalid': !validation.newPassword.valid && validation.newPassword.touched}"
                @blur="onFieldBlur('newPassword')"
            />
            <button
                type="button"
                class="toggle-password"
                @click="showPassword = !showPassword"
            >
              <i :class="showPassword ? 'pi pi-eye-slash' : 'pi pi-eye'"></i>
            </button>
          </div>
          <small v-if="!validation.newPassword.valid && validation.newPassword.touched" class="error-message">
            {{ validation.newPassword.message }}
          </small>
          <div v-if="showPasswordRequirements" class="password-requirements">
            <p class="requirements-title">La contraseña debe contener:</p>
            <ul>
              <li :class="{ 'valid': newPassword.length >= 8 }">
                <i :class="newPassword.length >= 8 ? 'pi pi-check' : 'pi pi-times'"></i>
                Al menos 8 caracteres
              </li>
              <li :class="{ 'valid': /[A-Z]/.test(newPassword) }">
                <i :class="/[A-Z]/.test(newPassword) ? 'pi pi-check' : 'pi pi-times'"></i>
                Una letra mayúscula
              </li>
              <li :class="{ 'valid': /[a-z]/.test(newPassword) }">
                <i :class="/[a-z]/.test(newPassword) ? 'pi pi-check' : 'pi pi-times'"></i>
                Una letra minúscula
              </li>
              <li :class="{ 'valid': /\d/.test(newPassword) }">
                <i :class="/\d/.test(newPassword) ? 'pi pi-check' : 'pi pi-times'"></i>
                Un número
              </li>
              <li :class="{ 'valid': /[!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]+/.test(newPassword) }">
              <i :class="/[!@#$%^&*()_+\-=\[\]{};':\\|,.<>\/?]+/.test(newPassword) ? 'pi pi-check' : 'pi pi-times'"></i>
              Un carácter especial
              </li>
            </ul>
          </div>
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <pv-input-text
              id="confirmPassword"
              v-model="confirmPassword"
              :type="showPassword ? 'text' : 'password'"
              placeholder="Confirma tu nueva contraseña"
              :class="{'p-invalid': !validation.confirmPassword.valid && validation.confirmPassword.touched}"
              @blur="onFieldBlur('confirmPassword')"
          />
          <small v-if="!validation.confirmPassword.valid && validation.confirmPassword.touched" class="error-message">
            {{ validation.confirmPassword.message }}
          </small>
        </div>

        <div class="form-group button-container">
          <pv-button
              type="submit"
              class="submit-button"
              :loading="loading"
              :disabled="loading"
          >
            Restablecer contraseña
          </pv-button>
        </div>

        <div class="back-link">
          <router-link to="/sign-in">
            <i class="pi pi-arrow-left"></i> Volver al inicio de sesión
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.password-confirm-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--background-color);
}

.password-confirm-form {
  width: 100%;
  max-width: 480px;
  padding: 32px;
  text-align: center;
  background: var(--surface-color);
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.logo {
  margin-bottom: 12px;
}

.logo img {
  height: 120px;
  width: auto;
}

.title {
  font-size: 32px;
  color: var(--text-primary);
  margin-bottom: 12px;
  font-weight: 600;
}

.subtitle {
  font-size: 14px;
  color: var(--text-secondary);
  margin-bottom: 32px;
  line-height: 1.5;
}

.subtitle strong {
  color: var(--text-primary);
}

.form-group {
  margin-bottom: 24px;
  text-align: left;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
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

.p-inputtext:focus {
  outline: none;
  border-color: var(--primaryColor600);
  box-shadow: 0 0 0 2px rgba(172, 131, 98, 0.3);
}

.password-input-wrapper .p-inputtext {
  padding-right: 45px;
}

.code-input {
  text-align: center;
  letter-spacing: 8px;
  font-size: 24px;
  font-weight: 600;
  font-family: monospace;
}

.password-input-wrapper {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 4px;
  font-size: 18px;
}

.toggle-password:hover {
  color: var(--text-primary);
}

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.resend-code {
  margin-top: 8px;
  text-align: right;
}

.resend-code a {
  color: var(--primaryColor500);
  text-decoration: none;
  font-size: 13px;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.resend-code a:hover {
  text-decoration: underline;
}

.password-requirements {
  margin-top: 12px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.requirements-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 8px;
}

.password-requirements ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.password-requirements li {
  font-size: 12px;
  color: #666;
  padding: 4px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.password-requirements li i {
  font-size: 10px;
}

.password-requirements li.valid {
  color: #4caf50;
}

.password-requirements li.valid i {
  color: #4caf50;
}

.password-requirements li:not(.valid) i {
  color: #f44336;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 24px;
}

.submit-button {
  min-width: 200px;
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

.submit-button:hover {
  background-color: var(--primaryColor600);
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.back-link {
  text-align: center;
  margin-top: 16px;
}

.back-link a {
  color: var(--primaryColor500);
  text-decoration: none;
  font-weight: 600;
  font-size: 14px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.back-link a:hover {
  text-decoration: underline;
}
</style>