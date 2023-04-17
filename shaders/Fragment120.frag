#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define resolution u_resolution
#define time u_time

#define COLOR_N vec3(0.15, 0.34, 0.6)
#define COLOR_T vec3(0.313, 0.816, 0.816)
#define COLOR_M vec3(0.745, 0.118, 0.243)
#define COLOR_K vec3(0.475, 0.404, 0.765)
#define COLOR_H vec3(1.0, 0.776, 0.224)
#define COLOR_S vec3(0.682, 0.706, 0.612)
#define COLOR_SAND vec3(0.6118, 0.6, 0.5765)
#define COLOR_BLOCK vec3(0.67, 0.361, 0.243)
#define COLOR_SAND2 vec3(0.2196, 0.2196, 0.2196)

#define pi acos(-1.0)
#define twoPi pi*2.0

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

float random1d1d(float n){
    return sin(n) * 21422.214122;
}

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

float sdRect(vec2 p, vec2 s){
    vec2 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

vec3 lattice2(vec2 uv, vec2 size){
    vec2 uv2 = uv * size;

    uv2.x += step(1.0, mod(uv2.y, 2.0)) * 0.5;
    vec2 fPos = fract(uv2) - 0.5;
    vec2 iPos = floor(uv2);

    vec3 color = vec3(0.0);
    color += mix(COLOR_SAND, COLOR_BLOCK, vec3(smoothstep(0.01, -0.01, sdRect(fPos, vec2(0.35 + fbm(vec3(iPos, length(fPos))) * 0.2)))));

    return color;
}

vec3 lattice(vec2 uv, vec2 size){
    vec2 uv2 = uv * size;

    uv2.x += step(1.0, mod(uv2.y, 2.0)) * 0.5;
    vec2 fPos = fract(uv2) - 0.5;
    vec2 iPos = floor(uv2);

    vec3 color = vec3(0.0);
    color += mix(vec3(0.0), COLOR_SAND2, vec3(smoothstep(0.01, -0.01, sdRect(fPos, vec2(0.45)))));
    color += mix(COLOR_SAND, COLOR_BLOCK, vec3(smoothstep(0.01, -0.01, sdRect(fPos, vec2(0.35 + fbm(vec3(iPos, length(fPos))) * 0.2)))));

    float ran = random(vec3(uv2, 2.222));
    color = mix(color, vec3(0.0), vec3(fbm(vec3(uv2, random(vec3(fPos, 22.2))*0.1))));
    color = mix(color, vec3(0.5059, 0.4667, 0.4667), vec3(fbm(vec3(uv2, random(vec3(fPos, 12.2))*0.1))));
    color = mix(color, vec3(0.0784, 0.0706, 0.0706), vec3(fbm(vec3(uv2, random(vec3(fPos, 22.2))*0.1))));
    color += random(vec3(fPos, 22.22)) * 0.06;
    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color += lattice(uv + vec2(0.0, time * 0.062), vec2(2.0, 5.0));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}

