import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { getAllUsers, deleteUser, deleteMultipleUsers, UserProfile } from '@/services/userService';
import { useAuth } from '@/contexts/AuthContext';
import { ConfirmModal } from '@/components/common/ConfirmModal';
import { 
  User, 
  Mail, 
  Shield, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Search, 
  UserCheck, 
  Users, 
  Square, 
  CheckSquare, 
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function AdminUsers() {
  const { userProfile, currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection & Bulk delete
  const [selectedUids, setSelectedUids] = useState<string[]>([]);
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleteLoading, setBulkDeleteLoading] = useState(false);

  // Single user deletion
  const [userToDelete, setUserToDelete] = useState<UserProfile | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const usersData = await getAllUsers();
      setUsers(usersData);
      setSelectedUids([]);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filteredUsers = users.filter(u => {
    const q = searchQuery.toLowerCase();
    const nameMatch = u.name?.toLowerCase().includes(q);
    const emailMatch = u.email?.toLowerCase().includes(q);
    const codeMatch = u.staffCode?.toLowerCase().includes(q);
    return !q || nameMatch || emailMatch || codeMatch;
  });

  const handleSelectAll = () => {
    const validUids = filteredUsers.map(u => u.uid).filter(Boolean);
    if (selectedUids.length === validUids.length) {
      setSelectedUids([]);
    } else {
      setSelectedUids(validUids);
    }
  };

  const toggleSelectOne = (uid: string) => {
    setSelectedUids(prev =>
      prev.includes(uid) ? prev.filter(id => id !== uid) : [...prev, uid]
    );
  };

  const confirmSingleDelete = async () => {
    if (!userToDelete) return;
    setDeleteLoading(true);
    try {
      await deleteUser(userToDelete.uid);
      setUsers(prev => prev.filter(u => u.uid !== userToDelete.uid));
      setSelectedUids(prev => prev.filter(id => id !== userToDelete.uid));
      toast.success(`User "${userToDelete.name || userToDelete.email}" removed from database`);
      setUserToDelete(null);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete user account');
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedUids.length === 0) return;
    setBulkDeleteLoading(true);
    try {
      await deleteMultipleUsers(selectedUids);
      setUsers(prev => prev.filter(u => !selectedUids.includes(u.uid)));
      toast.success(`Successfully deleted ${selectedUids.length} user accounts`);
      setSelectedUids([]);
      setShowBulkDeleteModal(false);
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || 'Failed to delete selected user accounts');
    } finally {
      setBulkDeleteLoading(false);
    }
  };

  const isAllSelected = filteredUsers.length > 0 && selectedUids.length === filteredUsers.length;
  const adminCount = users.filter(u => u.role === 'admin').length;
  const staffCount = users.filter(u => u.role === 'staff').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">User & Account Management</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">
            Manage authenticated user profiles, faculty roles, and security credentials.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedUids.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowBulkDeleteModal(true)}
              className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 hover:bg-red-100 dark:hover:bg-red-900/60 font-bold text-xs"
            >
              <Trash2 className="w-4 h-4 mr-1.5" />
              Delete Selected ({selectedUids.length})
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="text-xs font-semibold"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-luna-primary-blue dark:text-cyan-400 flex items-center justify-center font-bold">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Total Users</div>
            <div className="text-xl font-black text-gray-900 dark:text-white">{users.length}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Administrators</div>
            <div className="text-xl font-black text-gray-900 dark:text-white">{adminCount}</div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 shadow-2xs flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-gray-500 dark:text-gray-400 font-semibold uppercase">Staff / Faculty</div>
            <div className="text-xl font-black text-gray-900 dark:text-white">{staffCount}</div>
          </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="pb-3 border-b border-gray-100 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base font-bold text-gray-900 dark:text-white">Registered System Accounts</CardTitle>
            
            {/* Search filter input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search name, email, or code..."
                value={searchQuery || ''}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 rounded-lg focus:outline-none focus:ring-2 focus:ring-luna-primary-blue/30 focus:border-luna-primary-blue"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {/* Bulk Selection Bar */}
          {filteredUsers.length > 0 && (
            <div className="bg-gray-50/70 dark:bg-slate-800/70 border-b border-gray-200 dark:border-slate-800 px-6 py-2.5 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="flex items-center space-x-2 text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white font-semibold cursor-pointer select-none"
                >
                  {isAllSelected ? (
                    <CheckSquare className="w-4 h-4 text-luna-primary-blue dark:text-cyan-400" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                  )}
                  <span>
                    {isAllSelected ? 'Deselect All' : 'Select All'} ({filteredUsers.length} users)
                  </span>
                </button>

                {selectedUids.length > 0 && (
                  <span className="bg-blue-100 dark:bg-blue-900/60 text-blue-800 dark:text-blue-200 font-bold px-2 py-0.5 rounded-md">
                    {selectedUids.length} selected
                  </span>
                )}
              </div>

              {selectedUids.length > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedUids([])}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 font-medium underline cursor-pointer"
                >
                  Clear Selection
                </button>
              )}
            </div>
          )}

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-gray-500 dark:text-gray-400 text-xs">
              <RefreshCw className="w-6 h-6 animate-spin text-luna-primary-blue dark:text-cyan-400 mb-2" />
              Loading user profiles...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400 text-sm">
              No matching user accounts found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[800px] text-sm text-left">
                <thead className="text-[11px] text-gray-500 dark:text-gray-400 uppercase bg-gray-50/60 dark:bg-slate-800/60 font-semibold">
                  <tr>
                    <th className="w-12 px-6 py-3"></th>
                    <th className="px-6 py-3">Name</th>
                    <th className="px-6 py-3">Email Address</th>
                    <th className="px-6 py-3">Role</th>
                    <th className="px-6 py-3">Staff Code</th>
                    <th className="px-6 py-3">Status</th>
                    <th className="px-6 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                  {filteredUsers.map((user) => {
                    const isSelected = selectedUids.includes(user.uid);
                    const isSelf = user.uid === currentUser?.uid || user.email === userProfile?.email;

                    return (
                      <tr
                        key={user.uid}
                        className={`transition-colors ${
                          isSelected ? 'bg-blue-50/40 dark:bg-blue-950/30' : 'hover:bg-gray-50/60 dark:hover:bg-slate-800/40'
                        }`}
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelectOne(user.uid)}
                            className="w-4 h-4 rounded text-luna-primary-blue border-gray-300 dark:border-slate-700 focus:ring-luna-primary-blue cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            <div className="w-8 h-8 rounded-full bg-luna-primary-blue/10 dark:bg-cyan-950/50 text-luna-primary-blue dark:text-cyan-400 flex items-center justify-center font-bold mr-2.5 text-xs">
                              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                            </div>
                            <div>
                              <div className="font-bold flex items-center gap-1.5 text-gray-900 dark:text-white">
                                {user.name || 'Unnamed User'}
                                {isSelf && (
                                  <span className="text-[10px] bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-semibold px-1.5 py-0.2 rounded">
                                    You
                                  </span>
                                )}
                              </div>
                              <div className="text-[11px] text-gray-400 dark:text-gray-500 font-mono">UID: {user.uid?.slice(0, 8)}...</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                          <div className="flex items-center text-xs">
                            <Mail className="w-3.5 h-3.5 mr-1.5 text-gray-400 dark:text-gray-500" />
                            {user.email}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                              user.role === 'admin'
                                ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300'
                                : 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                            }`}
                          >
                            <Shield className="w-3 h-3 mr-1" />
                            {user.role ? user.role.toUpperCase() : 'STAFF'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs font-semibold text-gray-700 dark:text-gray-300">
                          {user.staffCode ? (
                            <span className="bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-gray-200 dark:border-slate-700 text-gray-800 dark:text-gray-200">
                              {user.staffCode}
                            </span>
                          ) : (
                            <span className="text-gray-400 dark:text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          {user.active !== false ? (
                            <span className="inline-flex items-center text-green-700 dark:text-green-400 text-xs font-medium bg-green-50 dark:bg-green-950/40 px-2 py-0.5 rounded-full border border-green-200/60 dark:border-green-800/60">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-600 dark:text-green-400" />
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center text-red-700 dark:text-red-400 text-xs font-medium bg-red-50 dark:bg-red-950/40 px-2 py-0.5 rounded-full border border-red-200/60 dark:border-red-800/60">
                              <XCircle className="w-3.5 h-3.5 mr-1 text-red-600 dark:text-red-400" />
                              Disabled
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setUserToDelete(user)}
                            className="text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 hover:border-red-200 dark:hover:border-red-800 p-1.5 h-8 w-8"
                            title="Delete User Record"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Single User Delete Confirmation Modal */}
      {userToDelete && (
        <ConfirmModal
          isOpen={!!userToDelete}
          onClose={() => setUserToDelete(null)}
          onConfirm={confirmSingleDelete}
          title="Delete User Account"
          message={`Are you sure you want to permanently delete user "${userToDelete.name || userToDelete.email}" (Staff Code: ${userToDelete.staffCode || 'N/A'})? This will revoke all database profile records.`}
          confirmText="Delete User"
          type="danger"
          loading={deleteLoading}
        />
      )}

      {/* Bulk User Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <ConfirmModal
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onConfirm={confirmBulkDelete}
          title={`Delete ${selectedUids.length} User Accounts`}
          message={`Are you sure you want to permanently delete all ${selectedUids.length} selected user profiles from Firestore? This action is irreversible.`}
          confirmText={`Delete ${selectedUids.length} Users`}
          type="danger"
          loading={bulkDeleteLoading}
        />
      )}
    </div>
  );
}
