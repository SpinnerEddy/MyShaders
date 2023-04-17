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

#define pi acos(-1.0)
#define twoPi pi*2.0

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
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

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    color += COLOR_N;

    uv *= 5.0;
    vec2 fPos = (fract(uv) - 0.5) * 2.0;
    fPos *= rotate(length(fPos));
    float ft1 = fract((time - length(uv) * 0.1) * 0.18);  // 0 ~ 1
    float t1 = linearStep(0.125, 0.250, ft1);
    float t2 = linearStep(0.375, 0.500, ft1);
    float t3 = linearStep(0.625, 0.750, ft1);
    float t4 = linearStep(0.875, 1.0, ft1);
    
    vec2 offset1 = vec2(mix(0.9, -0.8, bounceOut(t1) - bounceOut(t3)), mix(-0.9, 0.8, bounceOut(t2) - bounceOut(t4)));
    vec2 offset11 = vec2(mix(0.5, 0.7, bounceOut(t1) - bounceOut(t3)), mix(0.5, 0.7, bounceOut(t2) - bounceOut(t4)));
    vec2 tPos = fPos - offset1;
    color = mix(color, COLOR_T, smoothstep(0.005, -0.005, sdRect(tPos, offset11)));

    vec2 offset2 = vec2(mix(-0.9, 0.8, expOut(t2) - expOut(t4)), mix(-0.9, 0.8, expOut(t1) - expOut(t3)));
    vec2 offset22 = vec2(mix(0.5, 0.7, expOut(t2) - expOut(t4)), mix(0.5, 0.7, expOut(t1) - expOut(t3)));
    vec2 mPos = fPos - offset2;
    color = mix(color, COLOR_M, smoothstep(0.005, -0.005, sdRect(mPos, offset22)));

    vec2 offset3 = vec2(mix(-0.9, 0.8, elasticOut(t1) - elasticOut(t3)), mix(0.9, -0.8, elasticOut(t2) - elasticOut(t4)));
    vec2 offset33 = vec2(mix(0.5, 0.7, elasticOut(t1) - elasticOut(t3)), mix(0.5, 0.7, elasticOut(t2) - elasticOut(t4)));
    vec2 kPos = fPos - offset3;
    color = mix(color, COLOR_K, smoothstep(0.005, -0.005, sdRect(kPos, offset33)));

    vec2 offset4 = vec2(mix(0.9, -0.8, sinOut(t2) - sinOut(t4)), mix(0.9, -0.8, sinOut(t1) - sinOut(t3)));
    vec2 offset44 = vec2(mix(0.5, 0.7, sinOut(t2) - sinOut(t4)), mix(0.5, 0.7, sinOut(t1) - sinOut(t3)));
    vec2 hPos = fPos - offset4;
    color = mix(color, COLOR_H, smoothstep(0.005, -0.005, sdRect(hPos, offset44)));
    
    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}