import { useApi } from '../../hooks/useApi';
import { publicApi } from '../../lib/api';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './Dashboard.css';

export default function Dashboard() {
  const { data: projectsData } = useApi(
    () => publicApi.getProjects({ limit: 5 }),
    []
  );

  const { data: capabilities } = useApi(
    () => publicApi.getCapabilities(),
    []
  );

  const stats = {
    totalProjects: projectsData?.pagination.total ?? 0,
    publishedProjects: projectsData?.data.filter(p => p.published === 1).length ?? 0,
    totalCapabilities: capabilities?.length ?? 0
  };

  return (
    <div className="dashboard">
      <h1 className="dashboard__title">Dashboard</h1>
      <p className="dashboard__subtitle">Overview of your portfolio.</p>

      <div className="dashboard__stats">
        <div className="dashboard__stat">
          <span className="dashboard__stat-value">{stats.totalProjects}</span>
          <span className="dashboard__stat-label">Total Projects</span>
        </div>
        <div className="dashboard__stat">
          <span className="dashboard__stat-value">{stats.publishedProjects}</span>
          <span className="dashboard__stat-label">Published</span>
        </div>
        <div className="dashboard__stat">
          <span className="dashboard__stat-value">{stats.totalCapabilities}</span>
          <span className="dashboard__stat-label">Capabilities</span>
        </div>
      </div>

      <div className="dashboard__section">
        <h2 className="dashboard__section-title">Recent Projects</h2>
        {!projectsData ? (
          <LoadingSpinner />
        ) : (
          <div className="dashboard__table-wrap">
            <table className="dashboard__table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Status</th>
                  <th>Published</th>
                </tr>
              </thead>
              <tbody>
                {projectsData.data.slice(0, 5).map((project) => (
                  <tr key={project.id}>
                    <td>{project.name}</td>
                    <td>
                      <span className={`dashboard__badge dashboard__badge--${project.status}`}>
                        {project.status}
                      </span>
                    </td>
                    <td>{project.published === 1 ? 'Yes' : 'No'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
