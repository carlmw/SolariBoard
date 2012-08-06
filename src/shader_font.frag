uniform sampler2D diffuse;
varying vec2 texCoord;
varying vec2 prevPos;
varying vec2 curPos;

void main(void) {
    vec2 velocity = curPos - prevPos;
    float s = dot(velocity, velocity);

    gl_FragColor = vec4(s, 0.0, 0.0, 1.0);
    //gl_FragColor = texture2D(diffuse, texCoord);
}
