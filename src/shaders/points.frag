uniform float radius;
uniform vec3 intersect;

varying vec3 vPos;
varying float d;

void main() {
  gl_FragColor = vec4( vec3( d, 1.0 - d, 0.0 ), 1.0 );
}
