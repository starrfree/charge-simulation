# version 300 es
precision highp float;

uniform float width;
uniform float height;
uniform float c;
uniform vec2 positions[300];
uniform vec2 velocities[300];
uniform vec2 accelerations[300];
uniform int positionCount;
uniform int velocityCount;
uniform int accelerationCount;

out vec4 o_FragColor;

const float q = -1.0;
uint hash(uint ste);
float random(uint seed);

void main() {
  vec3 position = vec3(gl_FragCoord.x / width * 2.0, gl_FragCoord.y / height * 2.0, 0.0);
  int tr = 1;
  float minDiff = -1.0;
  for(int i = 0; i < positionCount; i++) {
    float d = abs(float(positionCount-1) / 120.0 - (float(i) / 120.0 + distance(position.xy, positions[i]) / c));
    if (minDiff < 0.0 || d < minDiff) {
      minDiff = d;
      tr = i;
    }
  }
  if (minDiff >  1.0 / (c * 120.0)) {
    o_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
    return;
  }
  // int tr = int(120.0 * length(positions[positionCount - 1] - position.xy) / c);
  // tr = max(tr, 1);
  vec2 r0xy = positions[tr];
  vec3 r0 = vec3(r0xy.x, r0xy.y, 0.0);
  vec3 r = position - r0;
  vec2 vxy = velocities[tr];
  vec3 v = vec3(vxy.x, vxy.y, 0.0);
  vec2 axy = accelerations[tr];
  vec3 a = vec3(axy.x, axy.y, 0.0);
  float rMag = length(r);
  vec3 n = r / rMag;
  vec3 vRelat = v / c;
  float vMag = length(v);
  float gamma = 1.0 / sqrt(1.0 - vMag * vMag / (c * c));

  float denominator = pow(1.0 - dot(n, vRelat), 3.0);
  vec3 near = (n - vRelat) / (gamma * gamma * denominator);
  vec3 far = cross(n, cross(n - vRelat, a)) / denominator;
  vec3 E = q * (near / (rMag * rMag) + far / rMag);
  vec3 B = cross(n / c, E);
  vec3 poynting = cross(E, B);

  float t = clamp(log(length(E)) / 10.0, 0.0, 1.0);
  vec3 color1 = vec3(1.0, 0.1, 0.1);
  vec3 color2 = vec3(0.1, 0.1, 1.0);
  o_FragColor = vec4(t * color1  + (1.0 - t) * color2, 1.0);
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
