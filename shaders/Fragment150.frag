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

float pi2 = acos(-1.0) * 2.0;
float pi = acos(-1.0);

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

vec2 boxelUv(vec2 uv, float size){
    uv *= size;
    vec2 iPos = floor(uv);
    iPos /= size;

    return iPos;
}

float wipe(vec2 p, float t){
    float a = atan(-p.x, -p.y);
    float v = (t * pi2 < a + pi) ? 0.0 : 1.0;
    return v;
}

float bounceOut(float t) {
	const float a = 4.0 / 11.0;
	const float b = 8.0 / 11.0;
	const float c = 9.0 / 10.0;
	
	const float ca = 4356.0 / 361.0;
	const float cb = 35442.0 / 1805.0;
	const float cc = 16061.0 / 1805.0;
	
	float t2 = t * t;
	
	return t < a
		? 7.5625 * t2
		: t < b
		? 9.075 * t2 - 9.9 * t + 3.4
		: t < c
		? ca * t2 - cb * t + cc
		: 10.8 * t * t - 20.52 * t + 10.72;
}

float easeInOutExpo(float t) {
    if (t == 0.0 || t == 1.0) {
        return t;
    }
    if ((t *= 2.0) < 1.0) {
        return 0.5 * pow(2.0, 10.0 * (t - 1.0));
    } else {
        return 0.5 * (-pow(2.0, -10.0 * (t - 1.0)) + 2.0);
    }
}

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    float it = time * 0.3;
    float ft = mod(it, 4.0);

    float t1 = linearStep(0.1, 0.8, ft);
    float t2 = linearStep(1.0, 1.2, ft);
    float t3 = linearStep(1.5, 1.8, ft);
    float t4 = linearStep(2.2, 2.6, ft);
    float t5 = linearStep(2.9, 3.4, ft);
    float t6 = linearStep(3.5, 3.9, ft);
    float coef = mix(10.0, 30.0, wipe(uv, bounceOut(t1)));
    coef = mix(coef, 2000.0, wipe(uv, easeInOutExpo(t2)));
    coef = mix(coef, 50.0, wipe(uv, bounceOut(t3)));
    coef = mix(coef, 30.0, wipe(uv, easeInOutExpo(t4)));
    coef = mix(coef, 1000.0, wipe(uv, easeInOutExpo(t5)));
    coef = mix(coef, 10.0, wipe(uv, bounceOut(t6)));

    vec2 bUv = boxelUv(uv, coef);

    float waveT =  bUv.y + sin(bUv.x * 10.0 * fbm(vec3(bUv*3.0, time+0.0)) + time * 4.0) * 0.55;
    float waveM =  bUv.y + sin(bUv.x * 9.5 * fbm(vec3(bUv*4.0, time-2.0)) + time * 3.8) * 0.54;
    float waveK =  bUv.y + sin(bUv.x * 9.0 * fbm(vec3(bUv*5.0, time-1.0)) + time * 4.2) * 0.50;
    float waveH =  bUv.y + sin(bUv.x * 10.5 * fbm(vec3(bUv*2.0, time+1.0)) + time * 4.4) * 0.58;
    color += COLOR_N * 0.3;
    color += 0.1 / abs(waveT) * COLOR_T;
    color += 0.1 / abs(waveM) * COLOR_M;
    color += 0.1 / abs(waveK) * COLOR_K;
    color += 0.1 / abs(waveH) * COLOR_H;

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}