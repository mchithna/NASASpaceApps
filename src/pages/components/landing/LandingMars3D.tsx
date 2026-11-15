import { useEffect, useRef } from 'react'

const VERTEX_SHADER = `
attribute vec2 a_position;
varying vec2 v_uv;
void main() {
  v_uv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`

const FRAGMENT_SHADER = `
precision highp float;

varying vec2 v_uv;
uniform vec2 u_resolution;
uniform float u_time;
uniform sampler2D u_marsTex;
uniform float u_texLoaded;
uniform vec2 u_pointer;

#define PI 3.14159265359

float hash3(vec3 p) {
  p = fract(p * vec3(443.897, 441.423, 437.195));
  p += dot(p, p.yzx + 19.19);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);

  return mix(
    mix(
      mix(hash3(i + vec3(0.0, 0.0, 0.0)), hash3(i + vec3(1.0, 0.0, 0.0)), f.x),
      mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x),
      f.y
    ),
    mix(
      mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x),
      mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x),
      f.y
    ),
    f.z
  );
}

float fbm3(vec3 p) {
  float v = 0.0;
  float amp = 0.5;
  for (int i = 0; i < 4; i++) {
    v += amp * noise3(p);
    p = p * 2.07 + vec3(13.1, 7.7, 5.3);
    amp *= 0.5;
  }
  return v;
}

mat3 rotateY(float a) {
  float c = cos(a), s = sin(a);
  return mat3(
    c, 0.0, s,
    0.0, 1.0, 0.0,
    -s, 0.0, c
  );
}

mat3 rotateZ(float a) {
  float c = cos(a), s = sin(a);
  return mat3(
    c, -s, 0.0,
    s,  c, 0.0,
    0.0, 0.0, 1.0
  );
}

mat3 rotateX(float a) {
  float c = cos(a), s = sin(a);
  return mat3(
    1.0, 0.0, 0.0,
    0.0, c, -s,
    0.0, s,  c
  );
}

vec2 intersectSphere(vec3 ro, vec3 rd, vec3 center, float radius) {
  vec3 oc = ro - center;
  float b = dot(oc, rd);
  float c = dot(oc, oc) - radius * radius;
  float h = b * b - c;
  if (h < 0.0) return vec2(-1.0);
  float s = sqrt(h);
  return vec2(-b - s, -b + s);
}

vec4 sampleMarsSurface(vec3 unitPos) {
  float lon = atan(unitPos.x, unitPos.z);
  float lat = asin(clamp(unitPos.y, -1.0, 1.0));

  float uPhase = (lon + PI) / (2.0 * PI);
  float mirroredU = 1.0 - abs(2.0 * fract(uPhase) - 1.0);
  float vCoord = 0.5 - lat / PI;

  vec2 diskUv1 = vec2(0.22 + mirroredU * 0.56, 0.22 + vCoord * 0.56);
  float shiftedPhase = fract(uPhase + 0.5);
  float mirroredU2 = 1.0 - abs(2.0 * shiftedPhase - 1.0);
  vec2 diskUv2 = vec2(0.22 + mirroredU2 * 0.56, 0.22 + (1.0 - vCoord) * 0.56);

  float blend = smoothstep(0.15, 0.85, sin(uPhase * PI));
  vec3 texA = texture2D(u_marsTex, diskUv1).rgb;
  vec3 texB = texture2D(u_marsTex, diskUv2).rgb;
  vec3 nasaTex = mix(texB, texA, blend);

  float macro = fbm3(unitPos * 2.4);
  float meso = fbm3(unitPos * 6.5 + vec3(macro * 1.4));
  float micro = noise3(unitPos * 18.0);

  float canyonMask = exp(-pow((unitPos.y + 0.08) * 6.5, 2.0)) * smoothstep(0.45, 0.72, macro);
  float height = macro * 0.55 + meso * 0.32 + micro * 0.13 - canyonMask * 0.38;

  vec3 rustHighland = vec3(0.78, 0.46, 0.28);
  vec3 ochreDunes    = vec3(0.87, 0.62, 0.41);
  vec3 basaltLowland = vec3(0.32, 0.21, 0.17);
  vec3 canyonDark    = vec3(0.21, 0.14, 0.12);

  vec3 procColor = mix(basaltLowland, rustHighland, smoothstep(0.32, 0.68, macro));
  procColor = mix(procColor, ochreDunes, smoothstep(0.55, 0.85, meso));
  procColor = mix(procColor, canyonDark, canyonMask * 0.75);

  float polar = smoothstep(0.84, 0.96, abs(unitPos.y) + 0.08 * (macro - 0.5));
  procColor = mix(procColor, vec3(0.92, 0.88, 0.84), polar * 0.65);

  vec3 finalAlbedo = mix(procColor, nasaTex * 1.08, u_texLoaded * 0.68);
  return vec4(finalAlbedo, height);
}

void main() {
  vec2 aspect = vec2(u_resolution.x / max(u_resolution.y, 1.0), 1.0);
  vec2 p = (v_uv * 2.0 - 1.0) * aspect;

  vec3 ro = vec3(0.0, 0.0, 3.45);
  vec3 rd = normalize(vec3(p, -1.85));

  vec3 marsCenter = vec3(0.12 + u_pointer.x * 0.04, -0.02 + u_pointer.y * 0.03, 0.0);
  float marsRadius = 1.02;

  // Continuous horizontal 360-degree rotation around Mars's axis
  float marsSpinAngle = -u_time * 0.24;
  mat3 marsTilt = rotateZ(-0.14) * rotateX(0.08);
  mat3 marsRot = rotateY(marsSpinAngle) * marsTilt;

  // Orbiting 3D Moon (Phobos) with zero visible trajectory lines
  float orbitSpeed = 0.58;
  float orbitAngle = u_time * orbitSpeed + 2.35;
  float orbitRadiusX = 1.54;
  float orbitRadiusZ = 1.42;
  vec3 rawOrbit = vec3(
    cos(orbitAngle) * orbitRadiusX,
    0.0,
    sin(orbitAngle) * orbitRadiusZ
  );
  mat3 orbitInclination = rotateZ(-0.26) * rotateX(0.24);
  vec3 moonCenter = marsCenter + orbitInclination * rawOrbit;
  float moonRadius = 0.108;

  vec3 sunDir = normalize(vec3(-0.68, 0.42, 0.60));
  vec3 viewDir = -rd;

  vec2 hitMars = intersectSphere(ro, rd, marsCenter, marsRadius);
  vec2 hitAtmo = intersectSphere(ro, rd, marsCenter, marsRadius * 1.095);
  vec2 hitMoon = intersectSphere(ro, rd, moonCenter, moonRadius);

  vec4 outColor = vec4(0.0);

  // Subtle solar corona behind Mars's sunlit limb
  float distToMarsCenter = length((ro + rd * 3.45) - marsCenter);
  float limbSunGlow = exp(-max(0.0, distToMarsCenter - marsRadius * 0.85) * 3.4);
  vec2 limbDir = normalize((ro.xy + rd.xy * 3.45) - marsCenter.xy + vec2(0.0001));
  float sunwardBias = clamp(dot(limbDir, normalize(sunDir.xy)), 0.0, 1.0);
  vec3 coronaColor = mix(vec3(0.45, 0.22, 0.11), vec3(1.0, 0.78, 0.52), pow(sunwardBias, 2.0));
  float coronaAlpha = limbSunGlow * (0.14 + 0.34 * pow(sunwardBias, 2.2));
  outColor = vec4(coronaColor * coronaAlpha, coronaAlpha);

  float tMars = hitMars.x;
  bool marsVisible = tMars > 0.0;
  vec3 marsRGB = vec3(0.0);
  float marsEdgeAA = 0.0;

  if (marsVisible) {
    vec3 hitPos = ro + rd * tMars;
    vec3 geomNormal = normalize(hitPos - marsCenter);

    float ndotv = clamp(dot(geomNormal, viewDir), 0.0, 1.0);
    marsEdgeAA = smoothstep(0.0, 0.045, ndotv);

    vec3 bodyPos = marsRot * geomNormal;
    vec4 surf = sampleMarsSurface(bodyPos);

    float eps = 0.008;
    float hX = sampleMarsSurface(normalize(bodyPos + vec3(eps, 0.0, 0.0))).w;
    float hY = sampleMarsSurface(normalize(bodyPos + vec3(0.0, eps, 0.0))).w;
    float hZ = sampleMarsSurface(normalize(bodyPos + vec3(0.0, 0.0, eps))).w;
    vec3 grad = vec3(hX - surf.w, hY - surf.w, hZ - surf.w) / eps;
    vec3 worldGrad = grad * marsRot;
    vec3 bumpedNormal = normalize(geomNormal - worldGrad * 0.055);

    float diff = dot(bumpedNormal, sunDir);
    float lit = smoothstep(-0.18, 0.85, diff);
    float wrapLit = clamp((diff + 0.22) / 1.22, 0.0, 1.0);

    vec2 moonShadowHit = intersectSphere(hitPos + geomNormal * 0.003, sunDir, moonCenter, moonRadius * 1.15);
    float eclipseFactor = 1.0;
    if (moonShadowHit.x > 0.0) {
      vec3 shadowClosest = (hitPos + sunDir * moonShadowHit.x) - moonCenter;
      float penumbra = smoothstep(0.0, moonRadius * 1.15, length(shadowClosest));
      eclipseFactor = mix(0.25, 1.0, penumbra);
    }

    vec3 halfVec = normalize(sunDir + viewDir);
    float spec = pow(clamp(dot(bumpedNormal, halfVec), 0.0, 1.0), 22.0) * 0.14 * lit;

    float fresnel = pow(1.0 - ndotv, 3.2);
    float sunRim = smoothstep(-0.25, 0.65, dot(geomNormal, sunDir));
    vec3 rimDayColor = vec3(1.0, 0.76, 0.50);
    vec3 rimNightColor = vec3(0.12, 0.22, 0.36);
    vec3 atmoRim = mix(rimNightColor, rimDayColor, sunRim) * fresnel * 0.72;

    vec3 nightSideAmbient = surf.rgb * vec3(0.04, 0.06, 0.11);
    vec3 daySideLit = surf.rgb * (0.12 + 1.08 * pow(wrapLit, 1.15)) * vec3(1.04, 0.96, 0.90);

    marsRGB = mix(nightSideAmbient, daySideLit, lit * eclipseFactor) + spec * vec3(1.0, 0.85, 0.68) + atmoRim;
    outColor = mix(outColor, vec4(marsRGB, 1.0), marsEdgeAA);
  } else if (hitAtmo.x > 0.0) {
    vec3 midAtmo = ro + rd * ((hitAtmo.x + hitAtmo.y) * 0.5);
    float distFromSurface = (length(midAtmo - marsCenter) - marsRadius) / (marsRadius * 0.095);
    float atmoDensity = exp(-distFromSurface * 3.8) * (1.0 - clamp(distFromSurface, 0.0, 1.0));
    vec3 atmoNormal = normalize(midAtmo - marsCenter);
    float sunAtmo = smoothstep(-0.35, 0.6, dot(atmoNormal, sunDir));
    vec3 haloCol = mix(vec3(0.16, 0.28, 0.44), vec3(1.0, 0.74, 0.46), sunAtmo);
    float haloAlpha = atmoDensity * (0.22 + 0.65 * sunAtmo);
    outColor = vec4(mix(outColor.rgb, haloCol, haloAlpha), clamp(outColor.a + haloAlpha, 0.0, 1.0));
  }

  float tMoon = hitMoon.x;
  bool moonInFrontOfMars = !marsVisible || (tMoon < tMars);
  if (tMoon > 0.0 && moonInFrontOfMars) {
    vec3 moonHit = ro + rd * tMoon;
    vec3 moonNormal = normalize(moonHit - moonCenter);
    float moonNdotV = clamp(dot(moonNormal, viewDir), 0.0, 1.0);
    float moonAA = smoothstep(0.0, 0.08, moonNdotV);

    mat3 moonSpin = rotateY(-orbitAngle + 0.5) * rotateZ(0.2);
    vec3 mBody = moonSpin * moonNormal;

    float mNoise = fbm3(mBody * 5.2);
    float mDetail = noise3(mBody * 14.0);
    float stickney = smoothstep(0.45, 0.15, length(mBody - vec3(0.55, 0.2, 0.8)));
    float mHeight = mNoise * 0.65 + mDetail * 0.35 - stickney * 0.45;

    float mEps = 0.03;
    float mhX = fbm3(normalize(mBody + vec3(mEps, 0.0, 0.0)) * 5.2);
    float mhY = fbm3(normalize(mBody + vec3(0.0, mEps, 0.0)) * 5.2);
    vec3 mBumped = normalize(moonNormal - vec3(mhX - mNoise, mhY - mNoise, 0.0) * 0.35);

    vec2 marsEclipse = intersectSphere(moonHit + moonNormal * 0.003, sunDir, marsCenter, marsRadius);
    float moonShadow = marsEclipse.x > 0.0 ? 0.15 : 1.0;

    float moonDiff = dot(mBumped, sunDir);
    float moonLit = smoothstep(-0.15, 0.82, moonDiff) * moonShadow;

    vec3 regolithLight = vec3(0.72, 0.76, 0.81);
    vec3 regolithDark  = vec3(0.32, 0.37, 0.43);
    vec3 moonAlbedo = mix(regolithDark, regolithLight, clamp(mHeight + 0.2, 0.0, 1.0));

    vec3 toMars = normalize(marsCenter - moonHit);
    float marsShine = max(0.0, dot(moonNormal, toMars)) * 0.16;

    vec3 moonLitColor =
      moonAlbedo * (0.06 + 0.98 * moonLit) +
      vec3(0.85, 0.48, 0.28) * marsShine +
      vec3(0.78, 0.86, 0.95) * pow(1.0 - moonNdotV, 2.6) * 0.25 * moonLit;

    outColor = mix(outColor, vec4(moonLitColor, 1.0), moonAA);
  }

  gl_FragColor = outColor;
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

export function LandingMars3D() {
  const stageRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    if (typeof navigator !== 'undefined' && /jsdom/i.test(navigator.userAgent)) {
      return
    }
    const canvas = canvasRef.current
    const stage = stageRef.current
    if (!canvas || !stage) return

    let gl: WebGLRenderingContext | null = null
    try {
      gl =
        (canvas.getContext('webgl', {
          alpha: true,
          antialias: true,
          premultipliedAlpha: false,
          powerPreference: 'high-performance',
        }) as WebGLRenderingContext | null) ||
        (canvas.getContext(
          'experimental-webgl',
        ) as WebGLRenderingContext | null)
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
    stage.classList.add('lp-mars-webgl-active')

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

    const resLoc = gl.getUniformLocation(program, 'u_resolution')
    const timeLoc = gl.getUniformLocation(program, 'u_time')
    const texLoadedLoc = gl.getUniformLocation(program, 'u_texLoaded')
    const pointerLoc = gl.getUniformLocation(program, 'u_pointer')
    const marsTexLoc = gl.getUniformLocation(program, 'u_marsTex')

    const texture = gl.createTexture()
    gl.activeTexture(gl.TEXTURE0)
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([186, 112, 72, 255]),
    )
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.uniform1i(marsTexLoc, 0)
    gl.uniform1f(texLoadedLoc, 0.0)

    const reducedMotionQuery = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)',
    )
    let isReducedMotion = reducedMotionQuery?.matches ?? false

    let pointerX = 0
    let pointerY = 0
    let currentX = 0
    let currentY = 0

    const drawFrame = (elapsedSec: number) => {
      if (!gl) return
      currentX += (pointerX - currentX) * 0.06
      currentY += (pointerY - currentY) * 0.06
      gl.uniform1f(timeLoc, elapsedSec)
      gl.uniform2f(pointerLoc, currentX, currentY)
      gl.drawArrays(gl.TRIANGLES, 0, 6)
    }

    let isDisposed = false
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.decoding = 'async'
    img.onload = () => {
      if (isDisposed || !gl) return
      gl.activeTexture(gl.TEXTURE0)
      gl.bindTexture(gl.TEXTURE_2D, texture)
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img)
      gl.uniform1f(texLoadedLoc, 1.0)
      if (isReducedMotion) {
        drawFrame(2.4)
      }
    }
    img.src = '/assets/common/landing/mars.webp'

    const resize = () => {
      if (!canvas || !gl) return
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 1.75)
      const w = Math.max(300, Math.floor((rect.width || 680) * dpr))
      const h = Math.max(300, Math.floor((rect.height || 680) * dpr))
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
      }
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(resLoc, canvas.width, canvas.height)
    }

    let frameId = 0
    const startTime = performance.now()

    const animate = (now: number) => {
      if (isDisposed) return
      const elapsed = (now - startTime) * 0.001
      drawFrame(elapsed)
      if (!isReducedMotion && document.visibilityState !== 'hidden') {
        frameId = requestAnimationFrame(animate)
      }
    }

    resize()
    if (isReducedMotion) {
      drawFrame(2.4)
    } else {
      frameId = requestAnimationFrame(animate)
    }

    const onPointerMove = (event: PointerEvent) => {
      if (isReducedMotion) return
      pointerX = (event.clientX / Math.max(window.innerWidth, 1) - 0.5) * 2
      pointerY = -(event.clientY / Math.max(window.innerHeight, 1) - 0.5) * 2
    }

    const onVisibilityChange = () => {
      cancelAnimationFrame(frameId)
      if (document.visibilityState === 'visible' && !isReducedMotion) {
        frameId = requestAnimationFrame(animate)
      }
    }

    const onMotionChange = (event: MediaQueryListEvent) => {
      isReducedMotion = event.matches
      cancelAnimationFrame(frameId)
      if (isReducedMotion) {
        drawFrame(2.4)
      } else {
        frameId = requestAnimationFrame(animate)
      }
    }

    window.addEventListener('resize', resize, { passive: true })
    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('visibilitychange', onVisibilityChange)
    reducedMotionQuery?.addEventListener('change', onMotionChange)

    return () => {
      isDisposed = true
      stage.classList.remove('lp-mars-webgl-active')
      cancelAnimationFrame(frameId)
      window.removeEventListener('resize', resize)
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('visibilitychange', onVisibilityChange)
      reducedMotionQuery?.removeEventListener('change', onMotionChange)
      gl?.deleteTexture(texture)
      gl?.deleteBuffer(quadBuffer)
      gl?.deleteProgram(program)
      gl?.deleteShader(vs)
      gl?.deleteShader(fs)
    }
  }, [])

  return (
    <div
      ref={stageRef}
      className="lp-mars-3d-stage"
      data-testid="mars-3d-stage"
    >
      <canvas ref={canvasRef} className="lp-mars-3d-canvas" />
      <div className="lp-mars-3d-fallback">
        <div className="lp-mars-sphere-fallback">
          <div className="lp-mars-texture-strip" />
          <div className="lp-mars-atmosphere-overlay" />
        </div>
        <div className="lp-moon-orbit-fallback">
          <div className="lp-moon-sphere-fallback" />
        </div>
      </div>
    </div>
  )
}
