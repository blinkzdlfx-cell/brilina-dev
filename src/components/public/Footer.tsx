import { Link } from 'react-router-dom';
import type { Link as LinkType } from '../../lib/types';
import './Footer.css';

interface FooterProps {
  links: LinkType[];
  profile: { contact_email?: string; location?: string } | null;
}

export default function Footer({ links, profile }: FooterProps) {
  const currentYear = new Date().getFullYear();

  const socialLinks = links.filter(l => l.type === 'social');
  const contactLinks = links.filter(l => l.type === 'contact');

  return (
    <footer className="footer" role="contentinfo">
      <div className="footer__inner">
        <div className="footer__top">
          <div className="footer__brand">
            <Link to="/" className="footer__logo">
              BRILINA DEV
            </Link>
            <p className="footer__tagline">
              Spec-Driven Developer & AI-Assisted Product Builder
            </p>
            <p className="footer__method">
              THINK &rarr; SPECIFY &rarr; BUILD &rarr; VERIFY
            </p>
          </div>

          <div className="footer__links">
            <div className="footer__section">
              <h4 className="footer__heading">Navigation</h4>
              <ul className="footer__list">
                <li><Link to="/" className="footer__link">Home</Link></li>
                <li><Link to="/projects" className="footer__link">Projects</Link></li>
                <li><Link to="/method" className="footer__link">Method</Link></li>
                <li><Link to="/about" className="footer__link">About</Link></li>
                <li><Link to="/contact" className="footer__link">Contact</Link></li>
              </ul>
            </div>

            {contactLinks.length > 0 && (
              <div className="footer__section">
                <h4 className="footer__heading">Contact</h4>
                <ul className="footer__list">
                  {contactLinks.map(link => (
                    <li key={link.id}>
                      <a href={link.url} className="footer__link" target="_blank" rel="noopener noreferrer">
                        {link.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {profile?.location && (
              <div className="footer__section">
                <h4 className="footer__heading">Location</h4>
                <p className="footer__text">{profile.location}</p>
              </div>
            )}
          </div>
        </div>

        <div className="footer__bottom">
          <div className="footer__social">
            {socialLinks.map(link => (
              <a
                key={link.id}
                href={link.url}
                className="footer__social-link"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={link.label}
              >
                {link.icon_key === 'github' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
                  </svg>
                )}
                {link.icon_key === 'linkedin' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                    <rect x="2" y="9" width="4" height="12" />
                    <circle cx="4" cy="4" r="2" />
                  </svg>
                )}
                {link.icon_key === 'twitter' && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4l11.733 16h4.267l-11.733 -16z" />
                    <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />
                  </svg>
                )}
              </a>
            ))}
          </div>

          <p className="footer__copyright">
            &copy; {currentYear} Brilina Dev. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
