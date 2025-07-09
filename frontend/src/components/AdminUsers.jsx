/**
 * AdminUsers Component
 * 
 * Admin-only component for managing user accounts.
 * Features:
 * - View all registered users
 * - Approve pending user accounts
 * - Delete/reject user accounts
 * - Real-time status updates
 * - Proper authentication handling
 */

import React, { useEffect, useState } from 'react';
import API from '../services/api';
import { toast } from 'react-toastify';
import { handleApiError } from '../services/api';
import './AdminUsers.css';

const AdminUsers = () => {
  // State management for users data and UI
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetches all users from the backend
   * Requires admin authentication
   */
  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get JWT token from localStorage
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Fetch users with proper authentication
      const response = await API.get('/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUsers(response.data);
      
    } catch (err) {
      console.error('Failed to fetch users:', err);
      
      if (err.response?.status === 401) {
        setError('Authentication failed. Please log in again.');
        toast.error('Session expired. Please log in again.');
      } else if (err.response?.status === 403) {
        setError('Access denied. Admin privileges required.');
        toast.error('You need admin privileges to access this page.');
      } else {
        setError('Failed to load users. Please try again.');
        handleApiError(err, 'Failed to fetch users');
      }
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles user account deletion/rejection
   * @param {number} userId - The ID of the user to delete
   * @param {string} email - The email of the user for confirmation
   */
  const handleDelete = async (userId, email) => {
    // Confirm deletion with user
    if (!window.confirm(`Are you sure you want to delete user "${email}"?\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await API.post('/admin/reject-user', 
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`✅ User "${email}" has been deleted successfully.`);
      
      // Refresh the users list
      fetchUsers();
      
    } catch (err) {
      console.error('Failed to delete user:', err);
      handleApiError(err, `Failed to delete user "${email}"`);
    }
  };

  /**
   * Handles user account approval
   * @param {number} userId - The ID of the user to approve
   * @param {string} email - The email of the user for feedback
   */
  const handleApprove = async (userId, email) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication required');
        return;
      }

      await API.post('/admin/approve-user', 
        { user_id: userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      toast.success(`✅ User "${email}" has been approved successfully.`);
      
      // Refresh the users list
      fetchUsers();
      
    } catch (err) {
      console.error('Failed to approve user:', err);
      handleApiError(err, `Failed to approve user "${email}"`);
    }
  };

  // Load users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="admin-users-container">
        <h2>👥 User Management</h2>
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="admin-users-container">
        <h2>👥 User Management</h2>
        <div className="error-state">
          <p>❌ {error}</p>
          <button onClick={fetchUsers} className="retry-btn">
            🔄 Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-users-container">
      <h2>👥 User Management</h2>
      
      {/* Users Table */}
      {users.length === 0 ? (
        <div className="empty-state">
          <p>📭 No users found in the system.</p>
          <p>Users will appear here once they register.</p>
        </div>
      ) : (
        <div className="users-table-container">
          <table className="users-table" role="table">
          <thead>
            <tr role="row">
                <th>📧 Email Address</th>
                <th>👤 Role</th>
                <th>📊 Status</th>
                <th>⚙️ Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
                <tr key={user.id} role="row" className="user-row">
                  <td role="cell" className="user-email">
                    {user.email}
                  </td>
                  <td role="cell" className="user-role">
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td role="cell" className="user-status">
                    <span className={`status-badge ${user.is_approved ? 'approved' : 'pending'}`}>
                      {user.is_approved ? '✅ Approved' : '⏳ Pending'}
                    </span>
                  </td>
                  <td role="cell" className="user-actions">
                    {/* Approve button for pending users */}
                  {!user.is_approved && (
                      <button 
                        className="action-btn approve-btn"
                        aria-label={`Approve user ${user.email}`} 
                        onClick={() => handleApprove(user.id, user.email)}
                        title="Approve this user"
                      >
                        ✅ Approve
                      </button>
                  )}
                    
                    {/* Delete button for all users */}
                    <button 
                      className="action-btn delete-btn"
                      aria-label={`Delete user ${user.email}`} 
                      onClick={() => handleDelete(user.id, user.email)}
                      title="Delete this user"
                    >
                      🗑️ Delete
                    </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      )}
      
      {/* Refresh Button */}
      <div className="table-actions">
        <button 
          onClick={fetchUsers} 
          className="refresh-btn"
          title="Refresh user list"
        >
          🔄 Refresh Users
        </button>
      </div>
    </div>
  );
};

export default AdminUsers; 