# version 300 es
precision highp float;

uniform float width;
uniform float height;
uniform float c;
uniform float dt;
uniform vec2 positions[330];
uniform vec2 velocities[330];
uniform vec2 accelerations[330];
uniform int positionCount;
uniform int velocityCount;
uniform int accelerationCount;

out vec4 o_FragColor;

const float q = -1.0;
uint hash(uint ste);
float random(uint seed);
vec3 hsv2rgb(vec3 c);

void main() {
  vec3 position = vec3(gl_FragCoord.x / width * 4.0, gl_FragCoord.y / height * 4.0, 0.0);
  int tr = 1;
  vec3 E = vec3(0.0);
  vec3 B = vec3(0.0);
  for(int i = 0; i < positionCount - 1; i++) {
    float timeInterval = float(positionCount - 1 - i) * dt;
    float timeToReach = distance(position.xy, positions[i]) / c;
    float timeIntervalAfter = float(positionCount - 1 - (i + 1)) * dt;
    float timeToReachAfter = distance(position.xy, positions[i + 1]) / c;
    bool isBetween = timeInterval >= timeToReach && timeIntervalAfter < timeToReachAfter;
    float interpolation = (timeInterval - timeToReach) / (timeInterval - timeToReach + timeToReachAfter - timeIntervalAfter);
    if (isBetween) {
      vec2 r0xy = positions[i] * (1.0 - interpolation) + positions[i + 1] * interpolation;
      vec3 r0 = vec3(r0xy.x, r0xy.y, 0.0);
      vec3 r = position - r0;
      vec2 vxy = velocities[i] * (1.0 - interpolation) + velocities[i + 1] * interpolation;
      vec3 v = vec3(vxy.x, vxy.y, 0.0);
      vec2 axy = accelerations[i] * (1.0 - interpolation) + accelerations[i + 1] * interpolation;
      vec3 a = vec3(axy.x, axy.y, 0.0);
      float rMag = length(r);
      vec3 n = r / rMag;
      vec3 beta = v / c;
      float gamma2 = 1.0 / (1.0 - dot(v, v) / (c * c));

      float denominator = pow(1.0 - dot(n, beta), 3.0);
      vec3 near = (n - beta) / (gamma2 * denominator);
      vec3 far = cross(n, cross(n - beta, a)) / denominator;
      E += q * (near / (rMag * rMag) + far / rMag);
      B += cross(n / c, E);
    }
  }
  vec3 poynting = cross(E, B);

  // vec3 color1 = vec3(1.0);
  // vec3 color2 = vec3(0.0);
  // o_FragColor = vec4(t * color1  + (1.0 - t) * color2, 1.0);
  // o_FragColor = vec4(hsv2rgb(vec3(atan(E.y, E.x) / (2.0 * 3.1415), 1.0, t)), 1.0);
  float t = clamp(log(length(E) + 1.0) / 5.0, 0.0, 1.0);
  o_FragColor = vec4(hsv2rgb(vec3(atan(E.y, E.x) / (2.0 * 3.1415), 1.0, t)), 1.0);
  // float t = clamp(log(length(poynting) + 1.0) / 5.0, 0.0, 1.0);
  // o_FragColor = vec4(hsv2rgb(vec3(atan(poynting.y, poynting.x) / (2.0 * 3.1415), 1.0, t)), 1.0);
}

uint hash(uint ste) {
  ste ^= 2747636419u;
  ste *= 2654435769u;
  ste ^= ste >> 16;
  ste *= 2654435769u;
  ste ^= ste >> 16;
  ste *= 2654435769u;
  return ste;
}

float random(uint seed) {
  return float(hash(seed)) / 4294967295.0;
}

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}
