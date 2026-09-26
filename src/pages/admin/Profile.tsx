import { useState, useEffect } from 'react';
import { adminApi } from '../../lib/api';
import type { Profile } from '../../lib/types';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './AdminProfile.css';

export default function AdminProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    professional_title: '',
    short_intro: '',
    biography: '',
    longer_about: '',
    contact_email: '',
    location: ''
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await adminApi.getProfile();
        setProfile(data);
        setFormData({
          name: data.name,
          professional_title: data.professional_title,
          short_intro: data.short_intro,
          biography: data.biography,
          longer_about: data.longer_about,
          contact_email: data.contact_email,
          location: data.location
        });
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load profile';
        setError(message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const updated = await adminApi.updateProfile(formData);
      setProfile(updated);
      setSuccess('Profile updated successfully.');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update profile';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-profile__loading">
        <LoadingSpinner />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="admin-profile__error">
        <p>Failed to load profile.</p>
      </div>
    );
  }

  return (
    <div className="admin-profile">
      <h1 className="admin-profile__title">Profile</h1>
      <p className="admin-profile__subtitle">Update your public profile information.</p>

      {error && (
        <div className="admin-profile__error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="admin-profile__success" role="status">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-profile__form">
        <div className="admin-profile__grid">
          <div className="admin-profile__field">
            <label htmlFor="name" className="admin-profile__label">Name</label>
            <input
              id="name"
              type="text"
              value={formData.name}
              onChange={e => updateField('name', e.target.value)}
              required
              className="admin-profile__input"
            />
          </div>

          <div className="admin-profile__field">
            <label htmlFor="professional_title" className="admin-profile__label">Professional Title</label>
            <input
              id="professional_title"
              type="text"
              value={formData.professional_title}
              onChange={e => updateField('professional_title', e.target.value)}
              required
              className="admin-profile__input"
            />
          </div>

          <div className="admin-profile__field">
            <label htmlFor="contact_email" className="admin-profile__label">Contact Email</label>
            <input
              id="contact_email"
              type="email"
              value={formData.contact_email}
              onChange={e => updateField('contact_email', e.target.value)}
              required
              className="admin-profile__input"
            />
          </div>

          <div className="admin-profile__field">
            <label htmlFor="location" className="admin-profile__label">Location</label>
            <input
              id="location"
              type="text"
              value={formData.location}
              onChange={e => updateField('location', e.target.value)}
              className="admin-profile__input"
            />
          </div>
        </div>

        <div className="admin-profile__field">
          <label htmlFor="short_intro" className="admin-profile__label">Short Introduction</label>
          <textarea
            id="short_intro"
            value={formData.short_intro}
            onChange={e => updateField('short_intro', e.target.value)}
            rows={3}
            className="admin-profile__input admin-profile__textarea"
          />
        </div>

        <div className="admin-profile__field">
          <label htmlFor="biography" className="admin-profile__label">Biography</label>
          <textarea
            id="biography"
            value={formData.biography}
            onChange={e => updateField('biography', e.target.value)}
            rows={5}
            className="admin-profile__input admin-profile__textarea"
          />
        </div>

        <div className="admin-profile__field">
          <label htmlFor="longer_about" className="admin-profile__label">Longer About</label>
          <textarea
            id="longer_about"
            value={formData.longer_about}
            onChange={e => updateField('longer_about', e.target.value)}
            rows={8}
            className="admin-profile__input admin-profile__textarea"
          />
        </div>

        <div className="admin-profile__actions">
          <button type="submit" disabled={saving} className="admin-profile__submit">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
