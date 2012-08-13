attribute vec3 position;
attribute vec2 character;

uniform mat4 viewMat;
uniform mat4 projectionMat;

uniform float timing;
uniform float prevTiming;
uniform float numCharacters;

varying vec3  velocity;

#define PI 3.14159265358979323846264

// Matrix rotation code copied from http://www.html5rocks.com/en/tutorials/webgl/million_letters/

// rotateAngleAxisMatrix returns the mat3 rotation matrix
// for given angle and axis.
mat3 rotateAngleAxisMatrix(float angle, vec3 axis) {
  float c = cos(angle);
  float s = sin(angle);
  float t = 1.0 - c;
  axis = normalize(axis);
  float x = axis.x, y = axis.y, z = axis.z;
  return mat3(
    t*x*x + c,    t*x*y + s*z,  t*x*z - s*y,
    t*x*y - s*z,  t*y*y + c,    t*y*z + s*x,
    t*x*z + s*y,  t*y*z - s*x,  t*z*z + c
  );
}

// rotateAngleAxis rotates a vec3 over the given axis by the given angle and
// returns the rotated vector.
vec3 rotateAngleAxis(float angle, vec3 axis, vec3 v) {
  return rotateAngleAxisMatrix(angle, axis) * v;
}


void main(void) {
    // World space coordinates for the animated vertex
    vec3 v1, v2, initial = position;

    // Screen space projected coordinates
    vec4 s1, s2;

    // We're abusing the z coord to mark whether we animate the vertex or not.
    float animate = initial.z;
    initial.z = 0.0;
    vec3 base = initial - vec3(0,1.0,0);

    float characterFrom = character.x;
    float characterTo = character.y;

    float char = min(characterFrom + timing, floor(characterTo));
    float angle = fract(char);
    float prevAngle = angle - 0.2;

    vec2 rawVelocity;
    // No texturing but still need to figure out it we're animating.
    //texCoord.s = (texCoord.s + char) / numCharacters;

    if ((animate>0.0) && (char < characterTo)) {
        v2 = rotateAngleAxis(angle * PI, vec3(1.0, 0.0, 0.0), initial-base)+base;

        if (angle > prevAngle) {
          v1 = rotateAngleAxis(prevAngle * PI, vec3(1.0, 0.0, 0.0), initial-base)+base;
        } else {
          v1 = v2;
        }

        s2 = projectionMat * viewMat * vec4(v2, 1.0);
        s1 = projectionMat * viewMat * vec4(v1, 1.0);
        rawVelocity = s2.xy / s2.w - s1.xy / s1.w;
        velocity = vec3(normalize(rawVelocity), length(rawVelocity));
    } else {
        s2 = projectionMat * viewMat * vec4(initial, 1.0);
        velocity = vec3(0.0);
    }
    gl_Position = s2;
}

