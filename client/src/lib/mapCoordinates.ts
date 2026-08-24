export function referencePointFromClick(normalizedX: number, normalizedY: number) {
  const x = Math.min(1, Math.max(0, normalizedX));
  const y = Math.min(1, Math.max(0, normalizedY));
  return {
    lat: 10.9358 + (1 - y) * 0.0048,
    lng: 76.9508 + x * 0.0102,
  };
}
