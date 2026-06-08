import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AdminLayout from '../../components/admin/AdminLayout';
import { cottagesApi } from '../../api/cottages';
import { amenitiesApi } from '../../api/amenities';
import './CottageFormPage.css';

const EMPTY_FORM = {
  name: '',
  description: '',
  capacity: '',
  price_per_night: '',
  address: '',
  latitude: '',
  longitude: '',
  is_visible: true,
};

function validate(form) {
  const e = {};
  if (!form.name.trim()) e.name = 'Name is required.';
  if (!form.capacity) e.capacity = 'Capacity is required.';
  else if (Number(form.capacity) < 1) e.capacity = 'Must be at least 1.';
  if (!form.price_per_night) e.price_per_night = 'Price is required.';
  else if (Number(form.price_per_night) < 0) e.price_per_night = 'Must be positive.';
  if (form.latitude && isNaN(Number(form.latitude))) e.latitude = 'Invalid coordinate.';
  if (form.longitude && isNaN(Number(form.longitude))) e.longitude = 'Invalid coordinate.';
  return e;
}

export default function CottageFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(isEdit);

  const [allAmenities, setAllAmenities] = useState([]);
  const [selectedAmenities, setSelectedAmenities] = useState([]);

  const [existingImages, setExistingImages] = useState([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [deletingImg, setDeletingImg] = useState(null);

  useEffect(() => {
    amenitiesApi.getAll()
      .then(r => setAllAmenities(r.data))
      .catch(() => { });
  }, []);

  useEffect(() => {
    if (!isEdit) return;
    cottagesApi.getById(id).then(r => {
      const c = r.data;
      setForm({
        name: c.name ?? '',
        description: c.description ?? '',
        capacity: c.capacity ?? '',
        price_per_night: c.price_per_night ?? '',
        address: c.address ?? '',
        latitude: c.latitude ?? '',
        longitude: c.longitude ?? '',
        is_visible: c.is_visible ?? true,
      });
      setExistingImages(
        [...(c.cottage_images ?? [])].sort((a, b) => a.sort_order - b.sort_order)
      );
      setSelectedAmenities((c.amenities ?? []).map(a => a.id));
    }).catch(() => {
      setServerError('Failed to load cottage.');
    }).finally(() => setLoading(false));
  }, [id, isEdit]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;
    setForm(f => ({ ...f, [name]: val }));
    if (touched[name]) {
      const errs = validate({ ...form, [name]: val });
      setErrors(prev => ({ ...prev, [name]: errs[name] }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(t => ({ ...t, [name]: true }));
    const errs = validate(form);
    setErrors(prev => ({ ...prev, [name]: errs[name] }));
  };

  const toggleAmenity = (amenityId) => {
    setSelectedAmenities(prev =>
      prev.includes(amenityId)
        ? prev.filter(a => a !== amenityId)
        : [...prev, amenityId]
    );
  };

  const handleAddImage = async () => {
    if (!newImageUrl.trim()) { setImageError('Please enter an image URL.'); return; }
    if (!isEdit) { setImageError('Save the cottage first before adding images.'); return; }
    try {
      setImageError('');
      const res = await cottagesApi.addImage(id, {
        image_url: newImageUrl.trim(),
        sort_order: existingImages.length,
      });
      setExistingImages(prev => [...prev, res.data]);
      setNewImageUrl('');
    } catch {
      setImageError('Failed to add image.');
    }
  };

  const handleDeleteImage = async (imageId) => {
    try {
      setDeletingImg(imageId);
      await cottagesApi.deleteImage(id, imageId);
      setExistingImages(prev => prev.filter(img => img.id !== imageId));
    } catch {
      alert('Failed to delete image.');
    } finally {
      setDeletingImg(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const allTouched = Object.keys(EMPTY_FORM).reduce((a, k) => ({ ...a, [k]: true }), {});
    setTouched(allTouched);
    const errs = validate(form);
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      ...form,
      capacity: Number(form.capacity),
      price_per_night: parseFloat(form.price_per_night),
      latitude: form.latitude ? parseFloat(form.latitude) : null,
      longitude: form.longitude ? parseFloat(form.longitude) : null,
      amenity_ids: selectedAmenities,
    };

    try {
      setSubmitting(true);
      if (isEdit) {
        await cottagesApi.update(id, payload);
      } else {
        await cottagesApi.create(payload);
      }
      navigate('/admin/cottages');
    } catch (err) {
      setServerError(
        err.response?.data?.message || 'Something went wrong. Please try again.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="cottage-form-loading">
          <span className="spinner spinner--lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="animate-fade-in-up">

        <div className="admin-page-header">
          <div className="admin-page-header__left">
            <h1 className="admin-page-title">
              {isEdit ? 'Edit Cottage' : 'New Cottage'}
            </h1>
            <p className="admin-page-subtitle">
              {isEdit ? `Editing: ${form.name}` : 'Fill in the details below'}
            </p>
          </div>
          <Link to="/admin/cottages" className="btn btn--ghost">
            ← Back
          </Link>
        </div>

        {serverError && (
          <div className="admin-error" style={{ marginBottom: 'var(--space-6)' }}>
            ⚠ {serverError}
          </div>
        )}

        <form className="cottage-form" onSubmit={handleSubmit} noValidate>
          <div className="cottage-form__grid">

            <div className="cottage-form__col">

              <div className="cottage-form__section">
                <h2 className="cottage-form__section-title">Basic Information</h2>

                <div className="form-group">
                  <label className="form-label" htmlFor="name">Cottage Name *</label>
                  <input
                    id="name" name="name" type="text"
                    className={`form-input ${errors.name && touched.name ? 'form-input--error' : ''}`}
                    placeholder="e.g. Lakeside Pine Lodge"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={handleBlur}
                  />
                  {errors.name && touched.name && <span className="form-error">{errors.name}</span>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="description">Description</label>
                  <textarea
                    id="description" name="description"
                    className="form-input cottage-form__textarea"
                    placeholder="Describe the cottage, surroundings, unique features…"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                  />
                </div>

                <div className="cottage-form__row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="capacity">Max Guests *</label>
                    <input
                      id="capacity" name="capacity" type="number"
                      className={`form-input ${errors.capacity && touched.capacity ? 'form-input--error' : ''}`}
                      placeholder="6"
                      value={form.capacity}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={1}
                    />
                    {errors.capacity && touched.capacity && <span className="form-error">{errors.capacity}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="price_per_night">Price / Night ($) *</label>
                    <input
                      id="price_per_night" name="price_per_night" type="number"
                      className={`form-input ${errors.price_per_night && touched.price_per_night ? 'form-input--error' : ''}`}
                      placeholder="150"
                      value={form.price_per_night}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      min={0}
                      step="0.01"
                    />
                    {errors.price_per_night && touched.price_per_night && <span className="form-error">{errors.price_per_night}</span>}
                  </div>
                </div>

                <div className="cottage-form__toggle-wrap">
                  <label className="cottage-form__toggle">
                    <input
                      type="checkbox"
                      name="is_visible"
                      checked={form.is_visible}
                      onChange={handleChange}
                      className="cottage-form__toggle-input"
                    />
                    <span className="cottage-form__toggle-track">
                      <span className="cottage-form__toggle-thumb" />
                    </span>
                    <span className="cottage-form__toggle-label">
                      {form.is_visible ? 'Visible to public' : 'Hidden from public'}
                    </span>
                  </label>
                </div>
              </div>

              <div className="cottage-form__section">
                <h2 className="cottage-form__section-title">Location</h2>

                <div className="form-group">
                  <label className="form-label" htmlFor="address">Address</label>
                  <input
                    id="address" name="address" type="text"
                    className="form-input"
                    placeholder="ul. Leśna 12, 12-345 Mazury"
                    value={form.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="cottage-form__row">
                  <div className="form-group">
                    <label className="form-label" htmlFor="latitude">Latitude</label>
                    <input
                      id="latitude" name="latitude" type="text"
                      className={`form-input ${errors.latitude && touched.latitude ? 'form-input--error' : ''}`}
                      placeholder="53.123456"
                      value={form.latitude}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.latitude && touched.latitude && <span className="form-error">{errors.latitude}</span>}
                  </div>

                  <div className="form-group">
                    <label className="form-label" htmlFor="longitude">Longitude</label>
                    <input
                      id="longitude" name="longitude" type="text"
                      className={`form-input ${errors.longitude && touched.longitude ? 'form-input--error' : ''}`}
                      placeholder="21.654321"
                      value={form.longitude}
                      onChange={handleChange}
                      onBlur={handleBlur}
                    />
                    {errors.longitude && touched.longitude && <span className="form-error">{errors.longitude}</span>}
                  </div>
                </div>
                <p className="cottage-form__hint">
                  ⊹ You can find coordinates on Google Maps — right-click any location and copy the numbers.
                </p>
              </div>

            </div>

            <div className="cottage-form__col">

              <div className="cottage-form__section">
                <h2 className="cottage-form__section-title">Amenities</h2>
                {allAmenities.length === 0 ? (
                  <p className="cottage-form__hint">No amenities defined yet. Add them first in the database.</p>
                ) : (
                  <div className="cottage-form__amenities">
                    {allAmenities.map(a => (
                      <button
                        key={a.id}
                        type="button"
                        className={`cottage-form__amenity-chip ${selectedAmenities.includes(a.id) ? 'cottage-form__amenity-chip--active' : ''}`}
                        onClick={() => toggleAmenity(a.id)}
                      >
                        {selectedAmenities.includes(a.id) ? '✓ ' : ''}{a.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="cottage-form__section">
                <h2 className="cottage-form__section-title">Photos</h2>

                {!isEdit && (
                  <p className="cottage-form__hint">
                    ⊹ Save the cottage first, then you can add photos.
                  </p>
                )}

                {isEdit && (
                  <>
                    {existingImages.length > 0 && (
                      <div className="cottage-form__images">
                        {existingImages.map((img, i) => (
                          <div key={img.id} className="cottage-form__img-item">
                            <img src={img.image_url} alt={`Photo ${i + 1}`} />
                            <div className="cottage-form__img-overlay">
                              <button
                                type="button"
                                className="cottage-form__img-delete"
                                onClick={() => handleDeleteImage(img.id)}
                                disabled={deletingImg === img.id}
                              >
                                {deletingImg === img.id
                                  ? <span className="spinner spinner--sm spinner--light" />
                                  : '×'
                                }
                              </button>
                            </div>
                            {i === 0 && (
                              <span className="cottage-form__img-cover">Cover</span>
                            )}
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="cottage-form__add-image">
                      <div className="form-group">
                        <label className="form-label">Add Photo URL</label>
                        <div className="cottage-form__add-image-row">
                          <input
                            type="url"
                            className={`form-input ${imageError ? 'form-input--error' : ''}`}
                            placeholder="https://example.com/photo.jpg"
                            value={newImageUrl}
                            onChange={e => { setNewImageUrl(e.target.value); setImageError(''); }}
                          />
                          <button
                            type="button"
                            className="btn btn--primary"
                            onClick={handleAddImage}
                          >
                            Add
                          </button>
                        </div>
                        {imageError && <span className="form-error">{imageError}</span>}
                      </div>
                    </div>
                  </>
                )}
              </div>

            </div>
          </div>

          <div className="cottage-form__footer">
            <Link to="/admin/cottages" className="btn btn--ghost btn--lg">
              Cancel
            </Link>
            <button
              type="submit"
              className="btn btn--primary btn--lg"
              disabled={submitting}
            >
              {submitting
                ? <><span className="spinner spinner--sm spinner--light" /> Saving…</>
                : isEdit ? 'Save Changes' : 'Create Cottage'
              }
            </button>
          </div>
        </form>

      </div>
    </AdminLayout>
  );
}
