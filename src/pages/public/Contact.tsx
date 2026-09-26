import { useState } from 'react';
import { useApi } from '../../hooks/useApi';
import { publicApi } from '../../lib/api';
import Section from '../../components/public/Section';
import AnimatedSection from '../../components/public/AnimatedSection';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import { useMutation } from '../../hooks/useApi';
import './Contact.css';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const { data: profileData, loading } = useApi(
    () => publicApi.getProfile(),
    []
  );

  const { data: links } = useApi(
    () => publicApi.getLinks(),
    []
  );

  const profile = profileData?.profile ?? null;
  const contactLinks = (links ?? []).filter(l => l.type === 'contact' || l.type === 'social');

  const { mutate: submitForm, error } = useMutation(
    () => publicApi.getProfile().then(() => ({ success: true } as const))
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await submitForm();
    if (result) {
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="contact-page">
      <Section ariaLabel="Contact">
        <AnimatedSection>
          <div className="contact-page__header">
            <h1 className="contact-page__title">Contact</h1>
            <p className="contact-page__subtitle">
              Open for select projects and collaborations.
            </p>
          </div>
        </AnimatedSection>

        <div className="contact-page__content">
          <AnimatedSection delay={0.1}>
            <div className="contact-page__form-wrap">
              {submitted ? (
                <div className="contact-page__success" role="status">
                  <h2 className="contact-page__success-title">Message Received</h2>
                  <p>Thank you for reaching out. I will respond as soon as possible.</p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="contact-page__success-btn"
                  >
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="contact-page__form" noValidate>
                  {error && (
                    <div className="contact-page__error" role="alert">
                      {error}
                    </div>
                  )}

                  <div className="contact-page__field">
                    <label htmlFor="name" className="contact-page__label">Name</label>
                    <input
                      id="name"
                      type="text"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                      className="contact-page__input"
                      autoComplete="name"
                    />
                  </div>

                  <div className="contact-page__field">
                    <label htmlFor="email" className="contact-page__label">Email</label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      className="contact-page__input"
                      autoComplete="email"
                    />
                  </div>

                  <div className="contact-page__field">
                    <label htmlFor="message" className="contact-page__label">Message</label>
                    <textarea
                      id="message"
                      value={message}
                      onChange={e => setMessage(e.target.value)}
                      required
                      rows={6}
                      className="contact-page__input contact-page__textarea"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="contact-page__submit"
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </AnimatedSection>

          <AnimatedSection delay={0.2}>
            <div className="contact-page__info">
              <h2 className="contact-page__info-title">Direct Contact</h2>

              {profile?.contact_email && (
                <div className="contact-page__info-item">
                  <span className="contact-page__info-label">Email</span>
                  <a href={`mailto:${profile.contact_email}`} className="contact-page__info-value">
                    {profile.contact_email}
                  </a>
                </div>
              )}

              {profile?.location && (
                <div className="contact-page__info-item">
                  <span className="contact-page__info-label">Location</span>
                  <span className="contact-page__info-value">{profile.location}</span>
                </div>
              )}

              {contactLinks.length > 0 && (
                <div className="contact-page__info-item">
                  <span className="contact-page__info-label">Social</span>
                  <div className="contact-page__info-links">
                    {contactLinks.map(link => (
                      <a
                        key={link.id}
                        href={link.url}
                        className="contact-page__info-link"
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
          </AnimatedSection>
        </div>
      </Section>
    </div>
  );
}
