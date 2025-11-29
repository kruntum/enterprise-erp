import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/axios';
import useAuthStore from '../store/useAuthStore';
import {
    Home,
    Users,
    Settings,
    Menu as MenuIcon,
    LogOut,
    LayoutDashboard,
    UserCog,
    FileText,
    BarChart3
} from 'lucide-react';

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

    // Helper to check if user has permission for a menu
    const hasPermission = (menu) => {
        if (!menu.permissionRequired) return true;
        // In a real app, check against user.roles or user.permissions
        // For this demo, we assume the backend filters menus or we check roles here
        // Simple check: if user has role 'ROLE_ADMIN', they see everything
        if (user?.roles?.includes('ROLE_ADMIN')) return true;

        // Check if user has the specific permission (if we had a list of permissions in user object)
        // For now, let's assume the backend returns only what the user can see, 
        // OR we filter here based on roles.
        return true;
    };

    const renderMenuItem = (menu) => {
        if (!hasPermission(menu)) return null;

        const isActive = location.pathname === menu.path;
        const Icon = getIcon(menu.icon);

        return (
            <li key={menu.id} className="mb-1">
                <Link
                    to={menu.path}
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${isActive
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                >
                    <Icon className="mr-3 h-5 w-5" />
                    {menu.label}
                </Link>
                {menu.children && menu.children.length > 0 && (
                    <ul className="ml-6 mt-1 border-l border-gray-700 pl-2">
                        {menu.children.map(child => renderMenuItem(child))}
                    </ul>
                )}
            </li>
        );
    };

    const getIcon = (iconName) => {
        switch (iconName) {
            case 'home': return Home;
            case 'dashboard': return LayoutDashboard;
            case 'users': return Users;
            case 'user-pen': return UserCog;
            case 'people': return Users;
            case 'menu': return MenuIcon;
            case 'settings': return Settings;
            case 'assessment': return BarChart3;
            case 'reports': return FileText;
            default: return MenuIcon;
        }
    }

    return (
        <div className="flex h-full w-64 flex-col bg-gray-900 text-white">
            <div className="flex h-16 items-center justify-center border-b border-gray-800">
                <h1 className="text-xl font-bold">Enterprise ERP</h1>
            </div>

            <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-2">
                    {menus.map((menu) => renderMenuItem(menu))}
                </ul>
            </nav>

            <div className="border-t border-gray-800 p-4">
                <div className="mb-2 flex items-center">
                    <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center font-bold">
                        {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <div className="ml-3">
                        <p className="text-sm font-medium">{user?.username}</p>
                        <p className="text-xs text-gray-400">{user?.roles?.[0]}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="flex w-full items-center rounded-md px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
