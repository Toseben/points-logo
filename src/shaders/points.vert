attribute float size;
uniform vec3 intersect;
varying vec3 vPos;

void main() {
  vPos = position;
  float d = distance(vPos, intersect) * 0.025;

  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
  gl_PointSize = size * ( 300.0 / -mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;

  gl_Position.y += clamp(1.0 - d, 0.0, 1.0) * 25.0;
}
