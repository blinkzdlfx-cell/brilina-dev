import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import type { ProfileImage } from '../../lib/types';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './Photos.css';

export default function Photos() {
  const [images, setImages] = useState<ProfileImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const loadImages = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getProfileImages();
      setImages(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load images';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('purpose', 'profile');
      formData.append('alt_text', file.name.replace(/\.[^/.]+$/, ''));

      await adminApi.createProfileImage(formData);
      await loadImages();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Upload failed';
      setUploadError(message);
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      await adminApi.updateProfileImage(id, { active: 1 });
      await loadImages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to set active image');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this image?')) return;
    try {
      await adminApi.deleteProfileImage(id);
      await loadImages();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete image');
    }
  };

  if (loading) {
    return (
      <div className="admin-photos__loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="admin-photos">
      <h1 className="admin-photos__title">Photos</h1>
      <p className="admin-photos__subtitle">Manage profile images.</p>

      {error && (
        <div className="admin-photos__error" role="alert">
          {error}
        </div>
      )}

      <div className="admin-photos__upload">
        <label htmlFor="photo-upload" className="admin-photos__upload-label">
          {uploading ? 'Uploading...' : 'Upload Image'}
        </label>
        <input
          id="photo-upload"
          type="file"
          accept="image/*"
          onChange={handleUpload}
          disabled={uploading}
          className="admin-photos__upload-input"
        />
        {uploadError && <span className="admin-photos__upload-error">{uploadError}</span>}
      </div>

      <div className="admin-photos__grid">
        {images.map((image) => (
          <div
            key={image.id}
            className={`admin-photo-card ${image.active === 1 ? 'admin-photo-card--active' : ''}`}
          >
            <img src={image.image_url} alt={image.alt_text || 'Profile image'} className="admin-photo-card__image" />
            <div className="admin-photo-card__actions">
              <button
                onClick={() => handleSetActive(image.id)}
                className={`admin-photo-card__btn ${image.active === 1 ? 'admin-photo-card__btn--active' : ''}`}
              >
                {image.active === 1 ? 'Active' : 'Set Active'}
              </button>
              <button
                onClick={() => handleDelete(image.id)}
                className="admin-photo-card__btn admin-photo-card__btn--danger"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {images.length === 0 && (
        <p className="admin-photos__empty">No images uploaded yet.</p>
      )}
    </div>
  );
}
