import { StageIcon } from "./media.jsx";

function GridIcon() {
  return <svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1" /><rect x="14" y="4" width="6" height="6" rx="1" /><rect x="4" y="14" width="6" height="6" rx="1" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
}

const icons = { all: <GridIcon />, akuakultur: <StageIcon type="fish" />, nutrisi: <StageIcon type="leaf" />, tanaman: <StageIcon type="plant" /> };

export default function ProductFilters({ categories, activeCategory, onChange }) {
  return (
    <div className="catalog-filters" aria-label="Filter kategori produk">
      {categories.map(([id, label]) => (
        <button className={activeCategory === id ? "is-active" : ""} type="button" aria-pressed={activeCategory === id} onClick={() => onChange(id)} key={id}>
          <span>{icons[id]}</span>{label}
        </button>
      ))}
    </div>
  );
}
