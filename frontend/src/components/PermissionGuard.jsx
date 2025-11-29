import React from 'react';
import usePermission from '../hooks/usePermission';

/**
 * Component to conditionally render children based on permission
 * 
 * @example
 * <PermissionGuard permission="CAN_DELETE_USER">
 *   <button onClick={handleDelete}>Delete</button>
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard role="ROLE_ADMIN">
 *   <AdminPanel />
 * </PermissionGuard>
 */
const PermissionGuard = ({ children, permission, role, anyRole, fallback = null }) => {
    const { hasPermission, hasRole, hasAnyRole } = usePermission();

    let hasAccess = false;

    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (role) {
        hasAccess = hasRole(role);
    } else if (anyRole) {
        hasAccess = hasAnyRole(anyRole);
    }

    return hasAccess ? children : fallback;
};

export default PermissionGuard;
