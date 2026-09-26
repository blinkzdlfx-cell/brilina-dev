import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import type { Link as LinkType } from '../../lib/types';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './AdminLinks.css';

export default function AdminLinks() {
  const [items, setItems] = useState<LinkType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<LinkType | null>(null);
  const [formData, setFormData] = useState({ label: '', type: 'social', url: '', icon_key: 'link', active: true, sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getLinks();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load links';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      await adminApi.createLink(formData);
      setFormData({ label: '', type: 'social', url: '', icon_key: 'link', active: true, sort_order: 0 });
      await loadItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create link';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setFormError('');
    setSaving(true);
    try {
      await adminApi.updateLink(editing.id, formData);
      setEditing(null);
      setFormData({ label: '', type: 'social', url: '', icon_key: 'link', active: true, sort_order: 0 });
      await loadItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update link';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this link?')) return;
    try {
      await adminApi.deleteLink(id);
      await loadItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const startEdit = (item: LinkType) => {
    setEditing(item);
    setFormData({ label: item.label, type: item.type, url: item.url, icon_key: item.icon_key, active: item.active === 1, sort_order: item.sort_order });
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormData({ label: '', type: 'social', url: '', icon_key: 'link', active: true, sort_order: 0 });
  };

  return (
    <div className="admin-links">
      <h1 className="admin-links__title">Links</h1>
      <p className="admin-links__subtitle">Manage social and contact links.</p>

      {error && (
        <div className="admin-links__error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={editing ? handleUpdate : handleCreate} className="admin-links__form">
        {formError && (
          <div className="admin-links__form-error" role="alert">
            {formError}
          </div>
        )}

        <div className="admin-links__form-row">
          <div className="admin-links__field">
            <label htmlFor="link-label" className="admin-links__label">Label</label>
            <input
              id="link-label"
              type="text"
              value={formData.label}
              onChange={e => setFormData(prev => ({ ...prev, label: e.target.value }))}
              required
              className="admin-links__input"
            />
          </div>

          <div className="admin-links__field">
            <label htmlFor="link-type" className="admin-links__label">Type</label>
            <select
              id="link-type"
              value={formData.type}
              onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))}
              className="admin-links__input"
            >
              <option value="social">Social</option>
              <option value="contact">Contact</option>
            </select>
          </div>
        </div>

        <div className="admin-links__field">
          <label htmlFor="link-url" className="admin-links__label">URL</label>
          <input
            id="link-url"
            type="url"
            value={formData.url}
            onChange={e => setFormData(prev => ({ ...prev, url: e.target.value }))}
            required
            className="admin-links__input"
          />
        </div>

        <div className="admin-links__form-actions">
          {editing ? (
            <>
              <button type="button" onClick={cancelEdit} className="admin-links__cancel">Cancel</button>
              <button type="submit" disabled={saving} className="admin-links__submit">
                {saving ? 'Saving...' : 'Update'}
              </button>
            </>
          ) : (
            <button type="submit" disabled={saving} className="admin-links__submit">
              {saving ? 'Adding...' : 'Add Link'}
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="admin-links__list">
          {items.map(item => (
            <div key={item.id} className="admin-link-item">
              <div className="admin-link-item__info">
                <h3 className="admin-link-item__label">{item.label}</h3>
                <a href={item.url} className="admin-link-item__url" target="_blank" rel="noopener noreferrer">
                  {item.url}
                </a>
                <span className="admin-link-item__type">{item.type}</span>
              </div>
              <div className="admin-link-item__actions">
                <button onClick={() => startEdit(item)} className="admin-link-item__btn">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="admin-link-item__btn admin-link-item__btn--danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
