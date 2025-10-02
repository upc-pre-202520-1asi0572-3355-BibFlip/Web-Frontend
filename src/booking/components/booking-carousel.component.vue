<script setup>
import { ref, onMounted, computed } from 'vue';
import { useAuthenticationStore } from '@/iam/services/authentication.store';
import { BookingService } from '@/booking/services/booking.service';
import { Booking } from '@/booking/model/booking.entity.js';
import { useConfirm } from 'primevue/useconfirm';
import { useToast } from 'primevue/usetoast';
import {HeadquartersService} from "@/booking/services/headquarter.service.js";

const headquarterService = new HeadquartersService();
const headquartersMap = ref({});
const authStore = useAuthenticationStore();
const bookingService = new BookingService();
const confirm = useConfirm();
const toast = useToast();

// Estado
const bookings = ref([]);
const loading = ref(true);
const error = ref(null);
const detailsDialogVisible = ref(false);
const selectedBooking = ref(null);
const responsiveOptions = ref([
    {
        breakpoint: '1024px',
        numVisible: 3,
        numScroll: 1
    },
    {
        breakpoint: '768px',
        numVisible: 2,
        numScroll: 1
    },
    {
        breakpoint: '560px',
        numVisible: 1,
        numScroll: 1
    }
]);
const loadHeadquarterNames = async () => {
  try {
    // Usar el método correcto del servicio
    const headquarters = await headquarterService.getAllHeadquarters();

    // Crear el mapa de IDs a nombres
    if (headquarters && Array.isArray(headquarters)) {
      headquarters.forEach(hq => {
        headquartersMap.value[hq.id] = hq.name;
      });
      console.log('Mapa de sedes cargado:', headquartersMap.value);
    }
  } catch (err) {
    console.error('Error al cargar datos de sedes:', err);
  }
};
const getHeadquarterName = (id) => {
  console.log('Buscando sede con ID:', id);
  console.log('Mapa de sedes disponible:', headquartersMap.value);
  return headquartersMap.value[id] || `Sede ${id}`;
};

const noBookingsMessage = computed(() => {
    if (loading.value) return "Cargando tus reservas...";
    if (error.value) return "No pudimos cargar tus reservas. Intenta de nuevo más tarde.";
    if (bookings.value.length === 0) return "No tienes reservas activas. ¡Haz tu primera reserva ahora!";
    return "";
});

const formatDate = (dateString) => {
  // Asegurarnos de que la fecha se interprete correctamente
  // Formato de entrada esperado: "YYYY-MM-DD"
  const [year, month, day] = dateString.split('-').map(num => parseInt(num, 10));

  // Crear fecha especificando todos los componentes para evitar problemas de zona horaria
  const date = new Date(year, month - 1, day, 12, 0, 0);

  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('es-ES', options).replace(/^\w/, (c) => c.toUpperCase());
};
const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    return `${hours}:${minutes}`;
};

const showBookingDetails = (booking) => {
    selectedBooking.value = booking;
    detailsDialogVisible.value = true;
};

const deleteBooking = (id) => {
    confirm.require({
        message: '¿Estás seguro que deseas cancelar esta reserva?',
        header: 'Confirmación de Cancelación',
        icon: 'pi pi-exclamation-triangle',
        acceptClass: 'p-button-danger',
        accept: async () => {
            try {
                await bookingService.delete(id);
                bookings.value = bookings.value.filter(booking => booking.id !== id);

                toast.add({
                    severity: 'success',
                    summary: 'Reserva Cancelada',
                    detail: 'Tu reserva ha sido cancelada correctamente',
                    life: 3000
                });
            } catch (error) {
                console.error('Error al cancelar la reserva:', error);
                toast.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'No se pudo cancelar la reserva',
                    life: 3000
                });
            }
        }
    });
};
onMounted(async () => {
  try {
    loading.value = true;
    const clientId = authStore.currentUserId;

    // Verificar si hay ID de cliente
    if (!clientId) {
      error.value = "No se pudo identificar al usuario";
      loading.value = false;
      return;
    }

    // Cargar nombres de sedes y reservas en paralelo
    await Promise.all([
      loadHeadquarterNames(),
      bookingService.getBookingsByClientId(clientId)
          .then(response => {
            if (response && response.data && Array.isArray(response.data)) {
              bookings.value = response.data.map(item => new Booking({
                id: item.id,
                clientId: item.clientId,
                cubicleNumber: item.cubicleNumber,
                headquarterId: item.headquarterId,
                cubicleId: item.cubicleId,
                bookingDate: item.bookingDate,
                bookingSlots: item.bookingSlots || []
              }));
            } else {
              bookings.value = [];
            }
          })
          .catch(err => {
            console.error('API endpoint error:', err.response?.status, err.response?.data);
            throw new Error(`Error al acceder a las reservas: ${err.response?.status || 'Error de conexión'}`);
          })
    ]);
  } catch (err) {
    console.error('Error al cargar las reservas:', err);
    toast.add({
      severity: 'error',
      summary: 'No pudimos cargar tus reservas',
      detail: 'Intenta de nuevo más tarde',
      life: 3000
    });
    bookings.value = [];
    error.value = err.message || 'Error al cargar reservas';
  } finally {
    loading.value = false;
  }
});
</script>

<template>
    <pv-toast />
    <pv-confirm-dialog></pv-confirm-dialog>

    <div class="booking-carousel-container">
        <h1 class="carousel-title">Mis Reservas</h1>

        <!-- Muestra mensaje si no hay reservas -->
        <div v-if="bookings.length === 0" class="no-bookings-message">
            <i class="pi pi-calendar-times no-bookings-icon"></i>
            <p>{{ noBookingsMessage }}</p>
            <router-link to="/headquarters" class="new-booking-link">
                <pv-button label="Hacer una reserva" icon="pi pi-calendar-plus" class="p-button-outlined" />
            </router-link>
        </div>

        <!-- Carrusel de reservas -->
        <pv-carousel
            v-else
            :value="bookings"
            :numVisible="3"
            :numScroll="1"
            :responsiveOptions="responsiveOptions"
            circular
            class="booking-carousel"
        >
            <template #item="slotProps">
                <div class="booking-card">
                    <div class="booking-header">
                        <i class="pi pi-calendar booking-icon"></i>
                        <span class="booking-date">{{ formatDate(slotProps.data.bookingDate) }}</span>
                    </div>
                    <div class="booking-content">
                        <div class="booking-detail">
                            <i class="pi pi-table"></i>
                            <span>Cubiculo {{ slotProps.data.cubicleNumber }}</span>
                        </div>
                        <!-- Elemento para mostrar el ID de la sede -->
                      <div class="booking-detail">
                        <i class="pi pi-building"></i>
                        <span>Sede: {{ getHeadquarterName(slotProps.data.headquarterId) }}</span>
                      </div>
                        <div class="booking-detail" v-if="slotProps.data.bookingSlots.length > 0">
                            <i class="pi pi-clock"></i>
                            <span>
                                {{ formatTime(slotProps.data.bookingSlots[0].startTime) }} -
                                {{ formatTime(slotProps.data.bookingSlots[0].endTime) }}
                            </span>
                        </div>
                    </div>
                    <div class="booking-footer">
                        <pv-button icon="pi pi-eye" class="p-button-rounded p-button-text"
                                tooltip="Ver detalles" :tooltipOptions="{ position: 'top' }"
                                @click="showBookingDetails(slotProps.data)" />
                        <pv-button icon="pi pi-trash" class="p-button-rounded p-button-text p-button-danger"
                                tooltip="Cancelar reserva" :tooltipOptions="{ position: 'top' }"
                                @click="deleteBooking(slotProps.data.id)" />
                    </div>
                </div>
            </template>
        </pv-carousel>

        <!-- Diálogo de detalles de reserva -->
        <pv-dialog
            v-model:visible="detailsDialogVisible"
            modal
            header="Detalles de la Reserva"
            :style="{ width: '90%', maxWidth: '500px' }"
            :dismissableMask="true"
        >
            <div v-if="selectedBooking" class="booking-details-container">
                <div class="details-section">
                    <h3 class="details-title">
                        <i class="pi pi-calendar"></i>
                        Fecha y Hora
                    </h3>
                    <div class="details-content">
                        <p class="detail-item">
                            <span class="detail-label">Fecha: </span>
                            <span class="detail-value">{{ formatDate(selectedBooking.bookingDate) }}</span>
                        </p>
                        <p class="detail-item" v-if="selectedBooking.bookingSlots && selectedBooking.bookingSlots.length > 0">
                            <span class="detail-label">Hora: </span>
                            <span class="detail-value">
                                {{ formatTime(selectedBooking.bookingSlots[0].startTime) }} -
                                {{ formatTime(selectedBooking.bookingSlots[0].endTime) }}
                            </span>
                        </p>
                    </div>
                </div>

                <div class="details-section">
                    <h3 class="details-title">
                        <i class="pi pi-map-marker"></i>
                        Ubicación
                    </h3>
                    <div class="details-content">
                      <p class="detail-item">
                        <span class="detail-label">Sede: </span>
                        <span class="detail-value">{{ getHeadquarterName(selectedBooking.headquarterId) }}</span>
                      </p>
                        <p class="detail-item">
                            <span class="detail-label">Cubiculo: </span>
                            <span class="detail-value">{{ selectedBooking.cubicleNumber }}</span>
                        </p>
                    </div>
                </div>

                <div class="details-section">
                    <h3 class="details-title">
                        <i class="pi pi-info-circle"></i>
                        Información Adicional
                    </h3>
                    <div class="details-content">
                        <p class="detail-item">
                            <span class="detail-label">ID de Reserva: </span>
                            <span class="detail-value">{{ selectedBooking.id }}</span>
                        </p>
                    </div>
                </div>

                <div class="details-actions">
                    <pv-button
                        label="Cerrar"
                        icon="pi pi-times"
                        @click="detailsDialogVisible = false"
                    />
                    <pv-button
                        label="Cancelar Reserva"
                        icon="pi pi-trash"
                        class="p-button-danger"
                        @click="detailsDialogVisible = false; deleteBooking(selectedBooking.id)"
                    />
                </div>
            </div>
        </pv-dialog>
    </div>
</template>

<style scoped>
/* Contenedor principal del carrusel */
.booking-carousel-container {
    width: 100%;
    padding: 0;
    margin: 0;
    background-color: var(--surface-color);
    border-radius: 8px;
}

/* Estilos del título */
.carousel-title {
  color: var(--primaryColor900);
  text-align: left;
  padding: 0 0 20px 0;
  margin: 0;
}

/* Estilos para las tarjetas de reserva */
.booking-card {
    background-color: var(--primaryColor50);
    border-radius: 10px;
    border: 1px solid var(--primaryColor200);
    padding: 1.5rem;
    margin: 0.5rem;
    height: 250px;
    display: flex;
    flex-direction: column;
    transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.booking-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(172, 131, 98, 0.15);
}

/* Cabecera de la tarjeta */
.booking-header {
    display: flex;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--primaryColor200);
}

.booking-icon {
    font-size: 1.2rem;
    color: var(--primaryColor600);
    margin-right: 0.5rem;
}

.booking-date {
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
}

/* Contenido de la tarjeta */
.booking-content {
    flex-grow: 1;
}

.booking-detail {
    display: flex;
    align-items: center;
    margin-bottom: 0.8rem;
}

.booking-detail i {
    font-size: 1rem;
    color: var(--primaryColor500);
    margin-right: 0.5rem;
}

/* Pie de la tarjeta */
.booking-footer {
    display: flex;
    justify-content: space-around;
    margin-top: auto;
}

/* Mensaje cuando no hay reservas */
.no-bookings-message {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
    background-color: var(--primaryColor50);
    border-radius: 10px;
    border: 1px dashed var(--primaryColor300);
    padding: 2rem;
    text-align: center;
    margin: 1rem 0;
}

.no-bookings-icon {
    font-size: 3rem;
    color: var(--primaryColor400);
    margin-bottom: 1rem;
}

.no-bookings-message p {
    font-size: 1.1rem;
    color: var(--text-secondary);
    margin-bottom: 1.5rem;
}

.new-booking-link {
    text-decoration: none;
}

/* Personalización del botón "Hacer una reserva" */
.new-booking-link :deep(.p-button.p-button-outlined) {
    border-color: var(--primaryColor500);
    color: var(--primaryColor700);
    background-color: transparent;
    transition: all 0.2s ease;
    border-radius: 30px;
    padding: 0.75rem 1.5rem;
}

.new-booking-link :deep(.p-button.p-button-outlined:hover) {
    background-color: var(--primaryColor50);
    border-color: var(--primaryColor600);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(172, 131, 98, 0.2);
}

.new-booking-link :deep(.p-button.p-button-outlined:active) {
    transform: translateY(0);
    background-color: var(--primaryColor100);
}

/* Personalización de los botones de acción en las tarjetas */
.booking-footer :deep(.p-button.p-button-rounded) {
    width: 2.5rem;
    height: 2.5rem;
    transition: all 0.2s ease;
}

/* Botón "Ver detalles" */
.booking-footer :deep(.p-button-text:not(.p-button-danger)) {
    color: var(--primaryColor600);
}

.booking-footer :deep(.p-button-text:not(.p-button-danger):hover) {
    background-color: var(--primaryColor100);
    color: var(--primaryColor800);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(172, 131, 98, 0.15);
}

.booking-footer :deep(.p-button-text:not(.p-button-danger):active) {
    transform: translateY(0);
    background-color: var(--primaryColor200);
}

/* Botón "Cancelar reserva" */
.booking-footer :deep(.p-button-danger.p-button-text) {
    background-color: transparent;
    color: #e57373;
}

.booking-footer :deep(.p-button-danger.p-button-text:hover) {
    background-color: rgba(244, 67, 54, 0.1);
    color: #f44336;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(244, 67, 54, 0.15);
}

.booking-footer :deep(.p-button-danger.p-button-text:active) {
    transform: translateY(0);
    background-color: rgba(244, 67, 54, 0.2);
}

/* Mejoras para los botones y navegación del carrusel */
:deep(.p-carousel-indicators .p-carousel-indicator.p-highlight button) {
    background-color: var(--primaryColor600);
}

:deep(.p-carousel-indicators .p-carousel-indicator button) {
    background-color: var(--primaryColor200);
}

:deep(.p-carousel-prev),
:deep(.p-carousel-next) {
    color: var(--primaryColor700) !important;
    background-color: var(--primaryColor50) !important;
    border-radius: 50%;
    margin: 0 0.5rem;
}

:deep(.p-carousel-prev:hover),
:deep(.p-carousel-next:hover) {
    background-color: var(--primaryColor100) !important;
    color: var(--primaryColor800) !important;
}

/* Estilos para el diálogo de detalles */
.booking-details-container {
    padding: 1rem;
}

.details-section {
    margin-bottom: 1.5rem;
    border-bottom: 1px solid var(--primaryColor100);
    padding-bottom: 1rem;
}

.details-section:last-child {
    border-bottom: none;
}

.details-title {
    display: flex;
    align-items: center;
    font-size: 1.1rem;
    color: var(--primaryColor700);
    margin-bottom: 0.75rem;
}

.details-title i {
    margin-right: 0.5rem;
}

.details-content {
    padding-left: 1.5rem;
}

.detail-item {
    display: flex;
    margin-bottom: 0.5rem;
    line-height: 1.5;
}

.detail-label {
    font-weight: 600;
    width: 100px;
    color: var(--text-secondary);
}

.detail-value {
    flex: 1;
    color: var(--text-primary);
}

.details-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 2rem;
}

:deep(.p-dialog-header) {
    background-color: var(--primaryColor50) !important;
    color: var(--primaryColor700) !important;
    border-bottom: 1px solid var(--primaryColor100) !important;
}

:deep(.p-dialog-content) {
    background-color: var(--surface-color) !important;
    color: var(--text-primary) !important;
    padding: 1rem;
}

:deep(.p-dialog) {
    background-color: var(--surface-color) !important;
    color: var(--text-primary) !important;
}

:deep(.p-dialog-footer) {
    background-color: var(--surface-color) !important;
    border-top: 1px solid var(--primaryColor100) !important;
}

/* Media queries para responsividad */
@media (max-width: 768px) {
    .booking-card {
        padding: 1rem;
        margin: 0.3rem;
        height: 240px;
    }

    .carousel-title {
        font-size: 1.3rem;
        margin-bottom: 1rem;
    }
}

@media (max-width: 480px) {
    .booking-card {
        height: 220px;
    }

    .booking-detail {
        margin-bottom: 0.5rem;
    }

    .booking-date {
        font-size: 1rem;
    }
}
</style>