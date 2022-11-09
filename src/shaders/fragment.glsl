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

void main() {
  vec3 position = vec3(gl_FragCoord.x / width * 2.0, gl_FragCoord.y / height * 2.0, 0.0);
  int tr = 1;
  vec3 E = vec3(0.0);
  vec3 B = vec3(0.0);
  for(int i = 0; i < positionCount; i++) {
    float d = abs((float(i) * dt + distance(position.xy, positions[i]) / c) - float(positionCount-1) * dt);
    if (d <= dt * 2.0) {
      tr = i;
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
      float gamma2 = 1.0 / (1.0 - vMag * vMag / (c * c));

      float denominator = pow(1.0 - dot(n, vRelat), 3.0);
      vec3 near = (n - vRelat) / (gamma2 * denominator);
      vec3 far = cross(n, cross(n - vRelat, a)) / denominator;
      E += q * (near / (rMag * rMag) + far / rMag);
      B += cross(n / c, E);
    }
  }
  vec3 poynting = cross(E, B);

  float t = clamp(log(length(E)) / 10.0, 0.0, 1.0);
  vec3 color1 = vec3(1.0);//vec3(1.0, 0.1, 0.1);
  vec3 color2 = vec3(0.0);//vec3(0.1, 0.1, 1.0);
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
