/**
 * Returns a CSS clip-path string for the given environment shape and dimensions.
 * Returns null for 'rect' (no clipping needed).
 */
export function envClipPath (shape, w, h) {
  if (shape === 'l-shape') {
    const cx = Math.round(w * 0.6), cy = Math.round(h * 0.4)
    return `polygon(0px 0px, ${cx}px 0px, ${cx}px ${cy}px, ${w}px ${cy}px, ${w}px ${h}px, 0px ${h}px)`
  }
  if (shape === 'u-shape') {
    const x1 = Math.round(w * 0.35), x2 = Math.round(w * 0.65), my = Math.round(h * 0.45)
    return `polygon(0px 0px, ${w}px 0px, ${w}px ${h}px, ${x2}px ${h}px, ${x2}px ${my}px, ${x1}px ${my}px, ${x1}px ${h}px, 0px ${h}px)`
  }
  return null
}

/**
 * Returns true if the point (x, y) is inside the valid area of the shape.
 * Used to block element placement outside the room boundary.
 */
export function isInsideShape (shape, w, h, x, y) {
  if (!shape || shape === 'rect') return x >= 0 && y >= 0 && x <= w && y <= h
  if (shape === 'l-shape') {
    const cx = w * 0.6, cy = h * 0.4
    // Invalid zone: top-right rectangle (x > cx AND y < cy)
    if (x > cx && y < cy) return false
    return x >= 0 && y >= 0 && x <= w && y <= h
  }
  if (shape === 'u-shape') {
    const x1 = w * 0.35, x2 = w * 0.65, my = h * 0.45
    // Invalid zone: center-bottom cutout (x between x1..x2 AND y > my)
    if (x > x1 && x < x2 && y > my) return false
    return x >= 0 && y >= 0 && x <= w && y <= h
  }
  return true
}
