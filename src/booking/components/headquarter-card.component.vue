<!-- src/booking/components/headquarter-card.component.vue -->
<script setup>
import { ref, onUnmounted } from 'vue';
import { HeadquartersService } from '../services/headquarter.service';
import { useRouter } from 'vue-router';

const props = defineProps({
  headquarter: {
    type: Object,
    required: true
  }
});

const headquarterService = new HeadquartersService();
const router = useRouter();
const showMap = ref(false);
const mapContainer = ref(null);
const map = ref(null);

const navigateToCubicles = () => {
  router.push(`/headquarters/${props.headquarter.id}/cubicles`);
};

const navigateToMap = () => {
  router.push(`/headquarters/${props.headquarter.id}/map`);
};

const toggleMap = () => {
  showMap.value = !showMap.value;
  if (showMap.value) {
    // Inicializa el mapa cuando se muestra
    setTimeout(initializeMap, 100);
  }
};

const getFullAddress = () => {
  return headquarterService.getFullAddress(props.headquarter);
};

const getSchedule = () => {
  return headquarterService.getScheduleString(props.headquarter);
};

const initializeMap = () => {
  if (!mapContainer.value || map.value) return;

  // Reemplaza con tu token de Mapbox
  mapboxgl.accessToken = 'pk.eyJ1IjoiYmFyYmFyYTE1IiwiYSI6ImNtYms0M2VwNTBtZzYybXB6Znh5ZTBuNjgifQ.lwTbVmhNLHpdzMgmkWdvUw';

  // Coordenadas de la sede (debes asegurarte que existan en el objeto headquarter)
  const lng = props.headquarter.longitude || -74.0721;
  const lat = props.headquarter.latitude || 4.7110;

  map.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [lng, lat],
    zoom: 15
  });

  // Añadir marcador
  new mapboxgl.Marker()
      .setLngLat([lng, lat])
      .addTo(map.value);

  // Añadir controles de navegación
  map.value.addControl(new mapboxgl.NavigationControl());
};

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
  }
});
</script>

<template>
  <div class="headquarter-card">
    <div class="card-image">
      <img src="@/assets/images/sede%20imagen.png" alt="headquarter" />
    </div>
    <div class="card-content">
      <h3 class="card-title">{{ headquarter.name }}</h3>
      <div class="card-info">
        <p class="address"><strong>Dirección:</strong> {{ getFullAddress() }}</p>
        <div class="schedule">
          <p class="schedule-title"><strong>Horario:</strong></p>
          <ul class="schedule-list">
            <li>Lunes - Viernes: 9:00 am - 8 pm</li>
            <li>Sábado: 10:00 am - 6 pm</li>
            <li>Domingo: 10:00 am - 5 pm</li>
          </ul>
        </div>
      </div>

      <!-- Mapa integrado (opcional) -->
      <div v-if="showMap" class="map-container-wrapper">
        <div ref="mapContainer" class="map-container"></div>
      </div>

      <div class="card-actions">
        <button class="btn btn-cubicles" @click="navigateToCubicles">
          <i class="pi pi-list"></i> Ver cubiculos
        </button>
        <button class="btn btn-map" @click="navigateToMap">
          <i class="pi pi-map-marker"></i> Ver en Mapa
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.map-container-wrapper {
  margin-top: 20px;
  width: 100%;
  height: 300px;
  border-radius: 8px;
  overflow: hidden;
  transition: height 0.3s ease;
  margin-bottom: 20px;
}

.map-container {
  width: 100%;
  height: 100%;
}

@media (max-width: 768px) {

  .map-container-wrapper {
    height: 250px;
  }
}
.headquarter-card {
  display: flex;
  flex-direction: row;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 40px;
  background-color: #FFF8F3;
  box-shadow: 0 2px 8px rgba(57, 43, 27, 0.1);
}

.card-image {
  width: 300px;
  height:300px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}
.headquarter-card:hover .card-image img {
  transform: scale(1.05);
}
.card-content {
  flex: 1;
  padding: 25px;
}

.card-title {
  font-size: 1.5rem;
  margin-top: 0;
  margin-bottom: 15px;
  color: #392B1B;
  font-weight: 600;
}

.card-info {
  margin-bottom: 20px;
}

.address {
  margin: 0 0 10px 0;
  color: #563F25;
}

.schedule-title {
  margin: 0 0 5px 0;
  color: #563F25;
}

.schedule-list {
  list-style: none;
  padding: 0;
  margin: 0;
  color: #563F25;
}

.schedule-list li {
  margin-bottom: 3px;
}

.card-actions {
  display: flex;
  gap: 15px;
  margin-top: 20px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-weight: 500;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #FFF8F3;
  transition: background-color 0.2s;
}

.btn-cubicles {
  background-color: #8A724A;
}

.btn-map {
  background-color: #8A724A;
}

.btn:hover {
  background-color: #59411A;
}

.btn-icon {
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .headquarter-card {
    flex-direction: column;
  }

  .card-image {
    width: 100%;
    height: 150px;
  }
}
</style>
