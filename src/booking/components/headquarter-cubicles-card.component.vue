<!-- src/booking/components/headquarter-cubicles-card.component.vue -->
<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  cubicle: {
    type: Object,
    required: true,
    validator: (value) => value instanceof Object
  },
  headquarter: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['select-cubicle', 'reserve-cubicle']);

// Uso de propiedades de CubiclesEntity
const isAvailable = computed(() => props.cubicle.status?.toLowerCase() === 'available');
const cubicleClass = computed(() => `cubicle-card ${isAvailable.value ? 'available' : 'occupied'}`);

const getStatusLabel = () => {
  return isAvailable.value ? 'Disponible' : 'Ocupada';
};

const selectCubicle = () => {
  if (isAvailable.value) {
    emit('select-cubicle', props.cubicle.id);
  }
};

const openReservationForm = () => {
  if (isAvailable.value) {
    emit('reserve-cubicle', {
      cubicleId: props.cubicle.id,
      cubicleNumber: props.cubicle.cubicleNumber,
      seats: props.cubicle.seats,
      headquarterId: props.cubicle.headquarterId,
      headquarter: props.headquarter
    });
  }
};
</script>

<template>
  <div :class="cubicleClass">
    <div class="cubicle-header">
      <div class="cubicle-number">Cubiculo {{ cubicle.cubicleNumber }}</div>
      <div class="status-badge" :class="isAvailable ? 'badge-available' : 'badge-occupied'">
        {{ getStatusLabel() }}
      </div>
    </div>

    <div class="cubicle-info">
      <div class="detail-item">
        <div class="detail-icon">
          <i class="pi pi-users"></i>
        </div>
        <div class="detail-text">
          <span class="detail-value">{{ cubicle.seats }} personas</span>
        </div>
      </div>
    </div>

    <button
        class="btn-reserve"
        @click="openReservationForm"
        :disabled="!isAvailable">
      <i class="pi pi-calendar-plus"></i> Reservar
    </button>
  </div>
</template>

<style scoped>
.cubicle-card {
  background-color: #faf2f2;
  border-radius: 12px;
  padding: 18px;
  box-shadow: 0 3px 10px rgba(57, 43, 27, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.cubicle-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 20px rgba(57, 43, 27, 0.15);
}

.cubicle-card.available {
  border-top: 4px solid #4CAF50;
}

.cubicle-card.occupied {
  border-top: 4px solid #F44336;
  opacity: 0.8;
}

.cubicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  padding-bottom: 10px;
  border-bottom: 1px solid #EEE6E0;
}

.cubicle-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: #392B1B;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  letter-spacing: 0.5px;
}

.badge-available {
  background-color: #E8F5E9;
  color: #2E7D32;
  border: 1px solid #A5D6A7;
}

.badge-occupied {
  background-color: #FFEBEE;
  color: #C62828;
  border: 1px solid #EF9A9A;
}

.cubicle-info {
  margin-bottom: 15px;
  flex-grow: 1;
}

.detail-item {
  display: flex;
  align-items: center;
  margin-bottom: 5px;
}

.detail-icon {
  width: 32px;
  height: 32px;
  background-color: #FAF7F4;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 10px;
  color: #8A724A;
}

.detail-text {
  flex-grow: 1;
}

.detail-value {
  font-weight: 500;
  color: #563F25;
  font-size: 1rem;
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
  justify-content: center;
  gap: 6px;
  font-size: 0.9rem;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(172, 131, 98, 0.3);
}

.btn-reserve:hover:not(:disabled) {
  background-color: #8A724A;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(138, 114, 74, 0.4);
}

.btn-reserve:disabled {
  background-color: #DCC8B9;
  cursor: not-allowed;
  box-shadow: none;
}
</style>