import { useEffect, useRef, useState } from 'react'
import styles from '@/pages/AuthPage.module.css'

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;
varying vec2 v_uv;
uniform float u_time;

float hash(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise3D(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  float n000 = hash(i + vec3(0.0, 0.0, 0.0));
  float n100 = hash(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash(i + vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);

  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);

  return mix(nxy0, nxy1, f.z);
}

float fbm(vec3 p) {
  float value = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 5; i++) {
    value += amp * noise3D(p);
    p = p * 2.04 + vec3(13.7, 29.3, 7.1);
    amp *= 0.5;
  }
  return value;
}

// Ringed lunar impact crater helper (bowl depression + raised ejecta rim)
float craterBowl(vec3 p, vec3 dir, float radius, float depth) {
  float d = length(p - normalize(dir));
  float normD = d / radius;
  float bowl = -depth * (1.0 - smoothstep(0.0, 0.78, normD));
  float rim = depth * 0.42 * exp(-pow((normD - 0.88) / 0.18, 2.0));
  return bowl + rim;
}

// Procedural 3D lunar topography: maria basins + ringed impact craters + regolith
float lunarElevation(vec3 p) {
  float n1 = fbm(p * 2.1);
  float n2 = fbm(p * 5.2 + vec3(4.2, -1.8, 6.5));
  float micro = fbm(p * 14.0) * 0.08;

  // Major lunar mare basins (Imbrium, Serenitatis, Tranquillitatis, Procellarum, Crisium)
  float mareImbrium = smoothstep(0.68, 0.18, length(p - normalize(vec3(-0.32, 0.46, 0.82))));
  float mareSerenitatis = smoothstep(0.52, 0.14, length(p - normalize(vec3(0.24, 0.38, 0.89))));
  float mareTranquillitatis = smoothstep(0.56, 0.15, length(p - normalize(vec3(0.45, 0.08, 0.88))));
  float oceanusProcellarum = smoothstep(0.82, 0.22, length(p - normalize(vec3(-0.72, 0.12, 0.68))));
  float mareCrisium = smoothstep(0.36, 0.10, length(p - normalize(vec3(0.78, 0.28, 0.56))));
  float farSideBasin = smoothstep(0.75, 0.20, length(p - normalize(vec3(-0.15, -0.45, -0.88))));
  float mareOrientale = smoothstep(0.48, 0.14, length(p - normalize(vec3(-0.88, -0.25, -0.40))));

  float mariaMask = clamp(
    mareImbrium * 0.85 +
    mareSerenitatis * 0.78 +
    mareTranquillitatis * 0.82 +
    oceanusProcellarum * 0.75 +
    mareCrisium * 0.88 +
    farSideBasin * 0.72 +
    mareOrientale * 0.80,
    0.0,
    1.0
  );

  // Prominent ringed craters (Tycho, Copernicus, Kepler, Plato, Clavius, Tsiolkovsky)
  float craters = 0.0;
  craters += craterBowl(p, vec3(-0.16, -0.68, 0.71), 0.20, 0.22); // Tycho
  craters += craterBowl(p, vec3(-0.34, 0.16, 0.92), 0.22, 0.20);  // Copernicus
  craters += craterBowl(p, vec3(-0.62, 0.13, 0.77), 0.15, 0.16);  // Kepler
  craters += craterBowl(p, vec3(-0.15, 0.76, 0.63), 0.18, 0.18);  // Plato
  craters += craterBowl(p, vec3(0.32, -0.52, -0.79), 0.24, 0.22); // Far-side crater
  craters += craterBowl(p, vec3(-0.55, 0.42, -0.72), 0.21, 0.20); // Korolev
  craters += craterBowl(p, vec3(0.68, -0.28, 0.67), 0.19, 0.18);  // Langrenus

  // Procedural repeating cellular crater field across highlands
  vec3 cp = p * 6.5;
  vec3 cell = fract(cp) - 0.5;
  float cellDist = length(cell);
  float smallCrater = smoothstep(0.42, 0.16, cellDist) * -0.07 +
                      exp(-pow((cellDist - 0.40) / 0.07, 2.0)) * 0.035;

  float highlands = n1 * 0.55 + n2 * 0.28 + micro;
  return mix(highlands + smallCrater * 0.9, highlands * 0.35 + smallCrater * 0.25, mariaMask) + craters;
}

mat3 rotateY(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(
    c, 0.0, s,
    0.0, 1.0, 0.0,
    -s, 0.0, c
  );
}

mat3 rotateZ(float angle) {
  float c = cos(angle);
  float s = sin(angle);
  return mat3(
    c, -s, 0.0,
    s, c, 0.0,
    0.0, 0.0, 1.0
  );
}

void main() {
  vec2 p = v_uv;
  float r = length(p);

  float moonRadius = 0.74;
  vec3 lightDir = normalize(vec3(-0.68, 0.32, 0.66));
  vec3 viewDir = vec3(0.0, 0.0, 1.0);

  // Subtle lunar atmospheric/coronal outer glow
  float outerHalo = exp(-max(0.0, r - moonRadius) * 8.5) * 0.34;
  vec3 haloColor = mix(vec3(0.55, 0.78, 1.0), vec3(0.83, 1.0, 0.61), 0.28);

  if (r > moonRadius) {
    float sunSide = 0.55 + 0.45 * max(0.0, dot(normalize(vec3(p, 0.15)), lightDir));
    float alpha = clamp(outerHalo * sunSide, 0.0, 1.0);
    gl_FragColor = vec4(haloColor * alpha, alpha);
    return;
  }

  // Ray-sphere intersection on unit Moon sphere
  vec2 sp = p / moonRadius;
  float z = sqrt(max(0.0, 1.0 - dot(sp, sp)));
  vec3 worldNormal = normalize(vec3(sp.x, sp.y, z));

  // Continuous 360-degree horizontal rotation around Y-axis with slight 1.54-deg axial tilt
  float yaw = u_time * 0.24;
  mat3 moonRot = rotateY(yaw) * rotateZ(0.03);
  vec3 objPos = moonRot * worldNormal;

  // Finite-difference 3D surface normal perturbation for craters & ridges
  float eps = 0.009;
  float h0 = lunarElevation(objPos);
  float hx = lunarElevation(normalize(objPos + vec3(eps, 0.0, 0.0)));
  float hy = lunarElevation(normalize(objPos + vec3(0.0, eps, 0.0)));
  float hz = lunarElevation(normalize(objPos + vec3(0.0, 0.0, eps)));
  vec3 grad = vec3(hx - h0, hy - h0, hz - h0) / eps;
  grad -= objPos * dot(objPos, grad);

  vec3 worldGrad = grad * moonRot;
  vec3 bumpedNormal = normalize(worldNormal - worldGrad * 0.16);

  // Lunar albedo: dark basaltic maria vs bright anorthositic highlands + crater rays
  vec3 mareDark = vec3(0.27, 0.31, 0.38);
  vec3 mareMid = vec3(0.41, 0.46, 0.54);
  vec3 highlandMid = vec3(0.69, 0.74, 0.81);
  vec3 highlandBright = vec3(0.88, 0.92, 0.97);

  float heightNorm = clamp(h0 * 1.15 + 0.32, 0.0, 1.0);
  vec3 albedo = mix(mareDark, mareMid, smoothstep(0.0, 0.38, heightNorm));
  albedo = mix(albedo, highlandMid, smoothstep(0.32, 0.66, heightNorm));
  albedo = mix(albedo, highlandBright, smoothstep(0.66, 0.95, heightNorm));

  // Bright ejecta rays around Tycho & Copernicus
  vec3 tychoDir = normalize(vec3(-0.16, -0.68, 0.71));
  float tychoDist = length(objPos - tychoDir);
  float tychoAngle = atan(objPos.y - tychoDir.y, objPos.x - tychoDir.x);
  float tychoRays = smoothstep(0.55, 0.04, tychoDist) *
                    (0.5 + 0.5 * sin(tychoAngle * 9.0 + fbm(objPos * 8.0) * 3.0));
  albedo = mix(albedo, vec3(0.95, 0.97, 1.0), tychoRays * 0.32);

  // Lommel-Seeliger + Oren-Nayar lunar regolith reflectance
  float ndotl = max(0.0, dot(bumpedNormal, lightDir));
  float ndotv = max(0.05, dot(bumpedNormal, viewDir));
  float sphereNdotL = max(0.0, dot(worldNormal, lightDir));
  float terminator = smoothstep(-0.14, 0.22, dot(worldNormal, lightDir));

  float lommel = ndotl / (ndotl + ndotv * 0.65 + 0.08);
  float diffuse = mix(ndotl, lommel * 1.35, 0.58) * terminator;

  // Cool earthshine on the night hemisphere
  vec3 earthshine = vec3(0.06, 0.10, 0.17) * (0.55 + 0.45 * heightNorm);

  // Subtle mineral specular glint on crater rims
  vec3 halfVec = normalize(lightDir + viewDir);
  float spec = pow(max(0.0, dot(bumpedNormal, halfVec)), 28.0) * 0.09 * terminator;

  // Fresnel rim glow (cool selenographic blue + faint Nova lime accent on sunlit limb)
  float fresnel = pow(1.0 - max(0.0, dot(worldNormal, viewDir)), 3.2);
  vec3 rimColor = mix(
    vec3(0.18, 0.34, 0.54),
    vec3(0.75, 0.93, 1.0),
    smoothstep(-0.2, 0.65, sphereNdotL)
  );

  vec3 color = albedo * (earthshine + vec3(1.02, 1.0, 0.97) * diffuse * 1.15) +
               vec3(0.90, 0.96, 1.0) * spec +
               rimColor * fresnel * (0.28 + 0.45 * sphereNdotL);

  float edgeAA = smoothstep(moonRadius, moonRadius - 0.012, r);
  vec3 finalColor = mix(haloColor * outerHalo, color, edgeAA);
  float finalAlpha = max(edgeAA, outerHalo * 0.65);

  gl_FragColor = vec4(finalColor, finalAlpha);
}
`

function compileShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type)
  if (!shader) return null
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader)
    return null
  }
  return shader
}

export function Moon3DIllustration() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [webglReady, setWebglReady] = useState(false)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
      return
    }
    const canvas = canvasRef.current
    if (!canvas) return

    let gl: WebGLRenderingContext | null = null
    try {
      gl =
        canvas.getContext('webgl', {
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        }) ||
        (canvas.getContext('experimental-webgl', {
          alpha: true,
          antialias: true,
        }) as WebGLRenderingContext | null)
    } catch {
      gl = null
    }

    if (!gl) return

    const vs = compileShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER)
    const fs = compileShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER)
    if (!vs || !fs) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vs)
    gl.attachShader(program, fs)
    gl.linkProgram(program)
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      gl.deleteProgram(program)
      return
    }

    gl.useProgram(program)

    const quadBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW,
    )

    const posLoc = gl.getAttribLocation(program, 'a_position')
    gl.enableVertexAttribArray(posLoc)
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0)

    const timeLoc = gl.getUniformLocation(program, 'u_time')

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect()
      const side = Math.max(240, Math.min(460, Math.round(rect.width || 320)))
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const pixelSize = Math.round(side * dpr)
      if (canvas.width !== pixelSize || canvas.height !== pixelSize) {
        canvas.width = pixelSize
        canvas.height = pixelSize
        gl?.viewport(0, 0, pixelSize, pixelSize)
      }
    }

    syncSize()
    setWebglReady(true)

    const reducedMotionQuery = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )
    let isReducedMotion = reducedMotionQuery?.matches ?? false
    let rafId = 0
    const startTime = performance.now()

    const render = (now: number) => {
      if (!gl) return
      const elapsed = isReducedMotion ? 2.4 : (now - startTime) * 0.001
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(timeLoc, elapsed)
      gl.drawArrays(gl.TRIANGLES, 0, 6)

      if (!isReducedMotion && document.visibilityState !== 'hidden') {
        rafId = requestAnimationFrame(render)
      }
    }

    render(performance.now())

    const onResize = () => syncSize()
    const onVisibilityChange = () => {
      cancelAnimationFrame(rafId)
      if (document.visibilityState === 'visible' && !isReducedMotion) {
        rafId = requestAnimationFrame(render)
      }
    }
    const onMotionChange = (event: MediaQueryListEvent) => {
      isReducedMotion = event.matches
      cancelAnimationFrame(rafId)
      render(performance.now())
    }

    window.addEventListener('resize', onResize, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    reducedMotionQuery?.addEventListener('change', onMotionChange)

    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', onResize)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      reducedMotionQuery?.removeEventListener('change', onMotionChange)
      gl?.deleteBuffer(quadBuffer)
      gl?.deleteProgram(program)
      gl?.deleteShader(vs)
      gl?.deleteShader(fs)
    }
  }, [])

  return (
    <div
      className={`${styles.moon3dStage} ${webglReady ? styles.moonWebglActive : ''}`}
      role="img"
      aria-label="Interactive 3D illustrative model of the Moon rotating horizontally"
    >
      <canvas ref={canvasRef} className={styles.moon3dCanvas} />
      <div className={styles.moon3dFallback} aria-hidden="true">
        <div className={styles.moonSphereFallback}>
          <div className={styles.moonSurfaceStrip} />
          <div className={styles.moonAtmosphereOverlay} />
        </div>
      </div>
    </div>
  )
}
