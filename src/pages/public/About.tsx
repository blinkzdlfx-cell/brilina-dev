import { useApi } from '../../hooks/useApi';
import { publicApi } from '../../lib/api';
import Section from '../../components/public/Section';
import AnimatedSection from '../../components/public/AnimatedSection';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './About.css';

export default function About() {
  const { data: profileData, loading } = useApi(
    () => publicApi.getProfile(),
    []
  );

  const { data: links } = useApi(
    () => publicApi.getLinks(),
    []
  );

  const profile = profileData?.profile ?? null;
  const images = profileData?.images ?? [];
  const contactLinks = (links ?? []).filter(l => l.type === 'contact' || l.type === 'social');

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <Section ariaLabel="About">
        <h1>About</h1>
        <p>Profile not available.</p>
      </Section>
    );
  }
  const activeImage = images.find(img => img.active === 1) || images[0];

  return (
    <div className="about-page">
      <Section ariaLabel="About">
        <AnimatedSection>
          <div className="about-page__header">
            <h1 className="about-page__title">About</h1>
            <p className="about-page__subtitle">
              {profile.professional_title || 'Developer & Product Builder'}
            </p>
          </div>
        </AnimatedSection>

        <div className="about-page__content">
          <AnimatedSection delay={0.1}>
            <div className="about-page__main">
              {activeImage && (
                <figure className="about-page__figure">
                  <img
                    src={activeImage.image_url}
                    alt={activeImage.alt_text || profile.name}
                    className="about-page__image"
                  />
                </figure>
              )}

              <div className="about-page__text">
                <h2 className="about-page__name">{profile.name}</h2>

                {profile.biography && (
                  <div className="about-page__section">
                    <h3 className="about-page__section-title">Biography</h3>
                    <p>{profile.biography}</p>
                  </div>
                )}

                {profile.longer_about && (
                  <div className="about-page__section">
                    <h3 className="about-page__section-title">Background</h3>
                    <p>{profile.longer_about}</p>
                  </div>
                )}

                {profile.short_intro && (
                  <div className="about-page__section">
                    <h3 className="about-page__section-title">Introduction</h3>
                    <p>{profile.short_intro}</p>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="about-page__meta">
              <div className="about-page__meta-grid">
                {profile.location && (
                  <div className="about-page__meta-item">
                    <span className="about-page__meta-label">Location</span>
                    <span className="about-page__meta-value">{profile.location}</span>
                  </div>
                )}
                {profile.contact_email && (
                  <div className="about-page__meta-item">
                    <span className="about-page__meta-label">Email</span>
                    <a href={`mailto:${profile.contact_email}`} className="about-page__meta-value about-page__meta-link">
                      {profile.contact_email}
                    </a>
                  </div>
                )}
                {contactLinks.length > 0 && (
                  <div className="about-page__meta-item">
                    <span className="about-page__meta-label">Connect</span>
                    <div className="about-page__meta-links">
                      {contactLinks.map(link => (
                        <a
                          key={link.id}
                          href={link.url}
                          className="about-page__meta-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </AnimatedSection>
        </div>
      </Section>
    </div>
  );
}
