import { useParams, Link } from 'react-router-dom';
import { useApi } from '../../hooks/useApi';
import { publicApi } from '../../lib/api';
import Section from '../../components/public/Section';
import AnimatedSection from '../../components/public/AnimatedSection';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './ProjectDetail.css';

const SECTION_TITLES: Record<string, string> = {
  overview: 'Overview',
  problem: 'Problem',
  objective: 'Objective',
  approach: 'Approach',
  architecture: 'Architecture',
  features: 'Features',
  gallery: 'Gallery',
  verification: 'Verification',
  technologies: 'Technologies',
  links: 'Links'
};

export default function ProjectDetail() {
  const { slug } = useParams();
  const { data: project, loading, error } = useApi(
    () => publicApi.getProject(slug!),
    [slug]
  );

  if (loading) {
    return (
      <div className="project-detail__loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="project-detail__error">
        <h1>Project Not Found</h1>
        <p>The project you are looking for does not exist or is not published.</p>
        <Link to="/projects" className="project-detail__back">Back to Projects</Link>
      </div>
    );
  }

  const primaryImage = project.images?.find(img => img.is_primary === 1) || project.images?.[0];
  const caseStudySections = project.case_study_sections?.filter(s => s.active === 1) ?? [];
  const techList = project.technologies?.map(t => t.technology) ?? [];

  return (
    <div className="project-detail">
      <div className="project-detail__hero">
        <div className="project-detail__hero-bg">
          {primaryImage && (
            <img src={primaryImage.image_url} alt="" className="project-detail__hero-image" aria-hidden="true" />
          )}
          <div className="project-detail__hero-overlay" />
        </div>

        <Section className="section--transparent">
          <AnimatedSection>
            <div className="project-detail__hero-content">
              <span className="project-detail__status">{project.status}</span>
              <h1 className="project-detail__title">{project.name}</h1>
              {project.tagline && <p className="project-detail__tagline">{project.tagline}</p>}
              {project.category && (
                <span className="project-detail__category">{project.category.name}</span>
              )}
            </div>
          </AnimatedSection>
        </Section>
      </div>

      <Section id="overview" ariaLabel="Overview">
        {project.short_description && (
          <AnimatedSection>
            <div className="project-detail__section">
              <h2 className="project-detail__section-title">Overview</h2>
              <p className="project-detail__section-text">{project.short_description}</p>
            </div>
          </AnimatedSection>
        )}

        {project.full_description && (
          <AnimatedSection delay={0.1}>
            <div className="project-detail__section">
              <h2 className="project-detail__section-title">Details</h2>
              <p className="project-detail__section-text">{project.full_description}</p>
            </div>
          </AnimatedSection>
        )}
      </Section>

      {caseStudySections.length > 0 && (
        <Section className="section--alt" ariaLabel="Case Study">
          {caseStudySections.map((section, idx) => (
            <AnimatedSection key={section.id} delay={idx * 0.05}>
              <div className="project-detail__section" id={`section-${section.section_type}`}>
                <h2 className="project-detail__section-title">
                  {SECTION_TITLES[section.section_type] || section.section_type}
                </h2>
                {section.heading && <h3 className="project-detail__section-heading">{section.heading}</h3>}
                {section.body && <p className="project-detail__section-text">{section.body}</p>}
              </div>
            </AnimatedSection>
          ))}
        </Section>
      )}

      {project.images && project.images.length > 0 && (
        <Section id="gallery" ariaLabel="Gallery">
          <AnimatedSection>
            <div className="project-detail__section">
              <h2 className="project-detail__section-title">Gallery</h2>
              <div className="project-detail__gallery">
                {project.images.map((image) => (
                  <figure key={image.id} className="project-detail__gallery-item">
                    <img
                      src={image.image_url}
                      alt={image.alt_text || `${project.name} image`}
                      className="project-detail__gallery-image"
                      loading="lazy"
                    />
                    {image.alt_text && (
                      <figcaption className="project-detail__gallery-caption">{image.alt_text}</figcaption>
                    )}
                  </figure>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </Section>
      )}

      {techList.length > 0 && (
        <Section className="section--alt" id="technologies" ariaLabel="Technologies">
          <AnimatedSection>
            <div className="project-detail__section">
              <h2 className="project-detail__section-title">Technologies</h2>
              <div className="project-detail__technologies">
                {techList.map((tech) => (
                  <span key={tech.id} className="project-detail__tech">{tech.name}</span>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </Section>
      )}

      {project.links && project.links.length > 0 && (
        <Section id="links" ariaLabel="Links">
          <AnimatedSection>
            <div className="project-detail__section">
              <h2 className="project-detail__section-title">Links</h2>
              <div className="project-detail__links">
                {project.links.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    className="project-detail__link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                ))}
              </div>
            </div>
          </AnimatedSection>
        </Section>
      )}

      <Section className="section--alt" ariaLabel="Next Project">
        <AnimatedSection>
          <div className="project-detail__next">
            <Link to="/projects" className="project-detail__next-link">
              <span className="project-detail__next-label">Browse all projects</span>
              <span className="project-detail__next-arrow">&rarr;</span>
            </Link>
          </div>
        </AnimatedSection>
      </Section>
    </div>
  );
}
