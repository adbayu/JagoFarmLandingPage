import { useEffect, useRef, useState } from "react";
import { cycleStages } from "../data/content.js";
import { getStoryState } from "../story-progress.js";
import { StageIcon } from "./media.jsx";
import { ecosystemNodes } from "./ecosystem-flow.js";
import "./EcosystemStory.css";

function FlowFallback() {
  return <div className="eco-flow-fallback" aria-label="Alur: 01 ke 02 dan 03; 02 dan 03 ke 04; 04 ke 05; 05 kembali ke 01">
    <span>01 Â· Budidaya ikan</span>
    <div className="eco-flow-branches"><span>â†“<br />02 Â· Sisa budidaya</span><span>â†“<br />03 Â· Azolla dan pupuk</span></div>
    <span>â†˜ &nbsp; â†™<br />04 Â· Hasil tanaman</span><span>â†“<br />05 Â· Ekosistem sirkular</span>
    <small>â†© Kembali ke budidaya ikan</small>
  </div>;
}

export default function EcosystemStory() {
  const sectionRef = useRef(null);
  const viewportRef = useRef(null);
  const canvasRef = useRef(null);
  const pinsRef = useRef([]);
  const sceneRef = useRef(null);
  const activeStageRef = useRef(0);
  const [activeStage, setActiveStage] = useState(0);
  const [sceneState, setSceneState] = useState("loading");

  useEffect(() => {
    activeStageRef.current = activeStage;
    sceneRef.current?.setStage(activeStage);
  }, [activeStage]);

  useEffect(() => {
    let disposed = false;
    let starting = false;
    const observer = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || starting) return;
      starting = true;
      observer.disconnect();
      try {
        const { createEcosystemScene } = await import("./ecosystem-scene.js");
        if (disposed) return;
        sceneRef.current = createEcosystemScene({
          canvas: canvasRef.current, viewport: viewportRef.current, pins: pinsRef.current,
          onError: () => setSceneState("fallback"),
        });
        sceneRef.current.setStage(activeStageRef.current);
        setSceneState("ready");
      } catch {
        if (!disposed) setSceneState("fallback");
      }
    }, { rootMargin: "450px" });
    observer.observe(viewportRef.current);
    return () => {
      disposed = true;
      observer.disconnect();
      sceneRef.current?.dispose();
      sceneRef.current = null;
    };
  }, []);

  useEffect(() => {
    let frame = 0;
    let previousScrollStage = -1;
    const update = () => {
      frame = 0;
      if (!window.matchMedia("(min-width: 1100px)").matches) return;
      const section = sectionRef.current;
      const top = section.getBoundingClientRect().top + window.scrollY;
      const { stage } = getStoryState(window.scrollY, top, section.offsetHeight, window.innerHeight, cycleStages.length);
      if (stage !== previousScrollStage) {
        previousScrollStage = stage;
        setActiveStage(stage);
      }
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  const stage = cycleStages[activeStage];
  const ready = sceneState === "ready";
  return (
    <section id="alur-ekosistem" className="section ecosystem-story ecosystem-story-3d" ref={sectionRef} aria-label="Alur ekosistem JagoFarm">
      <span className="ecosystem-branch ecosystem-branch-left" aria-hidden="true" />
      <span className="ecosystem-branch ecosystem-branch-right" aria-hidden="true" />
      <div className="ecosystem-sticky">
        <div className="container ecosystem-story-layout">
          <div className="ecosystem-story-copy">
            <span className="number">Alur ekosistem</span>
            <h2>Dari kolam,<br />kembali ke lahan.</h2>
            <span className="ecosystem-copy-divider" aria-hidden="true"><StageIcon type="leaf" /></span>
            <p>Lima tahap dalam satu ekosistem. Air dan sisa budidaya mengalir ke pengolahan serta azolla, lalu kembali menjadi nutrisi bagi tanaman.</p>
            <blockquote>Kami percaya limbah bukan akhir, melainkan awal dari nilai baru yang berkelanjutan.</blockquote>
          </div>
          <div className="eco-explorer">
            <div className="eco-scene-heading"><span>Jelajahi ekosistem</span><small>Ilustrasi konsep budidaya</small></div>
            <div className={`eco-viewport ${ready ? "is-ready" : ""}`} ref={viewportRef}>
              <canvas ref={canvasRef} className="eco-canvas" aria-label="Model ekosistem 3D. Geser horizontal untuk memutar, atau gunakan tombol putar di bawah." />
              {ready && <span className="eco-drag-hint" aria-hidden="true">â†” Geser untuk memutar</span>}
              <div className="eco-pins" hidden={!ready}>
                {cycleStages.map((item, index) => <button key={item.number} ref={(element) => { pinsRef.current[index] = element; }} className={`eco-pin${index === activeStage ? " is-active" : ""}`} type="button" onClick={() => setActiveStage(index)} aria-label={`${item.number} ${item.label}`} aria-pressed={index === activeStage}><b>{item.number}</b><span>{item.label}</span></button>)}
              </div>
              {!ready && <div className="eco-scene-placeholder"><p role="status">{sceneState === "loading" ? "Menyiapkan ekosistem 3Dâ€¦" : "Tampilan 3D tidak tersedia di perangkat ini. Jelajahi alurnya di bawah."}</p><FlowFallback /></div>}
            </div>
            <div className="eco-scene-tools">
              <ul className="eco-legend" aria-label="Jenis aliran"><li><i className="water" />Air</li><li><i className="nutrient" />Nutrisi</li><li><i className="biomass" />Biomassa</li></ul>
              <div className="eco-rotation-controls" role="group" aria-label="Kontrol model 3D">
                <button type="button" disabled={!ready} onClick={() => sceneRef.current?.rotate(-Math.PI / 6)} aria-label="Putar model ke kiri">â†¶</button>
                <button type="button" disabled={!ready} onClick={() => sceneRef.current?.reset()}>Reset</button>
                <button type="button" disabled={!ready} onClick={() => sceneRef.current?.rotate(Math.PI / 6)} aria-label="Putar model ke kanan">â†·</button>
              </div>
            </div>
            <div className="eco-stage-selector" role="group" aria-label="Pilih tahap ekosistem">
              {cycleStages.map((item, index) => <button type="button" key={item.number} className={index === activeStage ? "is-active" : ""} aria-pressed={index === activeStage} onClick={() => setActiveStage(index)}><b>{item.number}</b><span>{item.label}</span></button>)}
            </div>
            <div className="eco-stage-detail" aria-live="polite" aria-atomic="true">
              <span className="eco-detail-icon" aria-hidden="true"><StageIcon type={stage.icon} /></span>
              <div><h3>{stage.label}</h3><p>{ecosystemNodes[activeStage].output}</p></div>
              <span className="eco-detail-number" aria-hidden="true">{stage.number}/05</span>
            </div>
            <p className="eco-model-note">Hubungan alur: 01 â†’ 02 &amp; 03; 02 &amp; 03 â†’ 04 â†’ 05 â†’ 01. Konsep akan berkembang mengikuti bukti lapangan.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
