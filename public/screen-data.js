// Corners measured on the unchanged 1731 × 909 photographic desk source.
// Convert once into the shared 1448 × 1086 room plane; TL, TR, BR, BL.
const roomPoint = ([x, y]) => [160 + x * 400 / 1731, 350 + y * 210 / 909];
export const screenQuads = {
  laptop: [[618, 263], [1049, 263], [1049, 514], [612, 514]].map(roomPoint),
  omarchy: [[159, 34], [431, 33], [452, 493], [174, 518]].map(roomPoint)
};

// Project a rectangle onto four coplanar points. Browser hit testing follows
// this transform; text is laid out at its displayed pixel size before mapping.
export function quadTransform(points, width, height) {
  const [p0, p1, p2, p3] = points;
  const dx1 = p1[0] - p2[0], dx2 = p3[0] - p2[0];
  const dy1 = p1[1] - p2[1], dy2 = p3[1] - p2[1];
  const dx3 = p0[0] - p1[0] + p2[0] - p3[0];
  const dy3 = p0[1] - p1[1] + p2[1] - p3[1];
  const denominator = dx1 * dy2 - dx2 * dy1;
  const g = (dx3 * dy2 - dx2 * dy3) / denominator;
  const h = (dx1 * dy3 - dx3 * dy1) / denominator;
  const a = p1[0] - p0[0] + g * p1[0];
  const b = p3[0] - p0[0] + h * p3[0];
  const d = p1[1] - p0[1] + g * p1[1];
  const e = p3[1] - p0[1] + h * p3[1];
  return `matrix3d(${a / width},${d / width},0,${g / width},${b / height},${e / height},0,${h / height},0,0,1,0,${p0[0]},${p0[1]},0,1)`;
}
