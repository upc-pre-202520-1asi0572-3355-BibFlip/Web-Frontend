<script>
import { ref, onMounted } from 'vue';
import { BookingService } from '../services/booking.service.js';

export default {
  name: "BookingCardCubicle",
  props: {
    cubicle: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const bookings = ref([]);
    const loading = ref(true);
    const bookingService = new BookingService();

    // Obtener las reservas asociadas a este cubiculo
    onMounted(async () => {
      try {
        loading.value = true;
        const response = await bookingService.getAllBookings();

        if (response?.data) {
          // Filtrar las reservas que corresponden a este cubiculo
          bookings.value = response.data.filter(booking =>
              booking.cubicleId === props.cubicle.id
          );

          // Para cada reserva, obtener el nombre del cliente
          for (const booking of bookings.value) {
            if (booking.clientId || booking.userId) {
              const userId = booking.clientId || booking.userId;
              const userResponse = await bookingService.getUserById(userId);

              if (userResponse?.data) {
                booking.clientName = userResponse.data.username;
              } else {
                booking.clientName = 'Cliente';
              }
            } else {
              booking.clientName = 'Cliente';
            }
          }
        }
      } catch (error) {
        console.error('Error fetching bookings:', error);
      } finally {
        loading.value = false;
      }
    });

    return {
      bookings,
      loading
    };
  },
  methods: {
    formatTime(bookingSlots) {
      if (bookingSlots && bookingSlots.length > 0) {
        return `${bookingSlots[0].startTime} - ${bookingSlots[bookingSlots.length - 1].endTime}`;
      }
      return 'No time specified';
    }
  }
}
</script>

<template>
  <div class="booking-card">
    <div class="booking-card-header">
      <h3>Cubiculo {{ cubicle.cubicleNumber }}</h3>
      <span class="capacity-badge">{{ cubicle.seats }} personas</span>
    </div>

    <div class="booking-card-content">
      <div v-if="loading" class="loading-message">
        Cargando reservas...
      </div>

      <div v-else-if="bookings.length === 0" class="empty-message">
        No hay reservas para este cubiculo.
      </div>

      <div v-else class="bookings-list">
        <div v-for="booking in bookings" :key="booking.id" class="booking-item">
          <div class="booking-info">
            <div class="info-row">
              <span class="info-label">Cliente:</span>
              <span class="info-value">{{ booking.clientName }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Hora:</span>
              <span class="info-value">{{ formatTime(booking.bookingSlots) }}</span>
            </div>

            <div class="info-row">
              <span class="info-label">Fecha:</span>
              <span class="info-value">{{ booking.bookingDate }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.booking-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.booking-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.booking-card-header {
  padding: 15px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f0f0f0;
  background-color: #f9f7f5;
}

.booking-card-header h3 {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
  color: #392B1B;
}

.capacity-badge {
  background-color: #AC8362;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}

.booking-card-content {
  padding: 15px 20px;
}

.loading-message, .empty-message {
  text-align: center;
  padding: 20px;
  color: #8a8a8a;
  font-size: 0.9rem;
}

.bookings-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.booking-item {
  padding: 12px 15px;
  border-radius: 8px;
  background-color: #f9f7f5;
  border-left: 3px solid #AC8362;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  width: 80px;
  color: #563F25;
  font-size: 0.9rem;
}

.info-value {
  color: #392B1B;
}
</style>