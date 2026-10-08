import heroDark from "../../assets/herosection/hero_section_dark.webp";
import heroLight from "../../assets/herosection/hero_section_light.webp";
import { ButtonLink } from "../components/navigation.jsx";

const team = ["Haikal", "Ega", "Bayu", "Shafnat"];

export default function AboutPage() {
  return (
    <>
      <section className="hero section team-page-hero">
        <div className="hero-media" aria-hidden="true">
          <img className="hero-image hero-image-light" src={heroLight} alt="" loading="eager" fetchPriority="high" />
          <img className="hero-image hero-image-dark" src={heroDark} alt="" loading="eager" />
        </div>
        <div className="hero-shade" />
        <div className="container hero-content">
          <div className="hero-copy">
            <span className="decision-hero-kicker">Tim JagoFarm</span>
            <h1 className="hero-title">Tim di balik<br /><span>JagoFarm.</span></h1>
            <p className="hero-description">Haikal, Ega, Bayu, dan Shafnat mengembangkan platform keputusan budidaya dari kondisi lapangan dan kebutuhan petani.</p>
          </div>
        </div>
      </section>

      <section className="section team-page-section">
        <div className="container">
          <header className="decision-section-heading">
            <h2>Berangkat dari persoalan nyata di lapangan.</h2>
            <p>Kami menghubungkan pemantauan kualitas air dengan kebutuhan usaha budidaya. Produk terus berkembang seiring pekerjaan dan pembelajaran lapangan.</p>
          </header>
          <div className="team-page-content">
            <figure className="team-page-photo">
              <img src="/assets/team/team.webp" alt="Haikal, Ega, Bayu, dan Shafnat, tim JagoFarm" loading="lazy" decoding="async" />
            </figure>
            <div className="team-page-roster">
              <span className="meta">Anggota tim</span>
              <ol>
                {team.map((name, index) => <li key={name}><span>0{index + 1}</span><strong>{name}</strong></li>)}
              </ol>
              <p>Fokus tim adalah membangun platform keputusan budidaya yang bermanfaat dan terus belajar dari kebutuhan petani.</p>
              <ButtonLink secondary to="/produk">Kenali platform</ButtonLink>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}