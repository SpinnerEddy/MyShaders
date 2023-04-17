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

vec2 mainPoint;
float voronoiStrength = 0.02;
float pi = acos(-1.0);

float random(vec2 p){
    return fract(sin(dot(p, vec2(12.9876, 89.124))) * 76222.2466);
}

mat2 rotate(float angle){
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

vec2 polarMod(vec2 p, float r){
    float a = atan(p.x, p.y) + (pi/r);
    float n = pi * 2.0 / r;
    a = floor(a/n) * n;
    return p * rotate(a);
}

float sdRect(vec2 p, vec2 s){
    vec2 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float sdCircle(vec2 p, float r){
    return length(p) - r;
}

float sinOut(float t){
    return sin(t * pi / 2.0);
}

float elasticOut(float t) {
	return sin(-13.0 * (t + 1.0) * pi / 2.0) * pow(2.0, -10.0 * t) + 1.0;
}

float expOut(float t){
    return t == 1.0 ? t : 1.0 - pow(2.0, -10.0 * t);
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

// http://roy.red/posts/infinite-regression/
vec2 cInverse(vec2 a) {
    return vec2(a.x, -a.y) / dot(a, a);
}

vec2 cMul(vec2 a, vec2 b){
    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

vec2 cDiv(vec2 a, vec2 b){
    return cMul(a, cInverse(b));
}

vec2 cLog(vec2 a) {
    return vec2(0.5*log(dot(a,a)), atan(a.y, a.x));
}

vec2 cExp(vec2 a) {
    return exp(a.x) * vec2(cos(a.y), sin(a.y));
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    // http://roy.red/posts/infinite-regression/
    float ratio = 2.17;
    float r1 = 0.2;
    float r2 = 1.0;
    float scale = log2(r2 / r1);
    float angle = atan(scale/(2.0*pi));
    vec2 uv2 = cLog(uv);
    vec2 uv3 = cExp(vec2(0.0, angle)) * cos(angle);
    vec2 uv4 = cDiv(uv2, uv3);
    vec2 uv5 = uv4;
    uv5.x = mod(uv4.x - time * 0.7, scale);
    vec2 uv6 = cExp(uv5);
    vec2 uv7 = abs(uv6);
    float value = pow(ratio, -floor(log(max(uv7.x, uv7.y) * 2.0)/log(ratio)));
    vec2 uv8 = uv7 * value;

    // color += 0.4/length(uv4);

    color += COLOR_N;
    vec2 outputUv = uv8;

    // uv += time * 0.2;
    outputUv *= 4.0;
    vec2 fPos = (fract(outputUv) - 0.5) * 2.0;
    vec2 iPos = floor(outputUv);
    // color += 0.1/length(fPos);


    fPos *= rotate(length(fPos));
    float ft1 = fract((time - length(fPos) * 0.2 - sin(length(outputUv * 4.0)) * 0.2) * 0.18);  // 0 ~ 1
    float t1 = linearStep(0.125, 0.250, ft1);
    float t2 = linearStep(0.375, 0.500, ft1);
    float t3 = linearStep(0.625, 0.750, ft1);
    float t4 = linearStep(0.875, 1.0, ft1);
    
    vec2 offset1 = vec2(mix(0.9, -0.8, bounceOut(t1) - bounceOut(t3)), mix(-0.9, 0.8, bounceOut(t2) - bounceOut(t4)));
    vec2 offset11 = vec2(mix(0.1, 0.7, bounceOut(t1) - bounceOut(t3)), mix(0.1, 0.7, bounceOut(t2) - bounceOut(t4)));
    vec2 tPos = fPos - offset1;
    color = mix(color, COLOR_T, smoothstep(0.005, -0.005, sdRect(tPos, offset11)));

    vec2 offset2 = vec2(mix(-0.9, 0.8, expOut(t2) - expOut(t4)), mix(-0.9, 0.8, expOut(t1) - expOut(t3)));
    vec2 offset22 = vec2(mix(0.1, 0.7, expOut(t2) - expOut(t4)), mix(0.1, 0.7, expOut(t1) - expOut(t3)));
    vec2 mPos = fPos - offset2;
    color = mix(color, COLOR_M, smoothstep(0.005, -0.005, sdRect(mPos, offset22)));

    vec2 offset3 = vec2(mix(-0.9, 0.8, elasticOut(t1) - elasticOut(t3)), mix(0.9, -0.8, elasticOut(t2) - elasticOut(t4)));
    vec2 offset33 = vec2(mix(0.1, 0.7, elasticOut(t1) - elasticOut(t3)), mix(0.1, 0.7, elasticOut(t2) - elasticOut(t4)));
    vec2 kPos = fPos - offset3;
    color = mix(color, COLOR_K, smoothstep(0.005, -0.005, sdRect(kPos, offset33)));

    vec2 offset4 = vec2(mix(0.9, -0.8, sinOut(t2) - sinOut(t4)), mix(0.9, -0.8, sinOut(t1) - sinOut(t3)));
    vec2 offset44 = vec2(mix(0.1, 0.7, sinOut(t2) - sinOut(t4)), mix(0.1, 0.7, sinOut(t1) - sinOut(t3)));
    vec2 hPos = fPos - offset4;
    color = mix(color, COLOR_H, smoothstep(0.005, -0.005, sdRect(hPos, offset44)));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}