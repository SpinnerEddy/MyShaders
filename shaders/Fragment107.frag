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

vec2 random2d2d(vec2 p){
    return fract(sin(vec2(dot(p, vec2(333.12, 63.587)), dot(p, vec2(2122.66, 126.734)))) * 5222.346);
}

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

float sdRect(vec2 p, vec2 s){
    vec2 q  = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float twoRect(vec2 p){
    float rect1 = sdRect(p, vec2(0.07));
    float rect2 = max(sdRect(p, vec2(0.25)), -sdRect(p, vec2(0.15)));

    return min(rect1, rect2);
}

vec3 gradate(vec2 uv){
    vec2 p = (uv + 1.0) / 2.0;

    return mix(vec3(0.9765, 0.9765, 0.9765), vec3(0.149, 0.8706, 0.8824), p.x);
}

vec3 lattice(vec2 uv, float size){
    vec3 color = vec3(0.0);
    vec3 gColor = gradate(uv);
    float f = fbm(vec3(uv, time*0.222));
    uv.y += pow(f, 4.0) - 0.3 * pow(f, 4.0) + 0.8 * pow(f, 3.0);
    uv.x += pow(f, 3.0) - 0.22 * pow(f, 7.0) + 0.9 * pow(f, 8.0);
    uv += time * 0.22;
    uv *= size;

    vec2 iPos = floor(uv);
    vec2 fPos = (fract(uv) - 0.5);// * 2.0;

    float maxDist = 9999.9;
    
    for(float y = -1.0; y <= 1.0; y+=1.0){
        for(float x = -1.0; x <= 1.0; x+=1.0){
            vec2 neighbor = vec2(x, y);
            vec2 point = random2d2d(iPos + neighbor);
            point = sin(time + point * twoPi) * 0.422 + 0.5;
            vec2 diff = neighbor + point - fPos;
            float dist = length(diff);

            maxDist = min(maxDist, dist);
        }
    }

    vec3 col1 = mix(gColor, vec3(1.0), pow(maxDist, 3.0));
    color += col1*col1*col1;
    color += pow(fbm(vec3(uv, time*1.1)) * 0.8, 12.0);

    return color;
}

vec3 rectLattice(vec2 uv, float size){
    vec3 color = vec3(0.0);

    float f = pow(length(lattice(uv, size))*5.0, 0.22);
    uv *= size/2.0;
    uv *= f * 1.3;

    vec2 iPos = floor(uv);
    vec2 fPos = (fract(uv) - 0.5);

    color += smoothstep(0.01, -0.01, twoRect(fPos));
    color *= pow(vec3(0.0314, 0.4745, 0.5412), vec3(2.4));

    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color += rectLattice(uv, 5.0);
    color += lattice(uv, 3.0);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}