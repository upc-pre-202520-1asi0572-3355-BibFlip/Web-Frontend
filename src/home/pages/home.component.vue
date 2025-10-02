<template>
  <div class="home-container">
    <div class="home-content">

      <!-- Solo visible para administradores -->
      <!-- Sección de administrador con diseño mejorado -->
      <div v-rbac="[RoleEnum.ADMIN]" class="admin-dashboard-container">
        <div class="dashboard-header">
          <div class="header-content">
            <div class="brand-section">
              <div class="brand-icon">
                <i class="pi pi-shield"></i>
              </div>
              <div class="brand-info">
                <h2 class="brand-title">Panel Administrativo</h2>
                <p class="brand-subtitle">Tu centro de gestión de creación de sedes y supervisores</p>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-grid">
          <!-- Tarjeta de estadísticas -->
          <div class="dashboard-card stats-card">
            <div class="card-header">
              <i class="pi pi-chart-bar"></i>
              <h3>Estadísticas del Sistema</h3>
            </div>
            <div class="card-content-admin">
              <div class="stat-item">
                <div class="stat-icon"><i class="pi pi-building"></i></div>
                <div class="stat-info">
                  <span class="stat-value">{{ headquarters?.length || 0 }}</span>
                  <span class="stat-label">Sedes registradas</span>
                </div>
              </div>
              <div class="stat-item">
                <div class="stat-icon"><i class="pi pi-users"></i></div>
                <div class="stat-info">
                  <span class="stat-value">{{ supervisors?.length || 0 }}</span>
                  <span class="stat-label">Supervisores activos</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Tarjeta de accesos rápidos -->
          <div class="dashboard-card actions-card">
            <div class="card-header">
              <i class="pi pi-bolt"></i>
              <h3>Acciones Rápidas</h3>
            </div>
            <div class="card-content">
              <router-link to="/dashboard-admin" class="action-button">
                <i class="pi pi-building"></i>
                <span>Gestionar Sedes</span>
              </router-link>
              <router-link to="/dashboard-admin?tab=supervisors" class="action-button">
                <i class="pi pi-users"></i>
                <span>Gestionar Supervisores</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Visible para supervisores -->
      <div v-rbac="[RoleEnum.SUPERVISOR]" class="supervisor-dashboard">
        <div class="dashboard-header">
          <div class="header-content">
            <div class="brand-section">
              <div class="brand-icon">
                <i class="pi pi-building"></i>
              </div>
              <div class="brand-info">
                <h2 class="brand-title">Panel de Supervisor</h2>
                <p class="brand-subtitle">Tu centro de gestión de reservas y cubiculos</p>
              </div>
            </div>
          </div>
        </div>

        <div class="dashboard-content-grid">
          <!-- Tarjeta de sede asignada -->
          <div class="dashboard-card hq-card">
            <div class="card-header">
              <i class="pi pi-map-marker"></i>
              <h3>Mi Sede Asignada</h3>
            </div>
            <div class="card-content">
              <AssignedHeadquarterCard />
            </div>
          </div>

          <!-- Acciones rápidas -->
          <div class="supervisor-actions">
            <div class="card-header">
              <i class="pi pi-bolt"></i>
              <h3>Acciones Rápidas</h3>
            </div>
            <div class="actions-container">
              <router-link to="/supervisor-booking" class="action-button">
                <i class="pi pi-calendar"></i>
                <span>Gestionar Reservas</span>
              </router-link>
              <router-link to="/cubicles" class="action-button">
                <i class="pi pi-table"></i>
                <span>Gestionar Cubiculos</span>
              </router-link>
            </div>
          </div>
        </div>
      </div>

      <!-- Contenido visible para todos -->
      <div v-rbac="[RoleEnum.USER]" class="general-content">
        <BookingCarousel />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { RoleEnum } from '@/iam/model/role.enum.js';
import AssignedHeadquarterCard from '@/branching/components/assigned-headquarter-card.vue';
import HeadquarterCubicleList from '@/booking/components/headquarter-cubicle-list.vue';
import BookingCarousel from '@/booking/components/booking-carousel.component.vue';
import { BranchingApiService } from '@/branching/services/branching-api.service';

const router = useRouter();
const headquarters = ref([]);
const currentDate = new Date().toLocaleString('es-PE', {
  weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
});


const supervisors = ref([]);
const apiService = new BranchingApiService();

const navigateTo = (route) => {
  router.push({ name: route });
};


const fetchHeadquarters = async () => {
  try {
    const response = await apiService.getAllHeadquarters();
    headquarters.value = response?.data || [];
  } catch (error) {
    console.error('Error fetching headquarters:', error);
  }
};

onMounted(async () => {
  try {
    // Cargar datos de sedes
    const hqResponse = await apiService.getAllHeadquarters();
    if (hqResponse && hqResponse.data) {
      headquarters.value = hqResponse.data;
    }

    // Cargar datos de supervisores
    const usersResponse = await apiService.getAllUsers();
    if (usersResponse && usersResponse.data) {
      supervisors.value = usersResponse.data.filter(user =>
          user.roles && user.roles.includes("ROLE_SUPERVISOR"));
    }

  } catch (error) {
    console.error("Error al cargar datos para el panel de administrador:", error);
  }
});
</script>

<style scoped>
.card-content-admin {
  grid-template-columns: repeat(3, 1fr);
}

.stat-item {
  background: linear-gradient(135deg, var(--primaryColor50) 0%, var(--background-color) 100%);
  padding: 1rem;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: #a88467;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(172, 131, 98, 0.2);
}

.stat-info {
  display: flex;
  flex-direction: column;
}
.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
  font-weight: 500;
}

@media (max-width: 992px) {
  .card-content-admin {
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1.25rem;
  }

  .stat-icon {
    width: 48px;
    height: 48px;
    font-size: 1.25rem;
  }

  .stat-value {
    font-size: 1.5rem;
  }
}

@media (max-width: 768px) {
  .card-content-admin {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .card-content-admin {
    grid-template-columns: 1fr;
  }

  .stat-item {
    padding: 1.25rem;
  }
}
.home-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.admin-dashboard-container,
.supervisor-dashboard {
  margin: 1.5rem 0;
  width: 100%;
}

.dashboard-header {
  margin-bottom: 1.5rem;
}

.header-content {
  padding: 1.25rem;
  background: rgba(186, 108, 45, 0.06);
  border-radius: 12px;
  border: 1px solid var(--primaryColor100);
  box-shadow: 0 4px 8px rgba(57, 43, 27, 0.1);
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
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 1.25rem;
  box-shadow: 0 3px 10px rgba(172, 131, 98, 0.2);
}

.brand-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0;
  line-height: 1.2;
}

.brand-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0.25rem 0 0 0;
}

.dashboard-grid,
.dashboard-content-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 1.5rem;
}
.stats-card{
  border: 1px solid var(--primaryColor100);
  border-radius: 0 0 12px 12px;
}
.dashboard-card,
.supervisor-actions {
  background-color: rgba(186, 108, 45, 0.06);
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(57, 43, 27, 0.15);
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.dashboard-card:hover,
.supervisor-actions:hover {
  transform: translateY(-3px);
  box-shadow: 0 6px 15px rgba(57, 43, 27, 0.2);
}

.card-header {
  padding: 1.25rem;
  border-bottom: 1px solid var(--primaryColor100);
  background: #a88467;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.card-header i {
  font-size: 1.25rem;
  color: white;
}

.card-header h3 {
  font-size: 1.25rem;
  color: white;
  margin: 0;
}

.card-content {
  padding: 1.25rem;
  flex: 1;
  border: 1px solid var(--primaryColor100);
  border-radius: 0 0 12px 12px;
}

.actions-container {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: rgba(194, 154, 108, 0.08);
  border: 1px solid var(--primaryColor200);
  border-radius: 10px;
  color: var(--text-primary);
  font-weight: 600;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-button:hover {
  background: rgba(188, 148, 102, 0.38);
  border-color: var(--primaryColor300);
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .dashboard-grid,
  .dashboard-content-grid {
    grid-template-columns: 1fr;
  }

  .brand-title {
    font-size: 1.25rem;
  }

  .brand-subtitle {
    font-size: 0.8rem;
  }
}
</style>
