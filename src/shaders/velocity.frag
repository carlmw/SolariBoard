varying vec2 velocity;

void main(void) {
	// Straightforward "encoding"
	//FIXME: bit pack x,y with greater precision.
    gl_FragColor = vec4(velocity.xy * 0.5 + 0.5, 0.0, 1.0);
}
