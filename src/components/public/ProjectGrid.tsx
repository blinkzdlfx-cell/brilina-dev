import type { Project, PaginationInfo } from '../../lib/types';
import ProjectCard from './ProjectCard';
import './ProjectGrid.css';

interface ProjectGridProps {
  projects: Project[];
  pagination: PaginationInfo;
  onPageChange: (page: number) => void;
  loading?: boolean;
}

export default function ProjectGrid({ projects, pagination, onPageChange, loading }: ProjectGridProps) {
  if (loading) {
    return (
      <div className="project-grid__loading">
        <div className="loading-spinner">
          <div className="loading-spinner__spinner" />
          <span className="sr-only">Loading projects...</span>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="project-grid__empty">
        <p className="project-grid__empty-text">No projects found.</p>
      </div>
    );
  }

  return (
    <div className="project-grid">
      <div className="project-grid__items">
        {projects.map((project, index) => (
          <ProjectCard key={project.id} project={project} index={index} />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <nav className="project-grid__pagination" aria-label="Project pagination">
          <button
            className="pagination-btn"
            onClick={() => onPageChange(pagination.page - 1)}
            disabled={!pagination.hasPrevious}
            aria-label="Previous page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <div className="pagination-btn__pages">
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                className={`pagination-btn__page ${page === pagination.page ? 'pagination-btn__page--active' : ''}`}
                onClick={() => onPageChange(page)}
                aria-label={`Page ${page}`}
                aria-current={page === pagination.page ? 'page' : undefined}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            className="pagination-btn"
            onClick={() => onPageChange(pagination.page + 1)}
            disabled={!pagination.hasNext}
            aria-label="Next page"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </nav>
      )}

      <p className="project-grid__count">
        Showing {projects.length} of {pagination.total} project{pagination.total !== 1 ? 's' : ''}
      </p>
    </div>
  );
}
