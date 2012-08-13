varying vec3 velocity;

void main(void) {
	// Encoding the velocity as 3 floats. A normalized direction and a log scale
	// http://www.ctrl-alt-test.fr/?cat=12
    gl_FragColor = vec4(velocity.xy * 0.5 + 0.5, pow(velocity.z, 0.5), 1.0);
}
