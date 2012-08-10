uniform sampler2D imageTex;
varying vec2 texCoord;

void main(void) {
    gl_FragColor = texture2D(imageTex, texCoord);
}
