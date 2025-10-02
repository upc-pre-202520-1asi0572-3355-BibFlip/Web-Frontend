<script>
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router'; // Importar useRouteimport { BranchingApiService } from "@/branching/services/branching-api.service.js";
import HeadquarterCard from '../components/headquarter-card.vue';
import SupervisorCard from '../components/supervisor-card.vue';
import HeadquarterForm from '../components/headquarter-form.vue';
import {BranchingApiService} from "@/branching/services/branching-api.service.js";

export default {
  name: "headquarter-management",
  components: {
    HeadquarterCard,
    SupervisorCard,
    HeadquarterForm
  },
  setup() {
    const apiService = new BranchingApiService();
    const route = useRoute(); // Importa useRoute de vue-router

    // State variables
    const activeTab = ref(route.query.tab === 'supervisors' ? 'supervisors' : 'headquarters');
    const selectedHeadquarter = ref(null);
    const supervisors = ref([]);
    const allSupervisors = ref([]);
    const headquarters = ref([]);
    const loading = ref(false);
    const showAssignModal = ref(false);
    const searchTerm = ref('');
    const notification = ref(null);
    const router = useRouter();

    const fetchHeadquarters = async () => {
      loading.value = true;
      try {
        const response = await apiService.getAllHeadquarters();
        if (response && response.data) {
          headquarters.value = response.data;
        }
      } catch (err) {
        showNotification('Error al cargar sedes', 'error');
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Fetch all supervisors
    const fetchAllSupervisors = async () => {
      loading.value = true;
      try {
        const response = await apiService.getAllUsers();
        if (response && response.data) {
          // Filter users with ROLE_SUPERVISOR
          allSupervisors.value = response.data.filter(user =>
              user.roles && user.roles.includes("ROLE_SUPERVISOR"));
        }
      } catch (err) {
        showNotification('Error al cargar supervisores', 'error');
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    // Fetch supervisors for a specific headquarter
    const fetchSupervisorsForHeadquarter = async (headquarterId) => {
      loading.value = true;
      try {
        const response = await apiService.getSupervisorsByHeadquarterId(headquarterId);
        if (response && response.data) {
          supervisors.value = response.data;
        }
      } catch (err) {
        showNotification('Error al cargar supervisores para esta sede', 'error');
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const assignSupervisor = async (headquarterId, supervisorId) => {
      loading.value = true;
      try {
        await apiService.assignSupervisorToHeadquarter(headquarterId, supervisorId);
        await fetchSupervisorsForHeadquarter(headquarterId);
        await checkSupervisorAssignments(); // Update assignment information
        showNotification('Supervisor asignado correctamente', 'success');
        showAssignModal.value = false;
      } catch (err) {
        showNotification('Error al asignar supervisor', 'error');
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const removeSupervisor = async (headquarterId, supervisorId) => {
      loading.value = true;
      try {
        await apiService.removeSupervisorFromHeadquarter(headquarterId, supervisorId);
        await fetchSupervisorsForHeadquarter(headquarterId);
        await checkSupervisorAssignments(); // Update assignment information
        showNotification('Supervisor removido correctamente', 'success');
      } catch (err) {
        showNotification('Error al remover supervisor', 'error');
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const selectHeadquarter = (headquarter) => {
      selectedHeadquarter.value = headquarter;
      fetchSupervisorsForHeadquarter(headquarter.id);
    };

    const showNotification = (message, type = 'success') => {
      notification.value = { message, type };
      setTimeout(() => {
        notification.value = null;
      }, 3000);
    };

    const getAssignButtonText = () => {
      if (supervisors.value.length >= 1) {
        return "Máximo 1 supervisor por sede";
      }
      return "Asignar Supervisor";
    };

    // Computed properties
    const filteredHeadquarters = () => {
      if (!searchTerm.value) return headquarters.value;

      return headquarters.value.filter(hq =>
          hq.name?.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
          hq.streetAddress?.toLowerCase().includes(searchTerm.value.toLowerCase())
      );
    };

    const availableSupervisors = () => {
      if (supervisors.value.length >= 1) {
        return [];
      }

      return allSupervisors.value.filter(supervisor => {
        return !Object.keys(isSupervisorAssigned.value).includes(supervisor.id.toString());
      });
    };

    const isSupervisorAssigned = ref({});

    const checkSupervisorAssignments = async () => {
      try {
        const response = await apiService.getAllHeadquarters();
        const allHeadquarters = response.data;

        const assignmentMap = {};
        for (const hq of allHeadquarters) {
          const supervisorsRes = await apiService.getSupervisorsByHeadquarterId(hq.id);
          const hqSupervisors = supervisorsRes.data;
          for (const supervisor of hqSupervisors) {
            assignmentMap[supervisor.id] = hq.id;
          }
        }
        isSupervisorAssigned.value = assignmentMap;
      } catch (err) {
        console.error("Error checking supervisor assignments:", err);
      }
    };

    const newSupervisor = ref({
      username: '',
      password: '',
      confirmPassword: ''
    });
    const errors = ref({});
    const registrationSuccess = ref(false);
    const onHeadquarterCreated = (newHeadquarter) => {
      headquarters.value.push(newHeadquarter);
      showNotification('Sede creada correctamente', 'success');
      activeTab.value = 'headquarters';
    };
    const showHeadquarterModal = ref(false);

    const openCreateHeadquarterModal = () => {
      showHeadquarterModal.value = true;
    };

    const navigateToCreateHeadquarter = () => {
      router.push('/create-headquarter');
    };

    const closeCreateHeadquarterModal = () => {
      showHeadquarterModal.value = false;
    };

    const validateSupervisor = () => {
      errors.value = {};

      if (!newSupervisor.value.username?.trim()) {
        errors.value.username = 'El nombre de usuario es requerido';
      }

      if (!newSupervisor.value.password?.trim()) {
        errors.value.password = 'La contraseña es requerida';
      } else if (newSupervisor.value.password.length < 6) {
        errors.value.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (newSupervisor.value.password !== newSupervisor.value.confirmPassword) {
        errors.value.confirmPassword = 'Las contraseñas no coinciden';
      }

      return Object.keys(errors.value).length === 0;
    };
    const registerSupervisor = async () => {
      if (!validateSupervisor()) return;

      loading.value = true;
      try {
        const payload = {
          username: newSupervisor.value.username,
          password: newSupervisor.value.password,
          roles: ["ROLE_SUPERVISOR"]
        };

        const response = await apiService.registerUser(payload);
        if (response && response.data) {
          registrationSuccess.value = true;
          newSupervisor.value = { username: '', password: '', confirmPassword: '' };
          await fetchAllSupervisors(); // Refresh the list of supervisors
          showNotification('Supervisor registrado correctamente', 'success');
          setTimeout(() => {
            registrationSuccess.value = false;
          }, 3000);
        }
      } catch (err) {
        console.error('Error registering supervisor:', err);
        let errorMessage = 'Error al registrar supervisor';
        if (err.response && err.response.data && err.response.data.message) {
          errorMessage = err.response.data.message;
        }
        showNotification(errorMessage, 'error');
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchHeadquarters();
      fetchAllSupervisors();
      checkSupervisorAssignments();
    });

    return {
      activeTab,
      selectedHeadquarter,
      supervisors,
      allSupervisors,
      headquarters,
      loading,
      showAssignModal,
      searchTerm,
      notification,
      filteredHeadquarters,
      availableSupervisors,
      selectHeadquarter,
      assignSupervisor,
      removeSupervisor,
      showNotification,
      newSupervisor,
      errors,
      registrationSuccess,
      registerSupervisor,
      showHeadquarterModal,
      openCreateHeadquarterModal,
      closeCreateHeadquarterModal,
      onHeadquarterCreated,
      getAssignButtonText,
      navigateToCreateHeadquarter

    };
  }
}
</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <header class="dashboard-header">
      <div class="header-content">
        <div class="brand-section">
          <div class="brand-icon">
            <i class="pi pi-building"></i>
          </div>
          <div class="brand-info">
            <h1 class="brand-title">Bibflip</h1>
            <p class="brand-subtitle">Gestión de Sedes</p>
          </div>
        </div>

        <nav class="tab-navigation">
          <button
              @click="activeTab = 'headquarters'"
              :class="['nav-button', { active: activeTab === 'headquarters' }]"
          >
            <i class="pi pi-map-marker"></i>
            <span>Sedes</span>
          </button>
          <button
              @click="activeTab = 'supervisors'"
              :class="['nav-button', { active: activeTab === 'supervisors' }]"
          >
            <i class="pi pi-users"></i>
            <span>Supervisores</span>
          </button>
        </nav>
      </div>
    </header>

    <!-- Notification Toast -->
    <div v-if="notification" :class="['notification-toast', notification.type]">
      <div class="notification-content">
        <i :class="`pi ${notification.type === 'success' ? 'pi-check-circle' : 'pi-times-circle'}`"></i>
        <span>{{ notification.message }}</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="main-content">
      <div class="content-grid">
        <!-- Sidebar - Lista de Sedes -->
        <aside class="sidebar">
          <div class="sidebar-card">
            <div class="sidebar-header">
              <h2 class="sidebar-title">
                <i class="pi pi-building"></i>
                Sedes Disponibles
              </h2>
              <div class="sidebar-actions">
                <button @click="navigateToCreateHeadquarter" class="nav-button">
                  <i class="pi pi-plus"></i>
                  <span>Nueva Sede</span>
                </button>
              </div>

              <div class="search-container">
                <div class="search-input-wrapper">
                  <i class="pi pi-search search-icon"></i>
                  <input
                      type="text"
                      placeholder="Buscar sedes..."
                      v-model="searchTerm"
                      class="search-input"
                  />
                </div>
              </div>
            </div>

            <div class="headquarters-list">
              <div
                  v-for="hq in filteredHeadquarters()"
                  :key="hq.id"
                  @click="selectHeadquarter(hq)"
                  :class="['headquarter-item', { selected: selectedHeadquarter?.id === hq.id }]"
              >
                <div class="headquarter-info">
                  <h3 class="headquarter-name">{{ hq.name }}</h3>
                  <p class="headquarter-address">{{ hq.address }}</p>
                  <p class="headquarter-city">{{ hq.city }}</p>
                </div>
                <div class="headquarter-status">
                  <span class="status-badge active">Activa</span>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <!-- Main Panel -->
        <section class="main-panel">
          <div v-if="activeTab === 'headquarters'" class="panel-card">
            <div v-if="selectedHeadquarter" class="panel-header">
              <div class="panel-title-section">
                <h2 class="panel-title">
                  <i class="pi pi-users"></i>
                  Supervisores
                </h2>
                <p class="panel-subtitle">{{ selectedHeadquarter.name }}</p>
              </div>
              <button
                  @click="showAssignModal = true"
                  :disabled="supervisors.length >= 1 || availableSupervisors().length === 0"
                  class="assign-button"
                  :class="{ disabled: supervisors.length >= 1 || availableSupervisors().length === 0 }"
              >
                <i class="pi pi-plus"></i>
                <span>{{ getAssignButtonText() }}</span>
              </button>
            </div>

            <div class="panel-content">
              <div v-if="loading" class="loading-container">
                <div class="loading-spinner">
                  <div class="spinner"></div>
                </div>
              </div>

              <div v-else-if="supervisors.length > 0" class="supervisors-grid">
                <div v-for="supervisor in supervisors" :key="supervisor.id" class="supervisor-card">
                  <div class="supervisor-info">
                    <div class="supervisor-avatar">
                      <i class="pi pi-user"></i>
                    </div>
                    <div class="supervisor-details">
                      <h3 class="supervisor-name">{{ supervisor.username }}</h3>
                      <p class="supervisor-role">Supervisor Activo</p>
                    </div>
                  </div>
                  <button
                      @click="removeSupervisor(selectedHeadquarter.id, supervisor.id)"
                      class="remove-button"
                      title="Remover supervisor"
                  >
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>

              <div v-else class="empty-state">
                <div class="empty-icon">
                  <i class="pi pi-users"></i>
                </div>
                <h3 class="empty-title">Selecciona una sede para asignar un supervisor</h3>
              </div>
            </div>
          </div>

          <!-- Default State for headquarters tab -->
          <div v-else-if="activeTab === 'headquarters' && !selectedHeadquarter" class="panel-card">
            <div class="welcome-state">
              <div class="welcome-icon">
                <i class="pi pi-map-marker"></i>
              </div>
              <h3 class="welcome-title">Selecciona una sede</h3>
              <p class="welcome-description">
                Escoge una sede de la lista para gestionar sus supervisores
              </p>
            </div>
          </div>

          <!-- Show supervisor registration when supervisors tab is active -->
          <div v-else-if="activeTab === 'supervisors'" class="panel-card">
            <div class="panel-header">
              <div class="panel-title-section">
                <h2 class="panel-title">
                  <i class="pi pi-user-plus"></i>
                  Registro de Supervisores
                </h2>
                <p class="panel-subtitle">Crear una nueva cuenta de supervisor</p>
              </div>
            </div>

            <div class="panel-content">
              <div v-if="registrationSuccess" class="success-message">
                <i class="pi pi-check-circle"></i>
                <span>Supervisor registrado correctamente</span>
              </div>

              <form @submit.prevent="registerSupervisor" class="supervisor-form">
                <div class="form-group">
                  <label for="username">Nombre de Usuario</label>
                  <input
                      id="username"
                      type="text"
                      v-model="newSupervisor.username"
                      :class="['form-control', {'error': errors.username}]"
                      placeholder="Ingrese nombre de usuario"
                  />
                  <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
                </div>

                <div class="form-group">
                  <label for="password">Contraseña</label>
                  <input
                      id="password"
                      type="password"
                      v-model="newSupervisor.password"
                      :class="['form-control', {'error': errors.password}]"
                      placeholder="******"
                  />
                  <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
                </div>

                <div class="form-group">
                  <label for="confirmPassword">Confirmar Contraseña</label>
                  <input
                      id="confirmPassword"
                      type="password"
                      v-model="newSupervisor.confirmPassword"
                      :class="['form-control', {'error': errors.confirmPassword}]"
                      placeholder="******"
                  />
                  <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
                </div>

                <div class="form-actions">
                  <button type="submit" class="submit-button" :disabled="loading">
                    <i class="pi pi-user-plus"></i>
                    <span>{{ loading ? 'Registrando...' : 'Registrar Supervisor' }}</span>
                  </button>
                </div>
              </form>

              <div class="supervisors-list-section">
                <h3 class="section-title">
                  <i class="pi pi-users"></i>
                  Supervisores Registrados
                </h3>

                <div v-if="loading" class="loading-container">
                  <div class="loading-spinner">
                    <div class="spinner"></div>
                  </div>
                </div>

                <div v-else-if="allSupervisors.length > 0" class="supervisors-grid">
                  <div v-for="supervisor in allSupervisors" :key="supervisor.id" class="supervisor-card">
                    <div class="supervisor-info">
                      <div class="supervisor-avatar">
                        <i class="pi pi-user"></i>
                      </div>
                      <div class="supervisor-details">
                        <h3 class="supervisor-name">{{ supervisor.username }}</h3>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="empty-state">
                  <div class="empty-icon">
                    <i class="pi pi-users"></i>
                  </div>
                  <h3 class="empty-title">No hay supervisores registrados</h3>
                  <p class="empty-description">
                    Crea el primer supervisor utilizando el formulario de registro.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>

    <!-- Modal para asignar supervisor -->
    <div v-if="showAssignModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <div class="modal-title-section">
            <h3 class="modal-title">
              <i class="pi pi-user-plus"></i>
              Asignar Supervisor
            </h3>
            <p class="modal-subtitle">
              Selecciona un supervisor para {{ selectedHeadquarter?.name }}
            </p>
          </div>
          <button @click="showAssignModal = false" class="modal-close">
            <i class="pi pi-times"></i>
          </button>
        </div>

        <div class="modal-content">
          <div v-if="availableSupervisors().length > 0" class="supervisors-list">
            <div
                v-for="supervisor in availableSupervisors()"
                :key="supervisor.id"
                @click="assignSupervisor(selectedHeadquarter.id, supervisor.id)"
                class="supervisor-option"
            >
              <div class="supervisor-option-avatar">
                <i class="pi pi-user"></i>
              </div>
              <div class="supervisor-option-info">
                <h4 class="supervisor-option-name">{{ supervisor.username }}</h4>
                <p class="supervisor-option-status">Supervisor Disponible</p>
              </div>
              <i class="pi pi-angle-right supervisor-option-arrow"></i>
            </div>
          </div>

          <div v-else-if="supervisors.length >= 1" class="modal-empty-state">
            <div class="modal-empty-icon">
              <i class="pi pi-users"></i>
            </div>
            <p class="modal-empty-text">Esta sede ya tiene un supervisor asignado</p>
          </div>

          <div v-else class="modal-empty-state">
            <div class="modal-empty-icon">
              <i class="pi pi-users"></i>
            </div>
            <p class="modal-empty-text">No hay supervisores disponibles</p>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showHeadquarterModal" class="modal-overlay">
      <div class="modal-container">
        <div class="modal-header">
          <div>
            <h3 class="modal-title">
              <i class="pi pi-building"></i>
              Crear Nueva Sede
            </h3>
            <p class="modal-subtitle">Ingrese la información de la nueva sede</p>
          </div>
          <button @click="closeCreateHeadquarterModal" class="modal-close">
            <i class="pi pi-times"></i>
          </button>
        </div>
        <div class="modal-content">
          <HeadquarterForm
              @headquarter-created="onHeadquarterCreated"
              @cancel="closeCreateHeadquarterModal"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.brand-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.brand-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primaryColor500) 0%, var(--primaryColor400) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 4px 12px rgba(172, 131, 98, 0.3);
}

.brand-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1;
}

.brand-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
  font-weight: 500;
}

.tab-navigation {
  display: flex;
  background: var(--background-color-light);
  border-radius: 12px;
  padding: 4px;
  border: 1px solid var(--primaryColor100);
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  margin-bottom: 9px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.nav-button:hover {
  color: var(--text-primary);
  background: rgba(172, 131, 98, 0.22);
  cursor: pointer;
}

.nav-button.active {
  background: var(--primaryColor500);
  color: white;
  box-shadow: 0 2px 8px rgba(172, 131, 98, 0.3);
}

/* Notification Toast */
/* Notification Toast */
.notification-toast {
  position: fixed;
  bottom: 20px; /* Cambiado de top a bottom */
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 20px;
  border-radius: 8px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  display: flex;
  align-items: center;
  animation: slideUp 0.3s ease-out forwards; /* Cambiar animación */
}

/* Actualizar la animación para que aparezca desde abajo */
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translate(-50%, 20px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
  }
}

.notification-toast.success {
  background: rgba(76, 175, 80, 0.95);
  color: white;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

.notification-toast.error {
  background: rgba(244, 67, 54, 0.95);
  color: white;
  border: 1px solid rgba(244, 67, 54, 0.3);
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 600;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
}

@media (max-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}

/* Sidebar Styles */
.sidebar-card {
  background: var(--surface-color);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--primaryColor100);
  overflow: hidden;
}

.sidebar-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--primaryColor100);
  background: var(--primaryColor50);
}

.sidebar-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.search-container {
  position: relative;
}

.search-input-wrapper {
  position: relative;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid var(--primaryColor200);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--primaryColor500);
  box-shadow: 0 0 0 3px rgba(172, 131, 98, 0.1);
}

.search-input::placeholder {
  color: var(--text-secondary);
}

/* Headquarters List */
.headquarters-list {
  max-height: 400px;
  overflow-y: auto;
}

.headquarter-item {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--primaryColor100);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.headquarter-item:hover {
  background: var(--primaryColor50);
}

.headquarter-item.selected {
  background: linear-gradient(135deg, var(--primaryColor100) 0%, var(--primaryColor50) 100%);
  border-left: 4px solid var(--primaryColor500);
}

.headquarter-info {
  flex: 1;
}

.headquarter-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
}

.headquarter-address,
.headquarter-city {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.125rem 0;
}

.headquarter-status {
  margin-top: 0.5rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
}

.status-badge.active {
  background: rgba(76, 175, 80, 0.1);
  color: #4CAF50;
  border: 1px solid rgba(76, 175, 80, 0.3);
}

/* Main Panel */
.panel-card {
  background: var(--surface-color);
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--primaryColor100);
  overflow: hidden;
}

.panel-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--primaryColor100);
  background: var(--primaryColor50);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.panel-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.panel-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
  font-weight: 500;
}

.assign-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(135deg, var(--primaryColor500) 0%, var(--primaryColor400) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(172, 131, 98, 0.3);
}

.assign-button:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(172, 131, 98, 0.4);
}

.assign-button.disabled {
  background: var(--primaryColor200);
  color: var(--text-disabled);
  cursor: not-allowed;
  box-shadow: none;
}

.panel-content {
  padding: 1.5rem;
}

/* Loading Spinner */
.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem;
}

.loading-spinner {
  position: relative;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--primaryColor200);
  border-top: 3px solid var(--primaryColor500);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Supervisors Grid */
.supervisors-grid {
  display: grid;
  gap: 1rem;
}

.supervisor-card {
  background: var(--primaryColor50);
  border: 1px solid var(--primaryColor200);
  border-radius: 12px;
  padding: 1.25rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.2s ease;
}

.supervisor-card:hover {
  border-color: var(--primaryColor300);
  box-shadow: 0 4px 12px rgba(172, 131, 98, 0.15);
  transform: translateY(-1px);
}

.supervisor-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.supervisor-avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, var(--primaryColor500) 0%, var(--primaryColor400) 100%);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.125rem;
}

.supervisor-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.supervisor-role {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

.remove-button {
  width: 40px;
  height: 40px;
  background: rgba(244, 67, 54, 0.1);
  border: 1px solid rgba(244, 67, 54, 0.3);
  border-radius: 8px;
  color: #f44336;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.remove-button:hover {
  background: rgba(244, 67, 54, 0.2);
  border-color: rgba(244, 67, 54, 0.5);
}

/* Empty State */
.empty-state,
.welcome-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon,
.welcome-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primaryColor200) 0%, var(--primaryColor300) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: var(--primaryColor500);
  font-size: 2rem;
}

.empty-title,
.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.empty-description,
.welcome-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0 0 2rem 0;
  max-width: 400px;
  margin-left: auto;
  margin-right: auto;
}

.empty-action-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  background: linear-gradient(135deg, var(--primaryColor500) 0%, var(--primaryColor400) 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(172, 131, 98, 0.3);
}

.empty-action-button:hover:not(.disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(172, 131, 98, 0.4);
}

.empty-action-button.disabled {
  background: var(--primaryColor200);
  color: var(--text-disabled);
  cursor: not-allowed;
  box-shadow: none;
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 50;
}

.modal-container {
  background: var(--surface-color);
  border-radius: 16px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  border: 1px solid var(--primaryColor100);
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow: hidden;
  animation: modalSlideIn 0.3s ease;
}

@keyframes modalSlideIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--primaryColor100);
  background: linear-gradient(135deg, var(--primaryColor50) 0%, var(--primaryColor100) 100%);
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.modal-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
}

.modal-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.5rem 0 0 0;
}

.modal-close {
  width: 36px;
  height: 36px;
  background: transparent;
  border: 1px solid var(--primaryColor200);
  border-radius: 8px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close:hover {
  background: rgba(244, 67, 54, 0.1);
  border-color: rgba(244, 67, 54, 0.3);
  color: #f44336;
}

.modal-content {
  padding: 1.5rem;
  max-height: 400px;
  overflow-y: auto;
}

/* Supervisors List in Modal */
.supervisors-list {
  display: grid;
  gap: 0.75rem;
}

.supervisor-option {
  background: linear-gradient(135deg, var(--primaryColor50) 0%, var(--background-color) 100%);
  border: 1px solid var(--primaryColor200);
  border-radius: 12px;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.supervisor-option:hover {
  border-color: var(--primaryColor300);
  box-shadow: 0 2px 8px rgba(172, 131, 98, 0.15);
  transform: translateY(-1px);
}

.supervisor-option-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--primaryColor500) 0%, var(--primaryColor400) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1rem;
}

.supervisor-option-info {
  flex: 1;
}

.supervisor-option-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.supervisor-option-status {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

.supervisor-option-arrow {
  color: var(--text-secondary);
  font-size: 1rem;
}

/* Modal Empty State */
.modal-empty-state {
  text-align: center;
  padding: 2rem 1rem;
}

.modal-empty-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--primaryColor200) 0%, var(--primaryColor300) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: var(--primaryColor500);
  font-size: 1.5rem;
}

.modal-empty-text {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}
.supervisor-form {
  background: var(--primaryColor50);
  border: 1px solid var(--primaryColor200);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.25rem;
  text-align: left;
}

.form-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-control {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 1px solid var(--primaryColor200);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-control:focus {
  outline: none;
  border-color: var(--primaryColor500);
  box-shadow: 0 0 0 3px rgba(172, 131, 98, 0.1);
}

.form-control.error {
  border-color: #f44336;
  background-color: rgba(244, 67, 54, 0.05);
}

.error-message {
  display: block;
  font-size: 0.75rem;
  color: #f44336;
  margin-top: 0.375rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 2rem;
}

.submit-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.75rem;
  background: #AC8362;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 8px rgba(172, 131, 98, 0.3);
}

.submit-button:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(172, 131, 98, 0.4);
}

.submit-button:disabled {
  background: var(--primaryColor200);
  color: var(--text-disabled);
  cursor: not-allowed;
  box-shadow: none;
}

.success-message {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  margin-bottom: 1.5rem;
  background: rgba(76, 175, 80, 0.1);
  border: 1px solid rgba(76, 175, 80, 0.3);
  border-radius: 8px;
  color: #4CAF50;
  font-weight: 600;
}

.supervisors-list-section {
  margin-top: 2rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1.25rem 0;
  text-align: left;
}
/* Responsive Design */
@media (max-width: 768px) {
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .tab-navigation {
    justify-content: center;
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .panel-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .notification-toast {
    left: 1rem;
    right: 1rem;
    top: 1rem;
  }
}

@media (max-width: 480px) {
  .main-content {
    padding: 1rem;
  }

  .sidebar-card,
  .panel-card {
    border-radius: 12px;
  }

  .modal-container {
    margin: 1rem;
    max-width: calc(100vw - 2rem);
  }
}
</style>