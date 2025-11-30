import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from "sonner";
import { Edit2, Trash2, Plus } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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
    const [editingMenu, setEditingMenu] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState(null);
    const [formData, setFormData] = useState({
        label: '',
        path: '',
        icon: '',
        permissionRequired: '',
        parentId: null,
        sortOrder: 0
    });

    const currentUser = useAuthStore((state) => state.user);
    const canManage = currentUser?.roles?.includes('ROLE_ADMIN');

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
            toast.error("Failed to load menus");
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
                toast.success("Menu updated successfully");
            } else {
                await api.post('/menus', payload);
                toast.success("Menu created successfully");
            }

            fetchMenus();
            handleCloseModal();
        } catch (err) {
            toast.error(editingMenu ? "Failed to update menu" : "Failed to create menu");
        }
    };

    const handleDeleteClick = (menu) => {
        setMenuToDelete(menu);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!menuToDelete) return;

        try {
            await api.delete(`/menus/${menuToDelete.id}`);
            fetchMenus();
            toast.success("Menu deleted successfully");
        } catch (err) {
            toast.error("Failed to delete menu");
        } finally {
            setDeleteDialogOpen(false);
            setMenuToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Menu Management</h1>
                {canManage && (
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Menu
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Label</TableHead>
                            <TableHead>Path</TableHead>
                            <TableHead>Icon</TableHead>
                            <TableHead>Permission</TableHead>
                            <TableHead>Sort Order</TableHead>
                            {canManage && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {menus.map((menu) => (
                            <TableRow key={menu.id}>
                                <TableCell className="font-medium">{menu.id}</TableCell>
                                <TableCell>
                                    <span style={{ paddingLeft: `${menu.level * 20}px` }}>
                                        {menu.level > 0 && '└─ '}
                                        {menu.label}
                                    </span>
                                </TableCell>
                                <TableCell>{menu.path}</TableCell>
                                <TableCell>{menu.icon}</TableCell>
                                <TableCell>{menu.permissionRequired || '-'}</TableCell>
                                <TableCell>{menu.sortOrder}</TableCell>
                                {canManage && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleOpenModal(menu)}
                                            >
                                                <Edit2 className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleDeleteClick(menu)}
                                            >
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                )}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Create/Edit Dialog */}
            <Dialog open={showModal} onOpenChange={setShowModal}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {editingMenu ? 'Edit Menu' : 'Add Menu'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingMenu ? 'Update menu information' : 'Create a new menu item'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="label">Label</Label>
                                <Input
                                    id="label"
                                    value={formData.label}
                                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="path">Path</Label>
                                <Input
                                    id="path"
                                    value={formData.path}
                                    onChange={(e) => setFormData({ ...formData, path: e.target.value })}
                                    placeholder="/example"
                                    required
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="icon">Icon</Label>
                                <Input
                                    id="icon"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    placeholder="dashboard"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="permission">Permission Required</Label>
                                <Input
                                    id="permission"
                                    value={formData.permissionRequired}
                                    onChange={(e) => setFormData({ ...formData, permissionRequired: e.target.value })}
                                    placeholder="CAN_VIEW_USER"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="sortOrder">Sort Order</Label>
                                <Input
                                    id="sortOrder"
                                    type="number"
                                    value={formData.sortOrder}
                                    onChange={(e) => setFormData({ ...formData, sortOrder: parseInt(e.target.value) })}
                                    required
                                />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingMenu ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete the menu <strong>{menuToDelete?.label}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setMenuToDelete(null)}>
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm}>
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default MenuManagement;
