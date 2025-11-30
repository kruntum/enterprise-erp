import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import { toast } from "sonner";
import { Edit2, Trash2, Plus } from 'lucide-react';
import { permissionSchema } from '../schemas';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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

const PermissionManagement = () => {
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingPermission, setEditingPermission] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [permissionToDelete, setPermissionToDelete] = useState(null);

    const { hasPermission, hasRole } = useAuthStore();

    // Check permissions
    const canCreate = hasPermission('CAN_CREATE_PERMISSION') || hasRole('ROLE_ADMIN');
    const canUpdate = hasPermission('CAN_UPDATE_PERMISSION') || hasRole('ROLE_ADMIN');
    const canDelete = hasPermission('CAN_DELETE_PERMISSION') || hasRole('ROLE_ADMIN');

    // Form with validation
    const { register, handleSubmit, reset, formState: { errors } } = useForm({
        resolver: zodResolver(permissionSchema),
        defaultValues: {
            name: '',
            description: ''
        }
    });

    useEffect(() => {
        fetchPermissions();
    }, []);

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/permissions');
            setPermissions(response.data);
            setError(null);
        } catch (err) {
            setError("Failed to load permissions. You might not have permission.");
            toast.error("Failed to load permissions");
        }
    };

    const handleOpenModal = (permission = null) => {
        if (permission) {
            setEditingPermission(permission);
            reset({
                name: permission.name,
                description: permission.description || ''
            });
        } else {
            setEditingPermission(null);
            reset({
                name: '',
                description: ''
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingPermission(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            if (editingPermission) {
                await api.put(`/permissions/${editingPermission.id}`, data);
                toast.success("Permission updated successfully");
            } else {
                await api.post('/permissions', data);
                toast.success("Permission created successfully");
            }

            fetchPermissions();
            handleCloseModal();
        } catch (err) {
            toast.error(editingPermission ? "Failed to update permission" : "Failed to create permission");
        }
    };

    const handleDeleteClick = (permission) => {
        setPermissionToDelete(permission);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!permissionToDelete) return;

        try {
            await api.delete(`/permissions/${permissionToDelete.id}`);
            setPermissions(permissions.filter(p => p.id !== permissionToDelete.id));
            toast.success("Permission deleted successfully");
        } catch (err) {
            toast.error("Failed to delete permission");
        } finally {
            setDeleteDialogOpen(false);
            setPermissionToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Permission Management</h1>
                {canCreate && (
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Permission
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
                            <TableHead>Name</TableHead>
                            <TableHead>Description</TableHead>
                            {(canUpdate || canDelete) && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {permissions.map((permission) => (
                            <TableRow key={permission.id}>
                                <TableCell className="font-medium">{permission.id}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="font-mono">
                                        {permission.name}
                                    </Badge>
                                </TableCell>
                                <TableCell>{permission.description || '-'}</TableCell>
                                {(canUpdate || canDelete) && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {canUpdate && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenModal(permission)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(permission)}
                                                >
                                                    <Trash2 className="h-4 w-4 text-destructive" />
                                                </Button>
                                            )}
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
                            {editingPermission ? 'Edit Permission' : 'Add Permission'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingPermission ? 'Update permission information' : 'Create a new permission'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Permission Name</Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="e.g., CAN_VIEW_USER"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name.message}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Use uppercase with underscores starting with CAN_ (e.g., CAN_VIEW_USER)
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    {...register("description")}
                                    placeholder="Describe what this permission allows"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description.message}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingPermission ? 'Update' : 'Create'}
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
                            This will permanently delete the permission <strong>{permissionToDelete?.name}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setPermissionToDelete(null)}>
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

export default PermissionManagement;
