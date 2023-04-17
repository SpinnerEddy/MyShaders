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
#define COLOR_C vec3(0.98, 0.514, 0.2)
#define COLOR_KA vec3(0.898, 0.275, 0.11)
#define COLOR_CH vec3(0.976, 0.231, 0.565)
#define COLOR_JU vec3(1.0, 0.776, 0.008)
#define COLOR_RI vec3(0.537, 0.765, 0.922)
#define COLOR_NA vec3(0.549, 0.902, 0.404)
#define COLOR_S vec3(0.682, 0.706, 0.612)

float pi = acos(-1.0);
float pi2 = pi * 2.0;
float at = 0.0;

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
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

float sdStar(vec2 uv, float s){
    float pi2 = pi * 2.0;
    float a = atan(uv.y, uv.x) / pi2;
    float seg = a * 5.0;
    a = ((floor(seg)+0.5)/5.0 + mix(s, -s, step(0.5, fract(seg)))) * pi2;
    return abs(dot(vec2(cos(a), sin(a)), uv));
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float sdBox(vec3 p, vec3 s){
    vec3 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

vec2 polarMod(vec2 p, float r) {
    float a =  atan(p.x, p.y) + pi/r;
    float n = pi2 / r;
    a = floor(a/n)*n;
    return p*rotate(-a);
}

float distanceFunction(vec3 p){
    float d = 0.0;
    vec3 p1 = p;
    p1.xy *= rotate(0.6 * time);
    p1.yz *= rotate(0.4 * time);
    d += sdBox(p1, vec3(1.0));
    at += 0.0003 / (abs(d) + 0.01);

    return d;
}

vec3 getNormal(vec3 p){
    vec2 err = vec2(0.001, 0.0);
    return normalize(vec3(
        distanceFunction(p + err.xyy) - distanceFunction(p - err.xyy),
        distanceFunction(p + err.yxy) - distanceFunction(p - err.yxy),
        distanceFunction(p + err.yyx) - distanceFunction(p - err.yyx)
    ));
}

vec3 skyTexture(vec2 uv, float size){
    vec2 uv2 = uv * size;
    vec3 col = vec3(0.0);

    vec3 noiseCol = pow(vec3(fbm(vec3(uv2 + vec2(time*0.1, 0.0), 122.2))), vec3(2.0));
    noiseCol += pow(vec3(fbm(vec3(uv2 + vec2(time*0.2, 0.0), 422.2))), vec3(3.2));
    noiseCol += pow(vec3(fbm(vec3(uv2 + vec2(time*0.3, 0.0), 522.2))), vec3(2.0));
    noiseCol += pow(vec3(fbm(vec3(uv2 + vec2(time*0.4, 0.0), 622.2))), vec3(4.0));
    noiseCol += pow(vec3(fbm(vec3(uv2 + vec2(time*0.5, 0.0), 722.2))), vec3(9.0));

    col += mix(COLOR_N, vec3(1.0), pow(noiseCol, vec3(3.0)));

    return col;
}

vec3 background(vec3 rayDir){
    float k = rayDir.y * 0.5 + 0.5;
    vec3 color = COLOR_N;
    return mix(color, skyTexture(rayDir.xy, 20.0), k);
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 camPos = vec3(0.0, 2.0, -5.0);
    vec3 lookPos = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(lookPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(forward, up));
    up = normalize(cross(right, forward));
    float fov = 1.0;
    vec3 rayDir = normalize(uv.x * right + uv.y * up + fov * forward);

    float df, d;
    vec3 p;
    for(int i = 0; i < 400; i++){
        p = camPos + rayDir * d;
        df = distanceFunction(p);
        if(df > 100.0){
            break;
        }
        if(df <= 0.0001){
            break;
        }
        d += df;
    }

    if(df <= 0.0001){
        vec3 normal = getNormal(p);
        rayDir = refract(rayDir, normal, 0.9);
    }
    float depth = length(p - camPos);
    vec2 uv2 = p.xy / (depth * rayDir.z);
    color = mix(color, pow(background(rayDir), vec3(2.0)), smoothstep(0.0, 2.0, d));
    color = pow(color, vec3(0.4545));
    color += dot(at, at);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}