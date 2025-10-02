import http from "@/shared/services/http-common.js";

export class BranchingApiService {
    //Headquarter endpoints
    async getHeadquarterBySupervisorId(supervisorId) {
        return http.get(`/headquarters/supervisors/${supervisorId}`);
    }

    async getHeadquarterById(headquarterId) {
        return http.get(`/headquarters/${headquarterId}`);
    }

    async getAllHeadquarters() {
        return http.get('/headquarters');
    }

    async getAllUsers() {
        return http.get('/users');
    }

    async getRoles() {
        return http.get('/roles');
    }

    async createHeadquarter(headquarter) {
        return http.post('/headquarters', headquarter);
    }
    async assignSupervisorToHeadquarter(headquarterId, supervisorId) {
        return http.post(`/headquarters/${headquarterId}/supervisors/${supervisorId}`);
    }
    async removeSupervisorFromHeadquarter(headquarterId, supervisorId) {
        return http.delete(`/headquarters/${headquarterId}/supervisors/${supervisorId}`);
    }
    async getSupervisorsByHeadquarterId(headquarterId) {
        return http.get(`/headquarters/${headquarterId}/supervisors`);
    }
    async getSupervisors(supervisorId) {
        return http.get(`/headquarters/supervisors/${supervisorId}`);
    }
    registerUser(userData) {
      return http.post('/authentication/sign-up', userData);
    }
}