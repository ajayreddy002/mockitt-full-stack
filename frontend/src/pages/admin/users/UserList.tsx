/* eslint-disable @typescript-eslint/no-explicit-any */
// frontend/src/pages/admin/users/AdminUserList.tsx
import React, { useEffect, useState } from 'react';
import {
  Search,
  // Filter, 
  UserCheck,
  UserX,
  Crown,
  Mail,
  Calendar,
  MoreVertical,
  Shield,
  // ShieldCheck
} from 'lucide-react';
import { useAdminStore, useUI } from '../../../store';

export const AdminUserList: React.FC = () => {
  const {
    users,
    loading,
    fetchUsers,
    updateUser,
    // deleteUser,
    toggleUserPremium,
  } = useAdminStore();
  const { addNotification } = useUI();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (search: string) => {
    setSearchTerm(search);
    fetchUsers({ search, role: filterRole !== 'all' ? filterRole : undefined });
  };

  const handleRoleFilter = (role: string) => {
    setFilterRole(role);
    fetchUsers({
      search: searchTerm,
      role: role !== 'all' ? role : undefined,
      isActive: filterStatus !== 'all' ? filterStatus === 'active' : undefined
    });
  };

  const handleStatusChange = async (userId: string, isActive: boolean) => {
    try {
      await updateUser(userId, { isActive });
      addNotification({
        type: 'success',
        title: 'User Status Updated',
        message: 'User status updated successfully'
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete course';
      addNotification({
        type: 'error',
        title: 'Delete Failed',
        message: errorMessage
      });
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    try {
      await updateUser(userId, { role });
      addNotification({
        type: 'success',
        title: 'User Role Updated',
        message: 'User role updated successfully'
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update user role';
      addNotification({
        type: 'error',
        title: 'Role Update Failed',
        message: errorMessage
      });
      console.error('Failed to update user role:', error);
    }
  };

  const handlePremiumToggle = async (userId: string) => {
    try {
      await toggleUserPremium(userId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to toggle premium status';
      addNotification({
        type: 'error',
        title: 'Premium Toggle Failed',
        message: errorMessage
      });
    }
  };

  const handleBulkAction = async (action: string) => {
    if (selectedUsers.length === 0) return;

    try {
      switch (action) {
        case 'activate':
          // Bulk activate users
          break;
        case 'deactivate':
          // Bulk deactivate users
          break;
        case 'premium':
          // Bulk toggle premium
          break;
      }
      setSelectedUsers([]);
      addNotification({
        type: 'success',
        title: 'Bulk Action Successful',
        message: `Successfully performed ${action} on selected users`
      });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Bulk action failed';
      addNotification({
        type: 'error',
        title: 'Bulk Action Failed',
        message: errorMessage
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">Manage platform users and permissions</p>
        </div>

        <div className="flex space-x-3">
          {selectedUsers.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {selectedUsers.length} selected
              </span>
              <select
                onChange={(e) => handleBulkAction(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
                defaultValue=""
              >
                <option value="" disabled>Bulk Actions</option>
                <option value="activate">Activate Users</option>
                <option value="deactivate">Deactivate Users</option>
                <option value="premium">Toggle Premium</option>
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users by name or email..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3">
            <select
              value={filterRole}
              onChange={(e) => handleRoleFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Roles</option>
              <option value="STUDENT">Students</option>
              <option value="MENTOR">Mentors</option>
              <option value="ADMIN">Admins</option>
            </select>

            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>
      </div>

      {/* User Table */}
      {loading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedUsers(users.map(user => user.id));
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Activity
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedUsers([...selectedUsers, user.id]);
                          } else {
                            setSelectedUsers(selectedUsers.filter(id => id !== user.id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 rounded"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center">
                            <span className="text-white font-medium text-sm">
                              {user.firstName.charAt(0)}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <div className="flex items-center space-x-2">
                            <div className="text-sm font-medium text-gray-900">
                              {user.firstName} {user.lastName}
                            </div>
                            {user.isPremium && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="h-3 w-3 mr-1" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={`text-xs font-medium px-2 py-1 rounded-full border-0 ${user.role === 'ADMIN' ? 'bg-red-100 text-red-800' :
                            user.role === 'MENTOR' ? 'bg-purple-100 text-purple-800' :
                              'bg-blue-100 text-blue-800'
                          }`}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="MENTOR">Mentor</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleStatusChange(user.id, !user.isActive)}
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${user.isActive
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-red-100 text-red-800 hover:bg-red-200'
                          }`}
                      >
                        {user.isActive ? (
                          <>
                            <UserCheck className="h-3 w-3 mr-1" />
                            Active
                          </>
                        ) : (
                          <>
                            <UserX className="h-3 w-3 mr-1" />
                            Inactive
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="space-y-1">
                        <div>{user.enrollmentCount} courses</div>
                        <div>{user.interviewCount} interviews</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handlePremiumToggle(user.id)}
                          className={`p-2 rounded hover:bg-gray-100 ${user.isPremium ? 'text-yellow-600' : 'text-gray-400'
                            }`}
                          title={user.isPremium ? 'Remove Premium' : 'Grant Premium'}
                        >
                          <Crown className="h-4 w-4" />
                        </button>

                        <button
                          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                          title="More options"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {users.length === 0 && (
            <div className="text-center py-12">
              <Shield className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No users found</h3>
              <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
