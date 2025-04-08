import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true, // Required for cookies/session to work
    headers: {
        'X-Requested-With': 'XMLHttpRequest', // Required for Laravel to detect AJAX request
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Get CSRF cookie before making requests
export const initializeCsrf = async () => {
    await axiosInstance.get('/sanctum/csrf-cookie');
};

export default axiosInstance;
