uniform sampler2D imageTex;
uniform sampler2D velocityTex;
// The FragCoord has a (0, screen x) range we need to convert into (0,1)
// The passed in imageScale is roughly 1/screenx
uniform vec2 imageScale;

#define numSamples 24.0

vec2 sampleVelocity(vec2 uv) {
	vec3 encodedVelocity = texture2D(velocityTex, uv).rgb;
	return (2.0* encodedVelocity.xy - 1.0) * pow(encodedVelocity.z, 2.0);
}

void main(void) {
	vec2 uv = gl_FragCoord.xy * imageScale;
	vec3 color = texture2D(imageTex, uv).rgb;

	vec2 xSample, ySample;
	vec2 velocity;

	// This is a multisampling n^2 attempt at solving the lack of trails.
	// It looks reasonably well up close but it's very inefficient and really should be 2 passes.

	// He're how it's supposed to work:
	// The problem with text-book motion blur is that the effect is contained within the silhoutte
	// of the moving object and there's no way to generate "trails", where there's no longer any
	// velocity information.

	// So what is done here is we blur in 2 directions for every fragment, but only include a sample
	// if it hits the velocity map.
	for (float i=-numSamples/2.0; i<numSamples/2.0; i++) {
		vec2 xSample = uv + imageScale * vec2(i, 0);
		vec2 ySample = uv + imageScale * vec2(0, i);

		velocity = vec2(sampleVelocity(xSample).x, sampleVelocity(ySample).y) * sign(i);
		velocity = clamp(velocity, 0.0, 100.0);

		//velocity *= abs(i) / numSamples;
		color += texture2D(imageTex, xSample).rgb * velocity.x;
		color += texture2D(imageTex, ySample).rgb * velocity.y;
	}
    gl_FragColor = vec4(color, 1.0);
}
