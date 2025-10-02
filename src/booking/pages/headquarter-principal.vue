<script setup>
import { ref, onMounted } from 'vue';
import { HeadquartersService } from '../services/headquarter.service';
import HeadquarterCard from '../components/headquarter-card.component.vue';

const headquarters = ref([]);
const loading = ref(true);
const error = ref(null);
const headquartersService = new HeadquartersService();

onMounted(async () => {
  try {
    const response = await headquartersService.getAllHeadquarters();
    headquarters.value = response;
    loading.value = false;
  } catch (err) {
    error.value = 'Error al cargar las sedes: ' + err.message;
    loading.value = false;
  }
});
</script>

<template>
  <div class="headquarters-page">
    <div class="page-header">
      <h1>Conoce nuestras sedes y reserva!</h1>
    </div>

    <div class="loading" v-if="loading">
      <p>Cargando sedes...</p>
    </div>

    <div class="error-message" v-else-if="error">
      <p>{{ error }}</p>
    </div>

    <div class="headquarters-list" v-else>
      <div v-if="headquarters.length === 0" class="no-results">
        <p>No se encontraron sedes disponibles.</p>
      </div>

      <div v-else class="headquarters-container">
        <headquarter-card
            v-for="headquarter in headquarters"
            :key="headquarter.id"
            :headquarter="headquarter"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-header {
  text-align: center;
}

.loading, .error-message, .no-results {
  text-align: center;
  padding: 50px;
  color: #563F25;
  background-color: #FFF8F3;
  border-radius: 8px;
  margin: 30px 0;
}

.error-message {
  color: #D59969;
  background-color: #FFF2E9;
}

.headquarters-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 10px 0 30px;
}

@media (max-width: 768px) {
  .headquarters-page {
    padding: 10px;
  }

  .page-header {
    margin: 20px 0;
  }

  h1 {
    font-size: 1.5rem;
  }
}
</style>
