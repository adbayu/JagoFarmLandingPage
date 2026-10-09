import { documentation } from "./content.js";

const photos = Object.fromEntries(documentation.map(([title, image, alt]) => [
  title,
  { title, image, alt },
]));

export const projectPortfolio = [
  {
    slug: "bestari",
    number: "01",
    kind: "Kolaborasi eksternal",
    name: "Bestari",
    description: "Proyek eksternal JagoFarm bersama Bestari.",
    cover: photos["Kegiatan lapangan"],
    gallery: ["Kegiatan lapangan", "Pengamatan ikan", "Kolam dengan azolla", "Kolam budidaya"].map((title) => photos[title]),
  },
  {
    slug: "pkm",
    number: "02",
    kind: "Pengabdian kepada masyarakat",
    name: "PKM",
    description: "Program JagoFarm dalam ranah pengabdian kepada masyarakat.",
    cover: photos["Persemaian tanaman"],
    gallery: ["Persemaian tanaman", "Pertumbuhan tanaman", "Instalasi tanaman", "Kegiatan lapangan"].map((title) => photos[title]),
  },
  {
    slug: "sensor-ph-air",
    number: "03",
    kind: "Sensor & instrumentasi",
    name: "Sensor pH Air",
    description: "Eksplorasi pengukuran pH air sebagai bagian dari pengamatan kondisi budidaya.",
    cover: photos["Pengukuran media"],
    gallery: ["Pengukuran media", "Kolam budidaya", "Pengamatan ikan", "Kegiatan lapangan"].map((title) => photos[title]),
  },
  {
    slug: "iot",
    number: "04",
    kind: "Sistem informasi",
    name: "IoT untuk Budidaya",
    description: "Menghubungkan perangkat pengukuran dengan informasi yang dapat ditinjau dalam konteks pertanian dan budidaya.",
    cover: photos["Instalasi tanaman"],
    gallery: ["Instalasi tanaman", "Pengukuran media", "Kolam dengan azolla", "Kegiatan lapangan"].map((title) => photos[title]),
  },
  {
    slug: "ekosistem-sirkular",
    number: "05",
    kind: "Eksplorasi ekosistem",
    name: "Ekosistem Sirkular",
    description: "Area eksplorasi yang mempelajari hubungan ikan, sisa budidaya, azolla, dan tanaman.",
    cover: photos["Permukaan azolla"],
    gallery: ["Kolam dengan azolla", "Bahan dan sampel", "Pengamatan ikan", "Permukaan azolla", "Pertumbuhan tanaman"].map((title) => photos[title]),
  },
].map((project) => ({
  ...project,
  photoNote: "Foto arsip umum JagoFarm digunakan sementara sebagai konteks visual, bukan dokumentasi khusus proyek ini. Foto khusus proyek akan menggantikannya.",
}));
