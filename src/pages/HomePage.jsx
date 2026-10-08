import heroDark from "../../assets/herosection/hero_section_dark.webp";
import heroLight from "../../assets/herosection/hero_section_light.webp";
import EcosystemStory from "../components/EcosystemStory.jsx";
import { ButtonLink } from "../components/navigation.jsx";

const fieldNotes = [
  { src: "/assets/startup/startup-04.jpg", alt: "Tim JagoFarm mengamati kolam ikan", title: "Pengamatan lapangan" },
  { src: "/assets/startup/startup-08.jpg", alt: "Pencatatan kondisi media tanam menggunakan sensor", title: "Pengukuran media" },
  { src: "/assets/startup/startup-10.jpg", alt: "Tanaman yang diamati di area JagoFarm", title: "Pertumbuhan tanaman" },
];

const decisionSteps = [
  { number: "01", label: "Ukur", title: "Sensor mengumpulkan kondisi air.", description: "Perangkat berbasis ESP32 membaca pH, TDS, dan suhu air.", status: "Sensor dibangun" },
  { number: "02", label: "Pantau", title: "Dashboard menyajikan data.", description: "Parameter budidaya dapat dipantau dalam satu tempat.", status: "Dashboard dibangun" },
  { number: "03", label: "Pahami", title: "Data diarahkan menjadi langkah.", description: "Lapisan Claude sedang dikembangkan untuk membantu menjelaskan tren dan hal yang perlu diperhatikan.", status: "Dalam pengembangan" },
];

export default function HomePage() {
  return (
    <>
      <section className="hero section decision-hero">
        <div className="hero-media" aria-hidden="true">
          <img className="hero-image hero-image-light" src={heroLight} alt="" loading="eager" fetchPriority="high" />
          <img className="hero-image hero-image-dark" src={heroDark} alt="" loading="eager" />
        </div>
        <div className="hero-shade" />
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="decision-hero-kicker">Platform keputusan budidaya</span>
            <h1 className="hero-title">Data air.<br /><span>Langkah jelas.</span></h1>
            <p className="hero-description">JagoFarm mengembangkan platform yang menghubungkan data pH, TDS, dan suhu air dengan langkah budidaya yang lebih mudah dipahami.</p>
            <div className="buttons">
              <ButtonLink to="/produk">Kenali platform</ButtonLink>
              <ButtonLink secondary to="/dokumentasi">Lihat dokumentasi</ButtonLink>
            </div>
          </div>
        </div>
      </section>

      <section className="section decision-intro">
        <div className="container decision-intro-copy">
          <h2>Data saja belum memberi tahu petani apa yang perlu dilakukan.</h2>
          <p className="lead">Di banyak usaha budidaya kecil, perubahan kondisi baru terlihat setelah ikan atau tanaman mulai terdampak.</p>
          <p>Sensor dapat membantu mengukur kondisi air, tetapi angka tanpa konteks sulit menjawab tindakan apa yang perlu diprioritaskan. JagoFarm sedang membangun jembatan dari pemantauan menuju keputusan.</p>
        </div>
      </section>

      <section className="section decision-flow">
        <div className="container">
          <header className="decision-section-heading">
            <h2>Satu alur, dengan tahap produk yang jelas.</h2>
            <p>Sensor dan dashboard telah dibangun. Lapisan pengambilan keputusan berbasis Claude masih dalam pengembangan.</p>
          </header>
          <div className="decision-flow-grid">
            {decisionSteps.map((step, index) => (
              <article className={"decision-flow-card" + (index === 2 ? " is-in-development" : "")} key={step.number}>
                <div className="decision-flow-card-top"><span>{step.number}</span><small>{step.status}</small></div>
                <div className="decision-flow-card-content">
                  <span className="meta">{step.label}</span>
                  <h3>{step.title}</h3>
                  <p>{step.description}</p>
                </div>
              </article>
            ))}
          </div>
          <p className="decision-flow-note">Rekomendasi tindakan, peringatan awal, ringkasan berkala, dan tanya jawab tentang data farm adalah arah pengembangan lapisan Claude.</p>
        </div>
      </section>

      <EcosystemStory />

      <section className="section field-notes">
        <div className="container">
          <header className="decision-section-heading">
            <h2>Budidaya tetap menjadi konteks utama.</h2>
            <p>Platform dikembangkan dengan memahami kondisi budidaya dan pekerjaan yang berlangsung di lapangan.</p>
          </header>
          <div className="field-note-grid">
            {fieldNotes.map((item) => (
              <figure className="field-note-card" key={item.src}>
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                <figcaption><strong>{item.title}</strong></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
