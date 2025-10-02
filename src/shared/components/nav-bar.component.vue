<script setup>
import {useRouter} from 'vue-router';
import {useAuthenticationStore} from '@/iam/services/authentication.store';
import {RoleEnum} from '@/iam/model/role.enum';
import AuthenticationSection from '@/iam/components/authentication-section.component.vue';
import {ref} from 'vue';

const authStore = useAuthenticationStore();
const sidebarVisible = ref(false);

const router = useRouter();

// Replace the problematic navigateTo function
const navigateTo = (routeName) => {
  // Check if the route exists before navigating
  try {
    router.push({ name: routeName });
  } catch (error) {
    console.error(`Navigation error: ${error}`);
    // Fallback to a known route, like 'home' or 'dashboard'
    router.push({ name: 'home' }); // Replace 'home' with a route you know exists
  }
}
const handleSignOut = () => {
  authStore.signOut(router);
  sidebarVisible.value = false;
};

const toggleSidebar = () => {
  sidebarVisible.value = !sidebarVisible.value;
};
</script>

<template>
  <div class="navbar-container" v-if="authStore.isSignedIn">
    <pv-toolbar class="custom-toolbar p-0">
      <template #start>
        <div class="brand" @click="navigateTo('home')">
          <img src="@/assets/images/icon.svg" alt="Bibflip" class="mr-2 brand-logo"/>
          <span class="brand-name">Bibflip</span>
        </div>
      </template>

      <template #end>
        <div class="desktop-menu">
          <div v-rbac="[RoleEnum.USER]" class="nav-menu">
            <pv-button
                label="Inicio"
                icon="pi pi-home"
                class="p-button-text nav-item"
                @click="navigateTo('home')"
            />
            <pv-button
                label="Reservar"
                icon="pi pi-calendar-plus"
                class="p-button-text nav-item"
                @click="navigateTo('reservation')"
            />
          </div>

          <div v-rbac="[RoleEnum.SUPERVISOR]" class="nav-menu">
            <pv-button
                label="Inicio"
                icon="pi pi-home"
                class="p-button-text nav-item"
                @click="navigateTo('home')"
            />
            <pv-button
                label="Gestión de Cubiculos"
                icon="pi pi-table"
                class="p-button-text nav-item"
                @click="navigateTo('cubicle-management')"
            />
            <pv-button
                label="Ver Reservas"
                icon="pi pi-calendar"
                class="p-button-text nav-item"
                @click="navigateTo('supervisor-booking')"
            />
          </div>

          <div v-rbac="[RoleEnum.ADMIN]" class="nav-menu">
            <pv-button
                label="Inicio"
                icon="pi pi-home"
                class="p-button-text nav-item"
                @click="navigateTo('home')"
            />
            <pv-button
                label="Dashboard"
                icon="pi pi-building"
                class="p-button-text nav-item"
                @click="navigateTo('dashboard-admin')"
            />
          </div>
        </div>

        <authentication-section class="auth-desktop"/>

        <pv-button
            icon="pi pi-bars"
            class="p-button-text mobile-menu-btn"
            @click="toggleSidebar"
            aria-label="Menú"
        />
      </template>
    </pv-toolbar>

    <pv-sidebar v-model:visible="sidebarVisible" position="right" class="mobile-sidebar">
      <div class="sidebar-header">
        <h3>Menú</h3>
      </div>

      <div class="sidebar-user-info">
        <i class="pi pi-user mr-2"></i>
        <span>{{ authStore.currentUsername }}</span>
      </div>

      <div class="sidebar-content">
        <div v-rbac="[RoleEnum.USER]" class="mobile-menu-group">
          <h4 class="menu-group-title">Navegación</h4>
          <ul class="mobile-menu-list">
            <li @click="navigateTo('home')">
              <i class="pi pi-home mr-2"></i>Inicio
            </li>
            <li @click="navigateTo('menu')">
              <i class="pi pi-book mr-2"></i>Menú
            </li>
            <li @click="navigateTo('reservation')">
              <i class="pi pi-calendar-plus mr-2"></i>Reservar
            </li>
          </ul>
        </div>

        <div v-rbac="[RoleEnum.SUPERVISOR]" class="mobile-menu-group">
          <h4 class="menu-group-title">Navegación</h4>
          <ul class="mobile-menu-list">
            <li @click="navigateTo('home')">
              <i class="pi pi-home mr-2"></i>Inicio
            </li>
            <li @click="navigateTo('cubicle-management')">
              <i class="pi pi-table mr-2"></i>Gestión de Cubiculos
            </li>
            <li @click="navigateTo('supervisor-booking')">
              <i class="pi pi-calendar mr-2"></i>Ver Reservas
            </li>
          </ul>
        </div>

        <div v-rbac="[RoleEnum.ADMIN]" class="mobile-menu-group">
          <h4 class="menu-group-title">Navegación</h4>
          <ul class="mobile-menu-list">
            <li @click="navigateTo('home')">
              <i class="pi pi-home mr-2"></i>Inicio
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-footer">
        <pv-button
            label="Cerrar sesión"
            icon="pi pi-sign-out"
            @click="handleSignOut"
            class="p-button-danger p-button-outlined w-full"
        />
      </div>
    </pv-sidebar>
  </div>
</template>

<style scoped>
.navbar-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
  box-shadow: none;
}

/* Toolbar transparente */
:deep(.custom-toolbar) {
  background-color: #FFFFFF !important;
  color: var(--text-color) !important;
  border: none !important;
  padding: 0.5rem !important;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1) !important;
}

/* Estilos de botones en toolbar */
:deep(.custom-toolbar .p-button.p-button-text) {
  color: var(--text-primary) !important;
  background-color: transparent !important;
  font-weight: 600;
}

:deep(.custom-toolbar .p-button.p-button-text:hover) {
  background-color: rgba(172, 131, 98, 0.1) !important;
}

.brand {
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 8px 16px;
}

.brand-logo {
  height: 40px;
  width: auto;
}

.brand-name {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-left: 8px;
}

.nav-menu {
  display: flex;
  align-items: center;
}

.nav-item {
  margin: 0 4px;
  color: var(--text-primary);
}

.mobile-menu-btn {
  display: none;
}

.mobile-sidebar {
  padding: 16px;
}

.sidebar-header h3 {
  margin-top: 0;
  color: var(--text-primary);
  font-size: 1.5rem;
  font-weight: 700;
}

.sidebar-user-info {
  padding: 12px;
  background-color: var(--primaryColor50);
  border-radius: 8px;
  display: flex;
  align-items: center;
  margin-bottom: 16px;
  font-weight: 600;
}

.menu-group-title {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.mobile-menu-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.mobile-menu-list li {
  display: flex;
  align-items: center;
  padding: 12px;
  border-radius: 6px;
  cursor: pointer;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.mobile-menu-list li:hover {
  background-color: var(--primaryColor50);
}

.sidebar-content {
  margin-bottom: 24px;
  flex: 1;
  overflow-y: auto;
}

.sidebar-footer {
  margin-top: auto;
}

:deep(.p-sidebar.mobile-sidebar) {
  background-color: #ffffff !important;
  color: var(--text-primary) !important;
  border: none !important;
}

:deep(.p-sidebar.mobile-sidebar .p-sidebar-header) {
  background-color: #ffffff !important;
  color: var(--text-primary) !important;
  border-bottom: 1px solid var(--primaryColor100) !important;
}

:deep(.p-sidebar.mobile-sidebar .p-sidebar-content) {
  background-color: #ffffff !important;
  color: var(--text-primary) !important;
}

:deep(.p-sidebar.mobile-sidebar *) {
  color: var(--text-primary) !important;
}

:deep(.p-sidebar-close) {
  color: var(--text-primary) !important;
}

:deep(.p-sidebar-close:hover) {
  background-color: var(--primaryColor50) !important;
}

.sidebar-header h3 {
  color: var(--text-primary) !important;
}

.sidebar-user-info {
  background-color: var(--primaryColor50) !important;
  color: var(--text-primary) !important;
}

.menu-group-title {
  color: var(--text-secondary) !important;
}

.mobile-menu-list li {
  color: var(--text-primary) !important;
}

.mobile-menu-list li:hover {
  background-color: var(--primaryColor50) !important;
}

:deep(.p-button-danger.p-button-outlined) {
  border-color: var(--primaryColor400) !important;
  color: var(--text-primary) !important;
}

:deep(.p-button-danger.p-button-outlined:hover) {
  background-color: var(--primaryColor50) !important;
  border-color: var(--primaryColor600) !important;
}

@media (max-width: 768px) {
  .desktop-menu, .auth-desktop {
    display: none;
  }

  .mobile-menu-btn {
    display: block;
  }
}

@media (min-width: 769px) {
  :deep(.mobile-sidebar) {
    display: none;
  }
}
</style>