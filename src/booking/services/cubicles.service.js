// src/booking/services/cubicles.service.js
import http from "@/shared/services/http-common.js";

export class CubiclesService {
    resourceEndpoint = import.meta.env.VITE_CUBICLES_ENDPOINT_PATH;

    async getAllCubicles() {
        return http.get(this.resourceEndpoint);
    }

    async getCubicleById(cubicleId) {
        return http.get(`${this.resourceEndpoint}/${cubicleId}`);
    }


    async getCubiclesByHeadquarter(headquarterId) {
        return http.get(`${this.resourceEndpoint}/headquarter/${headquarterId}`);
    }

    async createCubicle(cubicleData) {
        return http.post(this.resourceEndpoint, cubicleData);
    }

    async getCubicleSchedule(cubicleId, date) {
        return http.get(`${this.resourceEndpoint}/${cubicleId}/schedule?date=${date}`);
    }
}