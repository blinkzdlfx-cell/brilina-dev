import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../lib/api';
import './Account.css';

export default function Account() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);
    try {
      await authApi.changePassword(currentPassword, newPassword);
      setSuccess('Password changed successfully.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to change password';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await authApi.logout();
    navigate('/admin/login');
  };

  return (
    <div className="admin-account">
      <h1 className="admin-account__title">Account</h1>
      <p className="admin-account__subtitle">Manage your account settings.</p>

      <div className="admin-account__section">
        <h2 className="admin-account__section-title">Change Password</h2>

        {error && (
          <div className="admin-account__error" role="alert">
            {error}
          </div>
        )}

        {success && (
          <div className="admin-account__success" role="status">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-account__form">
          <div className="admin-account__field">
            <label htmlFor="current-password" className="admin-account__label">Current Password</label>
            <input
              id="current-password"
              type="password"
              value={currentPassword}
              onChange={e => setCurrentPassword(e.target.value)}
              required
              className="admin-account__input"
            />
          </div>

          <div className="admin-account__field">
            <label htmlFor="new-password" className="admin-account__label">New Password</label>
            <input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={e => setNewPassword(e.target.value)}
              required
              minLength={8}
              className="admin-account__input"
            />
          </div>

          <div className="admin-account__field">
            <label htmlFor="confirm-password" className="admin-account__label">Confirm New Password</label>
            <input
              id="confirm-password"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              required
              className="admin-account__input"
            />
          </div>

          <button type="submit" disabled={loading} className="admin-account__submit">
            {loading ? 'Changing...' : 'Change Password'}
          </button>
        </form>
      </div>

      <div className="admin-account__section">
        <h2 className="admin-account__section-title">Session</h2>
        <button onClick={handleLogout} className="admin-account__logout">
          Logout
        </button>
      </div>
    </div>
  );
}
