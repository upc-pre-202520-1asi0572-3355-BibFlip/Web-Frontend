<script setup>
import { ref, defineEmits } from 'vue';
import { CubicleEntity } from '../model/cubicle.entity.js';

const emit = defineEmits(['save', 'cancel']);

// Definir props primero
const props = defineProps({
  predefinedHeadquarterId: {
    type: Number,
    default: null
  }
});

// Datos del formulario
const cubicleNumber = ref('');
const seats = ref('');
const zone = ref('Sala principal');
const headquarterId = ref(props.predefinedHeadquarterId);

// Zonas disponibles
const zones = [
  { name: 'Sala principal', value: 'Sala principal' },
  { name: 'Terraza', value: 'Terraza' },
  { name: 'Ventana', value: 'Ventana' }
];


// Validación de formulario
const errors = ref({});

const validateForm = () => {
  errors.value = {};
  let isValid = true;

  if (!cubicleNumber.value) {
    errors.value.cubicleNumber = 'El número de cubiculo es obligatorio';
    isValid = false;
  } else if (isNaN(cubicleNumber.value) || cubicleNumber.value <= 0) {
    errors.value.cubicleNumber = 'El número de cubiculo debe ser un número positivo';
    isValid = false;
  }

  if (!seats.value) {
    errors.value.seats = 'La capacidad es obligatoria';
    isValid = false;
  } else if (isNaN(seats.value) || seats.value <= 0) {
    errors.value.seats = 'La capacidad debe ser un número positivo';
    isValid = false;
  }

  return isValid;
};

const handleSubmit = () => {
  if (validateForm()) {
    const newCubicle = new CubicleEntity(
        null,
        Number(headquarterId.value),
        Number(cubicleNumber.value),
        Number(seats.value),
        'AVAILABLE',
        zone.value
    );

    emit('save', newCubicle);
    resetForm();
  }
};
const resetForm = () => {
  cubicleNumber.value = '';
  seats.value = '';
  zone.value = 'Sala principal';
  errors.value = {};
};

const handleCancel = () => {
  resetForm();
  emit('cancel');
};
</script>

<template>
  <div class="dialog-container">
    <div class="dialog-title">Agregar cubiculo</div>
    
    <form @submit.prevent="handleSubmit">
      <div class="form-group">
        <label for="cubicleNumber">Número de cubiculo</label>
        <input
          id="cubicleNumber"
          v-model="cubicleNumber"
          type="number"
          min="1"
          :class="{ 'error-input': errors.cubicleNumber }"
          placeholder="Ejemplo: 13"
        />
        <small v-if="errors.cubicleNumber" class="error-message">{{ errors.cubicleNumber }}</small>
      </div>

      <div class="form-group">
        <label for="seats">Capacidad (personas)</label>
        <input
          id="seats"
          v-model="seats"
          type="number"
          min="1"
          :class="{ 'error-input': errors.seats }"
          placeholder="Ejemplo: 4"
        />
        <small v-if="errors.seats" class="error-message">{{ errors.seats }}</small>
      </div>

      <div class="form-group">
        <label for="zone">Zona</label>
        <select id="zone" v-model="zone" class="custom-select">
          <option v-for="option in zones" :key="option.value" :value="option.value">
            {{ option.name }}
          </option>
        </select>
      </div>

      <div class="button-container">
        <pv-button type="button" class="secondary" @click="handleCancel">Cancelar</pv-button>
        <pv-button type="submit" class="add">Agregar</pv-button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.dialog-container {
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  padding: 28px;
  width: 100%;
  max-width: 380px;
  color: #333333;
}

.dialog-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 14px;
  text-align: left;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  font-size: 15px;
  font-weight: 500;
  color: #555;
  margin-bottom: 8px;
  text-align: left;
}

input, .custom-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  box-sizing: border-box;
  transition: border-color 0.2s;
  color: #333;
  background-color: white;
}

input:focus, .custom-select:focus {
  border-color: #a67c52;
  outline: none;
  box-shadow: 0 0 0 2px rgba(166, 124, 82, 0.2);
}

.custom-select {
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23a67c52' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;
}

.error-input {
  border-color: #e74c3c;
}

.error-message {
  color: #e74c3c;
  font-size: 12px;
  margin-top: 4px;
  display: block;
  text-align: left;
}

.button-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 28px;
}

button.add {
  margin-left: auto;
  background-color: var(--primaryColor500);
  border-color: var(--primaryColor500);
  color: var(--primaryColor50);
  border-radius: 1.5em;
  transition: transform 0.2s ease-in-out, background-color 0.2s, border-color 0.2s;
}

button.add:hover {
  background-color: var(--primaryColor400);
  border-color: var(--primaryColor400);
  color: var(--primaryColor50);
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;}

button.secondary {
  margin-left: auto;
  background-color: #6C6860FF;
  border-color: #6C6860FF;
  color: var(--primaryColor50);
  border-radius: 1.5em;
  transition: transform 0.2s ease-in-out, background-color 0.2s, border-color 0.2s;

}

button.secondary:hover {
  background-color: #a4a2a1;
  border-color: #A4A2A1FF;
  color: var(--primaryColor50);
  transform: scale(1.05);
  transition: transform 0.2s ease-in-out;
}
</style> 