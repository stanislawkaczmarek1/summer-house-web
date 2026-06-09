import { useState, useEffect, useCallback } from 'react';
import './CottageGallery.css';

export default function CottageGallery({ images = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);

  const prev = useCallback(() => setActiveIndex(i => (i === 0 ? sorted.length - 1 : i - 1)), [sorted.length]);
  const next = useCallback(() => setActiveIndex(i => (i === sorted.length - 1 ? 0 : i + 1)), [sorted.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = e => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightboxOpen, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  if (sorted.length === 0) {
    return (
      <div className="gallery-empty">
        <span className="gallery-empty__icon">⌂</span>
        <p>No photos available</p>
      </div>
    );
  }

  const thumbnails = sorted.slice(0, 5);
  const hasMore = sorted.length > 5;

  return (
    <>
      <div className="gallery">
        <div className="gallery__main" onClick={() => setLightboxOpen(true)}>
          <img src={sorted[activeIndex].imageUrl} alt={`Photo ${activeIndex + 1}`} className="gallery__main-img" />
          <div className="gallery__main-overlay">
            <span className="gallery__zoom-hint">⊕ Click to expand</span>
          </div>
        </div>

        {sorted.length > 1 && (
          <div className="gallery__thumbs">
            {thumbnails.map((img, i) => (
              <button
                key={img.id}
                className={`gallery__thumb ${activeIndex === i ? 'gallery__thumb--active' : ''}`}
                onClick={() => setActiveIndex(i)}
              >
                <img src={img.imageUrl} alt={`Thumbnail ${i + 1}`} />
                {i === 4 && hasMore && (
                  <div className="gallery__thumb-more" onClick={e => { e.stopPropagation(); setLightboxOpen(true); }}>
                    +{sorted.length - 5}
                  </div>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div className="lightbox" onClick={() => setLightboxOpen(false)}>
          <div className="lightbox__inner" onClick={e => e.stopPropagation()}>
            <button className="lightbox__close" onClick={() => setLightboxOpen(false)}>×</button>
            <button className="lightbox__nav lightbox__nav--prev" onClick={prev}>‹</button>
            <div className="lightbox__img-wrap">
              <img src={sorted[activeIndex].imageUrl} alt={`Photo ${activeIndex + 1}`} className="lightbox__img" />
            </div>
            <button className="lightbox__nav lightbox__nav--next" onClick={next}>›</button>
            <div className="lightbox__counter">{activeIndex + 1} / {sorted.length}</div>
            <div className="lightbox__thumbs">
              {sorted.map((img, i) => (
                <button
                  key={img.id}
                  className={`lightbox__thumb ${activeIndex === i ? 'lightbox__thumb--active' : ''}`}
                  onClick={() => setActiveIndex(i)}
                >
                  <img src={img.imageUrl} alt={`Thumbnail ${i + 1}`} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
