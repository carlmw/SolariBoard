uniform sampler2D fontTex;
varying vec2 texCoord;

void main(void) {
    gl_FragColor = texture2D(fontTex, texCoord);
}
