import React from 'react';
import useAuthStore from '../store/useAuthStore';

const Dashboard = () => {
    const user = useAuthStore((state) => state.user);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {/* Card 1 */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-5">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                {/* Icon */}
                            </div>
                            <div className="ml-5 w-0 flex-1">
                                <dl>
                                    <dt className="truncate text-sm font-medium text-gray-500">
                                        Welcome back
                                    </dt>
                                    <dd>
                                        <div className="text-lg font-medium text-gray-900">
                                            {user?.username}
                                        </div>
                                    </dd>
                                </dl>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Card 2 */}
                <div className="overflow-hidden rounded-lg bg-white shadow">
                    <div className="p-5">
                        <p className="text-gray-500">Your Role: {user?.roles?.join(', ')}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
