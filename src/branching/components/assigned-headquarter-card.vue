<script>
import {HeadquarterEntity} from "@/branching/model/headquarter.entity.js";
import {BranchingApiService} from "@/branching/services/branching-api.service.js";
import {useAuthenticationStore} from "@/iam/services/authentication.store.js";

export default {
  name: "AssignedHeadquarterCard",
  props: {},
  data() {
    return {
      apiService: new BranchingApiService(),
      headquarter: new HeadquarterEntity(
          '',
          '',
          '',
          '',
          0,
          0,
          '',
          '',
          '',
          '',
          '',
          '',
          '',
          30
      ),
      loading: true,
      error: null,
      currentSupervisorId: null,
      retryCount: 0,
      maxRetries: 3
    }
  },
  methods: {
    async fetchHeadquarterBySupervisor() {
      try {
        this.loading = true;
        this.error = null;

        // Import and use the authentication store
        const authStore = useAuthenticationStore();
        const supervisorId = authStore.currentUserId;

        if (!supervisorId) {
          this.error = 'User authentication required';
          return;
        }

        this.currentSupervisorId = supervisorId;

        // Get supervisor data with headquarterId
        const supervisorResponse = await this.apiService.getHeadquarterBySupervisorId(this.currentSupervisorId);

        if (!supervisorResponse || !supervisorResponse.data) {
          this.error = 'No supervisor data available';
          return;
        }

        const supervisorData = supervisorResponse.data;

        if (!supervisorData.headquarterId) {
          this.error = 'No headquarter assigned to this supervisor';
          return;
        }

        // Now fetch the correct headquarter using the headquarterId from the response
        await this.fetchHeadquarter(supervisorData.headquarterId);

      } catch (error) {
        console.error('Error fetching headquarter:', error);

        if (error.response) {
          if (error.response.status === 404) {
            this.error = 'Supervisor or headquarter not found';
          } else if (error.response.status === 500) {
            this.error = 'Server error. Please try again later.';
          } else {
            this.error = `Error: ${error.response.status}`;
          }
        } else if (error.request) {
          this.error = 'Network error. Please check your connection.';
        } else {
          this.error = error.message || 'Failed to load data';
        }
      } finally {
        this.loading = false;
      }
    },

    async fetchHeadquarter(id) {
      try {
        this.loading = true;
        this.error = null;

        if (!id) {
          this.error = 'Invalid headquarter ID';
          return;
        }

        const response = await this.apiService.getHeadquarterById(id);

        if (!response || !response.data) {
          this.error = 'No headquarter data available';
          return;
        }

        const data = response.data;
        console.log('Headquarter data received:', data);

        // Extract address components if streetAddress exists
        let street = '', number = '', city = '', postalCode = '', country = '';

        if (data.streetAddress) {
          // Try to parse the combined address (this is a simple example)
          const addressParts = data.streetAddress.split(',').map(part => part.trim());

          if (addressParts.length >= 1) {
            // First part usually contains street and number
            const streetPart = addressParts[0];
            const match = streetPart.match(/^(.*?)(\d+)?$/);
            if (match) {
              street = match[1]?.trim() || '';
              number = match[2] || '';
            } else {
              street = streetPart;
            }
          }

          if (addressParts.length >= 2) city = addressParts[1];
          if (addressParts.length >= 3) postalCode = addressParts[2];
          if (addressParts.length >= 4) country = addressParts[3];
        }

        this.headquarter = new HeadquarterEntity(
            data.id || '',
            data.name || 'Unnamed Headquarter',
            data.landlinePhone || 'No landline',
            data.mobilePhone || 'No mobile',
            parseFloat(data.latitude) || 0,
            parseFloat(data.longitude) || 0,
            street,
            number,
            city,
            postalCode,
            country,
            data.openingTime || 'N/A',
            data.closingTime || 'N/A',
            parseInt(data.intervalMinutes) || 30
        );

        console.log('Headquarter entity created:', this.headquarter);
      } catch (error) {
        console.error('Error fetching headquarter:', error);

        if (error.response?.status === 404) {
          this.error = `Headquarter with ID ${id} not found`;
        } else {
          this.error = 'Failed to load headquarter data';
        }
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.fetchHeadquarterBySupervisor();
  }
}
</script>

<template>
  <div class="headquarter-card" v-if="!loading && !error">
    <div class="card-header">
      <h2>{{ headquarter.name || 'Headquarter' }}</h2>
    </div>

    <div class="card-content">
      <div class="info-section">
        <div class="info-item">
          <i class="pi pi-map-marker"></i>
          <span>{{ headquarter.street }} {{ headquarter.number }}, {{ headquarter.city }}, {{ headquarter.postalCode }}, {{ headquarter.country }}</span>
        </div>
        <div class="info-item">
          <i class="pi pi-phone"></i>
          <span>{{ headquarter.landlinePhone || 'No landline phone' }}</span>
        </div>
        <div class="info-item">
          <i class="pi pi-mobile"></i>
          <span>{{ headquarter.mobilePhone || 'No mobile phone' }}</span>
        </div>
        <div class="info-item">
          <i class="pi pi-clock"></i>
          <span>{{ headquarter.openingTime || 'N/A' }} - {{ headquarter.closingTime || 'N/A' }}</span>
        </div>
      </div>
    </div>
  </div>
  <div v-else-if="loading" class="loading">
    Loading headquarter information...
  </div>
  <div v-else-if="error" class="error">
    {{ error }}
  </div>
</template>

<style scoped>
.headquarter-card {
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
}

.card-header {
  padding: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.card-header h2 {
  margin: 0;
  color: #392B1B;
  font-size: 1.5rem;
}

.card-content {
  padding: 20px;
  color: #392B1B;
  display: flex;
  justify-content: center;
}

.info-section {
  margin-bottom: 20px;
  max-width: 400px;
  width: 100%;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 10px;
  justify-content: flex-start;
}

span {
  padding: 0.5rem;
}

.info-item i {
  width: 20px;
  margin-right: 12px;
  color: #59411A;
  font-size: 1rem;
}

.loading, .error {
  padding: 20px;
  text-align: center;
  background-color: #DCC8B9;
  border-radius: 8px;
  color: #392B1B;
  max-width: 500px;
  margin: 0 auto;
}

.error {
  color: #721c24;
  background-color: #f8d7da;
}
</style>