<script>
import { ref, onMounted } from 'vue';
import HeadquarterCard from './headquarter-card.vue';
import { BranchingApiService } from '@/branching/services/branching-api.service.js';

export default {
  name: "headquarter-card-list",
  components: {
    HeadquarterCard
  },
  setup() {
    const apiService = new BranchingApiService();
    const headquarters = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchHeadquarters = async () => {
      try {
        loading.value = true;
        const response = await apiService.getAllHeadquarters();

        if (response && response.data) {
          headquarters.value = response.data;
        } else {
          error.value = 'No headquarters available';
        }
      } catch (err) {
        error.value = 'Error loading headquarters';
        console.error('Error fetching headquarters:', err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchHeadquarters();
    });

    return {
      headquarters,
      loading,
      error
    };
  }
}
</script>

<template>
  <div class="headquarter-list-container">
    <h2 class="headquarter-list-title">Headquarters</h2>

    <div v-if="loading" class="loading-container">
      <div class="loading">Loading headquarters...</div>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error">{{ error }}</div>
    </div>

    <div v-else-if="headquarters.length === 0" class="empty-container">
      <div class="empty-message">No headquarters found</div>
    </div>

    <div v-else class="headquarter-grid">
      <div v-for="hq in headquarters" :key="hq.id" class="headquarter-item">
        <headquarter-card :headquarter-data="hq" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.headquarter-list-container {
  padding: 20px;
}

.headquarter-list-title {
  color: #392B1B;
  margin-bottom: 20px;
  font-size: 1.75rem;
  text-align: center;
}

.headquarter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.headquarter-item {
  min-height: 200px;
}

.loading-container, .error-container, .empty-container {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.loading, .error, .empty-message {
  padding: 15px 30px;
  border-radius: 8px;
  text-align: center;
}

.loading {
  background-color: #f8f9fa;
  color: #6c757d;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

.empty-message {
  background-color: #e2e3e5;
  color: #383d41;
}
</style>