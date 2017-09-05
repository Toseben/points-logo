uniform vec3 intersect;
varying vec3 vPos;

void main() {
  float d = distance(vPos, intersect) * 0.025;
  gl_FragColor = vec4( vec3( d, 1.0 - d, 0.0 ), 1.0 );
}
