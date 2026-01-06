"use client";

import { useEffect, useRef } from "react";

export interface FractalGlassProps {
  /** Scale of the noise blobs (lower = larger blobs) */
  noiseScale?: number;
  /** How much lines bend at edges (displacement strength) */
  displacementStrength?: number;
  /** Number of vertical lines */
  lineFrequency?: number;
  /** Line sharpness (0 = soft, 1 = crisp) */
  lineSharpness?: number;
  /** Flow animation speed */
  animationSpeed?: number;
  /** Film grain intensity */
  grainIntensity?: number;
  /** Contrast boost for deep darks */
  contrastBoost?: number;
  /** Gradient colors array (dark to bright) */
  gradientColors?: string[];
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

// Fragment shader with proper gradient-based displacement
const fragmentShaderSource = `
  precision highp float;
  
  varying vec2 v_texCoord;
  uniform float u_time;
  uniform vec2 u_resolution;
  uniform float u_noiseScale;
  uniform float u_displacementStrength;
  uniform float u_lineFrequency;
  uniform float u_lineSharpness;
  uniform float u_animationSpeed;
  uniform float u_grainIntensity;
  uniform float u_contrastBoost;
  uniform vec3 u_colorDark;
  uniform vec3 u_colorMid;
  uniform vec3 u_colorBright;
  uniform vec3 u_colorAccent;
  
  //
  // GLSL Simplex Noise by Ian McEwan, Ashima Arts
  //
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
  
  // ============================================
  // LAYER 1: Base Gradient Field (light source)
  // ============================================
  float getBaseNoise(vec2 uv, float time) {
    float t = time * u_animationSpeed;
    
    // Primary large-scale noise (the main blobs)
    float n = snoise(uv * 3.0 * u_noiseScale + vec2(t * 0.3, t * 0.2));
    
    // Secondary octave for organic feel
    n += 0.5 * snoise(uv * 5.0 * u_noiseScale + vec2(-t * 0.2, t * 0.25));
    
    // Third octave for subtle detail
    n += 0.25 * snoise(uv * 8.0 * u_noiseScale + vec2(t * 0.15, -t * 0.1));
    
    // Normalize to 0-1 range
    n = n * 0.5 + 0.5;
    
    // Apply contrast boost for deep darks and bright brights
    n = pow(n, u_contrastBoost);
    
    return clamp(n, 0.0, 1.0);
  }
  
  // ============================================
  // LAYER 2: Displacement from Noise GRADIENT
  // ============================================
  float getDisplacement(vec2 uv, float time) {
    float eps = 0.005; // Small epsilon for numerical derivative
    
    // Sample noise at positions slightly left and right
    float noiseLeft = getBaseNoise(vec2(uv.x - eps, uv.y), time);
    float noiseRight = getBaseNoise(vec2(uv.x + eps, uv.y), time);
    
    // Calculate horizontal gradient (derivative)
    // This is HIGH at edges (where light meets dark)
    // and LOW in flat areas (centers of blobs)
    float gradientX = (noiseRight - noiseLeft) / (2.0 * eps);
    
    return gradientX;
  }
  
  // ============================================
  // COLOR RAMP: Map noise value to colors
  // ============================================
  vec3 colorRamp(float n) {
    // Four-stop gradient: dark -> mid -> bright -> accent
    vec3 color;
    
    if (n < 0.25) {
      // Deep dark to mid-dark
      color = mix(u_colorDark, u_colorMid, n / 0.25);
    } else if (n < 0.55) {
      // Mid-dark to bright
      color = mix(u_colorMid, u_colorBright, (n - 0.25) / 0.3);
    } else {
      // Bright to accent (for hottest areas)
      color = mix(u_colorBright, u_colorAccent, (n - 0.55) / 0.45);
    }
    
    return color;
  }
  
  // ============================================
  // Film grain
  // ============================================
  float random(vec2 st, float seed) {
    return fract(sin(dot(st + seed, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  void main() {
    vec2 uv = v_texCoord;
    float time = u_time;
    
    // Aspect ratio correction for noise sampling
    float aspect = u_resolution.x / u_resolution.y;
    vec2 noiseUV = vec2(uv.x * aspect, uv.y);
    
    // LAYER 1: Get base noise at this position
    float baseNoise = getBaseNoise(noiseUV, time);
    
    // LAYER 2: Get gradient-based displacement
    float gradientX = getDisplacement(noiseUV, time);
    
    // Displace the x-coordinate based on gradient
    // Lines will CONVERGE where gradient is high (light/dark edges)
    // Lines will SPREAD where gradient is low (flat areas)
    float displacedX = uv.x + gradientX * u_displacementStrength;
    
    // LAYER 3: Render vertical lines using displaced X
    float linePattern = sin(displacedX * u_lineFrequency * 3.14159);
    
    // Convert to 0-1 and apply sharpness
    linePattern = linePattern * 0.5 + 0.5;
    
    // Sharpness control: low = soft gradient, high = crisp lines
    float edge0 = 0.5 - u_lineSharpness * 0.4;
    float edge1 = 0.5 + u_lineSharpness * 0.4;
    float lineAlpha = smoothstep(edge0, edge1, linePattern);
    
    // Get base color from noise value
    vec3 baseColor = colorRamp(baseNoise);
    
    // Apply lines as subtle brightness modulation
    // Lines darken slightly, creating the ribbed glass look
    float lineDarkening = mix(0.65, 1.0, lineAlpha);
    vec3 finalColor = baseColor * lineDarkening;
    
    // Add subtle specular highlight on line ridges
    float highlight = pow(lineAlpha, 3.0) * baseNoise * 0.15;
    finalColor += vec3(highlight);
    
    // Add film grain
    float grain = (random(uv * u_resolution, time * 10.0) - 0.5) * u_grainIntensity;
    finalColor += vec3(grain);
    
    // Ensure we don't clip
    finalColor = clamp(finalColor, 0.0, 1.0);
    
    gl_FragColor = vec4(finalColor, 1.0);
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

export function FractalGlassBackground({
  noiseScale = 1.0,
  displacementStrength = 0.15,
  lineFrequency = 120,
  lineSharpness = 0.5,
  animationSpeed = 0.1,
  grainIntensity = 0.04,
  contrastBoost = 1.3,
  gradientColors = ["#0a0515", "#581c87", "#ec4899", "#06b6d4"],
}: FractalGlassProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", { antialias: true });
    if (!gl) {
      console.error("WebGL not supported");
      return;
    }

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(
      gl,
      gl.FRAGMENT_SHADER,
      fragmentShaderSource
    );

    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);

    // Set up geometry
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

    // Get uniform locations
    const uniforms = {
      time: gl.getUniformLocation(program, "u_time"),
      resolution: gl.getUniformLocation(program, "u_resolution"),
      noiseScale: gl.getUniformLocation(program, "u_noiseScale"),
      displacementStrength: gl.getUniformLocation(
        program,
        "u_displacementStrength"
      ),
      lineFrequency: gl.getUniformLocation(program, "u_lineFrequency"),
      lineSharpness: gl.getUniformLocation(program, "u_lineSharpness"),
      animationSpeed: gl.getUniformLocation(program, "u_animationSpeed"),
      grainIntensity: gl.getUniformLocation(program, "u_grainIntensity"),
      contrastBoost: gl.getUniformLocation(program, "u_contrastBoost"),
      colorDark: gl.getUniformLocation(program, "u_colorDark"),
      colorMid: gl.getUniformLocation(program, "u_colorMid"),
      colorBright: gl.getUniformLocation(program, "u_colorBright"),
      colorAccent: gl.getUniformLocation(program, "u_colorAccent"),
    };

    // Parse colors (dark -> mid -> bright -> accent)
    const colorDark = hexToRgb(gradientColors[0] || "#0a0515");
    const colorMid = hexToRgb(gradientColors[1] || "#581c87");
    const colorBright = hexToRgb(gradientColors[2] || "#ec4899");
    const colorAccent = hexToRgb(gradientColors[3] || "#06b6d4");

    // Set static uniforms
    gl.uniform1f(uniforms.noiseScale, noiseScale);
    gl.uniform1f(uniforms.displacementStrength, displacementStrength);
    gl.uniform1f(uniforms.lineFrequency, lineFrequency);
    gl.uniform1f(uniforms.lineSharpness, lineSharpness);
    gl.uniform1f(uniforms.animationSpeed, animationSpeed);
    gl.uniform1f(uniforms.grainIntensity, grainIntensity);
    gl.uniform1f(uniforms.contrastBoost, contrastBoost);
    gl.uniform3fv(uniforms.colorDark, colorDark);
    gl.uniform3fv(uniforms.colorMid, colorMid);
    gl.uniform3fv(uniforms.colorBright, colorBright);
    gl.uniform3fv(uniforms.colorAccent, colorAccent);

    const handleResize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    const startTime = performance.now();

    const render = () => {
      const elapsed = (performance.now() - startTime) / 1000;
      gl.uniform1f(uniforms.time, elapsed);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationRef.current);
      gl.deleteProgram(program);
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      gl.deleteBuffer(positionBuffer);
      gl.deleteBuffer(texCoordBuffer);
    };
  }, [
    noiseScale,
    displacementStrength,
    lineFrequency,
    lineSharpness,
    animationSpeed,
    grainIntensity,
    contrastBoost,
    gradientColors,
  ]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0"
      style={{ width: "100vw", height: "100vh" }}
    />
  );
}
