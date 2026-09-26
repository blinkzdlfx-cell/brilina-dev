import { Link } from 'react-router-dom';
import type { Project } from '../../lib/types';
import './ProjectCard.css';

interface ProjectCardProps {
  project: Project & { images?: Array<{ id: number; image_url: string; alt_text: string; is_primary: number }>; technologies?: Array<{ technology: { id: number; name: string } }> };
  index?: number;
}

export default function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const primaryImage = project.images?.find(img => img.is_primary === 1) || project.images?.[0];
  const technologies = project.technologies?.map(t => t.technology) ?? [];

  return (
    <article className="project-card" style={{ animationDelay: `${index * 75}ms` }}>
      <Link to={`/projects/${project.slug}`} className="project-card__link">
        <div className="project-card__image-wrap">
          {primaryImage ? (
            <img
              src={primaryImage.image_url}
              alt={primaryImage.alt_text || project.name}
              className="project-card__image"
              loading="lazy"
            />
          ) : (
            <div className="project-card__image-placeholder">
              <span className="project-card__placeholder-text">{project.name.charAt(0)}</span>
            </div>
          )}
          {project.featured === 1 && (
            <span className="project-card__badge">Featured</span>
          )}
          <span className="project-card__status">{project.status}</span>
        </div>

        <div className="project-card__body">
          <h3 className="project-card__title">{project.name}</h3>
          {project.tagline && (
            <p className="project-card__tagline">{project.tagline}</p>
          )}
          {project.short_description && (
            <p className="project-card__description">{project.short_description}</p>
          )}

          {technologies.length > 0 && (
            <div className="project-card__technologies">
              {technologies.slice(0, 4).map((tech) => (
                <span key={tech.id} className="project-card__tech">
                  {tech.name}
                </span>
              ))}
              {technologies.length > 4 && (
                <span className="project-card__tech project-card__tech--more">
                  +{technologies.length - 4}
                </span>
              )}
            </div>
          )}
        </div>
      </Link>
    </article>
  );
}
