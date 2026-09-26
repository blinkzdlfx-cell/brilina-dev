import { useState, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import { publicApi } from '../../lib/api';
import Hero from '../../components/public/Hero';
import Section from '../../components/public/Section';
import AnimatedSection from '../../components/public/AnimatedSection';
import ProjectCard from '../../components/public/ProjectCard';
import CapabilityCard from '../../components/public/CapabilityCard';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './Home.css';

export default function Home() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data: profileData, loading: profileLoading } = useApi(
    () => publicApi.getProfile(),
    []
  );

  const { data: projectsData, loading: projectsLoading } = useApi(
    () => publicApi.getProjects({ page, limit: 6, search, featured: '1' }),
    [page, search]
  );

  const { data: capabilities } = useApi(
    () => publicApi.getCapabilities(),
    []
  );

  const { data: links } = useApi(
    () => publicApi.getLinks(),
    []
  );

  const profile = profileData?.profile ?? null;
  const images = profileData?.images ?? [];
  const featuredProjects = projectsData?.data ?? [];
  const capabilitiesList = capabilities ?? [];
  const linksList = links ?? [];

  const featuredCapabilities = capabilitiesList.filter(c => c.active === 1).slice(0, 6);
  const contactLinks = linksList.filter(l => l.type === 'contact');

  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
  }, []);

  if (profileLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="home">
      {profile && <Hero profile={profile} images={images} />}

      <Section id="selected-work" ariaLabel="Selected Work">
        <AnimatedSection>
          <div className="home__section-header">
            <h2 className="home__section-title">Selected Work</h2>
            <p className="home__section-subtitle">Featured projects that demonstrate breadth and depth.</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <form onSubmit={handleSearch} className="home__search">
            <input
              type="search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search projects..."
              className="home__search-input"
              aria-label="Search projects"
            />
          </form>
        </AnimatedSection>

        <div className="home__projects">
          {featuredProjects.map((project, index) => (
            <AnimatedSection key={project.id} delay={index * 0.05}>
              <ProjectCard project={project} index={index} />
            </AnimatedSection>
          ))}
        </div>

        {projectsLoading && (
          <div className="home__loading">
            <div className="loading-spinner">
              <div className="loading-spinner__spinner" />
              <span className="sr-only">Loading projects...</span>
            </div>
          </div>
        )}

        {featuredProjects.length > 0 && (
          <AnimatedSection delay={0.2}>
            <div className="home__section-footer">
              <a href="/projects" className="home__view-all">View all projects &rarr;</a>
            </div>
          </AnimatedSection>
        )}
      </Section>

      <Section className="section--alt" id="capabilities" ariaLabel="Capabilities">
        <AnimatedSection>
          <div className="home__section-header">
            <h2 className="home__section-title">How I Build</h2>
            <p className="home__section-subtitle">End-to-end capability from specification to deployed software.</p>
          </div>
        </AnimatedSection>

        <div className="home__capabilities">
          {featuredCapabilities.map((cap, index) => (
            <AnimatedSection key={cap.id} delay={index * 0.08}>
              <CapabilityCard capability={cap} index={index} />
            </AnimatedSection>
          ))}
        </div>
      </Section>

      <Section id="about" ariaLabel="About">
        <AnimatedSection>
          <div className="home__section-header">
            <h2 className="home__section-title">AI + Human</h2>
            <p className="home__section-subtitle">Specification-first. Human-directed. AI-augmented.</p>
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="home__about">
            <div className="home__about-text">
              <p>{profile?.biography || profile?.short_intro}</p>
              {profile?.longer_about && <p>{profile.longer_about}</p>}
            </div>
            <div className="home__about-meta">
              {profile?.location && (
                <div className="home__meta-item">
                  <span className="home__meta-label">Location</span>
                  <span className="home__meta-value">{profile.location}</span>
                </div>
              )}
              {contactLinks.length > 0 && (
                <div className="home__meta-item">
                  <span className="home__meta-label">Contact</span>
                  {contactLinks.map(link => (
                    <a key={link.id} href={link.url} className="home__meta-value home__meta-link">
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </AnimatedSection>
      </Section>

      {contactLinks.length > 0 && (
        <Section className="section--alt" id="contact" ariaLabel="Contact">
          <AnimatedSection>
            <div className="home__contact">
              <h2 className="home__section-title">Get in Touch</h2>
              <p className="home__section-subtitle">Open for select projects and collaborations.</p>
              <a href={contactLinks[0].url} className="home__contact-btn">
                {contactLinks[0].label} &rarr;
              </a>
            </div>
          </AnimatedSection>
        </Section>
      )}
    </div>
  );
}
