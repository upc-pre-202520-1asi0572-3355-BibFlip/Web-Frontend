<script setup>
import { ref, defineProps, defineEmits } from 'vue';
import { CubicleEntity } from '../model/cubicle.entity.js';

const props = defineProps({
  cubicle: {
    type: Object, // Changed from Cubicle to Object since CubicleEntity is a class
    required: true
  }
});

const emit = defineEmits(['delete']);

const handleDelete = () => {
  console.log('ID de cubiculo a eliminar:', props.cubicle.id, typeof props.cubicle.id);
  console.log('Cubiculo completo:', props.cubicle);
  emit('delete', props.cubicle.id);
};
</script>

<template>
  <div class="cubicle-card" :class="'zone-' + cubicle.zone?.toLowerCase()">
    <div class="cubicle-header">
      <h3 class="cubicle-number">Cubiculo #{{ cubicle.cubicleNumber }}</h3>
    </div>
    <div class="cubicle-content">
      <div class="cubicle-info">
        <div class="info-item">
          <i class="pi pi-users"></i>
          <span>{{ cubicle.seats }} personas</span>
        </div>
        <div class="info-item">
          <i class="pi pi-map-marker"></i>
          <span>{{ cubicle.getZoneDisplayName() }}</span>
          <span class="zone-indicator" :class="'zone-' + cubicle.zone?.toLowerCase()"></span>
        </div>
      </div>
      <div class="cubicle-actions">
        <button class="delete-button" @click="handleDelete">
          <i class="pi pi-trash"></i>
          <span>Eliminar</span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.cubicle-card {
  background: rgba(213, 153, 105, 0.07);
  border-radius: 8px;
  border: rgba(123, 93, 70, 0.2) 1px solid;
  box-shadow: 0 2px 10px rgba(57, 43, 27, 0.15);
  padding: 1rem;
  transition: all 0.3s ease;
}

.cubicle-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 10px rgba(57, 43, 27, 0.15);
}

.cubicle-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #8A724A;
}

.cubicle-number {
  font-size: 1.2rem;
  font-weight: 600;
  color: #392B1B;
  margin: 0;
}

.cubicle-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.cubicle-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #392B1B;
}

.info-item i {
  color: #563F25;
  font-size: 1rem;
}

.zone-indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
  margin-left: 0.5rem;
}



.cubicle-actions {
  justify-content: flex-end;
  display: flex;
}

.delete-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #AC311C;
  border: none;
  border-radius: 6px;
  color: white;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.delete-button:hover {
  background: #8C2916;
}
</style>