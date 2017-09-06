attribute float size;
attribute float random;
uniform float radius;
uniform vec3 intersect;

varying vec3 vPos;
varying float d;

#pragma glslify: map = require(./includes/map.glsl)

void main() {
  d = distance(position, intersect) / ( radius * 0.75 ) + random * 0.25;
  d = pow( smoothstep( 0.0, 1.0, d ), 0.5 );

  vPos = mix(position, intersect, 1.0 - d);
  vec4 mvPosition = modelViewMatrix * vec4( vPos, 1.0 );

  float sizeRandom = map( pow( random, 5.0 ), 0.0, 1.0, 0.25, 1.0);
  gl_PointSize = ( size + (1.0 - d) * 0.05 ) * ( 300.0 / -mvPosition.z ) * sizeRandom;
  gl_Position = projectionMatrix * mvPosition;
}
