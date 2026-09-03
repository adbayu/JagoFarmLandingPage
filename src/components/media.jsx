export function PhotoFrame({ src, alt, label, className = "", eager = false }) {
  function handlePointerMove(event) {
    const bounds = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--pointer-x", `${(event.clientX - bounds.left) / bounds.width - 0.5}`);
    event.currentTarget.style.setProperty("--pointer-y", `${(event.clientY - bounds.top) / bounds.height - 0.5}`);
  }

  function resetPointer(event) {
    event.currentTarget.style.setProperty("--pointer-x", "0");
    event.currentTarget.style.setProperty("--pointer-y", "0");
  }

  return (
    <figure className={`photo-frame ${className}`} onPointerMove={handlePointerMove} onPointerLeave={resetPointer}>
      <img src={src} alt={alt} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : "auto"} decoding="async" />
      {label ? <figcaption><span>{label}</span><small>Dokumentasi JagoFarm</small></figcaption> : null}
    </figure>
  );
}

export function ProductMedia({ src, label }) {
  return (
    <div className="product-media">
      <img src={src} alt={`Dokumentasi ${label}`} loading="lazy" decoding="async" />
      <span>{label}</span>
    </div>
  );
}

export function StageIcon({ type }) {
  if (type === "fish") return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 12c3.5-4 8.5-5.2 13-2.7L21 6v12l-4-3.3C12.5 17.2 7.5 16 4 12Z" />
      <circle cx="15.5" cy="11" r=".7" fill="currentColor" stroke="none" />
    </svg>
  );
  if (type === "drop") return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 3S6.5 9.4 6.5 14a5.5 5.5 0 0 0 11 0C17.5 9.4 12 3 12 3Z" />
      <path d="M9.5 14.5c.5 1.4 1.4 2.1 2.8 2.3" />
    </svg>
  );
  if (type === "plant") return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 21v-9M12 15c-4.5 0-7-2.3-7-6 4.5 0 7 2.3 7 6ZM12 12c4.5 0 7-2.3 7-6-4.5 0-7 2.3-7 6ZM7 21h10" />
    </svg>
  );
  if (type === "cycle") return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M18.5 8A7 7 0 0 0 6.8 6.2L5 8M5.5 16A7 7 0 0 0 17.2 17.8L19 16M5 4v4h4M19 20v-4h-4" />
    </svg>
  );
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 5C10 5 5 9.2 5 16c5.8 0 10.2-3.5 14-11ZM5 19c2.5-4 5.5-6.7 9-8.2" />
    </svg>
  );
}
