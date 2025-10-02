import http from "@/shared/services/http-common.js";

export class ReservationService {
    resourceEndpoint = import.meta.env.VITE_BOOKINGS_ENDPOINT_PATH;

    getCubicleSchedule(cubicleId, date) {
        return http.get(`/cubicles/${cubicleId}/schedule?date=${date}`);
    }
    async createReservation(reservationData) {
        return http.post(this.resourceEndpoint, reservationData);
    }
}