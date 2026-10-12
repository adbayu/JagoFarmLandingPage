import { useLanguage } from "../i18n.jsx";
import { Link } from "./navigation.jsx";
import "./AboutAISection.css";

const tools = [
  { name: "Claude", logo: "claude.png", href: "https://claude.ai/", site: "claude.ai", use: "Riset dan penalaran" },
  { name: "ChatGPT", logo: "chatgpt.svg", href: "https://chatgpt.com/", site: "chatgpt.com", use: "Diskusi dan perencanaan" },
  { name: "Claude Code", logo: "claude.png", href: "https://claude.com/product/claude-code", site: "claude.com/product/claude-code", use: "Pengembangan kode" },
  { name: "Codex", logo: "chatgpt.svg", href: "https://openai.com/codex/", site: "openai.com/codex", use: "Implementasi dan perbaikan" },
  { name: "Hermes Agent", logo: "hermes-agent.png", href: "https://hermes-agent.nousresearch.com/", site: "hermes-agent.nousresearch.com", use: "Alur kerja agent" },
];

const workflow = [
  ["Riset", "Kami menggunakan Claude dan ChatGPT untuk menelaah referensi, mendiskusikan temuan, dan merumuskan ide yang ingin dipelajari lebih lanjut."],
  ["Pembuatan", "Claude Code, Codex, dan Hermes Agent membantu kami menulis kode, mengembangkan prototipe, memperbaiki masalah, dan menyusun dokumentasi teknis."],
  ["Eksekusi", "AI membantu kami memecah pekerjaan menjadi langkah yang bisa dilakukan, menyusun rencana, dan merangkum progres. Tim JagoFarm tetap menentukan keputusan dan menjalankan pekerjaan di lapangan."],
];

export default function AboutAISection() {
  const { t } = useLanguage();

  function scrollToDecisionPlatform() {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let attempts = 0;

    function scrollWhenReady() {
      const target = document.getElementById("decision-platform");
      if (target) {
        window.requestAnimationFrame(() => {
          target.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
        });
        return;
      }

      if (attempts++ < 120) window.requestAnimationFrame(scrollWhenReady);
    }

    window.requestAnimationFrame(scrollWhenReady);
  }

  return (
    <section className="section about-ai" aria-labelledby="about-ai-product-title">
      <div className="container">
        <section className="about-ai-block about-ai-product" aria-labelledby="about-ai-product-title">
          <h2 id="about-ai-product-title">{t("AI di dalam produk")}</h2>
          <p>{t("Claude API dipakai sebagai lapisan keputusan di dalam produk dan sedang diintegrasikan.")}</p>
          <p>{t("Rekomendasi membantu pengelola mempertimbangkan tindakan, bukan menggantikan keputusan mereka.")}</p>
          <span className="about-ai-product-status">{t("Sedang diintegrasikan")}</span>
          <Link className="about-ai-platform-link" to="/" onClick={scrollToDecisionPlatform}>
            {t("Lihat platform keputusan budidaya")}
          </Link>
        </section>
        <section className="about-ai-block about-ai-build" aria-labelledby="about-ai-build-title">
          <h2 id="about-ai-build-title">{t("AI untuk membangun produk")}</h2>
          <div className="about-ai-intro">
            <header>
              <span className="number">{t("Cara kami bekerja")}</span>
              <h3>{t("Riset dan pengembangan, dibantu AI.")}</h3>
            </header>
            <div className="about-ai-context">
              <p>{t("JagoFarm mengembangkan ekosistem budidaya sirkular dan teknologi pemantauan. Dalam prosesnya, kami menggunakan model bahasa besar (LLM) seperti Claude dan ChatGPT, serta agent coding untuk membantu tim dari ide hingga pelaksanaan.")}</p>
              <p>{t("Kami menggabungkan bantuan AI dengan pengamatan dan pekerjaan nyata di lapangan. Arah pengembangan dan keputusan tetap berada di tangan tim JagoFarm.")}</p>
            </div>
          </div>
          <ol className="about-ai-workflow">
            {workflow.map(([title, description], index) => (
              <li key={title}>
                <span className="about-ai-step-number" aria-hidden="true">0{index + 1}</span>
                <div><h4>{t(title)}</h4><p>{t(description)}</p></div>
              </li>
            ))}
          </ol>
          <div className="about-ai-tools">
            <div className="about-ai-tools-heading">
              <h4>{t("Alat yang membantu tim kami")}</h4>
              <p>{t("Kenali alat yang kami gunakan melalui situs resminya.")}</p>
            </div>
            <nav className="about-ai-tool-list" aria-label={t("Situs resmi alat AI")}>
              {tools.map((tool) => (
                <a className={`about-ai-tool${tool.name === "Claude" ? " is-claude" : ""}`} href={tool.href} target="_blank" rel="noopener noreferrer" title={tool.href} aria-label={`${tool.name} · ${t("Buka situs resmi")}`} key={tool.name}>
                  <span className="about-ai-tool-logo"><img src={`/assets/ai-tools/${tool.logo}`} alt="" width="48" height="48" loading="lazy" /></span>
                  <strong>{tool.name}</strong>
                  <span className="about-ai-tool-use">{t(tool.use)}</span>
                  <span className="about-ai-tool-site">{tool.site} <span aria-hidden="true">↗</span></span>
                </a>
              ))}
            </nav>
          </div>
        </section>
      </div>
    </section>
  );
}
