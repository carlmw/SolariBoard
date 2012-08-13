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

    // We're abusing the z coord to mark whether we animate the vertex or not. We
    // keep it above 0 for the animation check and so it renders in front when it
    // stops moving
    v.z *= 0.01;
    vec3 base = v - vec3(0,1.0,0);

    float characterFrom = character.x;
    float characterTo = character.y;

    float char = min(characterFrom + timing, floor(characterTo));
    float angle = fract(char);

    texCoord = texture;
    // Since non power of two textures don't support wrap around, we roll our own wrap around
    float offset = (texCoord.s + floor(char)) / numCharacters;
    // Fract wraps values > 1.0 and substracting -1 wraps everything < 0.0
    offset = fract( offset - min(0.0, sign(offset)));

    // Because we can't figure out if 1.0 is the right edge of the last character or
    // the left of the next one, we pass them in as 0.99, so if the original coord was a right edge
    // we can always clamp it to 1.0 and not 0.0.
    if ((fract(texCoord.x) > 0.9) && (offset < 0.001)) {
      offset = 1.0;
    }
    texCoord.s = offset;

    if ((v.z>0.0) && (char < characterTo)) {
        v = rotateAngleAxis(angle * PI, vec3(1.0, 0.0, 0.0), v-base)+base;
    }

    gl_Position = projectionMat * viewMat * vec4(v, 1.0);
}

