import axios from 'axios';
//import {authenticationInterceptor} from "@/iam/services/authentication.interceptor.js";

const API_BASE_URL = /*import.meta.env.VITE_API_BASE_URL ||*/ 'http://localhost:8080/api/v1';

export const http = axios.create({
    baseURL: API_BASE_URL,
});

http.defaults.headers.common['Content-Type'] = 'application/json';
http.defaults.headers.common['Access-Control-Allow-Origin'] = '*';

// Add a request interceptor
//http.interceptors.request.use(authenticationInterceptor);

export default http;
