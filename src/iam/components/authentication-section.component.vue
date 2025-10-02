<script setup>
import { useAuthenticationStore } from "../services/authentication.store.js";
import { useRouter } from "vue-router";

const router = useRouter();
const authenticationStore = useAuthenticationStore();

const onSignOut = () => {
  authenticationStore.signOut(router);
};
</script>

<template>
  <div class="auth-section" v-if="authenticationStore.isSignedIn">
    <div class="user-info">
      <i class="pi pi-user user-icon"></i>
      <span class="username-text">{{ authenticationStore.currentUsername }}</span>
      <pv-button 
        icon="pi pi-sign-out" 
        class="p-button-text sign-out-btn" 
        @click="onSignOut"
        aria-label="Cerrar sesión"
      />
    </div>
  </div>
</template>

<style scoped>
.auth-section {
  display: flex;
  align-items: center;
  padding: 0 8px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-icon {
  font-size: 1.2rem;
  color: var(--text-primary);
}

.username-text {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-right: 4px;
}

.sign-out-btn {
  color: var(--text-primary) !important;
  padding: 0.5rem;
}

.sign-out-btn:hover {
  background-color: rgba(172, 131, 98, 0.1) !important;
  border-radius: 50%;
}
</style>