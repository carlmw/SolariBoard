uniform sampler2D imageTex;
// The FragCoord has a (0, screen x) range we need to convert into (0,1)
uniform vec2 imageScale;


void main(void) {
	float w = 0.1;

	vec2 texCoord = gl_FragCoord.xy;
	vec4 color = vec4(0.0);

	for (int i=-1; i<2; i++) {
		for (int j=-1; j<2; j++) {
			color += texture2D(imageTex, (texCoord + vec2(i,j)) * imageScale ) * w;
		}
	}
    gl_FragColor = color;
}
