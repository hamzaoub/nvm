import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

// Create a custom instance of axios with CSRF handling
const axiosInstance = axios.create({
    baseURL: API_URL,
    withCredentials: true,  // Required for handling cookies
    headers: {
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    }
});

// Function to get CSRF token from cookie
const getCSRFToken = () => {
    const name = 'XSRF-TOKEN';
    let token = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                token = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return token;
};

// Function to get CSRF cookie from Laravel
export const getCsrfToken = async () => {
    try {
        // First ensure we're authenticated with Sanctum
        await axios.get(`${API_URL}sanctum/csrf-cookie`, {
            withCredentials: true,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                'Accept': 'application/json'
            }
        });

        // Wait a brief moment to ensure cookie is set
        await new Promise(resolve => setTimeout(resolve, 100));

        const token = getCSRFToken();
        if (!token) {
            throw new Error('CSRF token not found after fetching');
        }
        console.log('CSRF token fetched successfully');
        return token;
    } catch (error) {
        console.error('Failed to fetch CSRF token:', error);
        throw error;
    }
};

// Add request interceptor to handle CSRF token
axiosInstance.interceptors.request.use(
    async (config) => {
        if (config.method !== 'get') {
            try {
                // Always get a fresh token for non-GET requests
                const token = await getCsrfToken();
                config.headers['X-XSRF-TOKEN'] = token;
            } catch (error) {
                console.error('Error setting CSRF token:', error);
                // Still try to proceed with the request
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            const errorMessage = error.response.data.message || error.response.data.error || 'An error occurred';
            return Promise.reject({
                message: errorMessage,
                status: error.response.status,
                data: error.response.data
            });
        } else if (error.request) {
            // The request was made but no response was received
            return Promise.reject({
                message: 'No response received from server',
                status: 0,
                data: null
            });
        } else {
            // Something happened in setting up the request that triggered an Error
            return Promise.reject({
                message: error.message || 'An unexpected error occurred',
                status: 0,
                data: null
            });
        }
    }
);

export default axiosInstance;
