import { useState } from "react";
import heroDark from "../../assets/herosection/hero_section_dark.webp";
import heroLight from "../../assets/herosection/hero_section_light.webp";
import ProductCard from "../components/ProductCard.jsx";
import ProductFilters from "../components/ProductFilters.jsx";
import { productCategories, products } from "../data/content.js";

export default function ProductsPage() {
  const [activeCategory, setActiveCategory] = useState("all");
  const filteredProducts = activeCategory === "all" ? products : products.filter((product) => product.category === activeCategory);

  return (
    <>
      <section className="product-hero section">
        <div className="product-hero-media" aria-hidden="true">
          <img className="hero-image hero-image-light" src={heroLight} alt="" loading="eager" fetchPriority="high" />
          <img className="hero-image hero-image-dark" src={heroDark} alt="" loading="eager" />
        </div>
        <div className="product-hero-shade" />
        <div className="container product-hero-content">
          <div>
            <span className="product-hero-kicker">Calon hasil ekosistem</span>
            <h1>Hasil dari setiap sisi ekosistem.</h1>
          </div>
          <div className="product-hero-copy">
            <p>Daftar awal produk yang sedang dikembangkan dari hubungan budidaya ikan, nutrisi, azolla, dan tanaman.</p>
            <span>Seluruh item masih dalam tahap riset dan eksplorasi.</span>
          </div>
        </div>
      </section>
      <section className="section catalog-section">
        <div className="container">
          <ProductFilters categories={productCategories} activeCategory={activeCategory} onChange={setActiveCategory} />
          <div className="catalog-grid" aria-live="polite">
            {filteredProducts.map((product) => <ProductCard product={product} key={product.id} />)}
          </div>
        </div>
      </section>
    </>
  );
}
