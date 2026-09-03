import heroLight from "../../assets/herosection/hero_section_light.webp";

export const routes = [
  ["/produk", "Produk"],
  ["/dokumentasi", "Dokumentasi"],
  ["/tentang", "Tentang"],
];

export const products = [
  { id: "ikan-nila", name: "Ikan nila", description: "Hasil budidaya ikan yang sedang diamati dalam ekosistem awal.", image: "/assets/startup/startup-03.jpg", category: "akuakultur", categoryLabel: "Akuakultur", icon: "fish" },
  { id: "ikan-gurame", name: "Ikan gurame", description: "Komoditas ikan kedua dalam pengamatan budidaya JagoFarm.", image: "/assets/startup/startup-06.jpg", category: "akuakultur", categoryLabel: "Akuakultur", icon: "fish" },
  { id: "pupuk-azolla", name: "Pupuk azolla", description: "Gagasan pemanfaatan biomassa azolla sebagai bahan bernilai guna.", image: "/assets/startup/startup-01.jpg", category: "nutrisi", categoryLabel: "Nutrisi & Pupuk", icon: "leaf" },
  { id: "pupuk-limbah-ikan", name: "Pupuk limbah ikan", description: "Konsep pengolahan nutrisi budidaya sebelum digunakan kembali.", image: "/assets/startup/startup-02.jpg", category: "nutrisi", categoryLabel: "Nutrisi & Pupuk", icon: "drop" },
  { id: "hasil-tanaman", name: "Hasil tanaman", description: "Beragam tanaman yang diamati; sorgum menjadi salah satu contoh saat ini.", image: "/assets/startup/startup-10.jpg", category: "tanaman", categoryLabel: "Tanaman", icon: "plant" },
];

export const productCategories = [
  ["all", "Semua Produk"],
  ["akuakultur", "Akuakultur"],
  ["nutrisi", "Nutrisi & Pupuk"],
  ["tanaman", "Tanaman"],
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
