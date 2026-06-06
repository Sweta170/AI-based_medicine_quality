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
    <div className="space-y-8 p-6 max-w-7xl mx-auto">
      {/* Header section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">System Administration</h1>
          <p className="text-slate-400 text-sm mt-1">
            Oversee user accounts, roles, access permissions, and system metrics.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          disabled={isLoading || isRefetching}
          className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl border border-white/5 transition-all text-sm disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
          <span>Refresh Accounts</span>
        </button>
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
          {successMessage}
        </div>
      )}
      {localError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          <span>{localError}</span>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-brand-500/10 rounded-xl flex items-center justify-center text-brand-400">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Total Registers</p>
          <p className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : totalUsers}</p>
          <div className="mt-4 text-xs text-slate-400 flex items-center gap-1">
            <span className="text-emerald-400 font-semibold">Active</span> database pool
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center text-red-400">
            <Shield className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Super Admins</p>
          <p className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : adminCount}</p>
          <div className="mt-4 text-xs text-slate-400">Security controllers</div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Pharmacists</p>
          <p className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : pharmacistCount}</p>
          <div className="mt-4 text-xs text-slate-400">Inventory controllers</div>
        </div>

        <div className="glass-card p-6 rounded-2xl relative overflow-hidden">
          <div className="absolute top-4 right-4 w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400">
            <Users className="w-6 h-6" />
          </div>
          <p className="text-slate-400 text-sm font-semibold uppercase tracking-wider">Customers</p>
          <p className="text-3xl font-bold text-white mt-2">{isLoading ? '...' : customerCount}</p>
          <div className="mt-4 text-xs text-slate-400">System client tier</div>
        </div>
      </div>

      {/* User Management Section */}
      <div className="glass-panel rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Registered Terminals</h2>
          <span className="text-xs text-slate-400 bg-white/5 py-1 px-3 rounded-full border border-white/5">
            Total count: {users.length}
          </span>
        </div>

        {isLoading ? (
          <div className="py-20 flex justify-center">
            <div className="w-10 h-10 border-4 border-brand-500/20 border-t-brand-500 rounded-full animate-spin"></div>
          </div>
        ) : isError ? (
          <div className="py-20 text-center text-red-400">
            <p>Error listing accounts: {error.message}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-white/[0.02]">
                  <th className="py-4 px-6">Name</th>
                  <th className="py-4 px-6">Email Address</th>
                  <th className="py-4 px-6">Role Authority</th>
                  <th className="py-4 px-6">Registration Date</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-white/[0.01] transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-sm text-brand-400">
                          {item.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-white">
                            {item.name}
                            {item._id === currentUser?._id && (
                              <span className="ml-2 text-xs bg-brand-500/10 text-brand-400 px-2 py-0.5 rounded-full border border-brand-500/20">
                                You
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-slate-300">{item.email}</td>
                    <td className="py-4 px-6">
                      <select
                        value={item.role}
                        onChange={(e) => handleRoleChange(item._id, e.target.value)}
                        disabled={updateRoleMutation.isPending && updateRoleMutation.variables?.id === item._id}
                        className="bg-slate-900 border border-white/10 text-xs rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-brand-500 disabled:opacity-50"
                      >
                        <option value="superadmin">Super Admin</option>
                        <option value="pharmacist">Pharmacist</option>
                        <option value="customer">Customer</option>
                      </select>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-sm">
                      {new Date(item.createdAt).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDeleteUser(item._id)}
                        disabled={
                          item._id === currentUser?._id ||
                          (deleteUserMutation.isPending && deleteUserMutation.variables === item._id)
                        }
                        className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all border border-transparent hover:border-red-500/20 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 disabled:hover:border-transparent disabled:cursor-not-allowed"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
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
