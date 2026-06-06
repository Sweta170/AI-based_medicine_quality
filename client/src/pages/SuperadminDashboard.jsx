import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Users, Shield, UserCheck, Trash2, ArrowUpDown, AlertCircle, RefreshCw } from 'lucide-react';

const SuperadminDashboard = () => {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [localError, setLocalError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch all users
  const { data: users = [], isLoading, isError, error, refetch, isRefetching } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const { data } = await api.get('/users');
      return data;
    },
  });

  // Mutation to update user role
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }) => {
      const { data } = await api.put(`/users/${id}/role`, { role });
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['users']);
      setSuccessMessage(data.message || 'User role updated successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err) => {
      setLocalError(err.response?.data?.message || 'Failed to update user role');
      setTimeout(() => setLocalError(''), 4000);
    },
  });

  // Mutation to delete a user
  const deleteUserMutation = useMutation({
    mutationFn: async (id) => {
      const { data } = await api.delete(`/users/${id}`);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['users']);
      setSuccessMessage(data.message || 'User deleted successfully');
      setTimeout(() => setSuccessMessage(''), 4000);
    },
    onError: (err) => {
      setLocalError(err.response?.data?.message || 'Failed to delete user');
      setTimeout(() => setLocalError(''), 4000);
    },
  });

  const handleRoleChange = (userId, newRole) => {
    updateRoleMutation.mutate({ id: userId, role: newRole });
  };

  const handleDeleteUser = (userId) => {
    if (window.confirm('Are you sure you want to delete this user account?')) {
      deleteUserMutation.mutate(userId);
    }
  };

  // Calculations for Stat Cards
  const totalUsers = users.length;
  const adminCount = users.filter((u) => u.role === 'superadmin').length;
  const pharmacistCount = users.filter((u) => u.role === 'pharmacist').length;
  const customerCount = users.filter((u) => u.role === 'customer').length;

  return (
    <div className="space-y-4 p-4 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-slate-805 dark:text-slate-200 tracking-tight">System Administration</h1>
          <p className="text-slate-400 dark:text-slate-500 text-xs mt-0.5">
            Oversee user accounts, roles, access permissions, and system metrics.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-205 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700/50 transition-all text-xs disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs">
          {successMessage}
        </div>
      )}
      {localError && (
        <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          <span>{localError}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-4 right-4 w-7 h-7 bg-blue-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-[#1A56A0] dark:text-sky-400">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Total Registers</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{isLoading ? '...' : totalUsers}</p>
          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
            <span className="text-emerald-500 font-semibold">Active</span> database pool
          </div>
        </div>

        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-4 right-4 w-7 h-7 bg-red-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-red-500 dark:text-red-400">
            <Shield className="w-4 h-4" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Super Admins</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{isLoading ? '...' : adminCount}</p>
          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">Security controllers</div>
        </div>

        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-4 right-4 w-7 h-7 bg-emerald-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-emerald-600 dark:text-emerald-450">
            <UserCheck className="w-4 h-4" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Pharmacists</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{isLoading ? '...' : pharmacistCount}</p>
          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">Inventory controllers</div>
        </div>

        <div className="bg-white dark:bg-[#1a2438] p-4 rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm relative overflow-hidden transition-colors duration-200">
          <div className="absolute top-4 right-4 w-7 h-7 bg-purple-50 dark:bg-white/5 rounded-lg flex items-center justify-center text-purple-600 dark:text-purple-400">
            <Users className="w-4 h-4" />
          </div>
          <p className="text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">Customers</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white mt-1">{isLoading ? '...' : customerCount}</p>
          <div className="mt-3 text-[10px] text-slate-400 dark:text-slate-500">System client tier</div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="bg-white dark:bg-[#1a2438] rounded-xl border border-slate-200 dark:border-slate-700/50 shadow-sm overflow-hidden transition-colors duration-200">
        <div className="p-4 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-805 dark:text-slate-200">Registered Terminals</h2>
          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 py-0.5 px-2 rounded-md border border-slate-200 dark:border-slate-700/50">
            Total count: {users.length}
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-3 border-slate-200 border-t-[#1A56A0] rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-500 dark:text-red-400 text-xs">
            <p>Error listing accounts: {error.message}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-100 dark:border-slate-700/50 text-slate-400 dark:text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                  <th className="py-2.5 px-4">Name</th>
                  <th className="py-2.5 px-4">Email Address</th>
                  <th className="py-2.5 px-4">Role Authority</th>
                  <th className="py-2.5 px-4">Registration Date</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/20 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-brand/20 border border-blue-100 dark:border-brand/30 flex items-center justify-center font-bold text-xs text-[#1A56A0] dark:text-sky-400">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 dark:text-slate-200">
                            {item.name}
                            {item._id === currentUser?._id && (
                              <span className="ml-2 text-[10px] bg-blue-50 dark:bg-brand/20 text-[#1A56A0] dark:text-sky-400 px-1.5 py-0.5 rounded border border-blue-100 dark:border-brand/30">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600 dark:text-slate-400 font-mono">{item.email}</td>
                    <td className="py-2.5 px-4">
                      <select
                        value={item.role}
                        onChange={(e) => handleRoleChange(item._id, e.target.value)}
                        disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.id === item._id}
                        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-[11px] rounded-lg px-2 py-0.5 text-slate-700 dark:text-slate-200 focus:outline-none focus:border-[#1A56A0] disabled:opacity-50 bg-white"
                      >
                        <option value="superadmin">Super Admin</option>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    <td className="py-2.5 px-4 text-slate-500 dark:text-slate-400 text-xs">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-2.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteUser(item._id)}
                        disabled={
                          item._id === currentUser?._id ||
                          (deleteUserMutation.isPending && deleteUserMutation.variables === item._id)
                        }
                        className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent disabled:cursor-not-allowed"
                        title="Delete User"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuperadminDashboard;
