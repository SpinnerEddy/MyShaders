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

vec2 repeat(vec2 p, float repCoef){
    return (fract(p/repCoef - 0.5) - 0.5) * repCoef;
}

vec3 lattice(vec2 uv, float size){
    vec3 color = vec3(0.0);
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

    vec3 col1 = mix(COLOR_N, vec3(1.0), pow(maxDist, 3.0));
    color += col1*col1*col1;
    color += pow(fbm(vec3(uv, time*1.1)) * 0.8, 22.0);

    return color;
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
    float f = pow(length(lattice(uv, 10.0))*5.0, 0.22);
    uv *= 5.0;
    uv *= f*0.6;

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

    return smoothstep(0.1, -0.1, sdFrameRect(p, vec2(0.3*sin(length(uv) - time + tCoef) + 0.25), 0.1));
}


vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color += lattice(uv, 10.0);
    color = mix(color, COLOR_T, rectFlowar(uv, 0.0));
    color = mix(color, COLOR_M, rectFlowar(uv, 1.0));
    color = mix(color, COLOR_K, rectFlowar(uv, 2.0));
    color = mix(color, COLOR_H, rectFlowar(uv, 3.0));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}