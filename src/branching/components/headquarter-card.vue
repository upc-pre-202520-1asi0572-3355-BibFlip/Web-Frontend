<script>
import { ref, onMounted } from 'vue';
import { BranchingApiService } from "@/branching/services/branching-api.service.js";

export default {
  name: "headquarter-card",
  props: {
    headquarterData: {
      type: Object,
      default: () => ({})
    },
    headquarterId: {
      type: [String, Number],
      default: null
    }
  },
  setup(props) {
    const apiService = new BranchingApiService();
    const headquarter = ref(props.headquarterData || {});
    const loading = ref(!props.headquarterData && props.headquarterId);
    const error = ref(null);

    const fetchHeadquarterData = async () => {
      if (!props.headquarterId) return;

      try {
        const response = await apiService.getHeadquarterById(props.headquarterId);
        if (response && response.data) {
          headquarter.value = response.data;
        } else {
          error.value = 'No data available';
        }
      } catch (err) {
        error.value = 'Error loading data';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      if (!props.headquarterData && props.headquarterId) {
        fetchHeadquarterData();
      }
    });

    return {
      headquarter,
      loading,
      error
    };
  }
}
</script>

<template>
  <div class="headquarter-card">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else class="headquarter-content">
      <h3 class="headquarter-name">{{ headquarter.name }}</h3>
      <div class="headquarter-details">
        <p v-if="headquarter.streetAddress" class="address">
          <strong>Dirección:</strong> {{ headquarter.streetAddress }}
        </p>
        <p v-if="headquarter.landlinePhone" class="phone">
          <strong>Teléfono:</strong> {{ headquarter.landlinePhone }}
        </p>
        <p v-if="headquarter.mobilePhone" class="mobile">
          <strong>Celular:</strong> {{ headquarter.mobilePhone }}
        </p>
        <p v-if="headquarter.openingTime && headquarter.closingTime" class="hours">
          <strong>Horas:</strong> {{ headquarter.openingTime }} - {{ headquarter.closingTime }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.headquarter-card {
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  height: 100%;
  transition: transform 0.2s, box-shadow 0.2s;
}

.headquarter-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.headquarter-name {
  color: #392B1B;
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 1.25rem;
  border-bottom: 2px solid #DCC8B9;
  padding-bottom: 10px;
}

.headquarter-details p {
  margin: 5px 0;
  color: #555;
}

.loading, .error {
  padding: 15px;
  text-align: center;
  border-radius: 8px;
}

.loading {
  background-color: #f8f9fa;
  color: #6c757d;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}
</style>