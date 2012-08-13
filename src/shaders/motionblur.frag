uniform sampler2D imageTex;
uniform sampler2D velocityTex;
// The FragCoord has a (0, screen x) range we need to convert into (0,1)
// The passed in imageScale is roughly 1/screenx
uniform vec2 imageScale;

#define numSamples 16.0

vec2 sampleVelocity(vec2 uv) {
	vec3 encodedVelocity = texture2D(velocityTex, uv).rgb;
	return (2.0* encodedVelocity.xy - 1.0) * pow(encodedVelocity.z, 2.0);
}

void main(void) {
	vec2 uv = gl_FragCoord.xy * imageScale;

	vec2 offset = sampleVelocity(uv) * imageScale * 20.0;

	vec3 color = vec3(0.0);

	for (float i=0.0; i<numSamples; i++) {
		color += texture2D(imageTex, uv + offset * i).rgb * (1.0/numSamples);
	}
    gl_FragColor = vec4(color, 1.0);
}
