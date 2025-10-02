<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { HeadquartersService } from '../services/headquarter.service';

const route = useRoute();
const router = useRouter();
const mapContainer = ref(null);
const map = ref(null);
const headquarter = ref(null);

const headquarterService = new HeadquartersService();
const headquarters = ref([]);
const loading = ref(true);
const error = ref(null);


onMounted(async () => {
  try {
    // Obtener el ID de la sede desde los parámetros de la ruta
    const headquarterId = route.params.id;

    if (!headquarterId) {
      error.value = 'ID de sede no proporcionado';
      loading.value = false;
      return;
    }

    // Cargar la sede específica
    const result = await headquarterService.getHeadquarterById(headquarterId);
    headquarter.value = result;

    // Inicializar el mapa después de cargar la sede
    setTimeout(() => {
      initializeMap();
    }, 100);

    loading.value = false;
  } catch (err) {
    error.value = 'Error al cargar la sede: ' + err.message;
    console.error(err);
    loading.value = false;
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});

const initializeMap = () => {
  if (!mapContainer.value || !headquarter.value) return;

  mapboxgl.accessToken = 'pk.eyJ1IjoiYmFyYmFyYTE1IiwiYSI6ImNtYms0M2VwNTBtZzYybXB6Znh5ZTBuNjgifQ.lwTbVmhNLHpdzMgmkWdvUw';

  const lng = headquarter.value.longitude;
  const lat = headquarter.value.latitude;

  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [lng, lat],
    zoom: 15
  });

  const popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h3>${headquarter.value.name}</h3><p>${headquarterService.getFullAddress(headquarter.value)}</p>`);

  new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .setPopup(popup)
      .addTo(map.value);

  map.value.addControl(new mapboxgl.NavigationControl());
  map.value.addControl(new mapboxgl.FullscreenControl());
};

const goBack = () => {
  router.back();
};
</script>

<template>
  <div class="map-page">
    <div class="map-header">
      <button class="back-button" @click="goBack">
        <i class="pi pi-arrow-left"></i> Volver
      </button>
      <h1 v-if="headquarter">{{ headquarter.name }}</h1>
    </div>

    <div v-if="loading" class="loading">
      <i class="pi pi-spin pi-spinner"></i> Cargando mapa...
    </div>

    <div v-else-if="error" class="error">
      {{ error }}
    </div>

    <div v-else ref="mapContainer" class="map-container"></div>

    <div v-if="headquarter" class="map-info">
      <div class="info-card">
        <h2>{{ headquarter.name }}</h2>
        <p><strong>Dirección:</strong> {{ headquarterService.getFullAddress(headquarter) }}</p>
        <div class="schedule">
          <h3>Horarios de atención</h3>
          <ul>
            <li>Lunes - Viernes: 9:00 am - 8:00 pm</li>
            <li>Sábado: 10:00 am - 6:00 pm</li>
            <li>Domingo: 10:00 am - 5:00 pm</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-page {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
}

.map-header {
  background-color: #FFF8F3;
  padding: 15px 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.back-button {
  background: #8A724A;
  color: white;
  border: none;
  border-radius: 20px;
  padding: 8px 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 20px;
}

.back-button:hover {
  background: #59411A;
}

.map-header h1 {
  margin: 0;
  font-size: 1.5rem;
  color: #392B1B;
}

.map-container {
  flex: 1;
  width: 100%;
}

.loading, .error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 300px;
  background-color: #f5f5f5;
  font-size: 1.2rem;
  color: #666;
}

.map-info {
  position: absolute;
  bottom: 20px;
  right: 20px;
  z-index: 1;
}

.info-card {
  background-color: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  max-width: 300px;
}

.info-card h2 {
  margin-top: 0;
  color: #392B1B;
  font-size: 1.3rem;
}

.info-card p {
  margin: 8px 0;
  color: #563F25;
}

.schedule h3 {
  font-size: 1.1rem;
  margin: 15px 0 8px;
  color: #392B1B;
}

.schedule ul {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #563F25;
}

.schedule li {
  margin-bottom: 4px;
}

@media (max-width: 768px) {
  .map-info {
    position: static;
    padding: 15px;
  }

  .info-card {
    max-width: none;
  }
}
</style>