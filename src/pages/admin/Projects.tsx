import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import type { AdminProject } from '../../lib/types';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './AdminProjects.css';

export default function AdminProjects() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const loadProjects = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getProjects({ page, limit: 10, search, status: status || undefined });
      setProjects(data.data);
      setTotalPages(data.pagination.totalPages);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load projects';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      return;
    }
    try {
      await adminApi.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleTogglePublish = async (id: number, published: number) => {
    try {
      if (published === 1) {
        await adminApi.unpublishProject(id);
      } else {
        await adminApi.publishProject(id);
      }
      loadProjects();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to update publish status');
    }
  };

  return (
    <div className="admin-projects">
      <div className="admin-projects__header">
        <div>
          <h1 className="admin-projects__title">Projects</h1>
          <p className="admin-projects__subtitle">Manage your portfolio projects.</p>
        </div>
        <button
          onClick={() => navigate('/admin/projects/new')}
          className="admin-projects__create"
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="admin-projects__error" role="alert">
          {error}
          <button onClick={loadProjects} className="admin-projects__retry">Retry</button>
        </div>
      )}

      <div className="admin-projects__filters">
        <div className="admin-projects__filter">
          <label htmlFor="search" className="admin-projects__label">Search</label>
          <input
            id="search"
            type="search"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="admin-projects__input"
            placeholder="Search projects..."
          />
        </div>
        <div className="admin-projects__filter">
          <label htmlFor="status" className="admin-projects__label">Status</label>
          <select
            id="status"
            value={status}
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            className="admin-projects__input"
          >
            <option value="">All</option>
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </div>
      </div>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <>
          <div className="admin-projects__table-wrap">
            <table className="admin-projects__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Status</th>
                  <th>Published</th>
                  <th>Featured</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <Link to={`/admin/projects/${project.id}/edit`} className="admin-projects__name">
                        {project.name}
                      </Link>
                    </td>
                    <td>{project.category?.name ?? '-'}</td>
                    <td>
                      <span className={`admin-badge admin-badge--${project.status}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <button
                        onClick={() => handleTogglePublish(project.id, project.published)}
                        className={`admin-toggle ${project.published === 1 ? 'admin-toggle--on' : 'admin-toggle--off'}`}
                        aria-label={project.published === 1 ? 'Unpublish' : 'Publish'}
                      >
                        {project.published === 1 ? 'Yes' : 'No'}
                      </button>
                    </td>
                    <td>{project.featured === 1 ? 'Yes' : 'No'}</td>
                    <td>
                      <div className="admin-projects__actions">
                        <Link to={`/admin/projects/${project.id}/edit`} className="admin-action-btn">
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(project.id)}
                          className="admin-action-btn admin-action-btn--danger"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="admin-pagination">
              <button
                onClick={() => setPage(p => p - 1)}
                disabled={page === 1}
                className="admin-pagination__btn"
              >
                Previous
              </button>
              <span className="admin-pagination__info">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={page === totalPages}
                className="admin-pagination__btn"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
