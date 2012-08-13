uniform sampler2D imageTex;
uniform sampler2D velocityTex;
// The FragCoord has a (0, screen x) range we need to convert into (0,1)
// The passed in imageScale is roughly 1/screenx
uniform vec2 imageScale;

#define numSamples 2.0


void main(void) {
	vec3 color = texture2D(imageTex, gl_FragCoord.xy * imageScale).rgb * 0.5;

	for (float i=-1.0; i<2.0;i++) {
		for (float j=-1.0; j<2.0; j++) {
			color += 0.1 * texture2D(imageTex, imageScale * (gl_FragCoord.xy + vec2(j,j))).rgb;
		}
	}
    gl_FragColor = vec4(color, 1.0);
}
