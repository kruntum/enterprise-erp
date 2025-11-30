import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(
    (config) => {
        const user = JSON.parse(localStorage.getItem('user'));
        if (user && user.token) {
            config.headers['Authorization'] = 'Bearer ' + user.token;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response) {
            const status = error.response.status;

            if (status === 401) {
                // Unauthorized - token expired or invalid
                toast.error('Session expired. Please login again.');
                localStorage.removeItem('user');
                window.location.href = '/login';
            } else if (status === 403) {
                // Forbidden - no permission
                toast.error('Access denied. You do not have permission to perform this action.');
            } else if (status === 404) {
                toast.error('Resource not found.');
            } else if (status === 500) {
                toast.error('Server error. Please try again later.');
            } else if (status === 400) {
                const message = error.response.data?.message || 'Invalid request.';
                toast.error(message);
            }
        } else if (error.request) {
            // Network error
            toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

export default api;
