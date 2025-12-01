import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import api from '../api/axios';

const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            isAuthenticated: false,
            isLoading: false,
            error: null,

            login: async (username, password) => {
                set({ isLoading: true, error: null });
                try {
                    const response = await api.post('/auth/signin', { username, password });
                    const userData = response.data;
                    // localStorage is handled by persist middleware now
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
                set({ user: null, isAuthenticated: false });
                localStorage.removeItem('auth-storage'); // Clear persist storage
            },

            // Check if user has a specific permission
            hasPermission: (permission) => {
                const { user } = get();
                if (!user || !user.roles) return false;

                // Check if any role has the permission
                return user.roles.some(role => {
                    // Handle if role is an object with permissions array
                    if (typeof role === 'object' && role.permissions) {
                        return role.permissions.some(p => {
                            // Permission can be string or object
                            return typeof p === 'string' ? p === permission : p.name === permission;
                        });
                    }
                    return false;
                });
            },

            // Check if user has a specific role
            hasRole: (roleName) => {
                const { user } = get();
                if (!user || !user.roles) return false;

                // Handle both string array and object array
                return user.roles.some(role => {
                    // If role is a string, compare directly
                    if (typeof role === 'string') {
                        return role === roleName;
                    }
                    // If role is an object, compare the name property
                    if (typeof role === 'object' && role.name) {
                        return role.name === roleName;
                    }
                    return false;
                });
            },

            // Check if user has any of the specified permissions
            hasAnyPermission: (permissions) => {
                const { hasPermission } = get();
                return permissions.some(permission => hasPermission(permission));
            },

            // Check if user has any of the specified roles
            hasAnyRole: (roles) => {
                const { hasRole } = get();
                return roles.some(role => hasRole(role));
            },
        }),
        {
            name: 'auth-storage', // unique name for localStorage key
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({ user: state.user, isAuthenticated: state.isAuthenticated }), // only persist these fields
        }
    )
);

export default useAuthStore;
