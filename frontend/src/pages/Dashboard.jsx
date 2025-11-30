import React from 'react';
import useAuthStore from '../store/useAuthStore';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, Menu as MenuIcon, Key } from 'lucide-react';

const Dashboard = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <div className="space-y-4">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                <p className="text-sm text-muted-foreground">
                    Welcome back, {user?.username}
                </p>
            </div>

            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                <Card className="compact-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 py-3 px-4">
                        <CardTitle className="text-xs font-medium">
                            Account
                        </CardTitle>
                        <Users className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                        <div className="text-lg font-semibold">{user?.username}</div>
                        <p className="text-xs text-muted-foreground truncate">
                            {user?.email}
                        </p>
                    </CardContent>
                </Card>

                <Card className="compact-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 py-3 px-4">
                        <CardTitle className="text-xs font-medium">
                            Roles
                        </CardTitle>
                        <Shield className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                        <div className="flex flex-wrap gap-1">
                            {user?.roles?.map((role) => (
                                <Badge key={role} variant="secondary" className="text-[10px] px-1.5 py-0">
                                    {role}
                                </Badge>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                <Card className="compact-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 py-3 px-4">
                        <CardTitle className="text-xs font-medium">
                            Navigation
                        </CardTitle>
                        <MenuIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                        <p className="text-xs text-muted-foreground">
                            Use sidebar to access modules
                        </p>
                    </CardContent>
                </Card>

                <Card className="compact-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 py-3 px-4">
                        <CardTitle className="text-xs font-medium">
                            Security
                        </CardTitle>
                        <Key className="h-3.5 w-3.5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                        <p className="text-xs text-muted-foreground">
                            RBAC enabled
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
                <Card className="compact-card">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-sm">System Information</CardTitle>
                        <CardDescription className="text-xs">Enterprise ERP System</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2 px-4 space-y-1.5">
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Status</span>
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Active</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-muted-foreground">Version</span>
                            <span className="text-xs font-medium">1.0.0</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="compact-card">
                    <CardHeader className="py-3 px-4">
                        <CardTitle className="text-sm">Recent Activity</CardTitle>
                        <CardDescription className="text-xs">Your recent actions</CardDescription>
                    </CardHeader>
                    <CardContent className="py-2 px-4">
                        <p className="text-xs text-muted-foreground">No recent activity</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
