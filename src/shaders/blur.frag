uniform sampler2D imageTex;
uniform sampler2D velocityTex;
// The FragCoord has a (0, screen x) range we need to convert into (0,1)
// The passed in imageScale is roughly 1/screenx
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
