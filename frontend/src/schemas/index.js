import { z } from 'zod';

// User Validation Schema
export const userSchema = z.object({
    username: z.string()
        .min(3, 'Username must be at least 3 characters')
        .max(50, 'Username must not exceed 50 characters')
        .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),

    email: z.string()
        .email('Invalid email address')
        .min(1, 'Email is required'),

    password: z.string()
        .min(8, 'Password must be at least 8 characters')
        .optional()
        .or(z.literal('')),

    roles: z.array(z.number())
        .min(1, 'At least one role must be selected')
});

// Role Validation Schema
export const roleSchema = z.object({
    name: z.string()
        .min(1, 'Role name is required')
        .max(100, 'Role name must not exceed 100 characters')
        .regex(/^[A-Z_]+$/, 'Role name should be uppercase with underscores (e.g., ROLE_ADMIN)'),

    description: z.string()
        .max(255, 'Description must not exceed 255 characters')
        .optional()
        .or(z.literal('')),

    permissions: z.array(z.number())
        .min(1, 'At least one permission must be selected')
});

// Permission Validation Schema
export const permissionSchema = z.object({
    name: z.string()
        .min(1, 'Permission name is required')
        .max(100, 'Permission name must not exceed 100 characters')
        .regex(/^CAN_[A-Z_]+$/, 'Permission name should start with CAN_ and be uppercase (e.g., CAN_VIEW_USER)'),

    description: z.string()
        .max(255, 'Description must not exceed 255 characters')
        .optional()
        .or(z.literal(''))
});

// Menu Validation Schema
export const menuSchema = z.object({
    label: z.string()
        .min(1, 'Label is required')
        .max(100, 'Label must not exceed 100 characters'),

    path: z.string()
        .min(1, 'Path is required')
        .regex(/^\/[a-z0-9/-]*$/, 'Path must start with / and contain only lowercase letters, numbers, and hyphens'),

    icon: z.string()
        .max(50, 'Icon name must not exceed 50 characters')
        .optional()
        .or(z.literal('')),

    permissionRequired: z.string()
        .max(100, 'Permission must not exceed 100 characters')
        .optional()
        .or(z.literal('')),

    parentId: z.number()
        .nullable()
        .optional(),

    sortOrder: z.number()
        .int('Sort order must be an integer')
        .min(0, 'Sort order must be 0 or greater')
});
