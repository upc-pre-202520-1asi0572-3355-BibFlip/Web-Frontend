<script setup>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { PasswordResetService } from '../services/password-reset.service.js';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const passwordResetService = new PasswordResetService();

const email = ref('');
const loading = ref(false);
const emailTouched = ref(false);

onMounted(() => {
  // Prellenar el email si viene de la query
  if (route.query.email) {
    email.value = route.query.email;
  }
});

const validateEmail = (value) => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(value);
};

const onFieldBlur = () => {
  emailTouched.value = true;
};

const onSubmit = async () => {
  emailTouched.value = true;

  if (!email.value || !validateEmail(email.value)) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Por favor ingresa un correo válido',
      life: 3000
    });
    return;
  }

  loading.value = true;

  try {
    await passwordResetService.requestPasswordReset(email.value);

    toast.add({
      severity: 'success',
      summary: 'Código enviado',
      detail: 'Revisa tu correo electrónico',
      life: 3000
    });

    // Redirigir a la página de confirmación
    setTimeout(() => {
      router.push({
        name: 'password-reset-confirm',
        query: { email: email.value }
      });
    }, 1500);
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: error.response?.data?.message || 'Error al enviar el código',
      life: 3000
    });
  } finally {
    loading.value = false;
  }
};
</script>

<template>
  <div class="password-reset-container">
    <pv-toast />
    <div class="password-reset-form">
      <div class="logo">
        <img src="@/assets/images/icon.svg" alt="Logo Bibflip">
      </div>

      <div class="title">
        Recuperar Contraseña
      </div>

      <div class="subtitle">
        Ingresa tu correo electrónico y te enviaremos un código de verificación
      </div>

      <form @submit.prevent="onSubmit">
        <div class="form-group">
          <label for="email">Correo Electrónico</label>
          <pv-input-text
              id="email"
              v-model="email"
              type="email"
              placeholder="tu@correo.com"
              :class="{'p-invalid': emailTouched && !validateEmail(email)}"
              @blur="onFieldBlur"
          />
          <small v-if="emailTouched && !validateEmail(email)" class="error-message">
            Ingresa un correo válido
          </small>
        </div>

        <div class="info-box">
          <i class="pi pi-info-circle"></i>
          <span>El código expira en 15 minutos</span>
        </div>

        <div class="form-group button-container">
          <pv-button
              type="submit"
              class="submit-button"
              :loading="loading"
              :disabled="loading"
          >
            Enviar código
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
.password-reset-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  padding: 20px;
  background-color: var(--background-color);
}

.password-reset-form {
  width: 100%;
  max-width: 450px;
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

.error-message {
  color: #f44336;
  font-size: 12px;
  margin-top: 4px;
  display: block;
}

.info-box {
  background-color: #e3f2fd;
  border: 1px solid #2196f3;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1976d2;
  font-size: 14px;
}

.info-box i {
  font-size: 18px;
}

.button-container {
  display: flex;
  justify-content: center;
  margin-top: 32px;
  margin-bottom: 24px;
}

.submit-button {
  min-width: 180px;
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

