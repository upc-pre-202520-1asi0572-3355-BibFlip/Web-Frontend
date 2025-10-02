<script>
import { ref, onMounted } from 'vue';
import { BookingService } from '../services/booking.service.js';

export default {
  name: "BookingCardPerson",
  props: {
    booking: {
      type: Object,
      required: true
    }
  },
  setup(props) {
    const clientName = ref(props.booking.clientName || 'Cliente');
    const bookingService = new BookingService();

    onMounted(async () => {
      try {
        if (props.booking.clientId || props.booking.userId) {
          const userId = props.booking.clientId || props.booking.userId;
          const response = await bookingService.getUserById(userId);

          if (response?.data) {
            clientName.value = response.data.username
          }
        }
      } catch (error) {
        console.error('Error fetching client details:', error);
      }
    });

    return {
      clientName
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
      <h3>{{ clientName }}</h3>
      <span class="status-badge">Reserva</span>
    </div>

    <div class="booking-card-content">
      <div class="booking-info">
        <div class="info-row">
          <span class="info-label">Cubiculo:</span>
          <span class="info-value">{{ booking.cubicleNumber }}</span>
        </div>

        <div class="info-row">
          <span class="info-label">Capacidad:</span>
          <span class="info-value">{{ booking.cubicleCapacity }} personas</span>
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
</template>

<style scoped>
.booking-card {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  overflow: hidden;
  border: 1px solid #f0f0f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  margin-bottom: 12px;
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

.booking-card-content {
  padding: 15px 20px;
}

.booking-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
  background-color: transparent;
}

.info-row {
  display: flex;
  align-items: center;
  margin-bottom: 0;
}

.info-label {
  font-weight: 600;
  width: 90px;
  color: #563F25;
  font-size: 0.9rem;
}

.info-value {
  color: #392B1B;
}

.status-badge {
  background-color: #AC8362;
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 500;
}
</style>