precision highp float;

uniform sampler2D uA;      // what was on screen when the current morph began
uniform sampler2D uB;      // the formation being morphed to
uniform sampler2D uC;      // scrub pair: from
uniform sampler2D uD;      // scrub pair: to
uniform float uMix;        // 0 → 1 between A and B
uniform float uScrubT;     // 0 → 1 between C and D (hero scroll)
uniform float uBScrub;     // 1 when B is the scrub blend of C and D
uniform float uTime;
uniform float uSize;
uniform float uDpr;
uniform float uSwirl;      // swirl amplitude multiplier
uniform float uIdle;       // idle drift multiplier (0 when reduced motion)

attribute vec2 aUv;
attribute float aSeed;
attribute float aSize;

varying float vVal;
varying float vFade;

const float PI = 3.141592653589793;

float stagger(float m, float seed) {
  float k = clamp((m - seed * 0.35) / 0.65, 0.0, 1.0);
  return k * k * (3.0 - 2.0 * k);
}

vec3 swirl(vec3 p, float k, float seed) {
  float sw = sin(k * PI) * uSwirl * 1.1;
  return sw * vec3(
    sin(p.y * 1.3 + uTime * 0.9 + seed * 6.2831),
    cos(p.x * 1.1 - uTime * 0.7 + seed * 3.1),
    sin(p.z * 1.7 + uTime * 0.5 + seed * 3.0)
  );
}

void main() {
  vec4 a = texture2D(uA, aUv);
  vec4 b;
  if (uBScrub > 0.5) {
    vec4 c = texture2D(uC, aUv);
    vec4 d = texture2D(uD, aUv);
    float k2 = stagger(uScrubT, aSeed);
    b = mix(c, d, k2);
    b.xyz += swirl(b.xyz, k2, aSeed);
  } else {
    b = texture2D(uB, aUv);
  }

  float k = stagger(uMix, aSeed);
  vec3 p = mix(a.xyz, b.xyz, k);
  p += swirl(p, k, aSeed);

  p += uIdle * 0.035 * vec3(
    sin(uTime * 0.7 + aSeed * 47.0),
    cos(uTime * 0.55 + aSeed * 29.0),
    sin(uTime * 0.6 + aSeed * 13.0)
  );

  vVal = mix(a.w, b.w, k);
  vFade = step(-500.0, p.y);

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_PointSize = aSize * uSize * uDpr * (36.0 / max(-mv.z, 0.5));
  gl_Position = projectionMatrix * mv;
}
