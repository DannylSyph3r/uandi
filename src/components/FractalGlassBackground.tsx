"use client";

import { useEffect, useRef } from "react";

export interface FractalGlassProps {
  /** Scale of the wave patterns */
  noiseScale?: number;
  /** How much vertical displacement the ridges create */
  displacementStrength?: number;
  /** Number of vertical ridges */
  lineFrequency?: number;
  /** Ridge waviness (0 = straight, 1 = wavy) */
  ridgeWaviness?: number;
  /** Flow animation speed */
  animationSpeed?: number;
  /** Film grain intensity */
  grainIntensity?: number;
  /** Contrast - controls dark valley depth */
  contrastBoost?: number;
  /** Gradient colors array (dark to bright) */
  gradientColors?: string[];
  /** Wave complexity (more = more bands) */
  waveComplexity?: number;
  /** Flow variation intensity */
  flowIntensity?: number;
}

// Vertex shader
const vertexShaderSource = `
  attribute vec2 a_position;
  attribute vec2 a_texCoord;
  varying vec2 v_texCoord;
  
  void main() {
    gl_Position = vec4(a_position, 0.0, 1.0);
    v_texCoord = a_texCoord;
  }
`;

// Fragment shader - FLOWING WAVES like aurora/silk
const fragmentShaderSource = `
  precision highp float;
  
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_noiseScale;
  uniform float u_displacementStrength;
  uniform float u_lineFrequency;
  uniform float u_ridgeWaviness;
  uniform float u_animationSpeed;
  uniform float u_grainIntensity;
  uniform float u_contrastBoost;
  uniform float u_waveComplexity;
  uniform float u_flowIntensity;
  uniform vec3 u_colorDark;
  uniform vec3 u_colorMid;
  uniform vec3 u_colorBright;
  uniform vec3 u_colorAccent;
  
  // Simplex noise
  vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
  vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
  
  float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                        -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy));
    vec2 x0 = v - i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i);
    vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m; m = m*m;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
    vec3 g;
    g.x = a0.x * x0.x + h.x * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }
  
  // FBM - layered noise for organic flow (reduced iterations for performance)
  float fbm(vec2 p, float t) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    
    for (int i = 0; i < 3; i++) {
      value += amplitude * snoise(p * frequency + t);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }
  
  // ============================================
  // FLOWING WAVE FIELD - DYNAMIC MULTI-DIRECTIONAL
  // Creates swirling, multi-directional aurora flow
  // with opposing currents and organic turbulence
  // ============================================
  float getGradientField(vec2 uv, float time) {
    float t = time * u_animationSpeed;
    
    // Scale UV
    vec2 p = uv * u_noiseScale;
    
    // ========== SWIRL / VORTEX EFFECT ==========
    // Create rotational motion that varies across the canvas
    vec2 center = vec2(0.5, 0.5);
    vec2 toCenter = uv - center;
    float dist = length(toCenter);
    float angle = atan(toCenter.y, toCenter.x);
    
    // Time-varying swirl intensity
    float swirlSpeed = sin(t * 0.15) * 0.5 + 0.5;
    float swirlAngle = angle + dist * 2.0 * swirlSpeed * sin(t * 0.2);
    vec2 swirlOffset = vec2(cos(swirlAngle), sin(swirlAngle)) * dist * 0.3 * u_flowIntensity;
    
    // ========== DYNAMIC DOMAIN WARPING ==========
    // Multi-directional warp that changes over time
    float warpAngle = t * 0.1;
    vec2 warpDir1 = vec2(cos(warpAngle), sin(warpAngle));
    vec2 warpDir2 = vec2(cos(warpAngle + 2.094), sin(warpAngle + 2.094));
    
    vec2 warp = vec2(
      fbm(p * 0.8 + warpDir1 * t * 0.2, t * 0.2),
      fbm(p * 0.8 + warpDir2 * t * 0.15, t * 0.15)
    );
    
    p += warp * u_flowIntensity * 0.35;
    p += swirlOffset * 0.2;
    
    // ========== PULSATING SPEED MODULATION ==========
    float speedPulse1 = sin(t * 0.08) * 0.4 + 1.0;
    float speedPulse2 = sin(t * 0.12 + 1.5) * 0.3 + 1.0;
    
    // ========== MULTI-DIRECTIONAL WAVE BANDS ==========
    float waves = 0.0;
    
    // Wave 1 - Primary flow (rotating direction over time)
    float angle1 = 0.7 + sin(t * 0.05) * 0.3;
    vec2 dir1 = vec2(cos(angle1), sin(angle1));
    float wave1 = sin(dot(p, dir1) * 3.0 * u_waveComplexity + t * 1.2 * speedPulse1 + fbm(p * 2.0, t) * 2.0);
    waves += wave1 * 0.35;
    
    // Wave 2 - Counter-rotating flow
    float angle2 = 2.4 - sin(t * 0.07) * 0.4;
    vec2 dir2 = vec2(cos(angle2), sin(angle2));
    float wave2 = sin(dot(p, dir2) * 2.5 * u_waveComplexity - t * 1.0 * speedPulse2 + fbm(p * 1.5 + 10.0, t) * 1.5);
    waves += wave2 * 0.3;
    
    // Wave 3 - Vertical oscillation
    float verticalShift = sin(t * 0.09) * 0.5;
    float wave3 = sin((p.y + p.x * 0.3 * verticalShift) * 2.8 * u_waveComplexity + t * 0.8);
    waves += wave3 * 0.2;
    
    // Wave 4 - Radial wave from shifting center
    vec2 waveCenter = vec2(0.5 + sin(t * 0.1) * 0.3, 0.5 + cos(t * 0.08) * 0.3);
    float radialDist = length(p / u_noiseScale - waveCenter);
    float wave4 = sin(radialDist * 4.0 * u_waveComplexity - t * 0.5);
    waves += wave4 * 0.15;
    
    // ========== COMBINE AND NORMALIZE ==========
    float field = waves * 0.45 + 0.5;
    
    // ========== ORGANIC TURBULENCE ==========
    float variation = fbm(p * 3.0 + vec2(t * 0.15, -t * 0.12), t * 0.3) * 0.1;
    field += variation;
    
    // ========== DYNAMIC BREATHING ==========
    float pulse = sin(t * 0.18) * 0.04 + sin(t * 0.07) * 0.03;
    field += pulse;
    
    // ========== LOCAL INTENSITY VARIATION ==========
    float localVar = snoise(uv * 2.0 + vec2(sin(t * 0.1), cos(t * 0.12)) * 0.5);
    field += localVar * 0.06;
    
    // ========== BIAS TOWARD COLOR ==========
    field = field * 0.7 + 0.3;
    
    // Clamp and apply contrast
    field = clamp(field, 0.0, 1.0);
    
    // S-curve for smoother transitions
    field = smoothstep(0.0, 1.0, field);
    
    // Contrast adjustment
    field = pow(field, u_contrastBoost);
    
    return field;
  }
  
  // ============================================
  // Vertical ridge pattern
  // ============================================
  float getRidgeDisplacement(vec2 uv, float time) {
    float t = time * u_animationSpeed * 0.5;
    
    float ridgeX = uv.x * u_lineFrequency;
    float wave = snoise(vec2(uv.x * 3.0, uv.y * 8.0 + t)) * u_ridgeWaviness * 0.3;
    ridgeX += wave;
    
    float ridge = sin(ridgeX * 6.28318);
    float displacement = ridge;
    
    float yVariation = snoise(vec2(uv.x * 5.0, uv.y * 2.0 + t * 0.3)) * 0.3;
    displacement *= (1.0 + yVariation);
    
    return displacement;
  }
  
  // ============================================
  // Color ramp
  // ============================================
  vec3 colorRamp(float n) {
    vec3 color;
    
    if (n < 0.33) {
      color = mix(u_colorDark, u_colorMid, n / 0.33);
    } else if (n < 0.66) {
      color = mix(u_colorMid, u_colorBright, (n - 0.33) / 0.33);
    } else {
      color = mix(u_colorBright, u_colorAccent, (n - 0.66) / 0.34);
    }
    
    return color;
  }
  
  // Film grain
  float random(vec2 st, float seed) {
    return fract(sin(dot(st + seed, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    vec2 uv = v_texCoord;
    float time = u_time;
    float aspect = u_resolution.x / u_resolution.y;
    
    // Get ridge displacement
    float ridgeOffset = getRidgeDisplacement(uv, time);
    
    // Displace UV for glass effect
    vec2 displacedUV = uv;
    displacedUV.y += ridgeOffset * u_displacementStrength;
    
    // Aspect-correct for gradient field
    vec2 gradientUV = vec2(displacedUV.x * aspect, displacedUV.y);
    
    // Sample the flowing wave field
    float gradientValue = getGradientField(gradientUV, time);
    
    // Get color
    vec3 color = colorRamp(gradientValue);
    
    // Ridge shading for depth
    float ridgeShading = ridgeOffset * 0.5 + 0.5;
    float shadeFactor = mix(0.85, 1.1, ridgeShading);
    color *= shadeFactor;
    
    // Specular on ridge peaks
    float specular = pow(max(ridgeShading, 0.0), 4.0) * 0.08;
    color += vec3(specular);
    
    // Film grain
    float grain = (random(uv * u_resolution, time * 10.0) - 0.5) * u_grainIntensity;
    color += vec3(grain);
    
    color = clamp(color, 0.0, 1.0);
    
    gl_FragColor = vec4(color, 1.0);
  }
`;

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (result) {
    return [
      parseInt(result[1], 16) / 255,
      parseInt(result[2], 16) / 255,
      parseInt(result[3], 16) / 255,
    ];
  }
  return [1, 0, 1];
}

function createShader(
  gl: WebGLRenderingContext,
  type: number,
  source: string
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.error("Shader compile error:", gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }

  return shader;
}

function createProgram(
  gl: WebGLRenderingContext,
  vertexShader: WebGLShader,
  fragmentShader: WebGLShader
): WebGLProgram | null {
  const program = gl.createProgram();
  if (!program) return null;

  gl.attachShader(program, vertexShader);
  gl.attachShader(program, fragmentShader);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error("Program link error:", gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
    return null;
  }

  return program;
}

interface UniformLocations {
  time: WebGLUniformLocation | null;
  resolution: WebGLUniformLocation | null;
  noiseScale: WebGLUniformLocation | null;
  displacementStrength: WebGLUniformLocation | null;
  lineFrequency: WebGLUniformLocation | null;
  ridgeWaviness: WebGLUniformLocation | null;
  animationSpeed: WebGLUniformLocation | null;
  grainIntensity: WebGLUniformLocation | null;
  contrastBoost: WebGLUniformLocation | null;
  waveComplexity: WebGLUniformLocation | null;
  flowIntensity: WebGLUniformLocation | null;
  colorDark: WebGLUniformLocation | null;
  colorMid: WebGLUniformLocation | null;
  colorBright: WebGLUniformLocation | null;
  colorAccent: WebGLUniformLocation | null;
}

export function FractalGlassBackground({
  noiseScale = 1.0,
  displacementStrength = 0.15,
  lineFrequency = 80,
  ridgeWaviness = 0.5,
  animationSpeed = 0.1,
  grainIntensity = 0.04,
  contrastBoost = 0.9,
  gradientColors = ["#0a0515", "#581c87", "#ec4899", "#06b6d4"],
  waveComplexity = 1.0,
  flowIntensity = 1.0,
}: FractalGlassProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uniformsRef = useRef<UniformLocations | null>(null);
  const isInitializedRef = useRef(false);

  // Initialize WebGL once
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isInitializedRef.current) return;

    const gl = canvas.getContext("webgl", { antialias: false, alpha: false });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    glRef.current = gl;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);

    // Set up geometry (only once)
    const positions = new Float32Array([
      -1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1,
    ]);
    const texCoords = new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]);

    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const texCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, texCoords, gl.STATIC_DRAW);

    const texCoordLocation = gl.getAttribLocation(program, "a_texCoord");
    gl.enableVertexAttribArray(texCoordLocation);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Store uniform locations
    uniformsRef.current = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      noiseScale: gl.getUniformLocation(program, "u_noiseScale"),
      displacementStrength: gl.getUniformLocation(program, "u_displacementStrength"),
      lineFrequency: gl.getUniformLocation(program, "u_lineFrequency"),
      ridgeWaviness: gl.getUniformLocation(program, "u_ridgeWaviness"),
      animationSpeed: gl.getUniformLocation(program, "u_animationSpeed"),
      grainIntensity: gl.getUniformLocation(program, "u_grainIntensity"),
      contrastBoost: gl.getUniformLocation(program, "u_contrastBoost"),
      waveComplexity: gl.getUniformLocation(program, "u_waveComplexity"),
      flowIntensity: gl.getUniformLocation(program, "u_flowIntensity"),
      colorDark: gl.getUniformLocation(program, "u_colorDark"),
      colorMid: gl.getUniformLocation(program, "u_colorMid"),
      colorBright: gl.getUniformLocation(program, "u_colorBright"),
      colorAccent: gl.getUniformLocation(program, "u_colorAccent"),
    };

    // Handle resize
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5); // Limit DPR for performance
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniformsRef.current!.resolution, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    // Animation loop
    const startTime = performance.now();
    const render = () => {
      if (!glRef.current || !uniformsRef.current) return;
      const elapsed = (performance.now() - startTime) / 1000;
      glRef.current.uniform1f(uniformsRef.current.time, elapsed);
      glRef.current.drawArrays(glRef.current.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };

    isInitializedRef.current = true;
    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      isInitializedRef.current = false;
      glRef.current = null;
      uniformsRef.current = null;
    };
  }, []); // Empty deps - initialize only once

  // Update uniforms when props change (no WebGL recreation!)
  useEffect(() => {
    const gl = glRef.current;
    const uniforms = uniformsRef.current;
    if (!gl || !uniforms) return;

    gl.uniform1f(uniforms.noiseScale, noiseScale);
    gl.uniform1f(uniforms.displacementStrength, displacementStrength);
    gl.uniform1f(uniforms.lineFrequency, lineFrequency);
    gl.uniform1f(uniforms.ridgeWaviness, ridgeWaviness);
    gl.uniform1f(uniforms.animationSpeed, animationSpeed);
    gl.uniform1f(uniforms.grainIntensity, grainIntensity);
    gl.uniform1f(uniforms.contrastBoost, contrastBoost);
    gl.uniform1f(uniforms.waveComplexity, waveComplexity);
    gl.uniform1f(uniforms.flowIntensity, flowIntensity);

    const colorDark = hexToRgb(gradientColors[0] || "#0a0515");
    const colorMid = hexToRgb(gradientColors[1] || "#581c87");
    const colorBright = hexToRgb(gradientColors[2] || "#ec4899");
    const colorAccent = hexToRgb(gradientColors[3] || "#06b6d4");

    gl.uniform3fv(uniforms.colorDark, colorDark);
    gl.uniform3fv(uniforms.colorMid, colorMid);
    gl.uniform3fv(uniforms.colorBright, colorBright);
    gl.uniform3fv(uniforms.colorAccent, colorAccent);
  }, [
    noiseScale,
    displacementStrength,
    lineFrequency,
    ridgeWaviness,
    animationSpeed,
    grainIntensity,
    contrastBoost,
    gradientColors,
    waveComplexity,
    flowIntensity,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full -z-10"
      style={{ background: "#0a0515" }}
    />
  );
}

export default FractalGlassBackground;