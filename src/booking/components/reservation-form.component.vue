<script setup>
import {ref, computed, onMounted, watch} from 'vue';
import {BookingService} from '../services/booking.service.js';
import {CubiclesService} from "../services/cubicles.service.js";
import {useAuthenticationStore} from "@/iam/services/authentication.store.js"; // Importar el store

const props = defineProps({
  tableInfo: {
    type: Object,
    required: true
  },
  visible: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['close', 'success']);

const bookingService = new BookingService();
const cubiclesService = new CubiclesService();
const timeSlots = ref([]);
const selectedSlotIds = ref([]);
const customerName = ref('');
const customerPhone = ref('');
const customerEmail = ref('');
const loading = ref(false);
const loadingSlots = ref(false);
const error = ref(null);
const success = ref(false);
const authStore = useAuthenticationStore();

const formattedDate = ref(new Date().toISOString().split('T')[0]);

const cubicleName = computed(() => {
  return `Cubiculo ${props.tableInfo?.cubicleNumber || ''}`;
});

const loadTimeSlots = async () => {
  if (!props.tableInfo?.cubicleId || !formattedDate.value) return;

  loadingSlots.value = true;
  error.value = null;
  // No limpiamos selectedSlotIds para mantener selecciones si es el mismo día

  try {
    const response = await cubiclesService.getCubicleSchedule(props.tableInfo.cubicleId, formattedDate.value);

    if (response && response.data) {
      const newSlots = response.data.map(slot => ({
        id: slot.id,
        label: `${slot.startTime}`,
        available: slot.status.toLowerCase() === 'available'
      }));

      timeSlots.value = newSlots;

      // Filtramos selectedSlotIds para mantener solo los que siguen disponibles
      selectedSlotIds.value = selectedSlotIds.value.filter(id =>
          newSlots.some(slot => slot.id === id && slot.available)
      );
    } else {
      timeSlots.value = [];
      selectedSlotIds.value = [];
    }
  } catch (err) {
    console.error("Error al cargar los horarios:", err);
    error.value = "No se pudieron cargar los horarios disponibles. Por favor, inténtelo de nuevo.";
    timeSlots.value = [];
    selectedSlotIds.value = [];
  } finally {
    loadingSlots.value = false;
  }
};

// Actualización automática de horarios cada 30 segundos
let refreshInterval;
const startAutoRefresh = () => {
  refreshInterval = setInterval(() => {
    if (props.visible && !success.value) {
      loadTimeSlots();
    }
  }, 30000);
};

const stopAutoRefresh = () => {
  clearInterval(refreshInterval);
};

const handleDateChange = () => {
  selectedSlotId.value = null;
  loadTimeSlots();
};

const toggleTimeSlot = (slotId) => {
  const index = selectedSlotIds.value.indexOf(slotId);
  if (index === -1) {
    selectedSlotIds.value.push(slotId);
  } else {
    selectedSlotIds.value.splice(index, 1);
  }
};

const selectTimeSlot = (slotId) => {
  selectedSlotId.value = slotId;
};

const validateForm = () => {
  if (selectedSlotIds.value.length === 0) {
    error.value = "Por favor seleccione al menos un horario para su reserva.";
    return false;
  }

  return true;
};

const submitReservation = async () => {
  if (!validateForm()) return;

  loading.value = true;
  error.value = null;

  try {
    const reservationData = {
      clientId: authStore.currentUserId, // Usar el ID del usuario autenticado
      cubicleId: props.tableInfo.cubicleId,
      bookingDate: formattedDate.value,
      slotIds: selectedSlotIds.value // Enviamos todos los slots seleccionados
    };

    const response = await bookingService.create(reservationData);

    success.value = true;
    emit('success', reservationData);
  } catch (err) {
    console.error('Error al crear la reserva:', err);
    error.value = 'No se pudo completar la reserva. Por favor, inténtelo de nuevo.';
  } finally {
    loading.value = false;
  }
};

const closeModal = () => {
  if (!loading.value) {
    emit('close');
    stopAutoRefresh();
    setTimeout(() => {
      success.value = false;
      error.value = null;
      selectedSlotIds.value = [];
    }, 300);
  }
};

onMounted(() => {
  loadTimeSlots();
  startAutoRefresh();
});

// Vigilar cambios en la fecha y visibilidad
watch(formattedDate, handleDateChange);
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    loadTimeSlots();
    startAutoRefresh();
  } else {
    stopAutoRefresh();
  }
});

// Limpiar intervalo al desmontar
onMounted(() => {
  return () => {
    stopAutoRefresh();
  };
});
</script>

<template>
  <div class="modal-overlay" v-if="visible" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <h2>{{ success ? 'Reserva Exitosa' : 'Reservar Cubiculo' }}</h2>
        <button class="close-button" @click="closeModal">&times;</button>
      </div>

      <div v-if="success" class="success-message">
        <i class="pi pi-check-circle"></i>
        <h3>¡Reserva confirmada!</h3>
        <div class="detail-item">
          <div class="detail-icon">
            <i class="pi pi-cubicle"></i>
          </div>
          <div class="detail-text">
            <span class="detail-label">Cubiculo:</span>
            <span class="detail-value">{{ cubicleName }}</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <i class="pi pi-users"></i>
          </div>
          <div class="detail-text">
            <span class="detail-label">Capacidad:</span>
            <span class="detail-value">{{ props.tableInfo?.seats }} personas</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <i class="pi pi-calendar"></i>
          </div>
          <div class="detail-text">
            <span class="detail-label">Fecha:</span>
            <span class="detail-value">{{ formattedDate }}</span>
          </div>
        </div>

        <div class="detail-item">
          <div class="detail-icon">
            <i class="pi pi-clock"></i>
          </div>
          <div class="detail-text">
            <span class="detail-label">Horarios:</span>
            <span class="detail-value">
        {{ selectedSlotIds.map(id => timeSlots.find(slot => slot.id === id)?.label).join(', ') }}
      </span>
          </div>
        </div>

        <button class="btn-success" @click="closeModal">
          Aceptar
        </button>
      </div>

      <div v-else class="compact-form">
        <div class="form-row">
          <div class="form-group">
            <label><strong>Cubiculo:</strong> {{ cubicleName }}</label>
          </div>

          <div class="form-group">
            <label><strong>Capacidad:</strong> {{ props.tableInfo?.seats }} personas</label>
          </div>
        </div>

        <div class="form-date">
          <div class="form-group">
            <label for="date">Fecha:</label>
            <input
                type="date"
                id="date"
                v-model="formattedDate"
                :min="new Date().toISOString().split('T')[0]"
                class="date-picker"
            />
          </div>
        </div>

        <div class="form-group slots-section">
          <label>Horarios disponibles:</label>

          <div v-if="loadingSlots" class="loading-slots">
            <i class="pi pi-spin pi-spinner"></i> Cargando horarios...
          </div>

          <div v-else-if="timeSlots.length === 0 && !error" class="no-slots-message">
            <i class="pi pi-calendar-times"></i> No hay horarios disponibles
          </div>

          <div v-else class="time-slots-container">
            <div
                v-for="slot in timeSlots"
                :key="slot.id"
                :class="{
            'time-slot': true,
            'slot-available': slot.available && !selectedSlotIds.includes(slot.id),
            'slot-unavailable': !slot.available,
            'selected': selectedSlotIds.includes(slot.id),
          }"
                @click="slot.available && toggleTimeSlot(slot.id)"
            >
              <span class="slot-time">{{ slot.label }}</span>
              <span class="slot-status">
          <i v-if="selectedSlotIds.includes(slot.id)" class="pi pi-check-circle"></i>
          <i v-else-if="!slot.available" class="pi pi-times-circle"></i>
      </span>
            </div>
          </div>

        </div>

        <div v-if="error" class="error-message">
          <i class="pi pi-exclamation-triangle"></i> {{ error }}
        </div>

        <div class="form-actions">
          <button class="btn-cancel" @click="closeModal" :disabled="loading">
            <i class="pi pi-times"></i> Cancelar
          </button>
          <button
              class="btn-reserve"
              @click="submitReservation"
              :disabled="loading || selectedSlotIds.length === 0 || timeSlots.length === 0"
          >
            <i class="pi" :class="loading ? 'pi-spinner pi-spin' : 'pi-check'"></i>
            {{ loading ? 'Procesando...' : `Confirmar (${selectedSlotIds.length} horario${selectedSlotIds.length !== 1 ? 's' : ''})` }}
          </button>

        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(57, 43, 27, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
  transition: all 0.3s ease;
}

.modal-container {
  background-color: white;
  border-radius: 12px;
  padding: 18px;
  width: 100%;
  max-width: 420px;
  max-height: 85vh;
  overflow-y: auto;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.2);
  transform: translateY(0);
  transition: transform 0.3s ease, opacity 0.3s ease;
  animation: modal-appear 0.3s ease-out;
}

@keyframes modal-appear {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  border-bottom: 1px solid #EEE6E0;
  padding-bottom: 12px;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #392B1B;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #563F25;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
}

.close-button:hover {
  background-color: rgba(220, 200, 185, 0.3);
}

/* Estilos para el formulario compacto */
.compact-form {
  font-size: 0.95rem;
}

.form-row {
  justify-content: space-between;
  border-radius: 8px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 12px;
}

.form-group label {
  font-weight: 500;
  color: #392B1B;
}

.form-date {
  margin-bottom: 15px;
}

.date-picker {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #DCC8B9;
  border-radius: 6px;
  color: #392B1B;
  font-size: 0.95rem;
  background-color: #FFFFFF;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.date-picker:focus {
  border-color: #AC8362;
  box-shadow: 0 0 0 3px rgba(172, 131, 98, 0.15);
  outline: none;
}

.slots-section {
  margin-bottom: 15px;
}

.time-slots-container {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  margin-top: 10px;
}

.time-slot {
  padding: 10px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.9rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.slot-available {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.slot-available:hover {
  background-color: #43A047;
  transform: translateY(-2px);
  box-shadow: 0 3px 6px rgba(0,0,0,0.15);
}

.slot-unavailable {
  background-color: #F44336;
  color: white;
  cursor: not-allowed;
  border: none;
  opacity: 0.8;
}

.selected {
  background-color: #2a4a29 !important;
  color: white;
  border: none !important;
  box-shadow: 0 0 0 2px rgba(138, 114, 74, 0.3), 0 3px 8px rgba(0,0,0,0.2) !important;
  transform: translateY(-2px);
  position: relative;
}

.selected::after {
  position: absolute;
  top: -3px;
  right: -3px;
  background-color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.2);
}

.slot-time {
  font-weight: 600;
}

.slot-status .pi-check-circle {
  color: white;
  font-size: 0.85rem;
}

.slot-status .pi-times-circle {
  color: white;
  font-size: 0.85rem;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
  border-top: 1px solid #EEE6E0;
  padding-top: 15px;
}

.btn-cancel {
  padding: 10px 16px;
  background-color: white;
  color: #563F25;
  border: 1px solid #DCC8B9;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
}

.btn-cancel:hover {
  background-color: #FFF8F3;
  border-color: #AC8362;
}

.btn-reserve {
  padding: 10px 16px;
  background-color: #AC8362;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(172, 131, 98, 0.3);
}

.btn-reserve:hover:not(:disabled) {
  background-color: #8A724A;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(138, 114, 74, 0.4);
}

.btn-reserve:disabled {
  background-color: #DCC8B9;
  cursor: not-allowed;
  box-shadow: none;
}

.error-message {
  color: #D32F2F;
  margin-top: 12px;
  padding: 10px;
  background-color: #FFEBEE;
  border-radius: 6px;
  border-left: 3px solid #F44336;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  animation: errorAppear 0.3s ease-in;
}

@keyframes errorAppear {
  from {
    opacity: 0;
    transform: translateY(-5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.no-slots-message {
  padding: 15px;
  background-color: #FFF8F3;
  border-radius: 6px;
  margin: 10px 0;
  color: #563F25;
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  border: 1px dashed #DCC8B9;
}

.loading-slots {
  text-align: center;
  padding: 20px;
  color: #563F25;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
}

.loading-slots .pi-spinner {
  animation: spin 1.5s linear infinite;
  font-size: 1.2rem;
  color: #AC8362;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.success-message {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 15px;
  text-align: center;
  animation: successAppear 0.5s ease-out;
}

@keyframes successAppear {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.success-message i {
  font-size: 3rem;
  margin-bottom: 15px;
  color: #43A047;
  animation: checkmark 0.8s ease-in-out;
}

@keyframes checkmark {
  0% { transform: scale(0); opacity: 0; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(1); opacity: 1; }
}

.success-message h3 {
  color: #392B1B;
  margin-bottom: 20px;
  font-size: 1.4rem;
}

.detail-item {
  display: flex;
  align-items: center;
  padding-left: 20px;
  width: 100%;
}

.detail-icon {
  background-color: #FAF7F4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
  color: #8A724A;
  font-size: 1.1rem;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
}

.detail-text {
  text-align: left;
  flex-grow: 1;
  padding-left: 10px;
}

.detail-label {
  display: block;
  font-size: 0.8rem;
  color: #563F25;
  margin-bottom: 4px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-value {
  font-weight: 600;
  color: #392B1B;
  font-size: 1.05rem;
}

.btn-success {
  background-color: #43A047;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  font-size: 0.95rem;
  box-shadow: 0 2px 6px rgba(67, 160, 71, 0.3);
  transition: all 0.2s;
  padding: 10px;
}

.btn-success:hover {
  background-color: #388E3C;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(67, 160, 71, 0.4);
}

@media (max-width: 576px) {
  .time-slots-container {
    grid-template-columns: repeat(2, 1fr);
  }

  .modal-container {
    max-width: 90%;
    margin: 0 15px;
  }
}
</style>