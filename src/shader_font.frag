uniform sampler2D diffuse;
varying vec2 texCoord;

void main(void) {
 gl_FragColor = texture2D(diffuse, texCoord);
}
