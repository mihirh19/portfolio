export const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uMorph;
  uniform float uAssemble;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform float uBeat;
  uniform float uVelocity;
  uniform vec3 uPointer;
  attribute vec3 aFrom;
  attribute vec3 aTo;
  attribute vec3 aScatter;
  attribute float aRand;
  varying float vGlow;
  varying float vRand;

  void main() {
    vec3 p = mix(aFrom, aTo, smoothstep(0.0, 1.0, uMorph));
    p += 0.04 * vec3(
      sin(uTime * 0.8 + aRand * 40.0),
      cos(uTime * 0.7 + aRand * 30.0),
      sin(uTime * 0.6 + aRand * 20.0)
    );
    p = mix(aScatter, p, smoothstep(0.0, 1.0, uAssemble));
    p *= 1.0 + uBeat * 0.15;
    // scroll-speed wave: particles ripple vertically while the page moves
    p.y += sin(p.x * 1.6 + uTime * 3.0) * uVelocity * 0.25;

    vec4 world = modelMatrix * vec4(p, 1.0);
    vec2 dir = world.xy - uPointer.xy;
    float influence = smoothstep(1.2, 0.0, length(dir));
    world.xy += normalize(dir + 1e-5) * influence * 0.35;

    vGlow = influence + uBeat * 0.5;
    vRand = aRand;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    float pulse = 0.5 + 0.5 * sin(uTime * 2.0 - length(p) * 3.0);
    gl_PointSize = uSize * uPixelRatio * (0.6 + aRand) * (1.0 + influence * 1.5 + pulse * 0.25) / -mv.z;
  }
`;

export const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform float uOpacity;
  uniform float uGlowBoost;
  varying float vGlow;
  varying float vRand;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float alpha = smoothstep(0.5, 0.0, d);
    float glow = clamp(vGlow, 0.0, 1.0);
    vec3 color = mix(mix(uColorA, uColorB, vRand), uColorB, glow) * (1.0 + glow * uGlowBoost);
    gl_FragColor = vec4(color, alpha * uOpacity);
  }
`;
