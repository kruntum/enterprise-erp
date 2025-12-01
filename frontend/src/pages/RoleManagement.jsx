import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import { toast } from "sonner";
import { Edit2, Trash2, Plus } from 'lucide-react';
import { roleSchema } from '../schemas';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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

const RoleManagement = () => {
    const [roles, setRoles] = useState([]);
    const [permissions, setPermissions] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRole, setEditingRole] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [roleToDelete, setRoleToDelete] = useState(null);

    const { hasPermission, hasRole } = useAuthStore();

    // Check permissions
    const canCreate = hasPermission('CAN_CREATE_ROLE') || hasRole('ROLE_ADMIN');
    const canUpdate = hasPermission('CAN_UPDATE_ROLE') || hasRole('ROLE_ADMIN');
    const canDelete = hasPermission('CAN_DELETE_ROLE') || hasRole('ROLE_ADMIN');

    // Form with validation
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(roleSchema),
        defaultValues: {
            name: '',
            description: '',
            permissions: []
        }
    });

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
            setError("Failed to load roles");
            toast.error("Failed to load roles");
        }
    };

    const fetchPermissions = async () => {
        try {
            const response = await api.get('/permissions');
            setPermissions(response.data);
        } catch (err) {
            console.error("Failed to load permissions", err);
            toast.error("Failed to load permissions");
        }
    };

    const handleOpenModal = (role = null) => {
        if (role) {
            setEditingRole(role);
            reset({
                name: role.name,
                description: role.description || '',
                permissions: role.permissions.map(p => p.id)
            });
        } else {
            setEditingRole(null);
            reset({
                name: '',
                description: '',
                permissions: []
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingRole(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                permissions: permissions.filter(p => data.permissions.includes(p.id))
            };

            if (editingRole) {
                await api.put(`/roles/${editingRole.id}`, payload);
                toast.success("Role updated successfully");
            } else {
                await api.post('/roles', payload);
                toast.success("Role created successfully");
            }

            fetchRoles();
            handleCloseModal();
        } catch (err) {
            console.error(err);
            toast.error(editingRole ? "Failed to update role" : "Failed to create role");
        }
    };

    const handleDeleteClick = (role) => {
        setRoleToDelete(role);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!roleToDelete) return;

        try {
            await api.delete(`/roles/${roleToDelete.id}`);
            setRoles(roles.filter(r => r.id !== roleToDelete.id));
            toast.success("Role deleted successfully");
        } catch (err) {
            toast.error("Failed to delete role");
        } finally {
            setDeleteDialogOpen(false);
            setRoleToDelete(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tight">Role Management</h1>
                {canCreate && (
                    <Button onClick={() => handleOpenModal()}>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Role
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
                            <TableHead>Permissions</TableHead>
                            {(canUpdate || canDelete) && <TableHead className="text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {roles.map((role) => (
                            <TableRow key={role.id}>
                                <TableCell className="font-medium">{role.id}</TableCell>
                                <TableCell>{role.name}</TableCell>
                                <TableCell>{role.description || '-'}</TableCell>
                                <TableCell>
                                    <div className="flex gap-1 flex-wrap">
                                        {role.permissions.map(p => (
                                            <Badge key={p.id} variant="outline">
                                                {p.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                {(canUpdate || canDelete) && (
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            {canUpdate && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleOpenModal(role)}
                                                >
                                                    <Edit2 className="h-4 w-4" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDeleteClick(role)}
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
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingRole ? 'Edit Role' : 'Add Role'}
                        </DialogTitle>
                        <DialogDescription>
                            {editingRole ? 'Update role information and permissions' : 'Create a new role with permissions'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Role Name</Label>
                                <Input
                                    id="name"
                                    {...register("name")}
                                    placeholder="e.g., ROLE_MANAGER"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    {...register("description")}
                                    placeholder="Describe the role"
                                />
                                {errors.description && (
                                    <p className="text-sm text-red-600">{errors.description.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Permissions</Label>
                                <Controller
                                    name="permissions"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto p-2 border rounded-md">
                                            {permissions.map(permission => (
                                                <div key={permission.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`permission-${permission.id}`}
                                                        checked={field.value?.includes(permission.id)}
                                                        onCheckedChange={(checked) => {
                                                            const updatedPerms = checked
                                                                ? [...(field.value || []), permission.id]
                                                                : field.value?.filter(id => id !== permission.id) || [];
                                                            field.onChange(updatedPerms);
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`permission-${permission.id}`}
                                                        className="text-sm font-normal cursor-pointer"
                                                    >
                                                        {permission.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                />
                                {errors.permissions && (
                                    <p className="text-sm text-red-600">{errors.permissions.message}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button type="submit">
                                {editingRole ? 'Update' : 'Create'}
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
                            This will permanently delete the role <strong>{roleToDelete?.name}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setRoleToDelete(null)}>
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

export default RoleManagement;
