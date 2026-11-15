import { useEffect, useRef, useState } from 'react'
import styles from './Spaceship3DIllustration.module.css'

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
uniform float u_variant;
uniform vec2 u_resolution;

mat3 rotateY(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(
    c, 0.0, s,
    0.0, 1.0, 0.0,
    -s, 0.0, c
  );
}

mat3 rotateX(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, -s,
    0.0, s, c
  );
}

mat3 rotateZ(float a) {
  float c = cos(a);
  float s = sin(a);
  return mat3(
    c, -s, 0.0,
    s, c, 0.0,
    0.0, 0.0, 1.0
  );
}

float sdBox(vec3 p, vec3 b) {
  vec3 q = abs(p) - b;
  return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdCylinderY(vec3 p, float h, float r) {
  vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
  return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

float sdCapsuleY(vec3 p, float y1, float y2, float r) {
  p.y -= clamp(p.y, y1, y2);
  return length(p) - r;
}

// Returns vec2(signedDistance, materialId)
// Material IDs:
// 1.0 = Gold MLI Foil Bus
// 2.0 = Titanium / Hull Dish & Struts
// 3.0 = Photovoltaic Solar Array Wings
// 4.0 = Ion Engine Nozzle & Glowing Core
// 5.0 = Nova Lime Telemetry Beacon
vec2 mapSpaceship(vec3 p) {
  // 1. Central octagonal/cylindrical spacecraft bus (gold thermal foil)
  float bus = sdCylinderY(p - vec3(0.0, -0.05, 0.0), 0.34, 0.34);
  float busChamfer = sdBox(p - vec3(0.0, -0.05, 0.0), vec3(0.27, 0.36, 0.27)) - 0.04;
  float coreBus = mix(bus, busChamfer, 0.45);
  vec2 res = vec2(coreBus, 1.0);

  // 2. Upper instrument collar & parabolic High-Gain Dish Antenna
  float collar = sdCylinderY(p - vec3(0.0, 0.34, 0.0), 0.07, 0.24);
  // Parabolic dish shell above bus
  vec3 dp = p - vec3(0.0, 0.48, 0.0);
  float dishRadius = length(dp.xz);
  float parabolaY = 0.22 * dishRadius * dishRadius;
  float dishShell = abs(dp.y - parabolaY) - 0.024;
  float dishBound = dishRadius - 0.62;
  float dish = max(dishShell, dishBound);

  // Feed horn spire & tripod struts
  float mast = sdCapsuleY(p, 0.44, 0.84, 0.026);
  float hullParts = min(collar, min(dish, mast));
  if (hullParts < res.x) {
    res = vec2(hullParts, 2.0);
  }

  // 3. Telemetry Beacon sphere at tip of high-gain antenna
  float beacon = length(p - vec3(0.0, 0.88, 0.0)) - 0.058;
  if (beacon < res.x) {
    res = vec2(beacon, 5.0);
  }

  // 4. Twin Articulated Solar Array Wings (symmetric along X)
  vec3 sp = p;
  sp.x = abs(sp.x);
  // Support boom
  float boom = sdBox(sp - vec3(0.56, -0.04, 0.0), vec3(0.28, 0.022, 0.022));
  if (boom < res.x) {
    res = vec2(boom, 2.0);
  }
  // Tilted photovoltaic solar wing panel
  vec3 wp = sp - vec3(1.16, -0.04, 0.0);
  wp = rotateX(0.32) * wp;
  float solarWing = sdBox(wp, vec3(0.56, 0.014, 0.24)) - 0.004;
  if (solarWing < res.x) {
    res = vec2(solarWing, 3.0);
  }

  // 5. Aft Hall-Effect Ion Thruster Nozzle & Plasma Core
  float nozzle = sdCylinderY(p - vec3(0.0, -0.46, 0.0), 0.09, 0.18);
  float thrusterCore = length(p - vec3(0.0, -0.56, 0.0)) - 0.13;
  float thruster = min(nozzle, thrusterCore);
  if (thruster < res.x) {
    res = vec2(thruster, 4.0);
  }

  return res;
}

vec3 calcNormal(vec3 p) {
  vec2 e = vec2(0.0025, -0.0025);
  return normalize(
    e.xyy * mapSpaceship(p + e.xyy).x +
    e.yyx * mapSpaceship(p + e.yyx).x +
    e.yxy * mapSpaceship(p + e.yxy).x +
    e.xxx * mapSpaceship(p + e.xxx).x
  );
}

void main() {
  vec2 aspect = vec2(u_resolution.x / max(1.0, u_resolution.y), 1.0);
  vec2 uv = v_uv * aspect;

  // Shift spacecraft slightly toward the right side of the wide hero stage when wide
  float xOffset = u_resolution.x > 460.0 ? 0.16 * aspect.x : 0.0;
  vec2 p = uv - vec2(xOffset, 0.02);

  // Camera setup
  vec3 ro = vec3(0.0, 0.18, 3.35);
  vec3 rd = normalize(vec3(p, -1.55));

  // Smooth continuous 3D rotation + gentle orbital pitch/roll
  float phase = u_variant * 1.65;
  float yaw = u_time * 0.48 + phase;
  float pitch = 0.28 + 0.08 * sin(u_time * 0.7 + phase);
  float roll = -0.22 + 0.06 * cos(u_time * 0.55 + phase);
  mat3 shipRot = rotateZ(roll) * rotateX(pitch) * rotateY(yaw);

  // Transform ray into spacecraft object space
  vec3 roObj = shipRot * ro;
  vec3 rdObj = shipRot * rd;

  // Raymarch SDF
  float t = 0.0;
  float matId = 0.0;
  float minGlowDist = 100.0;
  float minBeaconDist = 100.0;

  for (int i = 0; i < 56; i++) {
    vec3 pos = roObj + rdObj * t;
    vec2 h = mapSpaceship(pos);

    // Track closest approach to ion plume & telemetry beacon for volumetric glow
    vec3 plumePos = pos - vec3(0.0, -0.74, 0.0);
    plumePos.xz *= 1.65;
    float plumeDist = length(plumePos);
    minGlowDist = min(minGlowDist, plumeDist);

    float bDist = length(pos - vec3(0.0, 0.88, 0.0));
    minBeaconDist = min(minBeaconDist, bDist);

    if (h.x < 0.0025 || t > 5.5) {
      matId = h.y;
      break;
    }
    t += h.x * 0.92;
  }

  // Volumetric ion thruster plume & telemetry beacon halo
  float pulse = 0.85 + 0.15 * sin(u_time * 4.2);
  float ionHalo = exp(-minGlowDist * 5.2) * 0.68 * pulse;
  float beaconHalo = exp(-minBeaconDist * 8.5) * 0.58 * (0.8 + 0.2 * sin(u_time * 3.2));

  vec3 ionColor = mix(vec3(0.32, 0.80, 1.0), vec3(0.83, 1.0, 0.60), 0.38);
  vec3 beaconColor = vec3(0.83, 1.0, 0.60);

  if (t <= 5.5 && matId > 0.5) {
    vec3 posObj = roObj + rdObj * t;
    vec3 nObj = calcNormal(posObj);
    // Transform normal back to world space
    vec3 nWorld = normalize(nObj * shipRot);

    vec3 lightDir = normalize(vec3(-0.62, 0.68, 0.72));
    vec3 fillDir = normalize(vec3(0.65, -0.35, 0.45));
    vec3 viewDir = -rd;

    float diff = max(0.0, dot(nWorld, lightDir));
    float fill = max(0.0, dot(nWorld, fillDir));
    vec3 halfVec = normalize(lightDir + viewDir);
    float fresnel = pow(1.0 - max(0.0, dot(nWorld, viewDir)), 3.0);

    vec3 baseColor = vec3(0.75, 0.82, 0.90);
    float specPower = 32.0;
    float specStrength = 0.45;
    vec3 emissive = vec3(0.0);

    if (matId < 1.5) {
      // 1.0: Gold MLI Thermal Foil Bus with quilted crinkle detail
      float crinkle = sin(posObj.x * 38.0) * sin(posObj.y * 34.0) * cos(posObj.z * 38.0);
      baseColor = mix(vec3(0.82, 0.58, 0.22), vec3(0.98, 0.80, 0.42), 0.5 + 0.5 * crinkle);
      specPower = 24.0;
      specStrength = 0.75;
    } else if (matId < 2.5) {
      // 2.0: Aerospace Titanium Dish & Structural Bus
      float ring = 0.5 + 0.5 * sin(length(posObj.xz) * 42.0);
      baseColor = mix(vec3(0.62, 0.71, 0.82), vec3(0.86, 0.91, 0.97), ring * 0.45);
      specPower = 40.0;
      specStrength = 0.55;
    } else if (matId < 3.5) {
      // 3.0: Photovoltaic Solar Array Wings with cell grid lines
      vec2 gridUV = fract(posObj.xz * vec2(7.5, 9.0));
      float gridLine = step(0.07, gridUV.x) * step(0.08, gridUV.y);
      baseColor = mix(vec3(0.32, 0.78, 0.98), vec3(0.07, 0.19, 0.36), gridLine);
      specPower = 56.0;
      specStrength = 0.85;
      emissive = vec3(0.04, 0.12, 0.24) * (1.0 - gridLine * 0.7);
    } else if (matId < 4.5) {
      // 4.0: Ion Engine Nozzle & Plasma Core
      float isCore = smoothstep(-0.46, -0.56, posObj.y);
      baseColor = mix(vec3(0.22, 0.28, 0.36), vec3(0.32, 0.82, 1.0), isCore);
      emissive = mix(vec3(0.0), ionColor * 1.35 * pulse, isCore);
    } else {
      // 5.0: Nova Lime Telemetry Beacon
      baseColor = beaconColor;
      emissive = beaconColor * 1.25;
    }

    float spec = pow(max(0.0, dot(nWorld, halfVec)), specPower) * specStrength;

    vec3 litColor =
      baseColor * (vec3(0.16, 0.22, 0.32) + vec3(1.02, 0.99, 0.94) * diff * 0.95 + vec3(0.32, 0.75, 1.0) * fill * 0.35) +
      vec3(0.92, 0.97, 1.0) * spec +
      mix(vec3(0.32, 0.80, 1.0), beaconColor, 0.45) * fresnel * 0.42 +
      emissive;

    litColor += ionColor * ionHalo * 0.45 + beaconColor * beaconHalo * 0.45;
    gl_FragColor = vec4(litColor, 1.0);
  } else {
    // Transparent space background with volumetric ion & beacon glow
    vec3 glow = ionColor * ionHalo + beaconColor * beaconHalo;
    float alpha = clamp(ionHalo + beaconHalo, 0.0, 0.88);
    gl_FragColor = vec4(glow, alpha);
  }
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

export interface Spaceship3DIllustrationProps {
  variant?: 'command' | 'recon'
  badgeLabel?: string
}

export function Spaceship3DIllustration({
  variant = 'command',
  badgeLabel = '3D Deep Space Telemetry Craft',
}: Spaceship3DIllustrationProps) {
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
    const variantLoc = gl.getUniformLocation(program, 'u_variant')
    const resLoc = gl.getUniformLocation(program, 'u_resolution')

    let width = 360
    let height = 320

    const syncSize = () => {
      const rect = canvas.getBoundingClientRect()
      width = Math.max(240, Math.min(720, Math.round(rect.width || 380)))
      height = Math.max(200, Math.min(480, Math.round(rect.height || 300)))
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const pw = Math.round(width * dpr)
      const ph = Math.round(height * dpr)
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw
        canvas.height = ph
        gl?.viewport(0, 0, pw, ph)
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
      const elapsed = isReducedMotion ? 1.2 : (now - startTime) * 0.001
      gl.clearColor(0, 0, 0, 0)
      gl.clear(gl.COLOR_BUFFER_BIT)
      gl.uniform1f(timeLoc, elapsed)
      gl.uniform1f(variantLoc, variant === 'recon' ? 1.0 : 0.0)
      gl.uniform2f(resLoc, width, height)
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
  }, [variant])

  return (
    <div
      className={`${styles.stage} ${webglReady ? styles.webglActive : ''}`}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} className={styles.canvas} />
      <div className={styles.fallback}>
        <div className={styles.shipRig}>
          <svg
            viewBox="0 0 320 260"
            fill="none"
            className={styles.svgShip}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient id="solarPanelGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#1e4976" />
                <stop offset="50%" stopColor="#0e2744" />
                <stop offset="100%" stopColor="#53cbff" stopOpacity="0.65" />
              </linearGradient>
              <linearGradient id="foilBusGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#ffe08a" />
                <stop offset="55%" stopColor="#d99b38" />
                <stop offset="100%" stopColor="#7a4e12" />
              </linearGradient>
              <linearGradient id="dishHullGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f0f6ff" />
                <stop offset="100%" stopColor="#7d93ad" />
              </linearGradient>
              <radialGradient id="ionPlumeGrad" cx="50%" cy="20%" r="75%">
                <stop offset="0%" stopColor="#d4ff9a" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#53cbff" stopOpacity="0.65" />
                <stop offset="100%" stopColor="#53cbff" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Ion Engine Plume */}
            <ellipse cx="160" cy="212" rx="28" ry="38" fill="url(#ionPlumeGrad)" />

            {/* Port & Starboard 3D Solar Array Wings */}
            <polygon
              points="18,118 112,102 118,136 24,152"
              fill="url(#solarPanelGrad)"
              stroke="#53cbff"
              strokeWidth="1.5"
            />
            <polygon
              points="302,118 208,102 202,136 296,152"
              fill="url(#solarPanelGrad)"
              stroke="#53cbff"
              strokeWidth="1.5"
            />
            {/* Solar cell grid lines */}
            <line x1="48" y1="113" x2="54" y2="147" stroke="#53cbff" strokeOpacity="0.45" />
            <line x1="80" y1="108" x2="86" y2="141" stroke="#53cbff" strokeOpacity="0.45" />
            <line x1="272" y1="113" x2="266" y2="147" stroke="#53cbff" strokeOpacity="0.45" />
            <line x1="240" y1="108" x2="234" y2="141" stroke="#53cbff" strokeOpacity="0.45" />

            {/* Spacecraft Gold MLI Foil Bus */}
            <polygon
              points="126,102 194,102 204,162 116,162"
              fill="url(#foilBusGrad)"
              stroke="#ffe7a3"
              strokeWidth="1.5"
            />
            <polygon
              points="142,162 178,162 170,184 150,184"
              fill="#33475b"
              stroke="#8fa6bf"
              strokeWidth="1.2"
            />

            {/* Parabolic High-Gain Dish & Telemetry Spire */}
            <ellipse
              cx="160"
              cy="90"
              rx="54"
              ry="18"
              fill="url(#dishHullGrad)"
              stroke="#d6e6f9"
              strokeWidth="1.5"
            />
            <line x1="160" y1="90" x2="160" y2="42" stroke="#dce9f9" strokeWidth="3" />
            <line x1="132" y1="88" x2="160" y2="52" stroke="#9ab0c7" strokeWidth="1.3" />
            <line x1="188" y1="88" x2="160" y2="52" stroke="#9ab0c7" strokeWidth="1.3" />
            <circle cx="160" cy="38" r="6" fill="#d4ff9a" />
          </svg>
        </div>
      </div>
      <div className={styles.telemetryBadge}>
        <span className={styles.telemetryDot} />
        <span>{badgeLabel}</span>
      </div>
    </div>
  )
}
