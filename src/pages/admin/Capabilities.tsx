import { useState, useEffect, useCallback } from 'react';
import { adminApi } from '../../lib/api';
import type { Capability } from '../../lib/types';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './AdminCapabilities.css';

export default function AdminCapabilities() {
  const [items, setItems] = useState<Capability[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState<Capability | null>(null);
  const [formData, setFormData] = useState({ name: '', description: '', icon_key: 'code', active: true, sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const loadItems = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getCapabilities();
      setItems(data);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load capabilities';
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
      await adminApi.createCapability(formData);
      setFormData({ name: '', description: '', icon_key: 'code', active: true, sort_order: 0 });
      await loadItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create capability';
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
      await adminApi.updateCapability(editing.id, formData);
      setEditing(null);
      setFormData({ name: '', description: '', icon_key: 'code', active: true, sort_order: 0 });
      await loadItems();
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update capability';
      setFormError(message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this capability?')) return;
    try {
      await adminApi.deleteCapability(id);
      await loadItems();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to delete');
    }
  };

  const startEdit = (item: Capability) => {
    setEditing(item);
    setFormData({ name: item.name, description: item.description, icon_key: item.icon_key, active: item.active === 1, sort_order: item.sort_order });
  };

  const cancelEdit = () => {
    setEditing(null);
    setFormData({ name: '', description: '', icon_key: 'code', active: true, sort_order: 0 });
  };

  return (
    <div className="admin-capabilities">
      <h1 className="admin-capabilities__title">Capabilities</h1>
      <p className="admin-capabilities__subtitle">Manage your capabilities.</p>

      {error && (
        <div className="admin-capabilities__error" role="alert">
          {error}
        </div>
      )}

      <form onSubmit={editing ? handleUpdate : handleCreate} className="admin-capabilities__form">
        {formError && (
          <div className="admin-capabilities__form-error" role="alert">
            {formError}
          </div>
        )}

        <div className="admin-capabilities__form-row">
          <div className="admin-capabilities__field">
            <label htmlFor="cap-name" className="admin-capabilities__label">Name</label>
            <input
              id="cap-name"
              type="text"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
              className="admin-capabilities__input"
            />
          </div>

          <div className="admin-capabilities__field">
            <label htmlFor="cap-icon" className="admin-capabilities__label">Icon</label>
            <select
              id="cap-icon"
              value={formData.icon_key}
              onChange={e => setFormData(prev => ({ ...prev, icon_key: e.target.value }))}
              className="admin-capabilities__input"
            >
              <option value="code">Code</option>
              <option value="database">Database</option>
              <option value="cloud">Cloud</option>
              <option value="cpu">CPU</option>
              <option value="shield">Shield</option>
              <option value="zap">Zap</option>
            </select>
          </div>
        </div>

        <div className="admin-capabilities__field">
          <label htmlFor="cap-desc" className="admin-capabilities__label">Description</label>
          <textarea
            id="cap-desc"
            value={formData.description}
            onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
            rows={3}
            className="admin-capabilities__input admin-capabilities__textarea"
          />
        </div>

        <div className="admin-capabilities__form-actions">
          {editing ? (
            <>
              <button type="button" onClick={cancelEdit} className="admin-capabilities__cancel">Cancel</button>
              <button type="submit" disabled={saving} className="admin-capabilities__submit">
                {saving ? 'Saving...' : 'Update'}
              </button>
            </>
          ) : (
            <button type="submit" disabled={saving} className="admin-capabilities__submit">
              {saving ? 'Adding...' : 'Add Capability'}
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <LoadingSpinner />
      ) : (
        <div className="admin-capabilities__list">
          {items.map(item => (
            <div key={item.id} className="admin-capability-item">
              <div className="admin-capability-item__info">
                <h3 className="admin-capability-item__name">{item.name}</h3>
                <p className="admin-capability-item__desc">{item.description}</p>
              </div>
              <div className="admin-capability-item__actions">
                <button onClick={() => startEdit(item)} className="admin-capability-item__btn">Edit</button>
                <button onClick={() => handleDelete(item.id)} className="admin-capability-item__btn admin-capability-item__btn--danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
