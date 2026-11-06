// GLSL for the procedurally shaded planets, their atmosphere glow and the
// starfield. Nothing here is a raster asset: every surface is generated from
// 3D simplex noise, so each world is authored by its uniforms alone.

// 3D simplex noise — Ashima Arts / Stefan Gustavson (MIT).
const SIMPLEX_3D = /* glsl */ `
vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec4 permute(vec4 x) { return mod289(((x * 34.0) + 1.0) * x); }
vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

float snoise(vec3 v) {
  const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
  const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
  vec3 i = floor(v + dot(v, C.yyy));
  vec3 x0 = v - i + dot(i, C.xxx);
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min(g.xyz, l.zxy);
  vec3 i2 = max(g.xyz, l.zxy);
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy;
  vec3 x3 = x0 - D.yyy;
  i = mod289(i);
  vec4 p = permute(permute(permute(
    i.z + vec4(0.0, i1.z, i2.z, 1.0))
    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
  float n_ = 0.142857142857;
  vec3 ns = n_ * D.wyz - D.xzx;
  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_);
  vec4 x = x_ * ns.x + ns.yyyy;
  vec4 y = y_ * ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);
  vec4 b0 = vec4(x.xy, y.xy);
  vec4 b1 = vec4(x.zw, y.zw);
  vec4 s0 = floor(b0) * 2.0 + 1.0;
  vec4 s1 = floor(b1) * 2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));
  vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
  vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;
  vec3 p0 = vec3(a0.xy, h.x);
  vec3 p1 = vec3(a0.zw, h.y);
  vec3 p2 = vec3(a1.xy, h.z);
  vec3 p3 = vec3(a1.zw, h.w);
  vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;
  vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
  m = m * m;
  return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
}

float fbm(vec3 p) {
  float sum = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    sum += amp * snoise(p);
    p *= 2.03;
    amp *= 0.5;
  }
  return sum;
}
`;

export const planetVertexShader = /* glsl */ `
varying vec3 vObjPos;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vObjPos = position;
  vec4 world = modelMatrix * vec4(position, 1.0);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vViewDir = normalize(cameraPosition - world.xyz);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

export const planetFragmentShader = /* glsl */ `
uniform vec3 uDeep;
uniform vec3 uMid;
uniform vec3 uLight;
uniform vec3 uAtmo;
uniform vec3 uCloudTint;
uniform vec3 uSunDir;
uniform float uScale;
uniform float uBands;
uniform float uCloud;
uniform float uEmissive;
uniform float uTerminator;
uniform float uSeed;
uniform float uTime;
uniform float uFade;
uniform float uLines;
uniform float uScorch;

varying vec3 vObjPos;
varying vec3 vNormal;
varying vec3 vViewDir;

${SIMPLEX_3D}

void main() {
  vec3 p = normalize(vObjPos);
  vec3 q = p * uScale + uSeed;

  // Domain-warped terrain, optionally stretched into latitude bands.
  float warp = fbm(q + fbm(q * 1.7));
  vec3 banded = vec3(p.x * 0.5, p.y * uScale * 3.2, p.z * 0.5) + uSeed + warp * 0.9;
  float h = mix(warp, fbm(banded), uBands) * 0.5 + 0.5;

  vec3 color = mix(uDeep, uMid, smoothstep(0.22, 0.56, h));
  color = mix(color, uLight, smoothstep(0.56, 0.86, h));

  // Drifting cloud / ash / storm layer, in its own tint.
  float clouds = fbm(p * uScale * 1.6 + vec3(uTime * 0.015, 0.0, uSeed)) * 0.5 + 0.5;
  clouds = smoothstep(0.42, 0.78, clouds) * uCloud;
  color = mix(color, uCloudTint, clouds * 0.8);

  // Luminous glyph-like network (ridged noise), lit on both sides.
  float ridge = 1.0 - abs(snoise(q * 1.35 + 3.1));
  float lines = smoothstep(0.9, 0.985, ridge) * uLines;

  // One shared star: a narrow terminator makes every world read as a sphere.
  vec3 n = normalize(vNormal);
  float ndl = dot(n, normalize(uSunDir));
  float day = smoothstep(-uTerminator, uTerminator + 0.22, ndl);
  vec3 lit = color * (0.02 + 1.2 * day);

  // Scorched day side: blown out where the star is overhead.
  lit = mix(lit, uLight * 1.45, uScorch * smoothstep(0.3, 0.95, ndl));

  // Night-side emission (lava, lanterns) and the glyph network.
  float glow = smoothstep(0.6, 0.82, h) * uEmissive * (1.0 - day);
  lit += uAtmo * glow * 1.4;
  lit += uAtmo * lines * (0.3 + 0.9 * (1.0 - day));

  // Atmospheric rim, brighter on the sunlit limb.
  float fresnel = pow(1.0 - max(dot(n, normalize(vViewDir)), 0.0), 3.0);
  lit += uAtmo * fresnel * (0.1 + 0.95 * smoothstep(-0.2, 0.6, ndl));

  gl_FragColor = vec4(lit, uFade);
}
`;

export const atmosphereVertexShader = /* glsl */ `
varying vec3 vViewNormal;
varying vec3 vWorldNormal;

void main() {
  vViewNormal = normalize(normalMatrix * normal);
  vWorldNormal = normalize(mat3(modelMatrix) * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const atmosphereFragmentShader = /* glsl */ `
uniform vec3 uAtmo;
uniform vec3 uSunDir;
uniform float uStrength;
uniform float uFade;

varying vec3 vViewNormal;
varying vec3 vWorldNormal;

void main() {
  // Rendered on the back faces of a sphere 1.12x the planet. Normals stay
  // outward, so the visible ring has view-space z from about -0.45 (at the
  // planet's limb) to 0 (outer edge): strongest at the limb, gone at the edge.
  float halo = pow(clamp(-vViewNormal.z * 2.1, 0.0, 1.0), 3.0);
  float sunlit = smoothstep(-0.5, 0.7, dot(normalize(vWorldNormal), normalize(uSunDir)));
  gl_FragColor = vec4(uAtmo * halo * uStrength * uFade * (0.25 + 0.75 * sunlit), 1.0);
}
`;

export const starVertexShader = /* glsl */ `
attribute float aSize;
attribute float aPhase;
uniform float uTime;
uniform float uPixelRatio;
varying float vAlpha;

void main() {
  vec4 view = modelViewMatrix * vec4(position, 1.0);
  float twinkle = 0.75 + 0.25 * sin(uTime * 1.3 + aPhase);
  vAlpha = twinkle;
  gl_PointSize = aSize * uPixelRatio * (60.0 / -view.z);
  gl_Position = projectionMatrix * view;
}
`;

export const starFragmentShader = /* glsl */ `
uniform vec3 uColor;
varying float vAlpha;

void main() {
  float d = length(gl_PointCoord - 0.5);
  float core = smoothstep(0.5, 0.0, d);
  gl_FragColor = vec4(uColor, core * core * vAlpha);
}
`;
