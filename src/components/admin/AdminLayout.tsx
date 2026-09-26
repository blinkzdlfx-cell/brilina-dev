import { useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import './AdminLayout.css';

export default function AdminLayout() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
    }
  }, [admin, navigate]);

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/projects', label: 'Projects' },
    { to: '/admin/profile', label: 'Profile' },
    { to: '/admin/photos', label: 'Photos' },
    { to: '/admin/capabilities', label: 'Capabilities' },
    { to: '/admin/links', label: 'Links' },
    { to: '/admin/account', label: 'Account' }
  ];

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar" role="navigation" aria-label="Admin navigation">
        <div className="admin-sidebar__brand">
          <span className="admin-sidebar__logo">BRILINA DEV</span>
          <span className="admin-sidebar__role">Admin</span>
        </div>

        <nav className="admin-sidebar__nav">
          <ul className="admin-sidebar__list">
            {navItems.map(item => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }: { isActive: boolean }) =>
                    `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <span className="admin-sidebar__email">{admin?.email}</span>
          </div>
          <button onClick={handleLogout} className="admin-sidebar__logout">
            Logout
          </button>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <h1 className="admin-header__title">Dashboard</h1>
        </header>
        <main className="admin-content" id="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
