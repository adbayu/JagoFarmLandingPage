import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../i18n.jsx";
import { adjacentTeamIndex } from "../team-navigation.js";
import AboutAISection from "../components/AboutAISection.jsx";
import { primaryContactEmail } from "../data/content.js";

const team = [
  {
    id: "haikal",
    name: "Haykal",
    role: "Co-founder & CTO",
    github: "https://github.com/Haykal-9",
    email: primaryContactEmail,
    position: {
      "--x": "5.39%",
      "--y": "19.43%",
      "--w": "21.06%",
      "--h": "78.64%",
    },
    cardPosition: {
      "--card-x": "26%",
      "--card-y": "47%",
      "--card-shift": "0%",
    },
    portraitPosition: "12% center",
    portraitOrigin: "16% 55%",
    portraitMobilePosition: "0%",
  },
  {
    id: "ega",
    name: "Ega",
    role: "Co-founder & CEO",
    github: "https://github.com/egafiandra",
    email: "egafiandraapratama@jagofarm.dev",
    position: {
      "--x": "28.73%",
      "--y": "21.92%",
      "--w": "15.12%",
      "--h": "64.18%",
    },
    cardPosition: {
      "--card-x": "44%",
      "--card-y": "45%",
      "--card-shift": "0%",
    },
    portraitPosition: "36% center",
    portraitOrigin: "37% 55%",
    portraitMobilePosition: "34%",
  },
  {
    id: "bayu",
    name: "Bayu",
    role: "Co-founder & Head Dev Ops",
    github: "https://github.com/adbayu",
    email: "andibayuhanggoro28@jagofarm.dev",
    position: {
      "--x": "49.38%",
      "--y": "18.88%",
      "--w": "16.23%",
      "--h": "66.11%",
    },
    cardPosition: {
      "--card-x": "48%",
      "--card-y": "45%",
      "--card-shift": "-100%",
    },
    portraitPosition: "61% center",
    portraitOrigin: "59% 55%",
    portraitMobilePosition: "66%",
  },
  {
    id: "shafnat",
    name: "Shafnat",
    role: "Co-founder & COO",
    github: "https://github.com/ShafnatFR",
    email: "shafnatfuainiramadhan@jagofarm.dev",
    position: {
      "--x": "65.33%",
      "--y": "19.43%",
      "--w": "21.89%",
      "--h": "73.39%",
    },
    cardPosition: {
      "--card-x": "67%",
      "--card-y": "47%",
      "--card-shift": "-100%",
    },
    portraitPosition: "87% center",
    portraitOrigin: "82% 55%",
    portraitMobilePosition: "100%",
  },
];

function TeamContactLinks({ member, t, compact = false }) {
  return (
    <nav
      className={`team-contact-links${compact ? " is-compact" : ""}`}
      aria-label={`${t("Kontak")} ${member.name}`}
    >
      <a
        href={member.github}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`GitHub ${member.name}`}
        title={`GitHub ${member.name}`}
      >
        <img
          className="team-contact-icon team-contact-icon--github"
          src="/assets/social/github.svg"
          alt=""
          width="24"
          height="24"
        />
        {!compact && (
          <span>
            <small>GitHub</small>
            <strong>@{member.github.split("/").pop()}</strong>
          </span>
        )}
      </a>
      <a
        href={`mailto:${member.email}`}
        aria-label={`${t("Kirim email ke")} ${member.name}`}
        title={member.email}
      >
        <img
          className="team-contact-icon"
          src="/assets/social/gmail.svg"
          alt=""
          width="24"
          height="18"
        />
        {!compact && (
          <span>
            <small>Email</small>
            <strong>{member.email}</strong>
          </span>
        )}
      </a>
    </nav>
  );
}

export default function AboutPage() {
  const { t } = useLanguage();
  const [activeMemberId, setActiveMemberId] = useState(null);
  const [detailMemberId, setDetailMemberId] = useState(null);
  const [closing, setClosing] = useState(false);
  const enterTimer = useRef(null);
  const leaveTimer = useRef(null);
  const closeTimer = useRef(null);
  const dialogRef = useRef(null);
  const returnFocusRef = useRef(null);
  const activeMember = team.find(({ id }) => id === activeMemberId);
  const detailMember =
    team.find(({ id }) => id === detailMemberId) ?? activeMember ?? team[0];
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
    enterTimer.current = window.setTimeout(
      () => setActiveMemberId(memberId),
      70,
    );
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
    setClosing(true);
    closeTimer.current = window.setTimeout(() => dialog.close(), 300);
  }

  function finishClose() {
    window.clearTimeout(closeTimer.current);
    document.documentElement.classList.remove("team-dialog-open");
    setClosing(false);
    setDetailMemberId(null);
    requestAnimationFrame(() =>
      document.querySelector(`.team-hit-${returnFocusRef.current}`)?.focus(),
    );
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

  useEffect(
    () => () => {
      clearHoverTimers();
      window.clearTimeout(closeTimer.current);
      document.documentElement.classList.remove("team-dialog-open");
    },
    [],
  );

  return (
    <>
      <section
        className={`team-hero${activeMember ? " is-highlighted" : ""}`}
        aria-labelledby="team-hero-title"
      >
        <div className="team-hero-copy">
          <span className="team-kicker">{t("Tim")}</span>
          <h1 className="team-hero-title" id="team-hero-title">
            {t("Tim di balik")} <span>JagoFarm.</span>
          </h1>
          <p>
            {t(
              "Empat perspektif, satu tujuan—membangun sistem pertanian sirkular yang berdampak nyata.",
            )}
          </p>
          <div className="team-hint">
            <span className="team-hint-icon" aria-hidden="true" />
            <span className="team-hint-desktop">
              {t("Arahkan cursor untuk mengenal tim.")}
            </span>
            <span className="team-hint-touch">
              {t("Ketuk anggota untuk mengenal tim.")}
            </span>
          </div>
        </div>

        <div className="team-scene">
          <img
            className="team-base"
            src="/assets/team/team.webp"
            alt={t("Haykal, Ega, Bayu, dan Shafnat, tim JagoFarm")}
          />
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
              aria-label={`${t("Pilih")} ${member.name}, ${t(member.role)}`}
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
              <span className="team-preview-status">{t("Peran saat ini")}</span>
              <h2>{activeMember.name}</h2>
              <strong>{t(activeMember.role)}</strong>
              <TeamContactLinks member={activeMember} t={t} compact />
              <div>
                <span>
                  {String(detailIndex + 1).padStart(2, "0")} /{" "}
                  {String(team.length).padStart(2, "0")}
                </span>
                <button
                  type="button"
                  onClick={() => openProfile(activeMember.id)}
                  aria-label={`${t("Lihat peran")} ${activeMember.name}`}
                >
                  <span>{t("Lihat peran")}</span>
                  <b aria-hidden="true">→</b>
                </button>
              </div>
            </article>
          ) : null}
        </div>

        <dialog
          ref={dialogRef}
          className={`team-profile-dialog${closing ? " is-closing" : ""}`}
          aria-labelledby="team-profile-name"
          onClose={finishClose}
          onCancel={(event) => {
            event.preventDefault();
            closeProfile();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeProfile();
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowLeft") {
              event.preventDefault();
              moveProfile(-1);
            }
            if (event.key === "ArrowRight") {
              event.preventDefault();
              moveProfile(1);
            }
          }}
        >
          <button
            className="team-dialog-close"
            type="button"
            onClick={closeProfile}
            aria-label={t("Tutup profil")}
          >
            ×
          </button>
          <div className="team-profile-shell">
            <section
              className="team-profile-context"
              onClick={closeProfile}
              aria-label={t("Tutup profil dan kembali ke foto tim")}
            >
              <div className="team-profile-context-copy" aria-hidden="true">
                <span>{t("Tim")}</span>
                <h2>
                  {t("Tim di balik")}
                  <br />
                  JagoFarm.
                </h2>
                <p>
                  {t(
                    "Empat perspektif, satu tujuan—membangun sistem pertanian sirkular yang berdampak nyata.",
                  )}
                </p>
              </div>
              <nav
                className="team-profile-index"
                aria-label={t("Pilih anggota tim")}
                onClick={(event) => event.stopPropagation()}
              >
                {team.map((member, index) => (
                  <button
                    key={member.id}
                    type="button"
                    aria-label={`${t("Tampilkan profil")} ${member.name}`}
                    aria-current={
                      member.id === detailMember.id ? "true" : undefined
                    }
                    onClick={() => {
                      setActiveMemberId(member.id);
                      setDetailMemberId(member.id);
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </nav>
            </section>

            <figure
              className="team-profile-photo"
              style={{
                "--portrait-mobile-x": detailMember.portraitMobilePosition,
              }}
            >
              <img
                src="/assets/team/team.webp"
                style={{
                  objectPosition: detailMember.portraitPosition,
                  transformOrigin: detailMember.portraitOrigin,
                }}
                alt={`${detailMember.name}, ${t(detailMember.role)} JagoFarm`}
              />
            </figure>

            <article className="team-profile-content" aria-live="polite">
              <nav
                className="team-profile-mobile-index"
                aria-label={t("Pilih anggota tim")}
              >
                {team.map((member, index) => (
                  <button
                    key={member.id}
                    type="button"
                    aria-label={`${t("Tampilkan profil")} ${member.name}`}
                    aria-current={
                      member.id === detailMember.id ? "true" : undefined
                    }
                    onClick={() => {
                      setActiveMemberId(member.id);
                      setDetailMemberId(member.id);
                    }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </button>
                ))}
              </nav>
              <span className="team-profile-count">
                {String(detailIndex + 1).padStart(2, "0")} /{" "}
                {String(team.length).padStart(2, "0")}
              </span>
              <h2 id="team-profile-name">{detailMember.name}</h2>
              <strong className="team-profile-role">
                {t(detailMember.role)}
              </strong>
              <TeamContactLinks member={detailMember} t={t} />

              <div className="team-profile-footer">
                <div className="team-profile-arrows">
                  <button
                    type="button"
                    onClick={() => moveProfile(-1)}
                    aria-label={t("Profil sebelumnya")}
                  >
                    ←
                  </button>
                  <button
                    type="button"
                    onClick={() => moveProfile(1)}
                    aria-label={t("Profil berikutnya")}
                  >
                    →
                  </button>
                </div>
              </div>
            </article>
          </div>
        </dialog>
      </section>
      <section className="team-directory" aria-labelledby="team-directory-title">
        <div className="team-directory-inner">
          <h2 id="team-directory-title">{t("Tim")}</h2>
          <ul className="team-directory-list" aria-label={t("Daftar anggota tim JagoFarm")}>
            {team.map((member) => (
              <li className="team-directory-card" key={member.id}>
                <h3>{member.name}</h3>
                <p className="team-directory-role">{t(member.role)}</p>
                <TeamContactLinks member={member} t={t} />
              </li>
            ))}
          </ul>
          <section className="team-support" aria-labelledby="team-support-title">
            <h3 id="team-support-title">{t("JagoFarm adalah startup di bawah naungan Kolab Creative Hub.")}</h3>
            <a href="https://kolab-landing.pages.dev/" target="_blank" rel="noopener noreferrer">
              {t("Kunjungi Kolab Creative Hub")}
            </a>
            <p>{t("Kolab berperan sebagai pengarah.")}</p>
            <p>{t("JagoFarm dimulai pada 30 Juni 2026.")}</p>
          </section>
        </div>
      </section>
      <AboutAISection />
    </>
  );
}
