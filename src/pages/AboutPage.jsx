import { useEffect, useRef, useState } from "react";

const team = [
  { id: "haikal", name: "Haikal", role: "CTO", position: { "--x": "5.39%", "--y": "19.43%", "--w": "21.06%", "--h": "78.64%" } },
  { id: "ega", name: "Ega", role: "CEO", position: { "--x": "28.73%", "--y": "21.92%", "--w": "15.12%", "--h": "64.18%" } },
  { id: "bayu", name: "Bayu", role: "Head Dev Ops", position: { "--x": "49.38%", "--y": "18.88%", "--w": "16.23%", "--h": "66.11%" } },
  { id: "shafnat", name: "Shafnat", role: "COO", position: { "--x": "65.33%", "--y": "19.43%", "--w": "21.89%", "--h": "73.39%" } },
];

export default function AboutPage() {
  const [activeMember, setActiveMember] = useState(null);
  const [highlighted, setHighlighted] = useState(false);
  const enterTimer = useRef(null);
  const leaveTimer = useRef(null);

  function clearTimers() {
    window.clearTimeout(enterTimer.current);
    window.clearTimeout(leaveTimer.current);
  }

  function queueMember(memberId) {
    clearTimers();
    enterTimer.current = window.setTimeout(() => {
      setActiveMember(memberId);
      setHighlighted(true);
    }, 80);
  }

  function focusMember(memberId) {
    clearTimers();
    setActiveMember(memberId);
    setHighlighted(true);
  }

  function queueClear() {
    window.clearTimeout(enterTimer.current);
    window.clearTimeout(leaveTimer.current);
    leaveTimer.current = window.setTimeout(() => {
      if (document.activeElement?.classList.contains("team-hit")) return;
      setActiveMember(null);
      setHighlighted(false);
    }, 120);
  }

  useEffect(() => () => clearTimers(), []);

  return (
    <section className={`team-hero${highlighted ? " is-highlighted" : ""}`} aria-labelledby="team-hero-title">
      <div className="team-scene">
        <img className="team-base" src="/assets/team/team.webp" alt="Haikal, Ega, Bayu, dan Shafnat, tim JagoFarm" />
        {team.map((member) => <img key={member.id} className={`team-cutout team-cutout-${member.id}${activeMember === member.id ? " is-active" : ""}`} src={`/assets/team/${member.id}.png`} alt="" aria-hidden="true" />)}
        {team.map((member) => (
          <button key={member.id} className={`team-hit team-hit-${member.id}${activeMember === member.id ? " is-active" : ""}`} style={member.position} type="button" aria-label={`${member.name}, ${member.role}`} onMouseEnter={() => queueMember(member.id)} onMouseLeave={queueClear} onFocus={() => focusMember(member.id)} onBlur={queueClear}>
            <span className="team-person-label"><strong>{member.name}</strong><small>{member.role}</small></span>
          </button>
        ))}
      </div>
      <h1 className="team-hero-title" id="team-hero-title">Tim di Balik JagoFarm</h1>
      <ul className="team-mobile-list">
        {team.map((member) => <li key={member.id}><strong>{member.name}</strong><span>{member.role}</span></li>)}
      </ul>
    </section>
  );
}
