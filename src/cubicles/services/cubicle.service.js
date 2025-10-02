import http from '../../shared/services/http-common';

const resource = '/cubicles';
export default {
  async getAllCubicles() {
    const response = await http.get(resource);
    return response.data;
  },
  async getCubicleById(id) {
    const response = await http.get(`${resource}/${id}`);
    return response.data;
  },
  async createCubicle(cubicleData) {
    const response = await http.post(resource, cubicleData);
    return response.data;
  },
  async deleteCubicle(id) {
    console.log(`Attempting to delete cubicle with ID: ${id}`);
    try {
      const response = await http.delete(`${resource}/${id}`);
      console.log(`Cubicle ${id} deleted successfully with response:`, response.data);
      return response.data;
    } catch (error) {
      console.error('Error deleting cubicle:', error.response?.data || error.message);
      throw error;
    }
  },
  async getCubicleSchedule(cubicleId, date) {
    const response = await http.get(`${resource}/${cubicleId}/schedule?date=${date}`);
    return response.data;
  },
  getCubiclesByHeadquarterId(headquarterId) {
    return http.get(`/cubicles/headquarter/${headquarterId}`);
  },
  getHeadquarterBySupervisorId(supervisorId) {
    return http.get(`/headquarters/supervisors/${supervisorId}`); // Remove leading slash

  }
}; 