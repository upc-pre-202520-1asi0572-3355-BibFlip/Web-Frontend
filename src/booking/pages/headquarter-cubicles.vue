<!-- src/booking/pages/headquarter-cubicles.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { HeadquartersService } from '../services/headquarter.service';
import { CubiclesService } from '../services/cubicles.service.js';
import HeadquarterCubiclesCardComponent from '../components/headquarter-cubicles-card.component.vue';
import ReservationForm from '../components/reservation-form.component.vue';

const route = useRoute();
const headquarterId = computed(() => route.params.id);

const headquarter = ref(null);
const cubicles = ref([]);
const loading = ref(true);
const error = ref(null);
const noCubiclesFound = ref(false);

// Filtros
const capacityFilter = ref('all');
const zoneFilter = ref('all');
const availableZones = ref(['B', 'C', 'interior']);
const availableCapacities = ref([1, 2, 4, 6, 8]);

// Formulario de reserva
const showReservationForm = ref(false);
const selectedCubicleInfo = ref({});

const headquartersService = new HeadquartersService();
const cubiclesService = new CubiclesService();

onMounted(async () => {
  try {
    // Cargar datos de la sede
    const headquarterResponse = await headquartersService.getHeadquarterById(headquarterId.value);
    headquarter.value = headquarterResponse;

    try {
      // Cargar cubiculos de la sede
      const cubiclesResponse = await cubiclesService.getCubiclesByHeadquarter(headquarterId.value);
      cubicles.value = cubiclesResponse.data || [];

      if (cubicles.value.length === 0) {
        noCubiclesFound.value = true;
      }
    } catch (cubicleError) {
      if (cubicleError.response && cubicleError.response.status === 404) {
        noCubiclesFound.value = true;
      } else {
        throw cubicleError;
      }
    }

    loading.value = false;
  } catch (err) {
    error.value = 'Error al cargar los datos: ' + err.message;
    loading.value = false;
  }
});

const filteredCubicles = computed(() => {
  let filtered = [...cubicles.value];

  if (capacityFilter.value !== 'all') {
    filtered = filtered.filter(cubicle => cubicle.seats === parseInt(capacityFilter.value));
  }

  if (zoneFilter.value !== 'all') {
    filtered = filtered.filter(cubicle => cubicle.zone === zoneFilter.value);
  }

  return filtered;
});

const resetFilters = () => {
  capacityFilter.value = 'all';
  zoneFilter.value = 'all';
};

const handleReserveCubicle = (cubicleInfo) => {
  selectedCubicleInfo.value = cubicleInfo;
  showReservationForm.value = true;
};

const handleReservationSuccess = () => {
  setTimeout(() => {
    // Actualizar los cubiculos para reflejar la nueva reserva
    refreshCubicles();
  }, 2000);
};

const closeReservationForm = () => {
  showReservationForm.value = false;
  selectedCubicleInfo.value = null;
};

const refreshCubicles = async () => {
  try {
    const cubiclesResponse = await cubiclesService.getCubiclesByHeadquarter(headquarterId.value);
    cubicles.value = cubiclesResponse.data;
  } catch (err) {
    console.error('Error al actualizar los cubiculos:', err);
  }
};
</script>

<template>
  <div class="headquarter-cubicles-page">
    <div class="loading" v-if="loading">
      <div class="loading-spinner">
        <i class="pi pi-spin pi-spinner"></i>
        <p>Cargando información...</p>
      </div>
    </div>

    <div class="headquarter-content" v-else>
      <router-link to="/headquarters" class="btn-back-minimalista">
        <i class="pi pi-arrow-left"></i>
        <span>Volver a sedes</span>
      </router-link>

      <div class="headquarter-header" v-if="headquarter">
        <h1>{{ headquarter.name }} - Cubiculos</h1>
        <p class="headquarter-address">
          <i class="pi pi-map-marker"></i> {{ headquartersService.getFullAddress(headquarter) }}
        </p>
      </div>

      <div v-if="noCubiclesFound" class="no-cubicles-container">
        <div class="no-cubicles-content">
          <i class="pi pi-cubicle no-cubicles-icon"></i>
          <h2>No hay cubiculos registradas</h2>
          <p>Esta sede aún no tiene cubiculos disponibles para reservar.</p>
          <router-link to="/headquarters" class="btn-back-to-headquarters">
            <i class="pi pi-building"></i>
            Ver otras sedes
          </router-link>
        </div>
      </div>

      <div class="main-content" v-else-if="!error">
        <!-- Panel de filtros (lado izquierdo) -->
        <div class="filters-panel">
          <div class="filters-header">
            <h2>Filtros</h2>
          </div>

          <div class="filter-group">
            <label for="capacityFilter">Capacidad:</label>
            <select id="capacityFilter" v-model="capacityFilter">
              <option value="all">Todas las capacidades</option>
              <option v-for="capacity in availableCapacities" :key="capacity" :value="capacity">
                {{ capacity }} {{ capacity === 1 ? 'persona' : 'personas' }}
              </option>
            </select>
          </div>

          <button class="btn-reset" @click="resetFilters">
            <i class="pi pi-filter-slash"></i> Limpiar filtros
          </button>
        </div>

        <!-- Sección de cubiculos (lado derecho) -->
        <div class="cubicles-section">
          <div v-if="filteredCubicles.length === 0" class="no-cubicles">
            <p>No se encontraron cubiculos que coincidan con los filtros seleccionados.</p>
          </div>

          <div v-else class="cubicles-grid">
            <div class="cubicle-card" v-for="cubicle in filteredCubicles" :key="cubicle.id"
                 :class="cubicle.status?.toLowerCase() === 'available' ? 'available' : 'occupied'">
              <div class="cubicle-header">
                <div class="cubicle-number">Cubiculo {{ cubicle.cubicleNumber }}</div>
                <div class="status-badge" :class="cubicle.status?.toLowerCase() === 'available' ? 'badge-available' : 'badge-occupied'">
                  {{ cubicle.status?.toLowerCase() === 'available' ? 'Disponible' : 'Ocupada' }}
                </div>
              </div>
              <div class="cubicle-info">
                <p><strong>Capacidad:</strong> {{ cubicle.seats }} personas</p>
              </div>
              <button
                  class="btn-reserve"
                  @click="handleReserveCubicle({
                cubicleId: cubicle.id,
                cubicleNumber: cubicle.cubicleNumber,
                seats: cubicle.seats,
                zone: cubicle.zone,
                headquarter: headquarter
              })"
                  :disabled="cubicle.status?.toLowerCase() !== 'available'">
                Reservar
              </button>
            </div>
          </div>
        </div>
      </div>

      <reservation-form
          :visible="showReservationForm"
          :tableInfo="selectedCubicleInfo"
          @close="closeReservationForm"
          @success="handleReservationSuccess"
      />
    </div>
  </div>
</template>

<style scoped>

.loading {
  display: flex;
  justify-content: center;
  align-items: center;
}

.loading-spinner {
  text-align: center;
  color: #8A724A;
}

.loading-spinner i {
  font-size: 2rem;
  margin-bottom: 10px;
  animation: spin 1s infinite linear;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.btn-back-minimalista {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #563F25;
  font-weight: 500;
  font-size: 0.95rem;
  margin-bottom: 25px;
  padding: 10px 16px;
  border-radius: 6px;
  background-color: #FAF7F4;
  border: 1px solid #DCC8B9;
  box-shadow: 0 2px 4px rgba(57, 43, 27, 0.08);
  transition: all 0.2s ease;
}

.btn-back-minimalista:hover {
  background-color: #EEE6E0;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(57, 43, 27, 0.12);
}

.btn-back-minimalista i {
  margin-right: 8px;
  font-size: 1rem;
  color: #8A724A;
}

/* Estilos para la pantalla de no hay cubiculos */
.no-cubicles-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.no-cubicles-content {
  background-color: #FFF8F3;
  border-radius: 12px;
  padding: 40px;
  text-align: center;
  max-width: 500px;
  box-shadow: 0 4px 15px rgba(57, 43, 27, 0.08);
  border: 1px solid #EEE6E0;
}

.no-cubicles-icon {
  font-size: 4rem;
  color: #DCC8B9;
  margin-bottom: 20px;
  opacity: 0.8;
}

.no-cubicles-content h2 {
  color: #392B1B;
  font-size: 1.8rem;
  margin-bottom: 15px;
}

.no-cubicles-content p {
  color: #563F25;
  font-size: 1.1rem;
  margin-bottom: 30px;
}

.btn-back-to-headquarters {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: white;
  font-weight: 500;
  padding: 12px 24px;
  border-radius: 6px;
  background-color: #AC8362;
  border: none;
  transition: all 0.2s ease;
  font-size: 1rem;
  box-shadow: 0 3px 6px rgba(172, 131, 98, 0.3);
}

.btn-back-to-headquarters:hover {
  background-color: #8A724A;
  transform: translateY(-2px);
  box-shadow: 0 5px 10px rgba(172, 131, 98, 0.4);
}

.btn-back-to-headquarters i {
  margin-right: 8px;
}

/* Resto de estilos... */
.headquarter-header {
  margin-bottom: 30px;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 2rem;
  color: #392B1B;
  margin-bottom: 10px;
}

.headquarter-address {
  color: #563F25;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.main-content {
  display: flex;
  gap: 30px;
}

.headquarter-header {
  margin-bottom: 30px;
  align-items: center;
  justify-content: center;
}

h1 {
  font-size: 2rem;
  color: #392B1B;
  margin-bottom: 10px;
}

.headquarter-address {
  color: #563F25;
  font-size: 1.1rem;
  display: flex;
  align-items: center;
  gap: 5px;
}

.main-content {
  display: flex;
  gap: 30px;
}

.filters-panel {
  width: 250px;
  background-color: #FFF8F3;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(57, 43, 27, 0.1);
  height: fit-content;
}

.filters-header {
  border-bottom: 1px solid #DCC8B9;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.filters-header h2 {
  margin: 0;
  color: #392B1B;
  font-size: 1.3rem;
}

.filter-group {
  margin-bottom: 20px;
}

.filter-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #563F25;
}

.filter-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #DCC8B9;
  border-radius: 4px;
  background-color: #fff;
  color: #392B1B;
  font-size: 0.95rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23563F25' d='M4 8l4-4H4z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  cursor: pointer;
}

.btn-reset {
  width: 100%;
  padding: 10px;
  background-color: #8A724A;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: background-color 0.2s;
}

.btn-reset:hover {
  background-color: #59411A;
}

.cubicles-section {
  flex: 1;
}

.cubicles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
}

.cubicle-card {
  background-color: #FFF8F3;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(57, 43, 27, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s, box-shadow 0.2s;
}

.cubicle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(57, 43, 27, 0.2);
}

.cubicle-card.occupied {
  opacity: 0.7;
}

.cubicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.cubicle-number {
  font-size: 1.2rem;
  font-weight: bold;
  color: #392B1B;
}

.status-badge {
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 500;
}

.badge-available {
  background-color: #8A724A;
  color: white;
}

.badge-occupied {
  background-color: #D59969;
  color: white;
}

.cubicle-info {
  margin-bottom: 15px;
  flex-grow: 1;
}

.cubicle-info p {
  margin: 5px 0;
  color: #563F25;
}

.btn-reserve {
  padding: 10px;
  background-color: #AC8362;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s;
  width: 100%;
}

.btn-reserve:hover:not(:disabled) {
  background-color: #8A724A;
}

.btn-reserve:disabled {
  background-color: #DCC8B9;
  cursor: not-allowed;
}

.no-cubicles {
  text-align: center;
  padding: 30px;
  background-color: #FFF8F3;
  border-radius: 8px;
  color: #563F25;
}
.back-button {
  margin-bottom: 25px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #563F25;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #FAF7F4;
  border: 1px solid #DCC8B9;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(57, 43, 27, 0.08);
}

.btn-back:hover {
  background-color: #EEE6E0;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(57, 43, 27, 0.15);
}

.btn-back:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(57, 43, 27, 0.15);
}

.btn-back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #FFF;
  border-radius: 50%;
  margin-right: 10px;
  color: #8A724A;
  box-shadow: 0 1px 3px rgba(138, 114, 74, 0.15);
}

.btn-back-text {
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

.btn-back-minimalista {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #563F25;
  font-weight: 500;
  font-size: 0.95rem;
  margin-bottom: 10px;
  margin-top: 20px;

  padding: 10px 16px;
  border-radius: 6px;
  background-color: #FAF7F4;
  border: 1px solid #DCC8B9;
  box-shadow: 0 2px 4px rgba(57, 43, 27, 0.08);
  transition: all 0.2s ease;
}

.btn-back-minimalista:hover {
  background-color: #EEE6E0;
  transform: translateY(-1px);
  box-shadow: 0 3px 6px rgba(57, 43, 27, 0.12);
}

.btn-back-minimalista i {
  margin-right: 8px;
  font-size: 1rem;
  color: #8A724A;
}


.back-button {
   margin-bottom: 25px;
 }

.btn-back {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #563F25;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #FAF7F4;
  border: 1px solid #DCC8B9;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(57, 43, 27, 0.08);
}

.btn-back:hover {
  background-color: #EEE6E0;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(57, 43, 27, 0.15);
}

.btn-back:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(57, 43, 27, 0.15);
}

.btn-back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #FFF;
  border-radius: 50%;
  margin-right: 10px;
  color: #8A724A;
  box-shadow: 0 1px 3px rgba(138, 114, 74, 0.15);
}

.btn-back-text {
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}.back-button {
   margin-bottom: 25px;
 }

.btn-back {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #563F25;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #FAF7F4;
  border: 1px solid #DCC8B9;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(57, 43, 27, 0.08);
}

.btn-back:hover {
  background-color: #EEE6E0;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(57, 43, 27, 0.15);
}

.btn-back:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(57, 43, 27, 0.15);
}

.btn-back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #FFF;
  border-radius: 50%;
  margin-right: 10px;
  color: #8A724A;
  box-shadow: 0 1px 3px rgba(138, 114, 74, 0.15);
}

.btn-back-text {
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}.back-button {
   margin-bottom: 25px;
 }

.btn-back {
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  color: #563F25;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 6px;
  background-color: #FAF7F4;
  border: 1px solid #DCC8B9;
  transition: all 0.25s ease;
  box-shadow: 0 2px 4px rgba(57, 43, 27, 0.08);
}

.btn-back:hover {
  background-color: #EEE6E0;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(57, 43, 27, 0.15);
}

.btn-back:active {
  transform: translateY(0);
  box-shadow: 0 1px 2px rgba(57, 43, 27, 0.15);
}

.btn-back-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background-color: #FFF;
  border-radius: 50%;
  margin-right: 10px;
  color: #8A724A;
  box-shadow: 0 1px 3px rgba(138, 114, 74, 0.15);
}

.btn-back-text {
  font-size: 0.95rem;
  letter-spacing: 0.3px;
}

@media (max-width: 768px) {
  .main-content {
    flex-direction: column;
  }

  .filters-panel {
    width: 100%;
    margin-bottom: 20px;
  }
}
</style>