attribute vec3 position;
attribute vec2 texture;
attribute float charpos;

uniform mat4 viewMat;
uniform mat4 projectionMat;
uniform vec2 offset;
uniform float numChars;
varying vec2 texCoord;

void main(void) {
    vec4 v = viewMat * vec4(position, 1.0);
    float char = charpos;
    texCoord = texture;
    texCoord.s = (texCoord.s + char) / numChars;
    v.x = v.x + offset.x;
    v.y = v.y + offset.y;
    gl_Position = projectionMat * v;
}

