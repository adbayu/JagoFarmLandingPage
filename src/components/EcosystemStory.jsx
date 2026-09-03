import { useEffect, useRef, useState } from "react";
import { cycleStages } from "../data/content.js";
import { getStoryState } from "../story-progress.js";
import { StageIcon } from "./media.jsx";

const leaves = [
  ["leaf-01.webp", "7%", 0, 112, 300, .84],
  ["leaf-02.webp", "20%", .03, -128, -350, .74],
  ["leaf-03.webp", "36%", .08, 142, 430, .68],
  ["leaf-04.webp", "51%", .12, -104, 340, .78],
  ["leaf-05.webp", "65%", .05, 118, -410, .7],
  ["leaf-06.webp", "78%", .15, -148, 470, .76],
  ["leaf-07.webp", "89%", .1, 96, -330, .66],
  ["leaf-08.webp", "95%", .18, -88, 380, .62],
];

export default function EcosystemStory() {
  const sectionRef = useRef(null);
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const desktop = window.matchMedia("(min-width: 1100px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const leafElements = [...section.querySelectorAll(".ecosystem-falling-leaf")];
    let frame = 0;

    const update = () => {
      frame = 0;
      const sectionTop = section.getBoundingClientRect().top + window.scrollY;
      const { progress, stage } = getStoryState(window.scrollY, sectionTop, section.offsetHeight, window.innerHeight, cycleStages.length);
      section.style.setProperty("--cycle-progress", `${progress * 360}deg`);

      if (desktop.matches) setActiveStage((current) => current === stage ? current : stage);

      const travel = window.innerHeight * (desktop.matches ? 1.5 : 1.25);
      leafElements.forEach((leaf, index) => {
        const [, , delay, drift, spin, scale] = leaves[index];
        const local = Math.min(1, Math.max(0, (progress - delay) / Math.max(.01, 1 - delay)));
        const x = Math.sin(local * Math.PI * 2 + index) * drift * local;
        const opacity = local < .04 ? local / .04 : local > .9 ? (1 - local) / .1 : 1;
        leaf.style.opacity = `${Math.max(0, opacity)}`;
        leaf.style.transform = `translate3d(${x}px, ${local * travel}px, 0) rotate(${local * spin}deg) scale(${scale})`;
      });
    };

    const scheduleUpdate = () => { if (!frame) frame = requestAnimationFrame(update); };
    if (reducedMotion.matches) {
      setActiveStage(cycleStages.length - 1);
      section.style.setProperty("--cycle-progress", "360deg");
      return;
    }

    update();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    const desktop = window.matchMedia("(min-width: 1100px)");
    if (!section || desktop.matches) return;
    const cards = [...section.querySelectorAll(".ecosystem-card")];
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) setActiveStage(cards.indexOf(entry.target));
    }), { threshold: .55 });
    cards.forEach((card) => observer.observe(card));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="section ecosystem-story" ref={sectionRef} aria-label="Alur ekosistem JagoFarm" style={{ "--cycle-progress": "0deg" }}>
      <span className="ecosystem-branch ecosystem-branch-left" aria-hidden="true" />
      <span className="ecosystem-branch ecosystem-branch-right" aria-hidden="true" />
      <span className="ecosystem-foreground" aria-hidden="true" />
      <div className="ecosystem-sticky">
        <div className="ecosystem-falling-leaves" aria-hidden="true">
          {leaves.map(([asset, left]) => <span className="ecosystem-falling-leaf" style={{ "--leaf-image": `url(/assets/ecosystem-botanical/${asset})`, left }} key={asset} />)}
        </div>
        <div className="container ecosystem-story-layout">
          <div className="ecosystem-story-copy">
            <span className="number">Alur ekosistem</span>
            <h2>Dari kolam,<br />kembali ke lahan.</h2>
            <span className="ecosystem-copy-divider" aria-hidden="true"><StageIcon type="leaf" /></span>
            <p>Lima tahap berikut menjelaskan arah sistem. Dokumentasi menunjukkan kondisi nyata; proses akan berkembang mengikuti bukti lapangan.</p>
            <blockquote>“Kami percaya limbah bukan akhir, melainkan awal dari nilai baru yang berkelanjutan.”</blockquote>
          </div>
          <div className="ecosystem-cycle" aria-label={`Tahap aktif: ${cycleStages[activeStage].label}`}>
            <span className="ecosystem-orbit" aria-hidden="true"><i /></span>
            <div className="ecosystem-cycle-center">
              <img src="/jagofarm-mark-transparent.png" alt="" />
              <strong>JagoFarm</strong>
            </div>
            {cycleStages.map((stage, index) => (
              <article className={`ecosystem-card ecosystem-card-${index + 1}${index === activeStage ? " is-active" : ""}${index < activeStage ? " is-past" : ""}`} aria-current={index === activeStage ? "step" : undefined} key={stage.number}>
                <header><b>{stage.number}</b><h3>{stage.label}</h3><span><StageIcon type={stage.icon} /></span></header>
                <img src={stage.image} alt={stage.alt} loading="lazy" decoding="async" />
                <p>{stage.title}</p>
              </article>
            ))}
            <div className="ecosystem-loop-note"><span><StageIcon type="leaf" /></span>Siklus berputar, nilai bertambah.</div>
          </div>
        </div>
      </div>
    </section>
  );
}
