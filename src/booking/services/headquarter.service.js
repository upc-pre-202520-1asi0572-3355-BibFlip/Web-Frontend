
import http from "@/shared/services/http-common.js";
import { HeadquarterEntity } from "../model/headquarter.entity.js";

export class HeadquartersService {
    resourceEndpoint = import.meta.env.VITE_HEADQUARTERS_ENDPOINT_PATH;

    async getAllHeadquarters() {
        const response = await http.get(this.resourceEndpoint);
        return response.data.map(item => new HeadquarterEntity(item));
    }

    async getHeadquarterById(headquarterId) {
        const response = await http.get(`${this.resourceEndpoint}/${headquarterId}`);
        return new HeadquarterEntity(response.data);
    }

    async createHeadquarter(headquarterData) {
        return http.post(this.resourceEndpoint, headquarterData);
    }

    getFullAddress(headquarter) {
        if (headquarter.streetAddress) {
            return headquarter.streetAddress;
        }
        return `${headquarter.street} ${headquarter.number}, ${headquarter.city}, ${headquarter.country}`;
    }

    // Método para obtener el horario formateado
    getScheduleString(headquarter) {
        return `${headquarter.openingTime} - ${headquarter.closingTime}`;
    }
}