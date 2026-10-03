export const C = {
  red: "#e5393b",
  blue: "#2a6fd6",
  green: "#2e9e5b",
  orange: "#e4642b",
  warm: "#f2a03d",
  ink: "#2a2320",
};

export const seq = (names: string[], n: number) =>
  Array.from({ length: n }, (_, i) => names[i % names.length]);
