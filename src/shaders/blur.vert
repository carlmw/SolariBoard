attribute vec3 position;

uniform mat4 projectionMat;


void main(void) {
    gl_Position = projectionMat * vec4(position, 1.0);
}

