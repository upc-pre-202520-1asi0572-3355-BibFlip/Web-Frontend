<script>
import { ref, onMounted } from 'vue';
import { BookingService } from '../services/booking.service.js';
import { Booking } from '../model/booking.entity.js';
import { CubicleEntity } from '../model/cubicle.entity.js';
import BookingCardPerson from './booking-card-person.vue';
import { useAuthenticationStore } from "@/iam/services/authentication.store.js";

export default {
  name: "c",
  components: {
    BookingCardPerson,
  },
  props: {
    headquarterId: {
      type: [Number, String],
      required: false,
      default: null
    },
  },
  setup(props) {
    const bookings = ref([]);
    const cubicles = ref([]);
    const bookingService = new BookingService();
    const loading = ref(true);
    const error = ref(null);
    const headquarter = ref(null);
    const authStore = useAuthenticationStore();
    const viewType = ref('person');

    const fetchHeadquarterData = async () => {
      try {
        loading.value = true;

        let hqId = props.headquarterId;

        if (!hqId) {
          const supervisorId = authStore.currentUserId;
          if (!supervisorId) {
            throw new Error('No supervisor ID available');
          }

          const response = await bookingService.getHeadquarterBySupervisorId(supervisorId);

          if (!response?.data) {
            throw new Error('No headquarter data returned for this supervisor');
          }

          headquarter.value = response.data;
          hqId = headquarter.value.headquarterId || headquarter.value.id;

          if (!hqId) {
            throw new Error('Invalid headquarter data structure');
          }
        }

        const cubiclesResponse = await bookingService.getCubiclesByHeadquarterId(hqId);
        cubicles.value = cubiclesResponse.data.map(t => new CubicleEntity(
            t.id,
            hqId,
            t.cubicleNumber || 0,
            t.seats || 0,
            t.status || 'available'
        ));

        const bookingsResponse = await bookingService.getAllBookings();

        if (bookingsResponse?.data && Array.isArray(bookingsResponse.data)) {
          bookings.value = bookingsResponse.data
              .filter(b => b.headquarterId === hqId)
              .map(b => {
                const booking = Booking.fromJson(b);
                const cubicle = cubicles.value.find(t => t.id === booking.cubicleId);

                return {
                  ...booking,
                  clientName: b.clientName || 'Estudiante',
                  cubicleCapacity: cubicle?.seats ?? '-',
                  headquarterId: hqId,
                  cubicleNumber: cubicle?.cubicleNumber || 'N/A',
                  capacity: cubicle?.seats || 4,
                  zone: 'A'// UPDATE LATER
                };
              });
        } else {
          bookings.value = [];
        }
      } catch (err) {
        error.value = `Error al cargar reservas: ${err.message}`;
        console.error('Error fetching bookings data:', err);
      } finally {
        loading.value = false;
      }
    };

    onMounted(fetchHeadquarterData);

    return {
      bookings,
      cubicles,
      loading,
      error,
      headquarter,
    };
  }
}
</script>

<template>
  <div class="headquarter-bookings">
    <!-- Loading and error states -->
    <div v-if="loading" class="status-message loading">
      <p>Cargando información...</p>
    </div>

    <div v-else-if="error" class="status-message error">
      <p>{{ error }}</p>
    </div>

    <div v-else-if="bookings.length === 0" class="status-message empty">
      <p>No hay reservas.</p>
    </div>

    <div v-else class="bookings-grid">
      <!-- Person View -->
      <BookingCardPerson
          v-for="booking in bookings"
          :key="`person-${booking.id}`"
          :booking="booking"
      />
    </div>
  </div>
</template>

<style scoped>
.bookings-grid {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.status-message {
  text-align: center;
  padding: 20px;
  color: #392B1B;
  border-radius: 8px;
  margin: 20px 0;
}

.loading {
  background-color: #f5f5f5;
}

.error {
  background-color: #ffebee;
  color: #b3261e;
}

.empty {
  background-color: #fff8e1;
}
</style>