import { useLanguage } from "../i18n.jsx";
import { StageIcon } from "./media.jsx";

const marketplaces = [
  ["Shopee", "/assets/marketplaces/shopee.svg"],
  ["Tokopedia", "/assets/marketplaces/tokopedia.svg"],
  ["TikTok Shop", "/assets/marketplaces/tiktok.svg"],
];

export default function ProductCard({ product, onSelect }) {
  const { t } = useLanguage();

  return (
    <article className="catalog-card">
      <div className="catalog-card-media">
        <img src={product.image} alt={`${t("Ilustrasi konsep")} ${t(product.name)}`} loading="lazy" decoding="async" />
        <span className="catalog-status">{t("Dalam eksplorasi")}</span>
        <span className="catalog-product-icon"><StageIcon type={product.icon} /></span>
      </div>
      <div className="catalog-card-body">
        <span className="catalog-category">{t(product.categoryLabel)}</span>
        <div className="catalog-card-title">
          <h3>{t(product.name)}</h3>
          {onSelect && <button className="catalog-card-open" type="button" onClick={() => onSelect(product)} aria-label={`${t("Lihat detail")} ${t(product.name)}`}><span aria-hidden="true">→</span></button>}
        </div>
        <p>{t(product.description)}</p>
        <footer className="catalog-marketplaces">
          <span>{t("Marketplace")}</span>
          <div>
            {marketplaces.map(([name, logo]) => (
              <span className="marketplace-option" aria-disabled="true" title={`${name} · ${t("Segera tersedia")}`} key={name}>
                <img src={logo} alt="" aria-hidden="true" />
                <span className="sr-only">{name}, {t("Segera tersedia")}</span>
              </span>
            ))}
          </div>
        </footer>
      </div>
    </article>
  );
}
