import { Link } from 'react-router-dom';
import './CottageCard.css';

const AMENITY_ICONS = {
  'WiFi': '⌘',
  'Parking': '⊡',
  'Kitchen': '⊕',
  'Fireplace': '◈',
  'Pool': '◎',
  'Pet-friendly': '◉',
  'BBQ': '◆',
  'Sauna': '◇',
};

export default function CottageCard({ cottage }) {
  const {
    id,
    name,
    description,
    capacity,
    price_per_night,
    address,
    is_visible,
    cottage_images = [],
    amenities = [],
  } = cottage;

  const coverImage = cottage_images
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)[0]?.image_url;

  const visibleAmenities = amenities.slice(0, 4);
  const extraCount = amenities.length - visibleAmenities.length;

  return (
    <article className="cottage-card">
      <Link to={`/cottages/${id}`} className="cottage-card__img-wrap">
        {coverImage ? (
          <img
            src={coverImage}
            alt={name}
            className="cottage-card__img"
            loading="lazy"
          />
        ) : (
          <div className="cottage-card__img-placeholder">
            <span>⌂</span>
          </div>
        )}

        {!is_visible && (
          <div className="cottage-card__hidden-badge">Hidden</div>
        )}

        <div className="cottage-card__img-overlay" />
      </Link>

      <div className="cottage-card__body">
        <div className="cottage-card__meta">
          <span className="cottage-card__capacity">
            ◎ Up to {capacity} guests
          </span>
        </div>

        <h3 className="cottage-card__name">
          <Link to={`/cottages/${id}`}>{name}</Link>
        </h3>

        {address && (
          <p className="cottage-card__address">⊹ {address}</p>
        )}

        {description && (
          <p className="cottage-card__desc">{description}</p>
        )}

        {amenities.length > 0 && (
          <div className="cottage-card__amenities">
            {visibleAmenities.map((a) => (
              <span key={a.id} className="cottage-card__amenity">
                <span>{AMENITY_ICONS[a.name] ?? '·'}</span>
                {a.name}
              </span>
            ))}
            {extraCount > 0 && (
              <span className="cottage-card__amenity cottage-card__amenity--more">
                +{extraCount} more
              </span>
            )}
          </div>
        )}

        <div className="cottage-card__footer">
          <div className="cottage-card__price">
            <span className="cottage-card__price-amount">
              ${Number(price_per_night).toFixed(0)}
            </span>
            <span className="cottage-card__price-unit"> / night</span>
          </div>
          <Link to={`/cottages/${id}`} className="btn btn--primary btn--sm">
            View Details
          </Link>
        </div>
      </div>
    </article>
  );
}
