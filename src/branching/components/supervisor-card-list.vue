<script>
import { onMounted, ref } from 'vue';
import http from "@/shared/services/http-common.js";
import SupervisorCard from './supervisor-card.vue';
import {BranchingApiService} from "@/branching/services/branching-api.service.js";

export default {
  name: "supervisor-card-list",
  components: {
    SupervisorCard
  },
  setup() {
    const supervisors = ref([]);
    const loading = ref(true);
    const error = ref(null);

    const fetchSupervisors = async () => {
      try {
        loading.value = true;
        const branchingService = new BranchingApiService();

        // Fetch all users
        const userResponse = await branchingService.getAllUsers();

        if (userResponse.data) {
          // Filter users with ROLE_SUPERVISOR directly
          supervisors.value = userResponse.data.filter(user =>
            user.roles && user.roles.includes("ROLE_SUPERVISOR"));

          if (supervisors.value.length === 0) {
            console.log("No supervisors found in data:", userResponse.data);
          }
        } else {
          error.value = 'No data available';
        }
      } catch (err) {
        error.value = 'Error loading supervisors';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      fetchSupervisors();
    });

    return {
      supervisors,
      loading,
      error
    };
  }
}
</script>

<template>
  <div class="supervisor-list-container">
    <h2 class="list-title">Supervisores</h2>
    <div v-if="loading" class="loading">Cargando supervisores...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="supervisors.length === 0" class="empty-list">
      No hay supervisores disponibles
    </div>
    <div v-else class="supervisor-grid">
      <SupervisorCard
        v-for="supervisor in supervisors"
        :key="supervisor.id"
        :supervisor-data="supervisor"
      />
    </div>
  </div>
</template>

<style scoped>
.supervisor-list-container {
  width: 100%;
  margin-bottom: 20px;
}

.list-title {
  color: #392B1B;
  margin-bottom: 20px;
  font-size: 1.5rem;
  text-align: left;
  border-bottom: 2px solid #DCC8B9;
  padding-bottom: 10px;
}

.supervisor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.loading, .error, .empty-list {
  padding: 15px;
  text-align: center;
  border-radius: 8px;
  margin: 20px 0;
}

.loading {
  background-color: #f8f9fa;
  color: #6c757d;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
}

.empty-list {
  background-color: #fff3cd;
  color: #856404;
}
</style>