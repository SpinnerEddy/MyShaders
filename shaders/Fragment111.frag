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

float at = 0.0;
vec3 objectPos;

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

vec2 polarMod(vec2 p, float r){
    float a = atan(p.x, p.y) + (pi/r);
    float n = pi * 2.0 / r;
    a = floor(a/n) * n;
    return p * rotate(a);
}

vec2 random2d2d(vec2 p){
    return fract(sin(vec2(dot(p, vec2(333.12, 63.587)), dot(p, vec2(2122.66, 126.734)))) * 5222.346);
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

vec3 repeat(vec3 p, float repCoef){
    return (fract(p/repCoef - 0.5) - 0.5) * repCoef;
}

vec2 repeat(vec2 p, float repCoef){
    return (fract(p/repCoef - 0.5) - 0.5) * repCoef;
}

float repeat(float p, float repCoef){
    return (fract(p/repCoef - 0.5) - 0.5) * repCoef;
}

float sdRect(vec2 p, vec2 s){
    vec2 q  = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float sdFrameRect(vec2 p, vec2 s, float w){
    float outRect = sdRect(p, s);
    float inRect = sdRect(p, s - w);
    return max(outRect, -inRect);
}

float rectFlowar(vec2 uv, float tCoef){
    vec2 p = uv * 5.0;
    p = repeat(p, 2.0);
    p = polarMod(p, 12.0);
    vec2 err = vec2(1.0, 0.5);
    for(int i = 0; i < 3; i++){
        p = abs(p);
        p.xy *= rotate(pow(float(i), float(i)) * 0.4);
        p = abs(p);
        p -= err;
        err *= 0.682;
        p = polarMod(p, float(i) + 4.0);
    }

    return smoothstep(0.05, -0.05, sdFrameRect(p, vec2(0.6*sin(length(uv*3.0) - time * 2.0 + tCoef) + 0.5), 0.05 + cos(length(p) * pi) * 0.01));
}

float sdPlane(vec3 p, vec3 n, float h){
  return dot(p,n) + h;
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float sdBox(vec3 p, vec3 s){
    vec3 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdHexPolygon(vec3 p){
    float d = 0.0;

    p.yz = polarMod(p.yz, 6.0);
    d += sdBox(p, vec3(0.1, 0.5, 0.5));
    d = min(d, sdBox(p - vec3(0.1, 0.0, 0.0), vec3(0.05, 0.4, 0.4)));
    d = min(d, sdBox(p + vec3(0.1, 0.0, 0.0), vec3(0.05, 0.4, 0.4)));

    d = min(d, sdBox(p - vec3(0.1625, 0.0, 0.0), vec3(0.025, 0.3, 0.3)));  // 0.1 + 0.05 + 0.025 * 2
    d = min(d, sdBox(p + vec3(0.1625, 0.0, 0.0), vec3(0.025, 0.3, 0.3)));

    d = min(d, sdBox(p - vec3(0.19, 0.0, 0.0), vec3(0.01, 0.2, 0.2))); 
    d = min(d, sdBox(p + vec3(0.19, 0.0, 0.0), vec3(0.01, 0.2, 0.2)));

    return d;
}

float sdHex(vec2 p, float h) {
    vec3 k = vec3(-sqrt(3.0)/2.0, tan(radians(30.0)), 0.5);
    p = abs(p);
    p -= 2.0 * min(dot(k.xz, p), 0.0) * k.xz;
    return length(p - vec2(clamp(p.x, -k.y * h, k.y * h), h)) * sign(p.y - h);
}

float deHexTiling(vec2 p, float radius, float scale) {
    vec2 rep = vec2(2.0 * sqrt(3.0), 2.0) * radius;
    vec2 p1 = mod(p, rep) - rep * 0.5;
    vec2 p2 = mod(p + 0.5 * rep, rep) - rep * 0.5;
    return min(
        sdHex(p1.xy, scale * radius),
        sdHex(p2.xy, scale * radius)
    );
}

float hexPlane(vec3 p) {
    p.xy *= rotate(p.z * 0.22);
    float plane1 = sdPlane(p + vec3(0.0, 0.0, 0.0), normalize(vec3(0.0, -1.0, 0.0)), 2.0);
    float hexPlane1 = max(deHexTiling(p.zx, 0.3, 0.9 + 0.1 * sin(-time * 3.0 + p.z*0.6)), plane1);

    float plane2 = sdPlane(p, normalize(vec3(0.0, 1.0, 0.0)), 2.0);
    float hexPlane2 = max(deHexTiling(p.zx, 0.3, 0.9 + 0.1 * sin(-time * 3.0 + p.z*0.6)), plane2);

    float d = 0.0;
    d = min(hexPlane1, hexPlane2);
    return d;
}

float distanceFunc(vec3 p){
    float d = 0.0;
    vec3 p1 = p;
    d += hexPlane(p1);
    at += d * 0.03;

    return d;
}

vec3 getNormal(vec3 p){
    float err = 0.001;
    return normalize(vec3(distanceFunc(p + vec3(err, 0.0, 0.0)) - distanceFunc(p - vec3(err, 0.0, 0.0)),
                          distanceFunc(p + vec3(0.0, err, 0.0)) - distanceFunc(p - vec3(0.0, err, 0.0)),
                          distanceFunc(p + vec3(0.0, 0.0, err)) - distanceFunc(p - vec3(0.0, 0.0, err))));
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 camPos = vec3(0.0, 0.0, -2.0 + time);
    objectPos = vec3(0.0, 0.0, 0.0 + time);
    vec3 forward = normalize(objectPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, forward));
    up = normalize(cross(forward, right));
    float fov = 1.0;
    vec3 rayDir = normalize(uv.x * right + uv.y * up + forward * fov);

    float df = 0.0;
    float d = 0.0;
    vec3 p = vec3(0.0);
    float accum = 0.0;
    for(int i = 0; i < 100; i++){
        p = camPos + rayDir * d;
        df = distanceFunc(p);
        df = max(abs(df), 0.008);
        accum += exp(-df * 220.2);
        d += df * 0.38;
    }

    color =  accum * 0.2 * mix(COLOR_N, vec3(0.0, 0.9098, 0.9569), smoothstep(0.0, 24.0, d));
    color *= (sin(at * 4.0 - time * 3.0) + 1.0) / 2.0;
    
    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}