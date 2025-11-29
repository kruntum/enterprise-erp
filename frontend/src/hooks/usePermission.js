import useAuthStore from '../store/useAuthStore';

/**
 * Custom hook to check if user has specific permission
 */
const usePermission = () => {
    const user = useAuthStore((state) => state.user);

    /**
     * Check if user has a specific permission
     * @param {string} permission - Permission name (e.g., 'CAN_DELETE_USER')
     * @returns {boolean}
     */
    const hasPermission = (permission) => {
        if (!user) return false;

        // Admin has all permissions
        if (user.roles?.includes('ROLE_ADMIN')) {
            return true;
        }

        // Check if user has the specific permission
        // Note: This assumes permissions are included in the JWT response
        // You might need to modify the backend to include permissions in the JWT
        return user.roles?.some(role =>
            // This is a simplified check - in reality, you'd check against actual permissions
            role.includes(permission)
        );
    };

    /**
     * Check if user has a specific role
     * @param {string} role - Role name (e.g., 'ROLE_ADMIN')
     * @returns {boolean}
     */
    const hasRole = (role) => {
        if (!user) return false;
        return user.roles?.includes(role);
    };

    /**
     * Check if user has any of the specified roles
     * @param {string[]} roles - Array of role names
     * @returns {boolean}
     */
    const hasAnyRole = (roles) => {
        if (!user) return false;
        return roles.some(role => user.roles?.includes(role));
    };

    return {
        hasPermission,
        hasRole,
        hasAnyRole,
        user
    };
};

export default usePermission;
