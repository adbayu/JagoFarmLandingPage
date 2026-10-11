import { useLanguage } from "../i18n.jsx";
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

  return (
    <section className="section about-ai" aria-labelledby="about-ai-title">
      <div className="container">
        <div className="about-ai-intro">
          <header>
            <span className="number">{t("Cara kami bekerja")}</span>
            <h2 id="about-ai-title">{t("Riset dan pengembangan, dibantu AI.")}</h2>
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
              <div><h3>{t(title)}</h3><p>{t(description)}</p></div>
            </li>
          ))}
        </ol>
        <div className="about-ai-tools">
          <div className="about-ai-tools-heading">
            <h3>{t("Alat yang membantu tim kami")}</h3>
            <p>{t("Kenali alat yang kami gunakan melalui situs resminya.")}</p>
          </div>
          <nav className="about-ai-tool-list" aria-label={t("Situs resmi alat AI")}>
            {tools.map((tool) => (
              <a className="about-ai-tool" href={tool.href} target="_blank" rel="noopener noreferrer" title={tool.href} aria-label={`${tool.name} · ${t("Buka situs resmi")}`} key={tool.name}>
                <span className="about-ai-tool-logo"><img src={`/assets/ai-tools/${tool.logo}`} alt="" width="48" height="48" loading="lazy" /></span>
                <strong>{tool.name}</strong>
                <span className="about-ai-tool-use">{t(tool.use)}</span>
                <span className="about-ai-tool-site">{tool.site} <span aria-hidden="true">↗</span></span>
              </a>
            ))}
          </nav>
        </div>
      </div>
    </section>
  );
}
