attribute vec3 position;
attribute vec2 texture;
attribute vec2 character;

uniform mat4 viewMat;
uniform mat4 projectionMat;

uniform float timing;
uniform float numCharacters;

varying vec2 texCoord;

float PI = 3.14159265358979323846264;

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
    vec3 v = position;

    // We're abusing the z coord to mark whether we animate the vertex or not.
    float animate = v.z;
    v.z = 0.0;
    vec3 base = v - vec3(0,1.0,0);

    float char = floor(character.x + timing);
    float angle = fract(character.x + timing);

    texCoord = texture;
    texCoord.s = (texCoord.s + char) / numCharacters;

    if (animate>0.0) {
        v = rotateAngleAxis(angle * PI, vec3(1.0, 0.0, 0.0), v-base)+base;
    }

    gl_Position = projectionMat * viewMat * vec4(v, 1.0);
}

