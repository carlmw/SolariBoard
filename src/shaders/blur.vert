attribute vec3 position;
attribute vec2 texture;

uniform mat4 projectionMat;
varying vec2 texCoord;


void main(void) {
    texCoord = texture;
    gl_Position = projectionMat * vec4(position, 1.0);
}

