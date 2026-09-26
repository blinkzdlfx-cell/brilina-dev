import { Link } from 'react-router-dom';
import type { Profile, ProfileImage } from '../../lib/types';
import './Hero.css';

interface HeroProps {
  profile: Profile;
  images: ProfileImage[];
}

export default function Hero({ profile, images }: HeroProps) {
  const activeImage = images.find(img => img.active === 1) || images[0];

  return (
    <section className="hero" aria-labelledby="hero-heading">
      <div className="hero__bg">
        {activeImage && (
          <img
            src={activeImage.image_url}
            alt=""
            className="hero__bg-image"
            aria-hidden="true"
          />
        )}
        <div className="hero__overlay" />
      </div>

      <div className="hero__content">
        <div className="hero__text">
          <p className="hero__label">Spec-Driven Developer</p>
          <h1 id="hero-heading" className="hero__title">
            {profile.professional_title || 'Developer & Product Builder'}
          </h1>
          <p className="hero__intro">{profile.short_intro}</p>
          <div className="hero__actions">
            <Link to="/projects" className="hero__btn hero__btn--primary">
              View Projects
            </Link>
            <Link to="/method" className="hero__btn hero__btn--secondary">
              My Method
            </Link>
          </div>
        </div>

        {activeImage && (
          <div className="hero__image">
            <img
              src={activeImage.image_url}
              alt={activeImage.alt_text || profile.name}
              className="hero__avatar"
            />
          </div>
        )}
      </div>
    </section>
  );
}
