import http from '@/shared/services/http-common.js';

export class BookingService {

endpoint = '/bookings';

    async getBookingsByClientId(clientId) {
        try {
            return await http.get(`${this.endpoint}/client/${clientId}`);
        } catch (error) {
            // Check if it's a 404 with the specific "No bookings found" message
            if (error.response?.status === 404 &&
                error.response?.data?.message?.includes('No bookings found for client')) {
                // Return empty array instead of throwing an error
                return { data: [] };
            }
            // Re-throw other errors
            throw error;
        }
    }

    async delete(id) {
     return http.delete(`${this.endpoint}/${id}`);
    }

    async create(booking) {
     return http.post(this.endpoint, booking);
    }

    async getById(id) {
     return http.get(`${this.endpoint}/${id}`);
    }

    async update(id, booking) {
     return http.put(`${this.endpoint}/${id}`, booking);
    }
    //booking-supervisor
    getAllBookings() {
        return http.get(`/bookings`); // Remove leading slash
    }

    getCubiclesByHeadquarterId(headquarterId) {
        return http.get(`/cubicles/headquarter/${headquarterId}`); // Remove leading slash
    }

    getCubicleSchedule(cubicleId) {
        // Format date as YYYY-MM-DD
        const today = new Date();
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        return http.get(`/cubicles/${cubicleId}/schedule?date=${formattedDate}`);
    }

    getHeadquarterBySupervisorId(supervisorId) {
        return http.get(`/headquarters/supervisors/${supervisorId}`); // Remove leading slash

    }

    getUserById(userId) {
        return http.get(`/users/${userId}`); // Remove leading slash
    }
    getHeadquarterById(headquarterId) {
        return http.get(`/headquarters/${headquarterId}`);
    }
}
