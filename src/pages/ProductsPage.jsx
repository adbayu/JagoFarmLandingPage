import { useEffect, useRef, useState } from "react";
import ProductCard from "../components/ProductCard.jsx";
import ProductFilters from "../components/ProductFilters.jsx";
import { isAgriculturalProduct, productCategories, products, productStatusLabels } from "../data/content.js";
import { useLanguage } from "../i18n.jsx";
import "./ProductsPage.css";

export default function ProductsPage() {
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState("all");
  const [selectedProduct, setSelectedProduct] = useState(null);
  const dialogRef = useRef(null);
  const filteredProducts = activeCategory === "all" ? products : products.filter((product) => product.category === activeCategory);
  const hasAgriculturalProducts = filteredProducts.some(isAgriculturalProduct);
  const hasTechnologyProduct = filteredProducts.some((product) => !isAgriculturalProduct(product));

  useEffect(() => {
    if (selectedProduct) dialogRef.current.showModal();
    else dialogRef.current.close();
  }, [selectedProduct]);

  return (
    <div className="products-page">
      <section className="product-hero section">
        <div className="product-hero-media" aria-hidden="true">
          <img className="hero-image hero-image-light" src="/assets/products/hero-light.webp" alt="" loading="eager" fetchPriority="high" />
          <img className="hero-image hero-image-dark" src="/assets/products/hero-dark.webp" alt="" loading="eager" />
        </div>
        <div className="product-hero-shade" />
        <div className="container product-hero-content">
          <div className="product-hero-intro">
            <span className="product-hero-kicker">{t("Hasil dari satu ekosistem")}</span>
            <h1>{t("Dari ekosistem budidaya menjadi produk bernilai.")}</h1>
            <p>{t("Ikan, azolla, tanaman, dan teknologi. Kami mengeksplorasi potensi setiap bagian ekosistem untuk menghasilkan pangan dan sumber daya yang bermanfaat.")}</p>
            <button className="product-hero-link" type="button" onClick={() => document.getElementById("product-catalog").scrollIntoView({ behavior: "smooth" })}>
              {t("Jelajahi produk")} <span aria-hidden="true">→</span>
            </button>
          </div>
        </div>
      </section>
      <section className="section catalog-section" id="product-catalog" aria-labelledby="catalog-title">
        <div className="catalog-backdrop" aria-hidden="true">
          <img src="/assets/products/catalog-background.webp" alt="" loading="lazy" decoding="async" />
        </div>
        <span className="catalog-margin-note catalog-margin-note-left" aria-hidden="true">{t("Riset hari ini untuk pangan yang lebih baik esok nanti.")}</span>
        <span className="catalog-margin-note catalog-margin-note-right" aria-hidden="true">{t("Bertumbuh bersama alam")}</span>
        <div className="container catalog-inner">
          <header className="catalog-heading">
            <span className="number">{t("Riset ekosistem")}</span>
            <h2 id="catalog-title">{t("Calon hasil budidaya")}</h2>
            <p>{t("Daftar awal hasil yang sedang dieksplorasi dari hubungan ikan, nutrisi, azolla, dan tanaman.")}</p>
          </header>
          <div className="catalog-category-notes" aria-live="polite" aria-atomic="true">
            {hasAgriculturalProducts && (
              <p>{t("Seluruh produk pertanian masih dalam tahap riset dan belum tersedia di marketplace.")}</p>
            )}
            {hasTechnologyProduct && (
              <p>{t("Sensor dan dashboard JagoFarm sudah dibangun sebagai prototype, sementara rekomendasi AI sedang diintegrasikan dengan Claude API.")}</p>
            )}
          </div>
          <ProductFilters categories={productCategories} activeCategory={activeCategory} onChange={setActiveCategory} />
          <div className="catalog-grid" aria-live="polite">
            {filteredProducts.map((product) => <ProductCard product={product} key={product.id} onSelect={setSelectedProduct} />)}
          </div>
          {hasAgriculturalProducts && <p className="catalog-visual-note" aria-live="polite">{t("Gambar produk pertanian merupakan ilustrasi konsep.")}</p>}
        </div>
      </section>
      <dialog className="product-detail-dialog" ref={dialogRef} aria-labelledby="product-detail-title" data-lenis-prevent onClose={() => setSelectedProduct(null)} onClick={(event) => { if (event.target === event.currentTarget) setSelectedProduct(null); }}>
        {selectedProduct && <>
          <button className="product-detail-close" type="button" onClick={() => setSelectedProduct(null)} aria-label={t("Tutup")}>×</button>
          <img className="product-detail-image" src={selectedProduct.image} alt={!isAgriculturalProduct(selectedProduct) ? (selectedProduct.id === "iot" ? t("Foto prototype sensor dan dashboard JagoFarm") : t(selectedProduct.name)) : `${t("Ilustrasi konsep")} ${t(selectedProduct.name)}`} />
          <div className="product-detail-copy">
            <span className="number">{t(selectedProduct.categoryLabel)} · {t(productStatusLabels[selectedProduct.status])}</span>
            <h2 id="product-detail-title">{t(selectedProduct.name)}</h2>
            <p>{t(selectedProduct.description)}</p>
            {isAgriculturalProduct(selectedProduct) && <p className="product-detail-note">{t("Gambar produk pertanian merupakan ilustrasi konsep. Produk pertanian masih dalam tahap riset dan belum tersedia di marketplace.")}</p>}
          </div>
        </>}
      </dialog>
    </div>
  );
}
