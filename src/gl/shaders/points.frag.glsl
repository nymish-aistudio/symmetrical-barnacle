precision highp float;

uniform vec3 uColLo;
uniform vec3 uColHi;
uniform float uOpacity;

varying float vVal;
varying float vFade;

void main() {
  vec2 c = gl_PointCoord - 0.5;
  float d = dot(c, c) * 4.0;
  if (d > 1.0) discard;
  float core = 1.0 - d;
  float a = pow(core, 1.7);
  vec3 col = mix(uColLo, uColHi, smoothstep(0.0, 1.0, vVal));
  gl_FragColor = vec4(col, a * uOpacity * vFade);
}
