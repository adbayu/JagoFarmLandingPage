import { useRef, useState } from "react";
import { documentation } from "../data/content.js";

export default function DocumentationPage() {
  const dialogRef = useRef(null);
  const [selected, setSelected] = useState(null);

  function openImage(item) {
    setSelected(item);
    requestAnimationFrame(() => dialogRef.current?.showModal());
  }

  return (
    <>
      <section className="documentation-hero section">
        <img className="documentation-hero-image" src="/assets/startup/startup-04.jpg" alt="Tim JagoFarm melakukan pengamatan di area kolam" loading="eager" fetchPriority="high" />
        <div className="documentation-hero-shade" />
        <div className="container documentation-hero-content">
          <h1>Dokumentasi<br />Lapangan</h1>
          <div>
            <p>Catatan visual dari kegiatan pengamatan awal JagoFarm.</p>
            <span>{documentation.length} catatan visual</span>
          </div>
        </div>
      </section>
      <section className="section gallery-section">
        <div className="container">
          <div className="gallery-intro"><div><span className="number">Arsip kegiatan</span><h2>Proses yang benar-benar terjadi di lapangan.</h2></div><p>Setiap foto menampilkan bagian dari pengamatan kolam, bahan, media tanam, dan pertumbuhan tanaman.</p></div>
          <div className="gallery-grid">
            {documentation.map((item, index) => (
              <button className="gallery-card" key={item[1]} type="button" onClick={() => openImage(item)}>
                <img src={item[1]} alt={item[2]} loading="lazy" decoding="async" />
                <span className="gallery-number">{String(index + 1).padStart(2, "0")}</span>
                <span className="gallery-caption"><b>{item[0]}</b><small>Lihat detail</small></span>
              </button>
            ))}
          </div>
        </div>
      </section>
      <dialog className="lightbox" ref={dialogRef} onClose={() => setSelected(null)} onClick={(event) => { if (event.target === event.currentTarget) dialogRef.current?.close(); }}>
        {selected ? <div><button className="lightbox-close" type="button" onClick={() => dialogRef.current?.close()} aria-label="Tutup gambar">×</button><img src={selected[1]} alt={selected[2]} /><footer><strong>{selected[0]}</strong><p>{selected[2]}</p></footer></div> : null}
      </dialog>
    </>
  );
}
