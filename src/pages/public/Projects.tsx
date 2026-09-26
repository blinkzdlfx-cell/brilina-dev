import { useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { publicApi } from '../../lib/api';
import ProjectGrid from '../../components/public/ProjectGrid';
import Section from '../../components/public/Section';
import './Projects.css';

export default function Projects() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const { data, loading, error, refetch } = useApi(
    () => publicApi.getProjects({ page, limit: 9, search }),
    [page, search]
  );

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  return (
    <div className="projects-page">
      <Section id="projects" ariaLabel="Projects">
        <div className="projects-page__header">
          <h1 className="projects-page__title">Projects</h1>
          <p className="projects-page__subtitle">
            A selection of work across products, platforms, and experiments.
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="projects-page__filters">
          <div className="projects-page__filter-group">
            <label htmlFor="search" className="projects-page__label">Search</label>
            <input
              id="search"
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="projects-page__input"
            />
          </div>
        </form>

        {error && (
          <div className="projects-page__error" role="alert">
            <p>Failed to load projects: {error}</p>
            <button onClick={refetch} className="projects-page__retry">Try again</button>
          </div>
        )}

        <ProjectGrid
          projects={data?.data ?? []}
          pagination={data?.pagination ?? { page: 1, limit: 9, total: 0, totalPages: 0, hasNext: false, hasPrevious: false }}
          onPageChange={handlePageChange}
          loading={loading}
        />
      </Section>
    </div>
  );
}
