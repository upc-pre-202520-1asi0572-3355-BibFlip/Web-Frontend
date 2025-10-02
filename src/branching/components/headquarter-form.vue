<script>
import { BranchingApiService } from '@/branching/services/branching-api.service.js';
import { HeadquarterEntity } from '@/branching/model/headquarter.entity.js';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export default {
  name: 'SedeForm',
  data() {
    return {
      map: null,
      marker: null,
      form: {
        name: '',
        landlinePhone: '',
        mobilePhone: '',
        latitude: null,
        longitude: null,
        street: '',
        number: '',
        city: '',
        postalCode: '',
        country: '',
        openingTime: '',
        closingTime: '',
        intervalMinutes: ''
      },
      errors: {}
    };
  },
  computed: {
    isFormValid() {
      const requiredFields = ['name', 'street', 'number', 'city', 'postalCode', 'country', 'openingTime', 'closingTime', 'intervalMinutes'];
      const hasRequiredFields = requiredFields.every(field => this.form[field]);
      const hasCoordinates = this.form.latitude !== null && this.form.longitude !== null;
      const hasNoErrors = Object.keys(this.errors).length === 0;

      return hasRequiredFields && hasCoordinates && hasNoErrors;
    }
  },
  mounted() {
    this.initializeMap();
    // Handle window resize to maintain map dimensions
    window.addEventListener('resize', () => {
      if (this.map) {
        setTimeout(() => this.map.resize(), 100);
      }
    });
  },
  beforeUnmount() {
    if (this.map) {
      this.map.remove();
    }
  },
  methods: {
    async createAndFetchHeadquarter() {
      const apiService = new BranchingApiService();

      try {
        const createdHeadquarter = await apiService.createHeadquarter(this.form);
        const fetchedHeadquarter = await apiService.getHeadquarterById(createdHeadquarter.data.id);
        const headquarterEntity = new HeadquarterEntity(
            fetchedHeadquarter.data.id,
            fetchedHeadquarter.data.name,
            fetchedHeadquarter.data.landlinePhone,
            fetchedHeadquarter.data.mobilePhone,
            fetchedHeadquarter.data.latitude,
            fetchedHeadquarter.data.longitude,
            fetchedHeadquarter.data.street,
            fetchedHeadquarter.data.number,
            fetchedHeadquarter.data.city,
            fetchedHeadquarter.data.postalCode,
            fetchedHeadquarter.data.country,
            fetchedHeadquarter.data.openingTime,
            fetchedHeadquarter.data.closingTime,
            fetchedHeadquarter.data.intervalMinutes
        );

        this.$emit('headquarter-created', headquarterEntity);
        console.log('Headquarter created and fetched:', headquarterEntity);

        // Redirect to headquarter-management page
        this.$router.push('/dashboard-admin');
      } catch (error) {
        if (error.response && error.response.status === 409) {
          console.error('Conflict error:', error.response.data.message);
          alert('Error: The headquarter already exists or conflicts with existing data.');
        } else {
          console.error('Error creating or fetching headquarter:', error);
          alert('An unexpected error occurred. Please try again.');
        }
      }
    },
    initializeMap() {
      mapboxgl.accessToken = 'pk.eyJ1IjoiYmFyYmFyYTE1IiwiYSI6ImNtYms0M2VwNTBtZzYybXB6Znh5ZTBuNjgifQ.lwTbVmhNLHpdzMgmkWdvUw';
      this.map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v12',
        center: [-77.0428, -12.0464],
        zoom: 12,
        attributionControl: false
      });
      this.map.on('load', () => {
        this.map.resize();
        this.map.on('click', (e) => {
          const { lng, lat } = e.lngLat;
          this.updateCoordinates(lng, lat);
        });
      });
    },
    updateCoordinates(lng, lat) {
      // Store coordinates with proper precision
      this.form.longitude = Number(lng.toFixed(6));
      this.form.latitude = Number(lat.toFixed(6));

      // Remove existing marker if present
      if (this.marker) {
        this.marker.remove();
      }

      // Create a new marker with proper configuration
      this.marker = new mapboxgl.Marker({
        color: '#FF0000',
        draggable: false
      })
        .setLngLat([lng, lat])
        .addTo(this.map);
    },
    validateName() {
      const numberRegex = /\d/;
      if (!this.form.name) {
        this.errors.name = 'El nombre es requerido';
      } else if (numberRegex.test(this.form.name)) {
        this.errors.name = 'El nombre no puede contener números';
      } else {
        delete this.errors.name;
      }
    },
    validateLandlinePhone() {
      const numberRegex = /^\d+$/;
      if (this.form.landlinePhone) {
        if (!numberRegex.test(this.form.landlinePhone)) {
          this.errors.landlinePhone = 'Solo se permiten números';
        } else if (this.form.landlinePhone.length > 7) {
          this.errors.landlinePhone = 'Máximo 7 números';
        } else {
          delete this.errors.landlinePhone;
        }
      } else {
        delete this.errors.landlinePhone;
      }
    },
    validateMobilePhone() {
      const numberRegex = /^\d+$/;
      if (this.form.mobilePhone) {
        if (!numberRegex.test(this.form.mobilePhone)) {
          this.errors.mobilePhone = 'Solo se permiten números';
        } else if (this.form.mobilePhone.length > 9) {
          this.errors.mobilePhone = 'Máximo 9 números';
        } else {
          delete this.errors.mobilePhone;
        }
      } else {
        delete this.errors.mobilePhone;
      }
    },
    validateStreet() {
      const letterRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!this.form.street) {
        this.errors.street = 'La calle es requerida';
      } else if (!letterRegex.test(this.form.street)) {
        this.errors.street = 'Solo se permiten letras';
      } else {
        delete this.errors.street;
      }
    },
    validateNumber() {
      const numberRegex = /^\d+$/;
      if (!this.form.number) {
        this.errors.number = 'El número es requerido';
      } else if (!numberRegex.test(this.form.number)) {
        this.errors.number = 'Solo se permiten números';
      } else {
        delete this.errors.number;
      }
    },
    validateCity() {
      const letterRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!this.form.city) {
        this.errors.city = 'La ciudad es requerida';
      } else if (!letterRegex.test(this.form.city)) {
        this.errors.city = 'Solo se permiten letras';
      } else {
        delete this.errors.city;
      }
    },
    validatePostalCode() {
      const numberRegex = /^\d{4}$/;
      if (!this.form.postalCode) {
        this.errors.postalCode = 'El código postal es requerido';
      } else if (!numberRegex.test(this.form.postalCode)) {
        this.errors.postalCode = 'Debe contener exactamente 4 números';
      } else {
        delete this.errors.postalCode;
      }
    },
    validateCountry() {
      const letterRegex = /^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/;
      if (!this.form.country) {
        this.errors.country = 'El país es requerido';
      } else if (!letterRegex.test(this.form.country)) {
        this.errors.country = 'Solo se permiten letras';
      } else {
        delete this.errors.country;
      }
    },
    validateIntervalMinutes() {
      const numberRegex = /^\d+$/;
      if (!this.form.intervalMinutes) {
        this.errors.intervalMinutes = 'El intervalo es requerido';
      } else if (!numberRegex.test(this.form.intervalMinutes)) {
        this.errors.intervalMinutes = 'Solo se permiten números';
      } else if (parseInt(this.form.intervalMinutes) < 1) {
        this.errors.intervalMinutes = 'El intervalo debe ser mayor a 0';
      } else {
        delete this.errors.intervalMinutes;
      }
    },
    resetForm() {
      this.form = {
        name: '',
        landlinePhone: '',
        mobilePhone: '',
        latitude: null,
        longitude: null,
        street: '',
        number: '',
        city: '',
        postalCode: '',
        country: '',
        openingTime: '',
        closingTime: '',
        intervalMinutes: ''
      };
      this.errors = {};

      if (this.marker) {
        this.marker.remove();
        this.marker = null;
      }
    }
  }
};
</script>

<template>
  <div class="sede-form-container">
    <div class="form-header">
      <h2>Crear Nueva Sede</h2>
    </div>

    <form @submit.prevent="createAndFetchHeadquarter" class="sede-form">
      <!-- Información Básica -->
      <div class="form-section">
        <h3>Información Básica</h3>
        <div class="form-group">
          <label for="name">Nombre de la Sede *</label>
          <input
              id="name"
              v-model="form.name"
              type="text"
              placeholder="Ingrese el nombre de la sede"
              :class="{ 'error': errors.name }"
              @input="validateName"
          />
          <span v-if="errors.name" class="error-message">{{ errors.name }}</span>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="landlinePhone">Teléfono Fijo</label>
            <input
                id="landlinePhone"
                v-model="form.landlinePhone"
                type="text"
                placeholder="Ej: 4567890"
                maxlength="7"
                :class="{ 'error': errors.landlinePhone }"
                @input="validateLandlinePhone"
            />
            <span v-if="errors.landlinePhone" class="error-message">{{ errors.landlinePhone }}</span>
          </div>
          <div class="form-group">
            <label for="mobilePhone">Teléfono Móvil</label>
            <input
                id="mobilePhone"
                v-model="form.mobilePhone"
                type="text"
                placeholder="Ej: 987654321"
                maxlength="9"
                :class="{ 'error': errors.mobilePhone }"
                @input="validateMobilePhone"
            />
            <span v-if="errors.mobilePhone" class="error-message">{{ errors.mobilePhone }}</span>
          </div>
        </div>
      </div>

      <!-- Ubicación -->
      <div class="form-section">
        <h3>Ubicación</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="street">Calle *</label>
            <input
                id="street"
                v-model="form.street"
                type="text"
                placeholder="Ingrese solo números"
                :class="{ 'error': errors.street }"
                @input="validateStreet"
            />
            <span v-if="errors.street" class="error-message">{{ errors.street }}</span>
          </div>
          <div class="form-group">
            <label for="number">Número *</label>
            <input
                id="number"
                v-model="form.number"
                type="text"
                placeholder="Ingrese solo letras"
                :class="{ 'error': errors.number }"
                @input="validateNumber"
            />
            <span v-if="errors.number" class="error-message">{{ errors.number }}</span>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label for="city">Ciudad *</label>
            <input
                id="city"
                v-model="form.city"
                type="text"
                placeholder="Ingrese la ciudad"
                :class="{ 'error': errors.city }"
                @input="validateCity"
            />
            <span v-if="errors.city" class="error-message">{{ errors.city }}</span>
          </div>
          <div class="form-group">
            <label for="postalCode">Código Postal *</label>
            <input
                id="postalCode"
                v-model="form.postalCode"
                type="text"
                placeholder="Ej: 1234"
                maxlength="4"
                :class="{ 'error': errors.postalCode }"
                @input="validatePostalCode"
            />
            <span v-if="errors.postalCode" class="error-message">{{ errors.postalCode }}</span>
          </div>
        </div>
        <div class="form-group">
          <label for="country">País *</label>
          <input
              id="country"
              v-model="form.country"
              type="text"
              placeholder="Ingrese el país"
              :class="{ 'error': errors.country }"
              @input="validateCountry"
          />
          <span v-if="errors.country" class="error-message">{{ errors.country }}</span>
        </div>
      </div>

      <!-- Coordenadas y Mapa -->
      <div class="form-section">
        <h3>Coordenadas</h3>
        <div class="coordinates-info">
          <div class="coordinate-item">
            <strong>Latitud:</strong> {{ form.latitude || 'No seleccionada' }}
          </div>
          <div class="coordinate-item">
            <strong>Longitud:</strong> {{ form.longitude || 'No seleccionada' }}
          </div>
        </div>
        <div class="map-container">
          <div id="map" class="map"></div>
          <p class="map-instruction">Haz clic en el mapa para seleccionar la ubicación de la sede</p>
        </div>
      </div>

      <!-- Horarios -->
      <div class="form-section">
        <h3>Horarios de Atención</h3>
        <div class="form-row">
          <div class="form-group">
            <label for="openingTime">Hora de Apertura *</label>
            <input
              id="openingTime"
              v-model="form.openingTime"
              type="time"
              class="form-control"
              :class="{ 'error': errors.openingTime }"
            />
            <span v-if="errors.openingTime" class="error-message">{{ errors.openingTime }}</span>
          </div>

          <div class="form-group">
            <label for="closingTime">Hora de Cierre *</label>
            <input
              id="closingTime"
              v-model="form.closingTime"
              type="time"
              class="form-control"
              :class="{ 'error': errors.closingTime }"
            />
            <span v-if="errors.closingTime" class="error-message">{{ errors.closingTime }}</span>
          </div>
        </div>
        <div class="form-group">
          <label for="intervalMinutes">Intervalo de Citas (minutos) *</label>
          <input
              id="intervalMinutes"
              v-model="form.intervalMinutes"
              type="number"
              min="1"
              placeholder="Ej: 30"
              class="form-control"
              :class="{ 'error': errors.intervalMinutes }"
              @input="validateIntervalMinutes"
          />
          <span v-if="errors.intervalMinutes" class="error-message">{{ errors.intervalMinutes }}</span>
        </div>
      </div>

      <!-- Botones -->
      <div class="form-actions">
        <button type="button" @click="resetForm" class="btn-secondary">
          Limpiar Formulario
        </button>
        <button type="submit" class="btn-primary" :disabled="!isFormValid">
          Crear Sede
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.sede-form-container {
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
  padding: 1.5rem;
  background-color: var(--background-color);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.form-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.form-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
}

.sede-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-section {
  background: var(--background-color-light);
  border: 1px solid var(--primaryColor200);
  border-radius: 12px;
  padding: 1.5rem;
}

.form-section h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 1rem;
}

.form-row {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.form-group {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0.5rem;
}

.form-group input {
  padding: 0.75rem 1rem;
  border: 1px solid var(--primaryColor200);
  border-radius: 8px;
  background: var(--surface-color);
  color: var(--text-primary);
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.form-group input:focus {
  outline: none;
  border-color: var(--primaryColor500);
  box-shadow: 0 0 0 3px rgba(172, 131, 98, 0.1);
}

.form-group input.error {
  border-color: #f44336;
  background-color: rgba(244, 67, 54, 0.05);
}

.error-message {
  font-size: 0.75rem;
  color: #f44336;
  margin-top: 0.375rem;
}
.mapboxgl-marker {
  z-index: 10;
  pointer-events: auto;
}
.coordinates-info {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.coordinate-item {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.map-container {
  position: relative;
  height: 300px;
  border: 1px solid var(--primaryColor200);
  border-radius: 8px;
  overflow: hidden;
}

.map {
  width: 100%;
  height: 100%;
}

.map-instruction {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-top: 0.5rem;
  text-align: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

.btn-primary,
.btn-secondary {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-primary {
  background: var(--primaryColor500);
  color: white;
  border: none;
}

.btn-primary:hover:not(:disabled) {
  background: var(--primaryColor400);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-secondary {
  background: transparent;
  border: 1px solid var(--primaryColor300);
  color: var(--text-primary);
}

.btn-secondary:hover {
  background: rgba(172, 131, 98, 0.1);
}

@media (max-width: 768px) {
  .sede-form-container {
    padding: 1rem;
  }

  .form-row {
    flex-direction: column;
    gap: 1rem;
  }

  .coordinates-info {
    flex-direction: column;
  }

  .form-actions {
    flex-direction: column;
    gap: 0.5rem;
  }

  .map {
    height: 200px;
  }
}
</style>