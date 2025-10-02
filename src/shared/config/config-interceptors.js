import { http } from '../services/http-common'; // Importa http
import { authenticationInterceptor } from "@/iam/services/authentication.interceptor.js";

export const setupInterceptors = () => {
    http.interceptors.request.use(authenticationInterceptor);
};