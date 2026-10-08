import { useEffect, useRef, useState } from "react";
import "./EcosystemStory.css";

const journeyStages = [
  {
    number: "01",
    label: "Amati",
    title: "Mulai dari kondisi budidaya.",
    description: "Sensor berbasis ESP32 mengumpulkan pH, TDS, dan suhu air pada sistem aquaponik, hidroponik, dan budidaya ikan.",
    status: "Sensor dibangun",
    state: "built",
  },
  {
    number: "02",
    label: "Kelola informasi",
    title: "Susun data agar bisa dibaca.",
    description: "Dashboard menyatukan pembacaan sensor dan membantu menelusuri kondisi sistem budidaya dari waktu ke waktu.",
    status: "Dashboard dibangun",
    state: "built",
  },
  {
    number: "03",
    label: "Eksplorasi",
    title: "Cari hubungan di balik data.",
    description: "JagoFarm mengeksplorasi bagaimana sistem informasi dapat menghubungkan data budidaya dengan konteks produksi pertanian.",
    status: "Arah eksplorasi",
    state: "development",
  },
  {
    number: "04",
    label: "Perluas cakupan",
    title: "Hubungkan budidaya dengan lanskap pangan.",
    description: "Tujuan jangka panjang JagoFarm adalah mengeksplorasi cara sistem informasi dapat memperkaya pemahaman tentang pertanian, budidaya, dan pangan.",
    status: "Visi jangka panjang",
    state: "direction",
  },
];

export default function EcosystemStory() {
  const sectionRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const steps = [...section.querySelectorAll("[data-journey-step]")];
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => {
          const viewportCenter = window.innerHeight / 2;
          const distanceA = Math.abs((a.boundingClientRect.top + a.boundingClientRect.bottom) / 2 - viewportCenter);
          const distanceB = Math.abs((b.boundingClientRect.top + b.boundingClientRect.bottom) / 2 - viewportCenter);
          return distanceA - distanceB;
        });

      if (visible.length) setActiveStage(Number(visible[0].target.dataset.journeyStep));
    }, { rootMargin: "-38% 0px -42% 0px", threshold: 0 });

    steps.forEach((step) => observer.observe(step));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section ecosystem-journey" ref={sectionRef} aria-labelledby="ecosystem-journey-title">
      <div className="container ecosystem-journey-layout">
        <div className="ecosystem-journey-intro">
          <span className="number">Eksplorasi agrikultur & pangan</span>
          <h2 id="ecosystem-journey-title">JagoFarm mengeksplorasi pertanian dan pangan lewat sistem informasi.</h2>
          <p>JagoFarm mengeksplorasi bagaimana sistem informasi dapat membantu kita membaca hubungan dalam budidaya dan pertanian. Perjalanan ini dimulai dari data kondisi air dan berkembang menuju pemahaman yang lebih luas tentang pangan.</p>

          <div className="ecosystem-journey-map" aria-hidden="true">
            {journeyStages.map((stage, index) => (
              <div className="ecosystem-journey-node-wrap" key={stage.number}>
                <div className={"ecosystem-journey-node" + (activeStage === index ? " is-active" : "") + (stage.state !== "built" ? " is-planned" : "")}>
                  <span>{stage.number}</span>
                  <strong>{index === 3 ? "Pertanian & pangan" : stage.label}</strong>
                  <small>{stage.status}</small>
                </div>
                {index < journeyStages.length - 1 && <span className="ecosystem-journey-connector" />}
              </div>
            ))}
          </div>

          <ul className="ecosystem-journey-signals" aria-label="Parameter sensor">
            <li>pH</li>
            <li>TDS</li>
            <li>Suhu air</li>
          </ul>
          <p className="ecosystem-journey-note">Fondasi saat ini: sensor dan dashboard budidaya. Eksplorasi berikutnya: sistem informasi untuk memahami pertanian dan pangan dalam cakupan yang lebih luas.</p>
        </div>

        <ol className="ecosystem-journey-steps">
          {journeyStages.map((stage, index) => (
            <li
              className={"ecosystem-journey-step" + (activeStage === index ? " is-active" : "")}
              data-journey-step={index}
              aria-current={activeStage === index ? "step" : undefined}
              key={stage.number}
            >
              <div className="ecosystem-journey-step-meta">
                <span>{stage.number}</span>
                <small className={"ecosystem-journey-status is-" + stage.state}>{stage.status}</small>
              </div>
              <div>
                <span className="meta">{stage.label}</span>
                <h3>{stage.title}</h3>
                <p>{stage.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
