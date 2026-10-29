import heroDark from "../../assets/herosection/hero_section_dark.webp";
import heroLight from "../../assets/herosection/hero_section_light.webp";
import { useLanguage } from "../i18n.jsx";
import DecisionPlatformSection from "../components/DecisionPlatformSection.jsx";
import EcosystemStory from "../components/EcosystemStory.jsx";
import { StageIcon } from "../components/media.jsx";
import { Arrow, ButtonLink, Link } from "../components/navigation.jsx";
import { isAgriculturalProduct, useProducts } from "../data/content.js";

export default function HomePage() {
  const { t } = useLanguage();
  const { products, loading } = useProducts();
  
  // Filter for featured products (first 3 agricultural products)
  const featuredProducts = loading ? [] : products.filter(isAgriculturalProduct).slice(0, 3);

  return (
    <>
      <section className="hero section">
        <div className="hero-media" aria-hidden="true">
          <img
            className="hero-image hero-image-light"
            src={heroLight}
            alt=""
            loading="eager"
            fetchPriority="high"
          />
          <img
            className="hero-image hero-image-dark"
            src={heroDark}
            alt=""
            loading="eager"
          />
        </div>
        <div className="hero-shade" />
        <div className="container hero-content">
          <div className="hero-copy">
            <h1 className="hero-title">
              {t("Pertanian Cerdas,")}
              <br />
              {t("Masa Depan Sirkular")}
            </h1>
            <p className="hero-description">
              {t(
                "JagoFarm membangun platform yang menghubungkan data sensor dengan keputusan budidaya.",
              )}
            </p>
          </div>
        </div>
      </section>
      <DecisionPlatformSection />
      <section className="section ecosystem-overview">
        <div className="container ecosystem-overview-grid">
          <div className="ecosystem-overview-heading">
            <span className="number">{t("Tentang gagasan")}</span>
            <h2>
              {t(
                "Satu ekosistem, lebih banyak nilai dari sumber daya yang sama.",
              )}
            </h2>
            <div className="ecosystem-overview-note">
              <span>
                <StageIcon type="leaf" />
              </span>
              <p>
                {t(
                  "Menghubungkan air, nutrisi, dan tanah dalam satu siklus yang saling menguatkan.",
                )}
              </p>
            </div>
          </div>
          <div className="ecosystem-overview-copy">
            <p className="lead">
              {t(
                "JagoFarm merancang hubungan antara budidaya ikan, pengolahan nutrisi, azolla, dan tanaman dalam satu putaran yang saling mendukung.",
              )}
            </p>
            <p>
              {t(
                "Tujuannya sederhana: mengurangi sumber daya yang terbuang dan membuka lebih banyak hasil bernilai dari satu lahan.",
              )}
            </p>
            <Link className="text-link" to="/tentang">
              {t("Pelajari JagoFarm")} <Arrow />
            </Link>
          </div>
          <figure className="ecosystem-overview-photo">
            <img
              src="/assets/startup/startup-01.jpg"
              alt={t("Azolla pada kolam JagoFarm")}
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span>
                <StageIcon type="leaf" />
              </span>
              <div>
                <strong>{t("Riset dan inovasi berkelanjutan")}</strong>
                <small>
                  {t("Setiap temuan dipelajari untuk membuka nilai baru.")}
                </small>
              </div>
            </figcaption>
          </figure>
        </div>
      </section>
      <EcosystemStory />
      <section className="section editorial-feature home-products">
        <div className="container editorial-feature-shell">
          <header className="editorial-feature-heading editorial-feature-heading-mirrored">
            <div>
              <span className="number">{t("Calon produk")}</span>
              <h2>{t("Hasil dari setiap sisi ekosistem.")}</h2>
            </div>
            <div>
              <p>
                {t(
                  "Temukan hasil dari hubungan budidaya ikan, nutrisi, azolla, dan tanaman.",
                )}
              </p>
              <ButtonLink secondary to="/produk">
                {t("Lihat Produk")}
              </ButtonLink>
            </div>
          </header>
          <div
            className="editorial-gallery editorial-gallery-mirrored"
            role="list"
            aria-label={t("Produk pilihan JagoFarm")}
          >
            {featuredProducts.map((product, index) => (
              <figure
                className={`editorial-card editorial-card-${index + 1}`}
                role="listitem"
                key={product.id}
              >
                <img
                  src={product.image}
                  alt={t(product.name)}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>
                  <span>0{index + 1}</span>
                  <div>
                    <strong>{t(product.name)}</strong>
                    <small>{t(product.categoryLabel)}</small>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
      <section
        className="section home-incubator"
        aria-labelledby="home-incubator-title"
      >
        <div className="home-incubator-art" aria-hidden="true">
          <span className="home-incubator-ribbon home-incubator-ribbon-top" />
          <span className="home-incubator-ribbon home-incubator-ribbon-bottom" />
          <img
            src="/assets/startup-ecosystem-foliage.svg"
            alt=""
            width="2172"
            height="724"
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="container home-incubator-inner">
          <div className="home-incubator-copy">
            <span className="number">{t("Ekosistem startup")}</span>
            <h2 id="home-incubator-title">
              {t("JagoFarm dibina oleh Kolab Creative Hub.")}
            </h2>
            <p>
              {t(
                "Berkolaborasi untuk menghadirkan inovasi pertanian berkelanjutan melalui teknologi dan kreativitas.",
              )}
            </p>
          </div>
          <div className="home-incubator-partner">
            <span className="number">{t("Dinaungi oleh")}</span>
            <img
              className="home-incubator-logo"
              src="/assets/kolab-creative-hub.svg"
              alt="Kolab Creative Hub"
              width="190"
              height="170"
              loading="lazy"
              decoding="async"
            />
            <a
              className="home-incubator-link"
              href="https://kolab-landing.pages.dev/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span>{t("Kunjungi Kolab Creative Hub")}</span>
              <Arrow />
            </a>
          </div>
        </div>
      </section>
      <section className="section home-cta">
        <div className="container home-cta-inner">
          <div>
            <span className="number">{t("Ikuti perkembangannya")}</span>
            <h2>{t("Lihat prosesnya. Tanyakan potensinya.")}</h2>
          </div>
          <div className="buttons">
            <ButtonLink to="/tentang">{t("Tentang JagoFarm")}</ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
