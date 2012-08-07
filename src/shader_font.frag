uniform sampler2D diffuse;
uniform bool blur;
uniform vec2 screenSize;

varying vec2 texCoord;
varying vec2 velocity;

void main(void) {
    vec4 color = vec4(0.0);
    vec2 sample = vec2(0.0);
    const int numSamples = 10;
    if (blur) {
        sample = gl_FragCoord.xy / screenSize;
        for (int i=0; i<numSamples; ++i) {
            float scale = (float(i) / float(numSamples) - 0.5);
            color += texture2D(diffuse, sample + scale * velocity);
            }
        color /= float(numSamples);
    } else {
        color += texture2D(diffuse, texCoord);
    }
    gl_FragColor = color;
}
