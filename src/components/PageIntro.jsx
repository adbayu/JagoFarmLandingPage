export default function PageIntro({ index, title, description }) {
  return (
    <section className="page-intro section">
      <div className="container intro-grid">
        <span className="number">{index}</span>
        <div><h1>{title}</h1><p className="lead">{description}</p></div>
      </div>
    </section>
  );
}
