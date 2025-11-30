import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from 'lucide-react';

const Sidebar = () => {
    const [menus, setMenus] = useState([]);
    const location = useLocation();
    const logout = useAuthStore((state) => state.logout);
    const user = useAuthStore((state) => state.user);

    useEffect(() => {
        const fetchMenus = async () => {
            try {
                const response = await api.get('/menus');
                setMenus(response.data);
            } catch (error) {
                console.error("Failed to fetch menus", error);
            }
        };

        fetchMenus();
    }, []);

    const hasPermission = (menu) => {
        if (!menu.permissionRequired) return true;
        if (user?.roles?.includes('ROLE_ADMIN')) return true;
        return true;
    };

    const getIcon = (iconName) => {
        if (!iconName) return LucideIcons.Menu;

        // Convert kebab-case to PascalCase (e.g., 'user-pen' -> 'UserPen')
        const pascalCaseName = iconName
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join('');

        // Return the icon component if it exists, otherwise default to Menu
        return LucideIcons[pascalCaseName] || LucideIcons[iconName] || LucideIcons.Menu;
    };

    const renderMenuItem = (menu) => {
        if (!hasPermission(menu)) return null;

        const isActive = location.pathname === menu.path;
        const Icon = getIcon(menu.icon);

        return (
            <li key={menu.id}>
                <Button
                    variant={isActive ? "secondary" : "ghost"}
                    size="sm"
                    className={`w-full justify-start h-8 text-xs font-normal ${isActive ? 'bg-primary text-primary-foreground hover:bg-primary/90' : ''}`}
                    asChild
                >
                    <Link to={menu.path}>
                        <Icon className="mr-2 h-3.5 w-3.5" />
                        {menu.label}
                    </Link>
                </Button>
                {menu.children && menu.children.length > 0 && (
                    <ul className="ml-4 mt-0.5 space-y-0.5 border-l border-border pl-2">
                        {menu.children.map(child => renderMenuItem(child))}
                    </ul>
                )}
            </li>
        );
    };

    return (
        <div className="flex h-full w-56 flex-col border-r bg-card text-card-foreground">
            <div className="flex h-12 items-center px-3 border-b">
                <h1 className="text-base font-semibold">Enterprise ERP</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-2 px-2">
                <ul className="space-y-0.5">
                    {menus.map((menu) => renderMenuItem(menu))}
                </ul>
            </nav>

            <div className="border-t p-2">
                <div className="mb-2 flex items-center px-2 py-1.5">
                    <Badge className="h-7 w-7 rounded-full flex items-center justify-center text-xs shrink-0">
                        {user?.username?.charAt(0).toUpperCase()}
                    </Badge>
                    <div className="ml-2 flex-1 min-w-0">
                        <p className="text-xs font-medium truncate">{user?.username}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{user?.email}</p>
                    </div>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="w-full justify-start h-8 text-xs"
                    onClick={logout}
                >
                    <LucideIcons.LogOut className="mr-2 h-3 w-3" />
                    Logout
                </Button>
            </div>
        </div>
    );
};

export default Sidebar;
