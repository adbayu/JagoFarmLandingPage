import { useEffect, useRef, useState } from "react";
import { cycleStages } from "../data/content.js";
import { useLanguage } from "../i18n.jsx";
import { StageIcon } from "./media.jsx";
import "./EcosystemStory.css";

const summaries = [
  "Ikan menjadi titik awal aliran nilai.",
  "Limbah dilihat sebagai sumber nutrisi.",
  "Biomassa kembali menjadi bahan berguna.",
  "Nutrisi membantu beragam tanaman tumbuh.",
  "Setiap hasil membuka putaran berikutnya.",
];

export default function EcosystemStory() {
  const { language, t } = useLanguage();
  const [selectedStage, setSelectedStage] = useState(null);
  const dialogRef = useRef(null);

  useEffect(() => {
    if (selectedStage) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [selectedStage]);

  return (
    <section id="alur-ekosistem" className="section ecosystem-story ecosystem-illustrated" aria-labelledby="ecosystem-title">
      <span className="ecosystem-branch ecosystem-branch-left" aria-hidden="true" />
      <span className="ecosystem-branch ecosystem-branch-right" aria-hidden="true" />
      <div className="container eco-illustrated-layout">
        <div className="eco-illustrated-copy">
          <span className="number"><StageIcon type="leaf" />{t("Alur ekosistem")}</span>
          <h2 id="ecosystem-title">{language === "en" ? <>From pond,<br />back to the field.</> : <>Dari kolam,<br />kembali ke lahan.</>}</h2>
          <span className="ecosystem-copy-divider" aria-hidden="true"><StageIcon type="leaf" /></span>
          <p>{t("Lima tahap berikut menjelaskan arah sistem. Proses akan berkembang mengikuti bukti lapangan.")}</p>
          <blockquote>{t("Kami percaya limbah bukan akhir, melainkan awal dari nilai baru yang berkelanjutan.")}</blockquote>
        </div>
        <div className="eco-illustrated-board">
          <img className="eco-illustration" src="/assets/ecosystem-illustration.png" width="1448" height="1086" alt={t("Ilustrasi alur budidaya ikan, pengolahan nutrisi, azolla, hasil tanaman, dan ekosistem sirkular.")} loading="lazy" decoding="async" />
          <ol className="eco-illustrated-stages">
            {cycleStages.map((stage, index) => (
              <li className={`eco-illustrated-stage eco-illustrated-stage-${stage.number}`} key={stage.number}>
                <button type="button" onClick={() => setSelectedStage(stage)} aria-haspopup="dialog" aria-label={`${t("Lihat detail")}: ${t(stage.label)}`}>
                  <span className="eco-stage-number">{stage.number}</span>
                  <span className="eco-stage-copy"><strong>{t(stage.label)}</strong><span>{t(summaries[index])}</span></span>
                  <span className="eco-stage-icon"><StageIcon type={stage.icon} /></span>
                  <span className="eco-stage-arrow" aria-hidden="true">›</span>
                </button>
              </li>
            ))}
          </ol>
          <div className="eco-illustrated-panels">
            <div className="eco-info-panel eco-input-panel">
              <ul>
                <li><span className="eco-material-icon is-water"><StageIcon type="drop" /></span>{t("Air")}</li>
                <li><span className="eco-material-icon is-water"><StageIcon type="cycle" /></span>{t("Nutrisi")}</li>
                <li><span className="eco-material-icon"><StageIcon type="leaf" /></span>{t("Limbah organik")}</li>
              </ul>
            </div>
            <div className="eco-info-panel eco-output-panel">
              <strong>{t("Output")}</strong>
              <ul>
                <li><span className="eco-material-dot is-soil" aria-hidden="true" />{t("Lumpur organik")}</li>
                <li><span className="eco-material-dot is-nutrient" aria-hidden="true" />{t("Air kaya nutrisi")}</li>
                <li><span className="eco-material-dot is-feed" aria-hidden="true" />{t("Sisa pakan")}</li>
              </ul>
            </div>
            <div className="eco-info-panel eco-results-panel">
              <strong>{t("Hasil")}</strong>
              <ul>
                <li><span className="eco-material-dot is-azolla" aria-hidden="true" />{t("Azolla (pakan)")}</li>
                <li><span className="eco-material-dot is-soil" aria-hidden="true" />{t("Pupuk organik")}</li>
                <li><span className="eco-material-dot is-biomass" aria-hidden="true" />{t("Biomassa tanaman")}</li>
              </ul>
            </div>
            <div className="eco-info-panel eco-commodities-panel">
              <strong>{t("Komoditas contoh")}</strong>
              <ul>
                {["Kangkung", "Herbal", "Melon"].map((crop, index) => <li key={crop}><span className={`eco-crop-thumbnail eco-crop-thumbnail-${index}`} aria-hidden="true" /><span>{t(crop)}</span></li>)}
              </ul>
            </div>
          </div>
        </div>
      </div>
      <dialog className="eco-stage-dialog" ref={dialogRef} onClose={() => setSelectedStage(null)} aria-labelledby="eco-stage-dialog-title" onClick={(event) => { if (event.target === event.currentTarget) setSelectedStage(null); }}>
        {selectedStage && <div className="eco-stage-dialog-content">
          <button className="eco-stage-dialog-close" type="button" onClick={() => setSelectedStage(null)} aria-label={t("Tutup")}>×</button>
          <span className="number">{selectedStage.number} · {t(selectedStage.label)}</span>
          <h2 id="eco-stage-dialog-title">{t(selectedStage.title)}</h2>
          <p>{t(selectedStage.description)}</p>
          <img src={selectedStage.image} alt={t(selectedStage.alt)} loading="lazy" decoding="async" />
        </div>}
      </dialog>
    </section>
  );
}
