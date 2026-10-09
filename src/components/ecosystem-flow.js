export const ecosystemNodes = [
  { position: [0, 0, -3.7], output: "Air kolam menuju pengolahan sisa dan area azolla." },
  { position: [4.05, 0, -.9], output: "Sisa organik diolah menjadi nutrisi untuk tanaman." },
  { position: [2.8, 0, 3.55], output: "Azolla dan pupuk menjadi sumber biomassa untuk tanaman." },
  { position: [-2, 0, 3.85], output: "Dua aliran nutrisi bertemu untuk mendukung hasil tanaman." },
  { position: [-4.2, 0, -.65], output: "Hasil budidaya, pengolahan, dan tanaman melengkapi satu ekosistem." },
];

export const ecosystemConnections = [
  { from: 0, to: 1, kind: "water", bend: [3.05, 0, -3.55] },
  { from: 0, to: 2, kind: "water", bend: [1.8, 0, .35] },
  { from: 1, to: 3, kind: "nutrient", bend: [5.1, 0, 6.1] },
  { from: 2, to: 3, kind: "biomass", bend: [.2, 0, 4.65] },
  { from: 3, to: 4, kind: "biomass", bend: [-5.25, 0, 2.25] },
  { from: 4, to: 0, kind: "biomass", bend: [-3.95, 0, -4.45] },
];
