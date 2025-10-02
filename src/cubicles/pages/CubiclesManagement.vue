<script>
import { ref, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import CubicleList from '../components/CubicleList.vue';
import CubicleForm from '../components/CubicleForm.vue';
import cubicleService from '../services/cubicle.service.js';
import { useAuthenticationStore } from "@/iam/services/authentication.store.js";
import { CubicleEntity } from "@/cubicles/model/cubicle.entity.js";

export default {
  name: 'CubiclesManagement',
  components: {
    CubicleList: CubicleList,
    CubicleForm: CubicleForm
  },
  setup() {
    const toast = useToast();
    const authStore = useAuthenticationStore();
    const cubicles = ref([]);
    const loading = ref(true);
    const showModal = ref(false);
    const headquarterId = ref(null);

    onMounted(async () => {
      try {
        await loadSupervisorHeadquarter();
      } catch (error) {
        handleError(error, 'Error al cargar la información de la sede');
      }
    });

    // Función para cargar la sede asociada al supervisor
    const loadSupervisorHeadquarter = async () => {
      loading.value = true;
      try {
        // Obtener el ID del usuario actual desde el store de autenticación
        const supervisorId = authStore.currentUserId;
        console.log('Cargando sede para el supervisor ID:', supervisorId);

        // Obtener la sede asociada al supervisor
        const headquarterResponse = await cubicleService.getHeadquarterBySupervisorId(supervisorId);

        if (!headquarterResponse || !headquarterResponse.data) {
          throw new Error('No se encontró información de la sede para este supervisor');
        }

        headquarterId.value = headquarterResponse.data.headquarterId;
        console.log('ID de la sede obtenido:', headquarterId.value);

        // Cargar los cubiculos para esa sede
        await loadCubiclesByHeadquarter();
      } catch (error) {
        console.error('Error al cargar la sede del supervisor:', error);
        loading.value = false;
        throw error;
      }
    };

    const loadCubiclesByHeadquarter = async () => {
      if (!headquarterId.value) {
        cubicles.value = [];
        loading.value = false;
        return;
      }

      try {
        console.log('Cargando cubiculos para la sede ID:', headquarterId.value);
        const response = await cubicleService.getCubiclesByHeadquarterId(headquarterId.value);

        if (response && response.data) {
          console.log('Cubiculos obtenidos:', response.data);
          cubicles.value = Array.isArray(response.data) ?
            response.data.map(cubicleData => {
              return new CubicleEntity(
                cubicleData.id,
                cubicleData.headquarterId,
                cubicleData.cubicleNumber,
                cubicleData.seats,
                cubicleData.status,
                cubicleData.zone || 'MAIN_HALL'
              );
            }) : [];
        } else {
          cubicles.value = [];
          console.error('Respuesta inesperada al cargar cubiculos:', response);
        }
      } catch (error) {
        console.error('Error al cargar tablas de la sede:', error);
        cubicles.value = []; // Escubiclecer un array vacío en lugar de propagar el error
        // Solo mostrar mensaje de error si no es un problema de conectividad o backend caído
        if (error.response && error.response.status !== 500) {
          throw error;
        }
      } finally {
        loading.value = false;
      }
    };

    // Función para agregar un cubiculo
    const handleAddCubicle = async (newCubicle) => {
      try {
        // Asegurar que el cubiculo pertenezca a la sede del supervisor
        newCubicle.headquarterId = headquarterId.value;
        const createdCubicle = await cubicleService.createCubicle(newCubicle);
        
        // Si la creación fue exitosa, agregar el cubiculo a la lista actual sin recargar
        if (createdCubicle) {
          // Si tenemos datos de el cubiculo creada, la agregamos al array
          if (typeof createdCubicle === 'object' && createdCubicle.id) {
            cubicles.value.push(new CubicleEntity(
              createdCubicle.id,
              createdCubicle.headquarterId,
              createdCubicle.cubicleNumber,
              createdCubicle.seats,
              createdCubicle.status,
              createdCubicle.zone || 'MAIN_HALL'
            ));
          }
          // Si no, intentamos recargar (pero evitamos propagar errores si falla)
          else {
            try {
              await loadCubiclesByHeadquarter();
            } catch (loadError) {
              console.error("Error al recargar cubiculos después de crear:", loadError);
            }
          }
        }
        
        showModal.value = false;
        showSuccessMessage('Cubiculo agregado correctamente');
      } catch (error) {
        handleError(error, 'Error al agregar el cubiculo');
      }
    };

    // ELIMINAR MESA NO HAY ENDPOINT
    const handleDeleteCubicle = async (cubicleId) => {
      try {
        if (confirm(`¿Está seguro de eliminar el cubiculo con ID ${cubicleId}?`)) {
          // Ensure that cubicleId is a number
          const id = typeof cubicleId === 'string' ? parseInt(cubicleId, 10) : cubicleId;
          await cubicleService.deleteCubicle(id);
          
          // Update the list of cubicles by removing the deleted cubicle.
          cubicles.value = cubicles.value.filter(cubicle => cubicle.id !== id);
          
          showSuccessMessage('Cubiculo eliminado correctamente');
        }
      } catch (error) {
        const errorData = error.response?.data;
        const errorStatus = error.response?.status;
        const errorMessage = errorData?.message || error.message;

        handleError(
          error,
          `Error al eliminar el cubiculo ${cubicleId}. ${errorStatus === 500 ? 'Error interno del servidor.' : errorMessage}`
        );
      }
    };

    const openAddCubicleModal = () => {
      showModal.value = true;
    };

    const closeModal = () => {
      showModal.value = false;
    };

    const handleError = (error, defaultMessage) => {
      console.error(error);
      const message = error.response?.data?.message || defaultMessage;
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: message,
        life: 3000
      });
    };

    const showSuccessMessage = (message) => {
      toast.add({
        severity: 'success',
        summary: 'Éxito',
        detail: message,
        life: 3000
      });
    };

    return {
      cubicles,
      loading,
      showModal,
      openAddCubicleModal,
      closeModal,
      handleAddCubicle,
      handleDeleteCubicle,
      headquarterId
    };
  }
}
</script>

<template>
  <div class="cubicles-management-page">
    <pv-toast />

    <div class="page-header">
      <h1 class="page-title">
        <i class="pi pi-table"></i>
        Gestión de Cubiculos
      </h1>
      <p class="page-subtitle">Administra los cubiculos disponibles en tu sede asignada</p>
    </div>

    <div class="cubicles-container">
      <!-- Vista de carga -->
      <div v-if="loading" class="loading-state">
        <div class="loading-spinner">
          <i class="pi pi-spin pi-spinner"></i>
        </div>
        <p>Cargando cubiculos...</p>
      </div>

      <!-- Error - No hay sede asociada -->
      <div v-else-if="!headquarterId" class="empty-state">
        <div class="empty-icon">
          <i class="pi pi-building"></i>
        </div>
        <h3 class="empty-title">Sede no encontrada</h3>
        <p class="empty-description">No se encontró una sede asociada a su cuenta.</p>
      </div>

      <!-- Vista principal -->
      <div v-else>
        <div class="actions-container">
          <pv-button
              label="Agregar cubiculo"
              icon="pi pi-plus"
              class="add-cubicle-btn"
              @click="openAddCubicleModal"
          />
        </div>

        <CubicleList v-if="cubicles.length > 0" :cubicles="cubicles" @delete="handleDeleteCubicle" />

        <div v-else class="empty-state">
          <div class="empty-icon">
            <i class="pi pi-table"></i>
          </div>
          <h3 class="empty-title">Sin cubiculos</h3>
          <p class="empty-description">No hay cubiculos registradas en esta sede. Agrega una nueva cubiculo para comenzar.</p>
        </div>
      </div>
    </div>

    <!-- Modal personalizado para agregar cubiculo -->
    <div v-if="showModal" class="custom-modal-overlay" @click.self="closeModal">
      <div class="custom-modal-container">
        <CubicleForm
            @save="handleAddCubicle"
            @cancel="closeModal"
            :predefinedHeadquarterId="headquarterId"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.cubicles-management-page {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.page-header {
  margin-bottom: 2rem;
  text-align: center;
}

.page-title {
  font-size: 2rem;
  color: var(--primaryColor700);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.page-subtitle {
  color: var(--primaryColor600);
  font-size: 1rem;
}

.cubicles-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  border: 1px solid var(--primaryColor100);
  overflow: hidden;
  padding: 2rem;
}

.loading-state {
  text-align: center;
  padding: 3rem;
}

.loading-spinner {
  font-size: 2rem;
  color: var(--primaryColor500);
  margin-bottom: 1rem;
}

.empty-state {
  text-align: center;
  padding: 3rem 2rem;
}

.empty-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, var(--primaryColor200) 0%, var(--primaryColor300) 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.5rem;
  color: var(--primaryColor600);
  font-size: 2rem;
}

.empty-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.empty-description {
  font-size: 1rem;
  color: var(--text-secondary);
  margin: 0;
}

.actions-container {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1.5rem;
}

.add-cubicle-btn {
  background-color: var(--primaryColor500);
  border-color: var(--primaryColor500);
  color: white;
  transition: background-color 0.3s ease;
}

.add-cubicle-btn:hover {
  background-color: var(--primaryColor600);
  border-color: var(--primaryColor600);
}

.custom-modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

@media (max-width: 768px) {
  .page-title {
    font-size: 1.5rem;
  }

  .cubicles-container {
    padding: 1rem;
  }

  .custom-modal-container {
    width: 95%;
  }
}
</style>