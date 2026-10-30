import heroLight from "../../assets/herosection/hero_section_light.webp";

export const teamEmails = {
  haykal: "haykal@jagofarm.dev",
  ega: "egafiandra@jagofarm.dev",
  bayu: "andibayuhanggoro28@jagofarm.dev",
  shafnat: "shafnat@jagofarm.dev",
};
export const primaryContactEmail = teamEmails.haykal;
export const contactEmails = [
  { name: "Haykal", email: teamEmails.haykal },
  { name: "Ega", email: teamEmails.ega },
  { name: "Bayu", email: teamEmails.bayu },
  { name: "Shafnat", email: teamEmails.shafnat },
];
export const linkedinCompanyUrl = "https://www.linkedin.com/company/jagofarm";

export const routes = [
  ["/", "Beranda"],
  ["/produk", "Produk"],
  ["/proyek", "Proyek"],
  ["/tentang", "Tentang"],
];

// Static data for build-time use (tests, SSR)
// This is populated by fetch-data.mjs before build
import productsData from "./products.json" with { type: "json" };
export const products = productsData;

export function isAgriculturalProduct(product) {
  return Boolean(product && product.category !== "teknologi");
}

export const productStatusLabels = {
  prototype: "Prototype",
  riset: "Dalam eksplorasi",
};

export const productCategories = [
  ["all", "Semua Produk"],
  ["akuakultur", "Akuakultur"],
  ["nutrisi", "Nutrisi & Pupuk"],
  ["tanaman", "Tanaman"],
  ["teknologi", "Teknologi"],
];

export const documentation = [
  ["Kolam dengan azolla", "/assets/startup/startup-01.jpg", "Permukaan kolam JagoFarm yang ditumbuhi azolla."],
  ["Bahan dan sampel", "/assets/startup/startup-02.jpg", "Bahan yang digunakan dalam kegiatan pengamatan awal."],
  ["Pengamatan ikan", "/assets/startup/startup-03.jpg", "Ikan di kolam saat kegiatan dokumentasi lapangan."],
  ["Kegiatan lapangan", "/assets/startup/startup-04.jpg", "Tim mengamati kolam ikan dan azolla."],
  ["Sampel bahan", "/assets/startup/startup-05.jpg", "Sampel dan wadah yang dicatat selama kegiatan."],
  ["Kolam budidaya", "/assets/startup/startup-06.jpg", "Kolam budidaya dengan ikan dan azolla."],
  ["Instalasi tanaman", "/assets/startup/startup-07.jpg", "Area tanaman dan akuarium dalam pengamatan awal."],
  ["Pengukuran media", "/assets/startup/startup-08.jpg", "Pencatatan kondisi media tanam menggunakan sensor."],
  ["Persemaian tanaman", "/assets/startup/startup-09.jpg", "Tanaman muda yang sedang diamati pertumbuhannya."],
  ["Pertumbuhan tanaman", "/assets/startup/startup-10.jpg", "Tanaman dalam wadah pada area kegiatan JagoFarm."],
  ["Permukaan azolla", "/assets/startup/startup-11.jpg", "Kondisi azolla pada kolam saat dokumentasi."],
];

export const cycleStages = [
  { number: "01", icon: "fish", label: "Budidaya ikan", title: "Ikan menjadi titik awal aliran nilai.", description: "Nila dan gurame dibudidayakan sambil kondisi air, pakan, dan pertumbuhannya diamati sebagai dasar ekosistem.", image: "/assets/startup/startup-03.jpg", alt: "Ikan budidaya di kolam JagoFarm" },
  { number: "02", icon: "drop", label: "Sisa budidaya", title: "Limbah dilihat sebagai sumber nutrisi.", description: "Sisa organik dari kolam dipelajari agar dapat diolah kembali, bukan langsung dianggap sebagai bahan buangan.", image: "/assets/startup/startup-02.jpg", alt: "Bahan hasil pengamatan budidaya JagoFarm" },
  { number: "03", icon: "leaf", label: "Azolla dan pupuk", title: "Biomassa kembali menjadi bahan berguna.", description: "Azolla dan nutrisi hasil budidaya dieksplorasi sebagai bahan pupuk untuk menghubungkan kolam dengan area tanam.", image: "/assets/startup/startup-11.jpg", alt: "Azolla pada permukaan kolam JagoFarm" },
  { number: "04", icon: "plant", label: "Hasil tanaman", title: "Nutrisi membantu beragam tanaman tumbuh.", description: "Sorgum menjadi salah satu tanaman yang sedang diamati. Ekosistem ini tidak dibatasi pada satu jenis tanaman.", image: "/assets/startup/startup-10.jpg", alt: "Tanaman yang sedang diamati di area JagoFarm" },
  { number: "05", icon: "cycle", label: "Ekosistem sirkular", title: "Setiap hasil membuka putaran berikutnya.", description: "Ikan, pupuk, azolla, dan hasil tanaman diarahkan menjadi produk bernilai tanpa melebih-lebihkan tahap riset saat ini.", image: heroLight, alt: "Area ekosistem JagoFarm" },
];
