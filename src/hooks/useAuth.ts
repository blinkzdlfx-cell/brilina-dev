import { useState, useEffect, useCallback } from 'react';
import { authApi } from '../lib/api';
import type { Admin } from '../lib/types';

interface AuthState {
  authenticated: boolean;
  admin: Admin | null;
  loading: boolean;
}

export function useAuth(): AuthState & { refresh: () => Promise<void>; logout: () => Promise<void> } {
  const [state, setState] = useState<AuthState>({
    authenticated: false,
    admin: null,
    loading: true
  });

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const data = await authApi.session();
      setState({
        authenticated: data.authenticated,
        admin: data.admin ? { id: data.admin.id, email: data.admin.email, email_verified_at: null, created_at: '', updated_at: '' } : null,
        loading: false
      });
    } catch {
      setState({ authenticated: false, admin: null, loading: false });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } catch {
      // Ignore logout errors
    } finally {
      setState({ authenticated: false, admin: null, loading: false });
    }
  }, []);

  return { ...state, refresh, logout };
}
