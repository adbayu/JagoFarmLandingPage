import heroDark from "../../assets/herosection/hero_section_dark.webp";
import heroLight from "../../assets/herosection/hero_section_light.webp";
import { Arrow, ButtonLink, Link } from "../components/navigation.jsx";

const capabilities = [
  { title: "Rekomendasi tindakan", copy: "Menjelaskan langkah yang dapat dipertimbangkan berdasarkan data dan konteks budidaya." },
  { title: "Peringatan dan prioritas", copy: "Membantu petani melihat perubahan yang perlu diperhatikan lebih dulu." },
  { title: "Ringkasan berkala", copy: "Merangkum perubahan kondisi dan hal yang perlu dipantau berikutnya." },
  { title: "Tanya jawab data farm", copy: "Membuka cara bertanya tentang pembacaan dan tren dari farm sendiri." },
];

export default function ProductsPage() {
  return (
    <>
      <section className="product-hero section platform-hero">
        <div className="product-hero-media" aria-hidden="true">
          <img className="hero-image hero-image-light" src={heroLight} alt="" loading="eager" fetchPriority="high" />
          <img className="hero-image hero-image-dark" src={heroDark} alt="" loading="eager" />
        </div>
        <div className="product-hero-shade" />
        <div className="container product-hero-content">
          <div>
            <span className="product-hero-kicker">Sensor dan dashboard sudah dibangun</span>
            <h1>Data air.<br />Langkah jelas.</h1>
          </div>
          <div className="product-hero-copy">
            <p>Lapisan Claude sedang dikembangkan untuk membantu petani memahami data kualitas air dan hal yang perlu diperhatikan.</p>
            <div className="buttons">
              <ButtonLink to="/dokumentasi">Lihat dokumentasi</ButtonLink>
              <Link className="platform-text-link" to="/tentang">Kenali tim <Arrow /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section platform-status">
        <div className="container">
          <header className="decision-section-heading">
            <h2>Apa yang tersedia hari ini.</h2>
            <p>Kami membedakan kemampuan yang sudah dibangun dari fitur yang masih dalam pengerjaan.</p>
          </header>
          <div className="platform-status-grid">
            <article className="platform-status-card">
              <span className="platform-status-label is-built">Sudah dibangun</span>
              <h3>Sensor ESP32 dan dashboard</h3>
              <p>Perangkat sensor dan dashboard untuk memantau parameter kualitas air.</p>
              <ul><li>pH air</li><li>TDS</li><li>Suhu air</li></ul>
            </article>
            <article className="platform-status-card is-development">
              <span className="platform-status-label">Sedang dikembangkan</span>
              <h3>Lapisan keputusan berbasis Claude</h3>
              <p>Integrasi Claude API melalui backend Python/FastAPI sedang dikembangkan agar data dapat dijelaskan dengan bahasa yang mudah dipahami.</p>
              <p className="platform-card-note">Kemampuan berikut adalah arah pengembangan, belum tersedia sebagai fitur aktif.</p>
            </article>
          </div>
        </div>
      </section>

      <section className="section platform-capabilities">
        <div className="container">
          <header className="decision-section-heading">
            <h2>Dukungan untuk pertanyaan yang lebih praktis.</h2>
            <p>Tujuan pengembangan adalah membantu petani bergerak dari angka menuju pemahaman dan tindak lanjut.</p>
          </header>
          <div className="platform-capability-list">
            {capabilities.map((item, index) => (
              <article className="platform-capability-row" key={item.title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <h3>{item.title}</h3><p>{item.copy}</p><small>Dalam pengembangan</small>
              </article>
            ))}
          </div>
          <p className="platform-honesty-note">Rekomendasi, metrik keberhasilan, dan hasil pilot akan ditampilkan setelah tersedia dan dapat dibuktikan.</p>
        </div>
      </section>

      <section className="section platform-market">
        <div className="container platform-market-inner">
          <h2>Untuk usaha budidaya kecil dan menengah di Indonesia.</h2>
          <div className="platform-market-copy">
            <p>Fokus JagoFarm mencakup pengelola akuaponik, hidroponik, dan budidaya ikan skala kecil yang membutuhkan pemantauan kondisi air dan dukungan memahami datanya.</p>
            <div className="platform-market-tags"><span>Akuaponik</span><span>Hidroponik</span><span>Budidaya ikan</span></div>
          </div>
        </div>
      </section>
    </>
  );
}