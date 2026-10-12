import "./DecisionPlatformSection.css";
import { useLanguage } from "../i18n.jsx";
import { ButtonLink } from "./navigation.jsx";

const stages = [
  {
    number: "01",
    title: "Sensor",
    description: "Perangkat berbasis ESP32 membaca pH, TDS, dan suhu air.",
    status: "Sudah dibangun",
    state: "ready",
  },
  {
    number: "02",
    title: "Dashboard",
    description: "Backend Python dengan FastAPI mengolah data untuk ditampilkan di dashboard.",
    status: "Sudah dibangun",
    state: "ready",
  },
  {
    number: "03",
    title: "Rekomendasi AI",
    description: "Lapisan AI untuk rekomendasi tindakan sedang diintegrasikan dengan Claude API.",
    status: "Sedang diintegrasikan",
    state: "building",
  },
];

const aiFeatures = [
  "Rekomendasi tindakan beserta alasannya",
  "Peringatan dini dan prioritas",
  "Ringkasan harian dan mingguan",
  "Asisten tanya jawab tentang data kebun sendiri",
];

const evidence = [
  {
    image: "/assets/startup/startup-08.jpg",
    alt: "Pencatatan kondisi media tanam menggunakan sensor.",
    title: "Pengukuran media",
    fit: "cover",
  },
  {
    image: "/assets/projects/bestari/dashboard-alat-v1.svg",
    alt: "Dashboard untuk pengecekan data dari perangkat versi 1.",
    title: "Dashboard perangkat v1",
    fit: "contain",
  },
];

export default function DecisionPlatformSection() {
  const { t, language } = useLanguage();

  return (
    <section id="decision-platform" className="section decision-platform" aria-labelledby="decision-platform-title">
      <div className="container">
        <header className="decision-platform-heading">
          <span className="number">{t("Platform keputusan budidaya")}</span>
          <h2 id="decision-platform-title">{t("Dari data sensor ke keputusan budidaya.")}</h2>
          <p>{t("Sensor berbasis ESP32 membaca pH, TDS, dan suhu air. Backend Python dengan FastAPI mengolah data tersebut.")}</p>
          <p>{t("Claude API dipakai sebagai lapisan keputusan di dalam produk dan sedang diintegrasikan.")}</p>
          <p>{t("Rekomendasi membantu pengelola mempertimbangkan tindakan, bukan menggantikan keputusan mereka.")}</p>
        </header>

        <div className="decision-platform-grid">
          <div className="decision-platform-flow">
            <ol className="decision-platform-stages">
              {stages.map((stage) => (
                <li className="decision-platform-stage" key={stage.number}>
                  <span className="decision-platform-number">{t(stage.number)}</span>
                  <div className="decision-platform-stage-copy">
                    <h3>{t(stage.title)}</h3>
                    <p>{t(stage.description)}</p>
                  </div>
                  <span className={`decision-platform-status is-${stage.state}`}>
                    {stage.status === "Sudah dibangun"
                      ? t(language === "en" ? "Sudah dibangun" : "Built")
                      : t(language === "en" ? "Sedang diintegrasikan" : "Being integrated")}
                  </span>
                </li>
              ))}
            </ol>

            <section className="decision-platform-ai" aria-labelledby="decision-platform-ai-title">
              <h3 id="decision-platform-ai-title">
                {t("Fitur AI yang sedang diintegrasikan")}
              </h3>
              <ul className="decision-platform-ai-features">
                {aiFeatures.map((feature) => (
                  <li className="decision-platform-ai-feature" key={feature}>
                    <span>{t(feature)}</span>
                    <span className="decision-platform-feature-status">
                      {t(language === "en" ? "Sedang diintegrasikan" : "Being integrated")}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          </div>

          <div className="decision-platform-evidence">
            {evidence.map((item) => (
              <figure className="decision-platform-evidence-item" key={item.image}>
                <img
                  className={`is-${item.fit}`}
                  src={item.image}
                  alt={t(item.alt)}
                  loading="lazy"
                  decoding="async"
                />
                <figcaption>{t(item.title)}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        <p className="decision-platform-audience">
          {t(
            "Target pengguna: pelaku akuaponik, hidroponik, dan budidaya ikan skala kecil dan menengah di Indonesia.",
          )}
        </p>
        <div className="decision-platform-links">
          <ButtonLink to="/proyek/iot">
            {t("Lihat dokumentasi perangkat dan dashboard")}
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
