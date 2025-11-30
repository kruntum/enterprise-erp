import { create } from 'zustand';
import api from '../api/axios';

const useAuthStore = create((set) => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    isAuthenticated: !!localStorage.getItem('user'),
    isLoading: false,
    error: null,

    login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
            const response = await api.post('/auth/signin', { username, password });
            const userData = response.data;
            localStorage.setItem('user', JSON.stringify(userData));
            set({ user: userData, isAuthenticated: true, isLoading: false });
            return userData;
        } catch (error) {
            set({
                error: error.response?.data?.message || 'Login failed',
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        localStorage.removeItem('user');
        set({ user: null, isAuthenticated: false });
    },

    // Check if user has a specific permission
    hasPermission: (permission) => {
        const { user } = useAuthStore.getState();
        if (!user || !user.roles) return false;

        // Check if any role has the permission
        return user.roles.some(role =>
            role.permissions && role.permissions.some(p => p.name === permission)
        );
    },

    // Check if user has a specific role
    hasRole: (roleName) => {
        const { user } = useAuthStore.getState();
        if (!user || !user.roles) return false;

        return user.roles.some(role => role.name === roleName);
    },

    // Check if user has any of the specified permissions
    hasAnyPermission: (permissions) => {
        const { hasPermission } = useAuthStore.getState();
        return permissions.some(permission => hasPermission(permission));
    },

    // Check if user has any of the specified roles
    hasAnyRole: (roles) => {
        const { hasRole } = useAuthStore.getState();
        return roles.some(role => hasRole(role));
    },
}));

export default useAuthStore;
