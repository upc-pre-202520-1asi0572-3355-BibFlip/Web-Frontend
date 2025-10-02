<script setup>
import { ref, defineProps } from 'vue';
import CubicleCard from './CubicleCard.vue';

const props = defineProps({
  cubicles: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(['delete']);

const handleDelete = (cubicleId) => {
  emit('delete', cubicleId);
};
</script>

<template>
  <div class="cubicle-list" :class="{ 'empty': cubicles.length === 0 }">
    <div v-if="cubicles.length === 0" class="empty-state">
      <p>No hay cubiculos registradas</p>
    </div>
    <div v-else class="cubicle-grid">
      <CubicleCard
        v-for="cubicle in cubicles"
        :key="cubicle.id"
        :cubicle="cubicle"
        @delete="handleDelete"
      />
    </div>
  </div>
</template>

<style scoped>
.cubicle-list {
  width: 100%;
  min-height: 200px;
  color: #333333; /* Color oscuro para el texto */
}

.cubicle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.empty-state {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  background-color: #f8f8f8;
  border-radius: 5px;
  border: 1px dashed #ccc;
}

.empty-state p {
  font-size: 16px;
  color: #666;
}
</style>