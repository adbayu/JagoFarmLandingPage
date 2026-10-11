import "./DecisionPlatformSection.css";

const stages = [
  {
    number: "01",
    title: "Sensor",
    description: "Mengumpulkan data pH, TDS, dan suhu air.",
    status: "Sudah dibangun",
    state: "ready",
  },
  {
    number: "02",
    title: "Dashboard",
    description: "Membantu pengelola melihat pembacaan budidaya.",
    status: "Sudah dibangun",
    state: "ready",
  },
  {
    number: "03",
    title: "Bantuan keputusan Claude",
    description: "Dirancang untuk merangkum tren dan menyarankan langkah.",
    status: "Dalam pengembangan",
    state: "building",
  },
];

export default function DecisionPlatformSection() {
  return (
    <section className="section decision-platform" aria-labelledby="decision-platform-title">
      <div className="container">
        <header className="decision-platform-heading">
          <span className="number">Produk utama · platform budidaya</span>
          <h2 id="decision-platform-title">Dari pembacaan sensor ke keputusan yang lebih terarah.</h2>
          <p>
            JagoFarm mengembangkan alat bantu untuk pengelola aquaponik, hidroponik,
            dan budidaya ikan skala kecil hingga menengah.
          </p>
        </header>

        <div className="decision-platform-grid">
          <div className="decision-platform-flow">
            <ol className="decision-platform-stages">
              {stages.map((stage) => (
                <li className="decision-platform-stage" key={stage.number}>
                  <span className="decision-platform-number">{stage.number}</span>
                  <div className="decision-platform-stage-copy">
                    <h3>{stage.title}</h3>
                    <p>{stage.description}</p>
                  </div>
                  <span className={`decision-platform-status is-${stage.state}`}>
                    {stage.status}
                  </span>
                </li>
              ))}
            </ol>
            <p className="decision-platform-note">
              Claude disiapkan sebagai lapisan bantu. Rekomendasi nantinya ditujukan
              untuk mendukung pertimbangan pengelola, bukan menggantikannya.
            </p>
          </div>

          <figure className="decision-platform-evidence">
            <img
              src="/assets/startup/startup-08.jpg"
              alt="Pengukuran kondisi media tanam menggunakan sensor"
              loading="lazy"
              decoding="async"
            />
            <figcaption>
              <span className="decision-platform-photo-mark" aria-hidden="true">↗</span>
              <span>
                <strong>Pengamatan lapangan</strong>
                <small>Dokumentasi pengukuran kondisi media budidaya.</small>
              </span>
            </figcaption>
          </figure>
        </div>

      </div>
    </section>
  );
}
