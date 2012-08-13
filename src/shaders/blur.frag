uniform sampler2D imageTex;
uniform sampler2D velocityTex;
// The FragCoord has a (0, screen x) range we need to convert into (0,1)
// The passed in imageScale is roughly 1/screenx
uniform vec2 imageScale;

#define numSamples 6.0

vec4 sample(vec2 uv) {
	// Sampling the rendered image using velocity as a filter. 

	// The velocity is encoded as a normalized vec2, and a log scaling factor
	vec3 encodedVelocity = texture2D(velocityTex, uv).rgb;
	vec2 velocity = (2.0* encodedVelocity.xy - 1.0) * pow(encodedVelocity.z, 2.0);

	float v = abs(velocity.y) + abs(velocity.x) * 2.0;
	vec4 mult = vec4(v, v, v, 1);

	return mult * texture2D(imageTex, uv);
}

void main(void) {
	vec2 uv = gl_FragCoord.xy * imageScale;
	vec4 color = vec4(0);

	float step = 20.0 / numSamples;

	for (float i=0.0; i<numSamples; i++) {
		color += sample(uv + imageScale * vec2(0, i*-1.0)) * step;
		color += sample(uv + imageScale * vec2(i*1.0, 0)) * step;
	}
    gl_FragColor = texture2D(imageTex, uv)*0.5 + color;
}
