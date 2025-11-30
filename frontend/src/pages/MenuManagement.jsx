import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/axios';
import { X, Edit2, Trash2, Plus } from 'lucide-react';
import { toast } from 'sonner';
import useAuthStore from '../store/useAuthStore';
import { menuSchema } from '../schemas';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const MenuManagement = () => {
    const [menus, setMenus] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState(null);
    const [editingMenu, setEditingMenu] = useState(null);
    const { hasPermission, hasRole } = useAuthStore();

    // Permission checks
    const canCreate = hasPermission('CAN_CREATE_MENU') || hasRole('ROLE_ADMIN');
    const canUpdate = hasPermission('CAN_UPDATE_MENU') || hasRole('ROLE_ADMIN');
    const canDelete = hasPermission('CAN_DELETE_MENU') || hasRole('ROLE_ADMIN');

    // Form with validation
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(menuSchema),
        defaultValues: {
            label: '',
            path: '',
            icon: '',
            permissionRequired: '',
            parentId: null,
            sortOrder: 0
        }
    });

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await api.get('/menus');
            const flatMenus = flattenMenuTree(response.data);
            setMenus(flatMenus);
            setError(null);
        } catch (err) {
            setError("Failed to load menus.");
        }
    };

    const flattenMenuTree = (menuTree, level = 0) => {
        let result = [];
        menuTree.forEach(menu => {
            result.push({ ...menu, level });
            if (menu.children && menu.children.length > 0) {
                result = result.concat(flattenMenuTree(menu.children, level + 1));
            }
        });
        return result;
    };

    const handleOpenModal = (menu = null) => {
        if (menu) {
            setEditingMenu(menu);
            reset({
                label: menu.label,
                path: menu.path,
                icon: menu.icon || '',
                permissionRequired: menu.permissionRequired || '',
                parentId: menu.parentId || null,
                sortOrder: menu.sortOrder
            });
        } else {
            setEditingMenu(null);
            reset({
                label: '',
                path: '',
                icon: '',
                permissionRequired: '',
                parentId: null,
                sortOrder: 0
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingMenu(null);
        reset();
    };

    const onSubmit = async (data) => {
        const loadingToast = toast.loading(editingMenu ? 'Updating menu...' : 'Creating menu...');

        try {
            const payload = {
                ...data,
                parentId: data.parentId === '' || data.parentId === 'null' ? null : data.parentId
            };

            if (editingMenu) {
                await api.put(`/menus/${editingMenu.id}`, payload);
                toast.success('Menu updated successfully!', { id: loadingToast });
            } else {
                await api.post('/menus', payload);
                toast.success('Menu created successfully!', { id: loadingToast });
            }

            fetchMenus();
            handleCloseModal();
        } catch (err) {
            toast.error('Failed to save menu', { id: loadingToast });
        }
    };

    const handleDeleteClick = (menu) => {
        setMenuToDelete(menu);
        setShowDeleteDialog(true);
    };

    const handleConfirmDelete = async () => {
        if (!menuToDelete) return;

        const loadingToast = toast.loading('Deleting menu...');

        try {
            await api.delete(`/menus/${menuToDelete.id}`);
            setMenus(menus.filter(m => m.id !== menuToDelete.id));
            toast.success('Menu deleted successfully!', { id: loadingToast });
        } catch (err) {
            toast.error('Failed to delete menu', { id: loadingToast });
        } finally {
            setShowDeleteDialog(false);
            setMenuToDelete(null);
        }
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-4">
                <h1 className="text-2xl font-bold">Menu Management</h1>
                {canCreate && (
                    <button
                        onClick={() => handleOpenModal()}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        Add Menu
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                            {(canUpdate || canDelete) && (
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            )}
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {menus.map((menu) => (
                            <tr key={menu.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{menu.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900" style={{ paddingLeft: `${menu.level * 20 + 24}px` }}>
                                    {menu.label}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.path}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.icon || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.permissionRequired || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.sortOrder}</td>
                                {(canUpdate || canDelete) && (
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        {canUpdate && (
                                            <button
                                                onClick={() => handleOpenModal(menu)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-3"
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        {canDelete && (
                                            <button
                                                onClick={() => handleDeleteClick(menu)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-semibold">
                                {editingMenu ? 'Edit Menu' : 'Add Menu'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Label *</label>
                                <input
                                    type="text"
                                    {...register("label")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.label && (
                                    <p className="text-sm text-red-600 mt-1">{errors.label.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Path *</label>
                                <input
                                    type="text"
                                    {...register("path")}
                                    placeholder="/example"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.path && (
                                    <p className="text-sm text-red-600 mt-1">{errors.path.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                                <input
                                    type="text"
                                    {...register("icon")}
                                    placeholder="dashboard"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.icon && (
                                    <p className="text-sm text-red-600 mt-1">{errors.icon.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Permission Required</label>
                                <input
                                    type="text"
                                    {...register("permissionRequired")}
                                    placeholder="CAN_VIEW_MENU"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.permissionRequired && (
                                    <p className="text-sm text-red-600 mt-1">{errors.permissionRequired.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Parent Menu</label>
                                <select
                                    {...register("parentId", {
                                        setValueAs: v => v === '' || v === 'null' ? null : Number(v)
                                    })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">None (Top Level)</option>
                                    {menus.filter(m => m.level === 0).map(menu => (
                                        <option key={menu.id} value={menu.id}>{menu.label}</option>
                                    ))}
                                </select>
                                {errors.parentId && (
                                    <p className="text-sm text-red-600 mt-1">{errors.parentId.message}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order *</label>
                                <input
                                    type="number"
                                    {...register("sortOrder")}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.sortOrder && (
                                    <p className="text-sm text-red-600 mt-1">{errors.sortOrder.message}</p>
                                )}
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                                >
                                    {editingMenu ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Menu</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete "{menuToDelete?.label}"? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => {
                            setShowDeleteDialog(false);
                            setMenuToDelete(null);
                        }}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirmDelete}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MenuManagement;
