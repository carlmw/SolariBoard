uniform sampler2D imageTex;

void main(void) {
	vec2 texCoord = gl_FragCoord.xy / vec2(512.0, 512.0);
    gl_FragColor = texture2D(imageTex, texCoord);
}
