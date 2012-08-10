uniform sampler2D imageTex;
// The FragCoord has a (0, screen x) range we need to convert into (0,1)
uniform vec2 imageScale;

void main(void) {
	vec2 texCoord = gl_FragCoord.xy * imageScale;
    gl_FragColor = texture2D(imageTex, texCoord);
}
