
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define resolution u_resolution
#define time u_time

float random(vec3 v) { 
	return fract(sin(dot(v, vec3(12.9898, 78.233, 19.8321))) * 43758.5453);
}

float valueNoise(vec3 v) {
	vec3 i = floor(v);
	vec3 f = smoothstep(0.0, 1.0, fract(v));
	return  mix(
		mix(
			mix(random(i), random(i + vec3(1.0, 0.0, 0.0)), f.x),
			mix(random(i + vec3(0.0, 1.0, 0.0)), random(i + vec3(1.0, 1.0, 0.0)), f.x),
			f.y
		),
		mix(
			mix(random(i + vec3(0.0, 0.0, 1.0)), random(i + vec3(1.0, 0.0, 1.0)), f.x),
			mix(random(i + vec3(0.0, 1.0, 1.0)), random(i + vec3(1.0, 1.0, 1.0)), f.x),
			f.y
		),
		f.z
	);
}

float fbm(vec3 v) {
	float n = 0.0;
	float a = 0.5;
	for (int i = 0; i < 5; i++) {
		n += a * valueNoise(v);
		v *= 2.0;
		a *= 0.5;
	}
	return n;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    color += mix(vec3(0.0), vec3(0.8471, 0.0588, 0.0588), vec3(smoothstep(0.0, -1.0, uv.y) * fbm(vec3(uv * 5.0 + vec2(0.0, -time), 0.0))));
    color += mix(vec3(0.0), vec3(1.0, 0.4314, 0.4314), vec3(smoothstep(0.7, -1.0, uv.y) * fbm(vec3(uv * 2.0 + vec2(1.0, -time), 0.0))));
    color += mix(vec3(0.0), vec3(0.8706, 0.4275, 0.1137), vec3(smoothstep(0.5, -1.0, uv.y) * fbm(vec3(uv * 3.0 + vec2(2.0, -time), 0.0))));
    color += mix(vec3(0.0), vec3(0.9451, 0.851, 0.851), vec3(smoothstep(0.9, -1.0, uv.y) * fbm(vec3(uv * 10.0 + vec2(4.0, -time), 0.0))));
    color += mix(vec3(0.0), vec3(0.8863, 0.5373, 0.1882), vec3(smoothstep(1.2, -1.0, uv.y) * fbm(vec3(uv * 8.0 + vec2(9.0, -time), 0.0))));
    color += mix(vec3(0.0), vec3(0.9373, 0.9294, 0.6078), vec3(smoothstep(1.4, -1.0, uv.y) * fbm(vec3(uv * 6.0 + vec2(12.0, -time), 0.0))));
    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}