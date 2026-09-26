import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { adminApi } from '../../lib/api';
import type { Category } from '../../lib/types';
import LoadingSpinner from '../../components/public/LoadingSpinner';
import './ProjectForm.css';

export default function ProjectForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    tagline: '',
    short_description: '',
    full_description: '',
    category_id: '',
    status: 'draft',
    featured: false,
    published: false,
    sort_order: 0,
    meta_title: '',
    meta_description: ''
  });

  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    loadCategories();
    if (isEdit && id) {
      loadProject(Number(id));
    }
  }, [isEdit, id]);

  const loadCategories = async () => {
    try {
      await adminApi.getProjects({ limit: 1 });
      setCategories([]);
    } catch {
      setCategories([]);
    }
  };

  const loadProject = async (projectId: number) => {
    setLoading(true);
    setError('');
    try {
      const data = await adminApi.getProject(projectId);
      setFormData({
        name: data.name,
        slug: data.slug,
        tagline: data.tagline || '',
        short_description: data.short_description || '',
        full_description: data.full_description || '',
        category_id: data.category_id?.toString() || '',
        status: data.status,
        featured: data.featured === 1,
        published: data.published === 1,
        sort_order: data.sort_order,
        meta_title: data.meta_title || '',
        meta_description: data.meta_description || ''
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load project';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const updateField = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);

    try {
      const payload: Record<string, unknown> = {
        name: formData.name,
        slug: formData.slug,
        tagline: formData.tagline,
        short_description: formData.short_description,
        full_description: formData.full_description,
        category_id: formData.category_id ? Number(formData.category_id) : null,
        status: formData.status,
        featured: formData.featured ? 1 : 0,
        published: formData.published ? 1 : 0,
        sort_order: formData.sort_order,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description
      };

      if (isEdit && id) {
        await adminApi.updateProject(Number(id), payload);
        setSuccess('Project updated successfully.');
      } else {
        await adminApi.createProject(payload);
        setSuccess('Project created successfully.');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save project';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="project-form__loading">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="project-form">
      <div className="project-form__header">
        <h1 className="project-form__title">{isEdit ? 'Edit Project' : 'New Project'}</h1>
      </div>

      {error && (
        <div className="project-form__error" role="alert">
          {error}
        </div>
      )}

      {success && (
        <div className="project-form__success" role="status">
          {success}
          <button onClick={() => navigate('/admin/projects')} className="project-form__success-btn">
            View Projects
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="project-form__form">
        <fieldset className="project-form__fieldset">
          <legend className="project-form__legend">General</legend>

          <div className="project-form__row">
            <div className="project-form__field">
              <label htmlFor="name" className="project-form__label">Name</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={e => updateField('name', e.target.value)}
                required
                className="project-form__input"
              />
            </div>

            <div className="project-form__field">
              <label htmlFor="slug" className="project-form__label">Slug</label>
              <input
                id="slug"
                type="text"
                value={formData.slug}
                onChange={e => updateField('slug', e.target.value)}
                required
                className="project-form__input"
              />
            </div>
          </div>

          <div className="project-form__field">
            <label htmlFor="tagline" className="project-form__label">Tagline</label>
            <input
              id="tagline"
              type="text"
              value={formData.tagline}
              onChange={e => updateField('tagline', e.target.value)}
              className="project-form__input"
            />
          </div>

          <div className="project-form__field">
            <label htmlFor="short_description" className="project-form__label">Short Description</label>
            <textarea
              id="short_description"
              value={formData.short_description}
              onChange={e => updateField('short_description', e.target.value)}
              rows={3}
              className="project-form__input project-form__textarea"
            />
          </div>

          <div className="project-form__field">
            <label htmlFor="full_description" className="project-form__label">Full Description</label>
            <textarea
              id="full_description"
              value={formData.full_description}
              onChange={e => updateField('full_description', e.target.value)}
              rows={6}
              className="project-form__input project-form__textarea"
            />
          </div>
        </fieldset>

        <fieldset className="project-form__fieldset">
          <legend className="project-form__legend">Settings</legend>

          <div className="project-form__row">
            <div className="project-form__field">
              <label htmlFor="category_id" className="project-form__label">Category</label>
              <select
                id="category_id"
                value={formData.category_id}
                onChange={e => updateField('category_id', e.target.value)}
                className="project-form__input"
              >
                <option value="">None</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div className="project-form__field">
              <label htmlFor="status" className="project-form__label">Status</label>
              <select
                id="status"
                value={formData.status}
                onChange={e => updateField('status', e.target.value)}
                className="project-form__input"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
          </div>

          <div className="project-form__row">
            <label className="project-form__checkbox">
              <input
                type="checkbox"
                checked={formData.featured}
                onChange={e => updateField('featured', e.target.checked)}
              />
              <span>Featured</span>
            </label>

            <label className="project-form__checkbox">
              <input
                type="checkbox"
                checked={formData.published}
                onChange={e => updateField('published', e.target.checked)}
              />
              <span>Published</span>
            </label>
          </div>

          <div className="project-form__field">
            <label htmlFor="sort_order" className="project-form__label">Sort Order</label>
            <input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={e => updateField('sort_order', Number(e.target.value))}
              className="project-form__input"
            />
          </div>
        </fieldset>

        <fieldset className="project-form__fieldset">
          <legend className="project-form__legend">SEO</legend>

          <div className="project-form__field">
            <label htmlFor="meta_title" className="project-form__label">Meta Title</label>
            <input
              id="meta_title"
              type="text"
              value={formData.meta_title}
              onChange={e => updateField('meta_title', e.target.value)}
              className="project-form__input"
            />
          </div>

          <div className="project-form__field">
            <label htmlFor="meta_description" className="project-form__label">Meta Description</label>
            <textarea
              id="meta_description"
              value={formData.meta_description}
              onChange={e => updateField('meta_description', e.target.value)}
              rows={3}
              className="project-form__input project-form__textarea"
            />
          </div>
        </fieldset>

        <div className="project-form__actions">
          <button type="button" onClick={() => navigate('/admin/projects')} className="project-form__cancel">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="project-form__submit">
            {saving ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
          </button>
        </div>
      </form>
    </div>
  );
}
