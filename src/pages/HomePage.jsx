import heroDark from "../../assets/herosection/hero_section_dark.webp";
import heroLight from "../../assets/herosection/hero_section_light.webp";
import EcosystemStory from "../components/EcosystemStory.jsx";
import { StageIcon } from "../components/media.jsx";
import { Arrow, ButtonLink, Link } from "../components/navigation.jsx";
import { products } from "../data/content.js";

const documentation = [
  { src: "/assets/startup/startup-04.jpg", alt: "Tim JagoFarm mengamati kolam", label: "Kegiatan lapangan" },
  { src: "/assets/startup/startup-08.jpg", alt: "Pengukuran kondisi media tanam", label: "Pengukuran media" },
  { src: "/assets/startup/startup-10.jpg", alt: "Tanaman yang diamati JagoFarm", label: "Pertumbuhan tanaman" },
];

const featuredProducts = products.slice(0, 3);

export default function HomePage() {
  return (
    <>
      <section className="hero section">
        <div className="hero-media" aria-hidden="true">
          <img className="hero-image hero-image-light" src={heroLight} alt="" loading="eager" fetchPriority="high" />
          <img className="hero-image hero-image-dark" src={heroDark} alt="" loading="eager" />
        </div>
        <div className="hero-shade" />
        <div className="container hero-content"><div className="hero-copy"><h1 className="hero-title">Smart Farming,<br />Circular Future</h1><p className="hero-description">Riset dan inovasi untuk ekosistem budidaya yang berkelanjutan.</p></div></div>
      </section>
      <section className="section ecosystem-overview">
        <div className="container ecosystem-overview-grid">
          <div className="ecosystem-overview-heading">
            <span className="number">Tentang gagasan</span>
            <h2>Satu ekosistem, lebih banyak nilai dari sumber daya yang sama.</h2>
            <div className="ecosystem-overview-note"><span><StageIcon type="leaf" /></span><p>Menghubungkan air, nutrisi, dan tanah dalam satu siklus yang saling menguatkan.</p></div>
          </div>
          <div className="ecosystem-overview-copy">
            <p className="lead">JagoFarm merancang hubungan antara budidaya ikan, pengolahan nutrisi, azolla, dan tanaman dalam satu putaran yang saling mendukung.</p>
            <p>Tujuannya sederhana: mengurangi sumber daya yang terbuang dan membuka lebih banyak hasil bernilai dari satu lahan.</p>
            <Link className="text-link" to="/tentang">Pelajari JagoFarm <Arrow /></Link>
          </div>
          <figure className="ecosystem-overview-photo">
            <img src="/assets/startup/startup-01.jpg" alt="Azolla pada kolam JagoFarm" loading="lazy" decoding="async" />
            <figcaption><span><StageIcon type="leaf" /></span><div><strong>Riset dan inovasi berkelanjutan</strong><small>Setiap temuan dipelajari untuk membuka nilai baru.</small></div></figcaption>
          </figure>
        </div>
      </section>
      <EcosystemStory />
      <section className="section editorial-feature home-documentation">
        <div className="container editorial-feature-shell">
          <header className="editorial-feature-heading">
            <div><span className="number">Dokumentasi nyata</span><h2>Proses yang bisa dilihat, bukan sekadar diceritakan.</h2></div>
            <div><p>Ikuti kegiatan lapangan JagoFarm dari pengamatan, pengukuran, hingga pertumbuhan.</p><ButtonLink secondary to="/dokumentasi">Lihat Dokumentasi</ButtonLink></div>
          </header>
          <div className="editorial-gallery" role="list" aria-label="Dokumentasi pilihan JagoFarm">
            {documentation.map((item, index) => <figure className={`editorial-card editorial-card-${index + 1}`} role="listitem" key={item.src}><img src={item.src} alt={item.alt} loading="lazy" decoding="async" /><figcaption><span>0{index + 1}</span><div><strong>{item.label}</strong><small>Dokumentasi JagoFarm</small></div></figcaption></figure>)}
          </div>
        </div>
      </section>
      <section className="section editorial-feature home-products">
        <div className="container editorial-feature-shell">
          <header className="editorial-feature-heading editorial-feature-heading-mirrored">
            <div><span className="number">Calon produk</span><h2>Hasil dari setiap sisi ekosistem.</h2></div>
            <div><p>Temukan hasil dari hubungan budidaya ikan, nutrisi, azolla, dan tanaman.</p><ButtonLink secondary to="/produk">Lihat Produk</ButtonLink></div>
          </header>
          <div className="editorial-gallery editorial-gallery-mirrored" role="list" aria-label="Produk pilihan JagoFarm">
            {featuredProducts.map((product, index) => <figure className={`editorial-card editorial-card-${index + 1}`} role="listitem" key={product.id}><img src={product.image} alt={product.name} loading="lazy" decoding="async" /><figcaption><span>0{index + 1}</span><div><strong>{product.name}</strong><small>{product.categoryLabel}</small></div></figcaption></figure>)}
          </div>
        </div>
      </section>
      <section className="section home-cta">
        <div className="container home-cta-inner"><div><span className="number">Ikuti perkembangannya</span><h2>Lihat prosesnya. Tanyakan potensinya.</h2></div><div className="buttons"><ButtonLink to="/dokumentasi">Lihat Dokumentasi</ButtonLink><ButtonLink secondary to="/tentang">Tentang JagoFarm</ButtonLink></div></div>
      </section>
    </>
  );
}
