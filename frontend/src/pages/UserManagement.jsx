import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import { toast } from "sonner";
import { Edit2, Trash2, Plus } from 'lucide-react';
import { userSchema } from '../schemas';
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

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState(null);

    const { hasPermission, hasRole } = useAuthStore();

    // Check permissions
    const canCreate = hasPermission('CAN_CREATE_USER') || hasRole('ROLE_ADMIN');
    const canUpdate = hasPermission('CAN_UPDATE_USER') || hasRole('ROLE_ADMIN');
    const canDelete = hasPermission('CAN_DELETE_USER') || hasRole('ROLE_ADMIN');

    // Form with validation
    const { register, handleSubmit, control, reset, formState: { errors } } = useForm({
        resolver: zodResolver(userSchema),
        defaultValues: {
            username: '',
            email: '',
            password: '',
            roles: []
        }
    });

    useEffect(() => {
        fetchUsers();
        fetchRoles();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
            setError(null);
        } catch (err) {
            setError("Failed to load users. You might not have permission.");
            toast.error("Failed to load users");
        }
    };

    const fetchRoles = async () => {
        try {
            const response = await api.get('/roles');
            setRoles(response.data);
        } catch (err) {
            console.error("Failed to load roles", err);
            toast.error("Failed to load roles");
        }
    };

    const handleOpenModal = (user = null) => {
        if (user) {
            setEditingUser(user);
            reset({
                username: user.username,
                email: user.email,
                password: '',
                roles: user.roles.map(r => r.id)
            });
        } else {
            setEditingUser(null);
            reset({
                username: '',
                email: '',
                password: '',
                roles: []
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setEditingUser(null);
        reset();
    };

    const onSubmit = async (data) => {
        try {
            const payload = {
                ...data,
                roles: roles.filter(r => data.roles.includes(r.id))
            };

            // Remove password if it's empty during edit
            if (editingUser && !data.password) {
                delete payload.password;
            }

            if (editingUser) {
                await api.put(`/users/${editingUser.id}`, payload);
                toast.success("User updated successfully");
            } else {
                await api.post('/users', payload);
                toast.success("User created successfully");
            }

            fetchUsers();
            handleCloseModal();
        } catch (err) {
            toast.error(editingUser ? "Failed to update user" : "Failed to create user");
        }
    };

    const handleDeleteClick = (user) => {
        setUserToDelete(user);
        setDeleteDialogOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;

        try {
            await api.delete(`/users/${userToDelete.id}`);
            setUsers(users.filter(u => u.id !== userToDelete.id));
            toast.success("User deleted successfully");
        } catch (err) {
            toast.error("Failed to delete user");
        } finally {
            setDeleteDialogOpen(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex justify-between items-center">
                <h1 className="text-xl font-semibold tracking-tight">User Management</h1>
                {canCreate && (
                    <Button size="sm" onClick={() => handleOpenModal()}>
                        <Plus className="mr-1.5 h-3.5 w-3.5" />
                        Add User
                    </Button>
                )}
            </div>

            {error && (
                <Alert variant="destructive" className="py-2">
                    <AlertDescription className="text-xs">{error}</AlertDescription>
                </Alert>
            )}

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow className="text-xs">
                            <TableHead className="h-9 py-2">ID</TableHead>
                            <TableHead className="h-9 py-2">Username</TableHead>
                            <TableHead className="h-9 py-2">Email</TableHead>
                            <TableHead className="h-9 py-2">Roles</TableHead>
                            {(canUpdate || canDelete) && <TableHead className="h-9 py-2 text-right">Actions</TableHead>}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user) => (
                            <TableRow key={user.id} className="text-xs">
                                <TableCell className="font-medium py-2">{user.id}</TableCell>
                                <TableCell className="py-2">{user.username}</TableCell>
                                <TableCell className="py-2">{user.email}</TableCell>
                                <TableCell className="py-2">
                                    <div className="flex gap-1 flex-wrap">
                                        {user.roles.map(r => (
                                            <Badge key={r.id} variant="secondary" className="text-[10px] px-1.5 py-0">
                                                {r.name}
                                            </Badge>
                                        ))}
                                    </div>
                                </TableCell>
                                {(canUpdate || canDelete) && (
                                    <TableCell className="text-right py-2">
                                        <div className="flex justify-end gap-1">
                                            {canUpdate && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => handleOpenModal(user)}
                                                >
                                                    <Edit2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                            {canDelete && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-7 w-7 p-0"
                                                    onClick={() => handleDeleteClick(user)}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
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
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-base">
                            {editingUser ? 'Edit User' : 'Add User'}
                        </DialogTitle>
                        <DialogDescription className="text-xs">
                            {editingUser ? 'Update user information and roles' : 'Create a new user account'}
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="space-y-3 py-3">
                            <div className="space-y-1.5">
                                <Label htmlFor="username" className="text-xs">Username</Label>
                                <Input
                                    id="username"
                                    className="h-9 text-sm"
                                    {...register("username")}
                                />
                                {errors.username && (
                                    <p className="text-xs text-red-600">{errors.username.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-xs">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    className="h-9 text-sm"
                                    {...register("email")}
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs">
                                    Password {editingUser && '(leave blank to keep current)'}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    className="h-9 text-sm"
                                    {...register("password")}
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label className="text-xs">Roles</Label>
                                <Controller
                                    name="roles"
                                    control={control}
                                    render={({ field }) => (
                                        <div className="space-y-1.5">
                                            {roles.map(role => (
                                                <div key={role.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`role-${role.id}`}
                                                        checked={field.value?.includes(role.id)}
                                                        onCheckedChange={(checked) => {
                                                            const updatedRoles = checked
                                                                ? [...(field.value || []), role.id]
                                                                : field.value?.filter(id => id !== role.id) || [];
                                                            field.onChange(updatedRoles);
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`role-${role.id}`}
                                                        className="text-xs font-normal cursor-pointer"
                                                    >
                                                        {role.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                />
                                {errors.roles && (
                                    <p className="text-xs text-red-600">{errors.roles.message}</p>
                                )}
                            </div>
                        </div>

                        <DialogFooter>
                            <Button type="button" size="sm" variant="outline" onClick={handleCloseModal}>
                                Cancel
                            </Button>
                            <Button type="submit" size="sm">
                                {editingUser ? 'Update' : 'Create'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle className="text-base">Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription className="text-xs">
                            This will permanently delete the user <strong>{userToDelete?.username}</strong>.
                            This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setUserToDelete(null)} className="h-9 text-sm">
                            Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteConfirm} className="h-9 text-sm">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default UserManagement;
