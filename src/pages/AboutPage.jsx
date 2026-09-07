import { useEffect, useRef, useState } from "react";
import { adjacentTeamIndex } from "../team-navigation.js";

const team = [
  {
    id: "haikal",
    name: "Haikal",
    role: "CTO",
    summary: "Placeholder profil untuk arah teknologi dan pengembangan sistem JagoFarm.",
    focus: ["Teknologi", "Arsitektur Sistem", "Riset"],
    current: "Detail pekerjaan saat ini akan diperbarui setelah informasi profil tim tersedia.",
    position: { "--x": "5.39%", "--y": "19.43%", "--w": "21.06%", "--h": "78.64%" },
    cardPosition: { "--card-x": "26%", "--card-y": "47%", "--card-shift": "0%" },
    portraitPosition: "12% center",
    portraitOrigin: "16% 55%",
    portraitMobilePosition: "0%",
  },
  {
    id: "ega",
    name: "Ega",
    role: "CEO",
    summary: "Placeholder profil untuk strategi, kemitraan, dan arah pengembangan JagoFarm.",
    focus: ["Strategi", "Kemitraan", "Arah Produk"],
    current: "Detail pekerjaan saat ini akan diperbarui setelah informasi profil tim tersedia.",
    position: { "--x": "28.73%", "--y": "21.92%", "--w": "15.12%", "--h": "64.18%" },
    cardPosition: { "--card-x": "44%", "--card-y": "45%", "--card-shift": "0%" },
    portraitPosition: "36% center",
    portraitOrigin: "37% 55%",
    portraitMobilePosition: "34%",
  },
  {
    id: "bayu",
    name: "Bayu",
    role: "Head Dev Ops",
    summary: "Placeholder profil untuk operasional platform, reliabilitas, dan otomasi sistem.",
    focus: ["DevOps", "Reliabilitas", "Otomasi"],
    current: "Detail pekerjaan saat ini akan diperbarui setelah informasi profil tim tersedia.",
    position: { "--x": "49.38%", "--y": "18.88%", "--w": "16.23%", "--h": "66.11%" },
    cardPosition: { "--card-x": "48%", "--card-y": "45%", "--card-shift": "-100%" },
    portraitPosition: "61% center",
    portraitOrigin: "59% 55%",
    portraitMobilePosition: "66%",
  },
  {
    id: "shafnat",
    name: "Shafnat",
    role: "COO",
    summary: "Placeholder profil untuk operasional, proses kerja, dan koordinasi tim JagoFarm.",
    focus: ["Operasional", "Proses", "Koordinasi Tim"],
    current: "Detail pekerjaan saat ini akan diperbarui setelah informasi profil tim tersedia.",
    position: { "--x": "65.33%", "--y": "19.43%", "--w": "21.89%", "--h": "73.39%" },
    cardPosition: { "--card-x": "67%", "--card-y": "47%", "--card-shift": "-100%" },
    portraitPosition: "87% center",
    portraitOrigin: "82% 55%",
    portraitMobilePosition: "100%",
  },
];

export default function AboutPage() {
  const [activeMemberId, setActiveMemberId] = useState(null);
  const [detailMemberId, setDetailMemberId] = useState(null);
  const [closing, setClosing] = useState(false);
  const enterTimer = useRef(null);
  const leaveTimer = useRef(null);
  const closeTimer = useRef(null);
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const activeMember = team.find(({ id }) => id === activeMemberId);
  const detailMember = team.find(({ id }) => id === detailMemberId) ?? activeMember ?? team[0];
  const detailIndex = team.findIndex(({ id }) => id === detailMember.id);

  function clearHoverTimers() {
    window.clearTimeout(enterTimer.current);
    window.clearTimeout(leaveTimer.current);
  }

  function selectMember(memberId) {
    clearHoverTimers();
    setActiveMemberId(memberId);
  }

  function queueMember(memberId) {
    clearHoverTimers();
    enterTimer.current = window.setTimeout(() => setActiveMemberId(memberId), 70);
  }

  function queueClear() {
    clearHoverTimers();
    leaveTimer.current = window.setTimeout(() => {
      if (document.activeElement?.closest?.(".team-interactive")) return;
      setActiveMemberId(null);
    }, 260);
  }

  function openProfile(memberId) {
    clearHoverTimers();
    returnFocusRef.current = memberId;
    setActiveMemberId(memberId);
    setDetailMemberId(memberId);
  }

  function closeProfile() {
    const dialog = dialogRef.current;
    if (!dialog?.open || closing) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      dialog.close();
      return;
    }
    setClosing(true);
    closeTimer.current = window.setTimeout(() => dialog.close(), 300);
  }

  function finishClose() {
    window.clearTimeout(closeTimer.current);
    document.documentElement.classList.remove("team-dialog-open");
    setClosing(false);
    setDetailMemberId(null);
    requestAnimationFrame(() => document.querySelector(`.team-hit-${returnFocusRef.current}`)?.focus());
  }

  function moveProfile(direction) {
    const nextIndex = adjacentTeamIndex(detailIndex, direction, team.length);
    setActiveMemberId(team[nextIndex].id);
    setDetailMemberId(team[nextIndex].id);
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!detailMemberId || !dialog || dialog.open) return;
    dialog.showModal();
    document.documentElement.classList.add("team-dialog-open");
  }, [detailMemberId]);

  useEffect(() => () => {
    clearHoverTimers();
    window.clearTimeout(closeTimer.current);
    document.documentElement.classList.remove("team-dialog-open");
  }, []);

  return (
    <section className={`team-hero${activeMember ? " is-highlighted" : ""}`} aria-labelledby="team-hero-title">
      <div className="team-hero-copy">
        <span className="team-kicker">Tim</span>
        <h1 className="team-hero-title" id="team-hero-title">Tim di balik <span>JagoFarm.</span></h1>
        <p>Empat perspektif, satu tujuan—membangun sistem pertanian sirkular yang berdampak nyata.</p>
        <div className="team-hint">
          <span className="team-hint-icon" aria-hidden="true" />
          <span className="team-hint-desktop">Arahkan cursor untuk mengenal tim.</span>
          <span className="team-hint-touch">Ketuk anggota untuk mengenal tim.</span>
        </div>
      </div>

      <div className="team-scene">
        <img className="team-base" src="/assets/team/team.webp" alt="Haikal, Ega, Bayu, dan Shafnat, tim JagoFarm" />
        <span className="team-scene-shade" aria-hidden="true" />
        {team.map((member) => (
          <img
            key={member.id}
            className={`team-cutout team-cutout-${member.id}${activeMemberId === member.id ? " is-active" : ""}`}
            src={`/assets/team/${member.id}.png`}
            alt=""
            aria-hidden="true"
          />
        ))}
        {team.map((member) => (
          <button
            key={member.id}
            className={`team-hit team-hit-${member.id} team-interactive${activeMemberId === member.id ? " is-active" : ""}`}
            style={member.position}
            type="button"
            aria-label={`Pilih ${member.name}, ${member.role}`}
            aria-pressed={activeMemberId === member.id}
            onMouseEnter={() => queueMember(member.id)}
            onMouseLeave={queueClear}
            onFocus={() => selectMember(member.id)}
            onBlur={queueClear}
            onClick={() => selectMember(member.id)}
          />
        ))}

        {activeMember ? (
          <article
            className="team-preview team-interactive"
            style={activeMember.cardPosition}
            onMouseEnter={clearHoverTimers}
            onMouseLeave={queueClear}
            onFocusCapture={clearHoverTimers}
            onBlurCapture={queueClear}
          >
            <span className="team-preview-status">Profil sementara</span>
            <h2>{activeMember.name}</h2>
            <strong>{activeMember.role}</strong>
            <p>{activeMember.summary}</p>
            <div>
              <span>{String(detailIndex + 1).padStart(2, "0")} / {String(team.length).padStart(2, "0")}</span>
              <button type="button" onClick={() => openProfile(activeMember.id)} aria-label={`Lihat profil ${activeMember.name}`}>
                <span>Lihat profil</span><b aria-hidden="true">→</b>
              </button>
            </div>
          </article>
        ) : null}
      </div>

      <dialog
        ref={dialogRef}
        className={`team-profile-dialog${closing ? " is-closing" : ""}`}
        aria-labelledby="team-profile-name"
        aria-describedby="team-profile-summary"
        onClose={finishClose}
        onCancel={(event) => { event.preventDefault(); closeProfile(); }}
        onClick={(event) => { if (event.target === event.currentTarget) closeProfile(); }}
        onKeyDown={(event) => {
          if (event.key === "ArrowLeft") { event.preventDefault(); moveProfile(-1); }
          if (event.key === "ArrowRight") { event.preventDefault(); moveProfile(1); }
        }}
      >
        <button className="team-dialog-close" type="button" onClick={closeProfile} aria-label="Tutup profil">×</button>
        <div className="team-profile-shell">
          <section className="team-profile-context" onClick={closeProfile} aria-label="Tutup profil dan kembali ke foto tim">
            <div className="team-profile-context-copy" aria-hidden="true">
              <span>Tim</span>
              <h2>Tim di balik<br />JagoFarm.</h2>
              <p>Empat perspektif, satu tujuan—membangun sistem pertanian sirkular yang berdampak nyata.</p>
            </div>
            <nav className="team-profile-index" aria-label="Pilih anggota tim" onClick={(event) => event.stopPropagation()}>
              {team.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  aria-label={`Tampilkan profil ${member.name}`}
                  aria-current={member.id === detailMember.id ? "true" : undefined}
                  onClick={() => { setActiveMemberId(member.id); setDetailMemberId(member.id); }}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </nav>
          </section>

          <figure className="team-profile-photo" style={{ "--portrait-mobile-x": detailMember.portraitMobilePosition }}>
            <img src="/assets/team/team.webp" style={{ objectPosition: detailMember.portraitPosition, transformOrigin: detailMember.portraitOrigin }} alt={`${detailMember.name}, ${detailMember.role} JagoFarm`} />
          </figure>

          <article className="team-profile-content" aria-live="polite">
            <nav className="team-profile-mobile-index" aria-label="Pilih anggota tim">
              {team.map((member, index) => (
                <button
                  key={member.id}
                  type="button"
                  aria-label={`Tampilkan profil ${member.name}`}
                  aria-current={member.id === detailMember.id ? "true" : undefined}
                  onClick={() => { setActiveMemberId(member.id); setDetailMemberId(member.id); }}
                >
                  {String(index + 1).padStart(2, "0")}
                </button>
              ))}
            </nav>
            <span className="team-profile-count">{String(detailIndex + 1).padStart(2, "0")} / {String(team.length).padStart(2, "0")}</span>
            <h2 id="team-profile-name">{detailMember.name}</h2>
            <strong className="team-profile-role">{detailMember.role}</strong>
            <p id="team-profile-summary" className="team-profile-summary">{detailMember.summary}</p>
            <span className="team-profile-draft">Konten sementara</span>

            <div className="team-profile-section">
              <h3>Fokus sementara</h3>
              <div className="team-profile-tags">
                {detailMember.focus.map((item) => <span key={item}>{item}</span>)}
              </div>
            </div>

            <div className="team-profile-section">
              <h3>Saat ini</h3>
              <p>{detailMember.current}</p>
            </div>

            <div className="team-profile-footer">
              <div className="team-social-placeholders" aria-label="Tautan sosial segera tersedia">
                <button type="button" disabled title="LinkedIn segera tersedia">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 8.5V18M6.5 5.5v.01M10.5 18v-5.3c0-2.8 4-3 4 0V18M10.5 10v8M3.5 21h17a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1h-17a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1Z" /></svg>
                  LinkedIn
                </button>
                <button type="button" disabled title="Email segera tersedia">
                  <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 6 9 7 9-7M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" /></svg>
                  Email
                </button>
              </div>
              <div className="team-profile-arrows">
                <button type="button" onClick={() => moveProfile(-1)} aria-label="Profil sebelumnya">←</button>
                <button type="button" onClick={() => moveProfile(1)} aria-label="Profil berikutnya">→</button>
              </div>
            </div>
          </article>
        </div>
      </dialog>
    </section>
  );
}
