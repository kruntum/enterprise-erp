import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

import useAuthStore from '../store/useAuthStore';

api.interceptors.request.use(
    (config) => {
        // Read from Zustand persist storage
        const storage = localStorage.getItem('auth-storage');
        if (storage) {
            const { state } = JSON.parse(storage);
            if (state?.user?.token) {
                config.headers['Authorization'] = 'Bearer ' + state.user.token;
            }
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
            console.log(error);
            if (status === 401) {
                // Unauthorized - token expired or invalid
                // Only redirect if we are not already on the login page
                if (window.location.pathname !== '/login') {
                    toast.error('Session expired. Please login again.');
                    // Use the store's logout action to clean up state
                    useAuthStore.getState().logout();
                    // Optional: Add a small delay or check if it's a soft 401
                    setTimeout(() => {
                        window.location.href = '/login';
                    }, 1000);
                }
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
            console.error('Network Error:', error);
            // Don't logout on network error, just show toast
            toast.error('Network error. Please check your connection.');
        }

        return Promise.reject(error);
    }
);

export default api;
