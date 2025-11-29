import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { X, Edit2, Trash2, Plus } from 'lucide-react';

const MenuManagement = () => {
    const [menus, setMenus] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingMenu, setEditingMenu] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        path: '',
        icon: '',
        permissionRequired: '',
        parentId: null,
        sortOrder: 0
    });

    useEffect(() => {
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const response = await api.get('/menus');
            // Flatten the menu tree for table display
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
            setFormData({
                label: menu.label,
                path: menu.path,
                icon: menu.icon || '',
                permissionRequired: menu.permissionRequired || '',
                parentId: menu.parentId || null,
                sortOrder: menu.sortOrder
            });
        } else {
            setEditingMenu(null);
            setFormData({
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
        setFormData({ label: '', path: '', icon: '', permissionRequired: '', parentId: null, sortOrder: 0 });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                parentId: formData.parentId === '' ? null : formData.parentId
            };

            if (editingMenu) {
                await api.put(`/menus/${editingMenu.id}`, payload);
            } else {
                await api.post('/menus', payload);
            }

            fetchMenus();
            handleCloseModal();
        } catch (err) {
            alert(editingMenu ? "Failed to update menu" : "Failed to create menu");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this menu?")) return;
        try {
            await api.delete(`/menus/${id}`);
            fetchMenus();
        } catch (err) {
            alert("Failed to delete menu.");
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Menu Management</h1>
                <button
                    onClick={() => handleOpenModal()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <Plus className="h-5 w-5" />
                    Add Menu
                </button>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
                    {error}
                </div>
            )}

            <div className="overflow-hidden rounded-lg bg-white shadow">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Label</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Path</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Icon</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permission</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sort Order</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {menus.map((menu) => (
                            <tr key={menu.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    <span style={{ paddingLeft: `${menu.level * 20}px` }}>
                                        {menu.level > 0 && '└─ '}
                                        {menu.label}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.path}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.icon}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.permissionRequired || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{menu.sortOrder}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => handleOpenModal(menu)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        <Edit2 className="h-5 w-5" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(menu.id)}
                                        className="text-red-600 hover:text-red-900"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">
                                {editingMenu ? 'Edit Menu' : 'Add Menu'}
                            </h2>
                            <button onClick={handleCloseModal} className="text-gray-500 hover:text-gray-700">
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Label</label>
                                <input
                                    type="text"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Path</label>
                                <input
                                    type="text"
                                    value={formData.path}
                                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Icon</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Permission Required</label>
                                <input
                                    type="text"
                                    value={formData.permissionRequired}
                                    onChange={(e) => setFormData({ ...formData, permissionRequired: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="e.g., CAN_MANAGE_USERS"
                                />
                            </div>

                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">Sort Order</label>
                                <input
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingMenu ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MenuManagement;
