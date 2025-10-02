<script>
import { ref, onMounted } from 'vue';
import { CubicleEntity } from '../model/cubicle.entity.js';
import BookingCardCubicle from './booking-card-cubicle.vue';
import { useAuthenticationStore } from "@/iam/services/authentication.store.js";
import {BookingService} from "@/booking/services/booking.service.js";

export default {
  name: "HeadquarterCubicleList",
  components: {
    BookingCardCubicle
  },
  props: {
    headquarterId: {
      type: [Number, String],
      required: false,
      default: null
    }
  },
  setup(props) {
    const cubicles = ref([]);
    const bookingService = new BookingService();
    const loading = ref(true);
    const error = ref(null);
    const headquarter = ref(null);
    const authStore = useAuthenticationStore();


    const fetchHeadquarterCubicles = async () => {
      console.log('Starting fetchHeadquarterCubicles function');
      try {
        loading.value = true;
        console.log('Props headquarterId:', props.headquarterId);

        let hqId = props.headquarterId;

        if (!hqId) {
          console.log('No headquarterId in props, fetching from supervisor');
          const supervisorId = authStore.currentUserId;
          console.log('SupervisorId from auth store:', supervisorId);

          if (!supervisorId) {
            throw new Error('No supervisor ID available');
          }

          console.log('Calling getHeadquarterBySupervisorId with:', supervisorId);
          const response = await bookingService.getHeadquarterBySupervisorId(supervisorId);
          console.log('Headquarter response:', response);

          if (!response?.data) {
            throw new Error('No headquarter data returned for this supervisor');
          }

          headquarter.value = response.data;
          hqId = headquarter.value.headquarterId || headquarter.value.id;
          console.log('Found headquarter ID:', hqId);

          if (!hqId) {
            throw new Error('Invalid headquarter data structure');
          }
        }


        console.log('Fetching cubicles for headquarter ID:', hqId);
        const cubiclesResponse = await bookingService.getCubiclesByHeadquarterId(hqId);
        console.log('Cubicles response:', cubiclesResponse);

        if (Array.isArray(cubiclesResponse.data)) {
          cubicles.value = cubiclesResponse.data.map(t => {
            console.log('Processing cubicle:', t);
            return {
              id: t.id,
              headquarterId: hqId,
              cubicleNumber: t.cubicleNumber || t.number || 0,
              seats: t.seats || 0,
              status: t.status || 'available'
            };
          });
          console.log('Processed cubicles:', cubicles.value);
        } else {
          console.error('Invalid cubicle data format:', cubiclesResponse.data);
          throw new Error('Invalid cubicle data format received');
        }
      } catch (err) {
        error.value = `Error al cargar cubiculos: ${err.message}`;
        console.error('Error fetching cubicles data:', err);
      } finally {
        loading.value = false;
        console.log('Final cubicles value:', cubicles.value);
        console.log('Final loading state:', loading.value);
        console.log('Final error state:', error.value);
      }
    };

    onMounted(fetchHeadquarterCubicles);

    return {
      cubicles,
      loading,
      error,
      headquarter
    };
  }
}
</script>

<template>
  <div class="headquarter-cubicles">
    <div v-if="cubicles.length === 0" class="status-message empty">
      <p>No hay cubiculos disponibles en esta sede.</p>
    </div>

    <div v-else class="cubicles-grid">
      <BookingCardCubicle
          v-for="cubicle in cubicles"
          :key="`cubicle-${cubicle.id}`"
          :cubicle="cubicle"
      />
    </div>
  </div>
</template>

<style scoped>
.headquarter-cubicles {
  width: 100%;
}

.cubicles-grid {
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