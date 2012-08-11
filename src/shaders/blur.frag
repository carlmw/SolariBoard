uniform sampler2D imageTex;
uniform sampler2D velocityTex;
// The FragCoord has a (0, screen x) range we need to convert into (0,1)
// The passed in imageScale is roughly 1/screenx
uniform vec2 imageScale;


void main(void) {
	float numSamples = 10.0;
	float intensity = 0.5;

	vec2 texCoord = gl_FragCoord.xy;
	vec4 color = vec4(0.0);

	vec2 velocity = (2.0* texture2D(velocityTex, texCoord * imageScale).xy -1.0) * 10.0;
	float step = 1.0 / numSamples;

	for (float i=0.0; i<10.0; i++) {
		color += texture2D(imageTex, imageScale * (texCoord + (i*step-0.5)*velocity)) * step;
	}		

    gl_FragColor = color;
}
