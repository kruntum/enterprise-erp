import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import { X, Edit2, Shield, Plus, Trash2 } from 'lucide-react';

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState(null);
    const [showPermModal, setShowPermModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [selectedPermissions, setSelectedPermissions] = useState([]);
    const [newRole, setNewRole] = useState({ name: '', description: '' });

    const currentUser = useAuthStore((state) => state.user);
    const canManage = currentUser?.roles?.includes('ROLE_ADMIN');

    useEffect(() => {
        fetchRoles();
        fetchPermissions();
    }, []);

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
            setError(null);
        } catch (err) {
            setError("Failed to load roles. You might not have permission.");
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/permissions');
            setPermissions(response.data);
        } catch (err) {
            console.error("Failed to load permissions", err);
        }
    };

    const handleOpenPermModal = (role) => {
        setEditingRole(role);
        setSelectedPermissions(role.permissions.map(p => p.id));
        setShowPermModal(true);
    };

    const handleClosePermModal = () => {
        setShowPermModal(false);
        setEditingRole(null);
        setSelectedPermissions([]);
    };

    const handleOpenCreateModal = () => {
        setNewRole({ name: '', description: '' });
        setShowCreateModal(true);
    };

    const handleCloseCreateModal = () => {
        setShowCreateModal(false);
        setNewRole({ name: '', description: '' });
    };

    const handlePermissionToggle = (permissionId) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const handleSubmitPerm = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/roles/${editingRole.id}/permissions`, selectedPermissions);
            fetchRoles();
            handleClosePermModal();
        } catch (err) {
            alert("Failed to update role permissions");
        }
    };

    const handleSubmitCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/roles', newRole);
            fetchRoles();
            handleCloseCreateModal();
        } catch (err) {
            alert("Failed to create role: " + (err.response?.data?.message || err.message));
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this role?")) return;
        try {
            await api.delete(`/roles/${id}`);
            setRoles(roles.filter(r => r.id !== id));
        } catch (err) {
            alert("Failed to delete role.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Role Management</h1>
                {canManage && (
                    <button
                        onClick={handleOpenCreateModal}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus className="h-5 w-5" />
                        Add Role
                    </button>
                )}
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {roles.map((role) => (
                    <div key={role.id} className="bg-white rounded-lg shadow p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <Shield className="h-8 w-8 text-blue-600 mr-3" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{role.name}</h3>
                                    {role.description && <p className="text-xs text-gray-500">{role.description}</p>}
                                </div>
                            </div>
                            {canManage && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleOpenPermModal(role)}
                                        className="text-blue-600 hover:text-blue-900"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(role.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div>
                            <p className="text-sm font-medium text-gray-700 mb-2">Permissions:</p>
                            {role.permissions.length > 0 ? (
                                <div className="space-y-1">
                                    {role.permissions.map(permission => (
                                        <div key={permission.id} className="flex items-center">
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                {permission.name}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-gray-400 italic">No permissions assigned</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Create Role Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Add New Role</h2>
                            <button onClick={handleCloseCreateModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitCreate}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Role Name</label>
                                <input
                                    type="text"
                                    value={newRole.name}
                                    onChange={(e) => setNewRole({ ...newRole, name: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., IT, ACCOUNT, SHIPPING"
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Don't add "ROLE_" prefix, it will be added automatically
                                </p>
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                                <textarea
                                    value={newRole.description}
                                    onChange={(e) => setNewRole({ ...newRole, description: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    rows="3"
                                    placeholder="Describe this role"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseCreateModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Create Role
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit Permissions Modal */}
            {showPermModal && editingRole && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                Edit Permissions for {editingRole.name}
                            </h2>
                            <button onClick={handleClosePermModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmitPerm}>
                            <div className="mb-4">
                                <p className="text-sm text-gray-600 mb-3">
                                    Select permissions to assign to this role:
                                </p>
                                <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-lg p-4">
                                    {permissions.map(permission => (
                                        <label key={permission.id} className="flex items-start p-2 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedPermissions.includes(permission.id)}
                                                onChange={() => handlePermissionToggle(permission.id)}
                                                className="mt-1 mr-3 h-4 w-4 text-blue-600"
                                            />
                                            <div className="flex-1">
                                                <span className="font-medium text-sm text-gray-900">{permission.name}</span>
                                                {permission.description && (
                                                    <p className="text-xs text-gray-500 mt-1">{permission.description}</p>
                                                )}
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button
                                    type="button"
                                    onClick={handleClosePermModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    Update Permissions
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default RoleManagement;
