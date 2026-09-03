import { StageIcon } from "./media.jsx";

const marketplaces = [
  ["Shopee", "/assets/marketplaces/shopee.svg"],
  ["Tokopedia", "/assets/marketplaces/tokopedia.svg"],
  ["TikTok Shop", "/assets/marketplaces/tiktok.svg"],
];

export default function ProductCard({ product }) {
  return (
    <article className="catalog-card">
      <div className="catalog-card-media">
        <img src={product.image} alt={`Dokumentasi ${product.name}`} loading="lazy" decoding="async" />
        <span className="catalog-status">Dalam eksplorasi</span>
        <span className="catalog-product-icon"><StageIcon type={product.icon} /></span>
      </div>
      <div className="catalog-card-body">
        <span className="catalog-category">{product.categoryLabel}</span>
        <h2>{product.name}</h2>
        <p>{product.description}</p>
        <footer className="catalog-marketplaces">
          <span>Marketplace</span>
          <div>
            {marketplaces.map(([name, logo]) => (
              <span className="marketplace-option" aria-disabled="true" title={`${name} · Segera tersedia`} key={name}>
                <img src={logo} alt="" aria-hidden="true" />
                <span className="sr-only">{name}, segera tersedia</span>
              </span>
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}
