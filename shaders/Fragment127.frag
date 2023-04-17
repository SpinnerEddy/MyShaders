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

float at1 = 0.0;
float at2 = 0.0;
float at3 = 0.0;
float at4 = 0.0;
float at5 = 0.0;

vec2 random2d2d(vec2 p){
    return fract(sin(vec2(dot(p, vec2(333.12, 63.587)), dot(p, vec2(2122.66, 126.734)))) * 5222.346);
}

float random(vec3 v) { 
	return fract(sin(dot(v, vec3(12.9898, 78.233, 19.8321))) * 43758.5453);
}

float random1d1d(float n){
    return fract(sin(n * 222.222) * 2222.55);
}

float random3d1d(vec3 p){
    vec3 randCoef = vec3(24.214214, 56.6235425, 92.2132345);
    return fract(sin(dot(p, randCoef)) * 2134.1351);
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

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

float smoothMin(float a, float b, float k){
    float h = clamp(0.5 + 0.5 * (b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float distanceFunc(vec3 p){
    float d = 0.0;
    vec3 p1 = p + vec3(sin(time + 2.2) * 3.5, cos(time + 21.1) * 1.5, cos(time + 25.2) * 1.5);
    // vec3 p1 = p - vec3(0.7, 2.0, -0.1);
    float sphereT = sdSphere(p1, 1.5);
    // float sphereT = sdSphere(p1, 1.0);
    d += sphereT;
    at1 += 0.14 / (0.2 + abs(sphereT));

    vec3 p2 = p + vec3(sin(time + 10.0) * 3.5, cos(time + 20.0) * 1.5, cos(time + 20.0) * 1.5);
    // vec3 p2 = p - vec3(-3.4, 1.4, 0.1);
    float sphereM = sdSphere(p2, 1.45);
    // float sphereM = sdSphere(p2, 1.0);
    d = smoothMin(d, sphereM, 1.2);
    at2 += 0.14 / (0.2 + abs(sphereM));

    vec3 p3 = p + vec3(sin(time + 20.0) * 3.5, cos(time + 10.0) * 1.5, cos(time + 50.0) * 1.5);
    // vec3 p3 = p - vec3(-5.0, -2.1, 0.12);
    float sphereK = sdSphere(p3, 1.3);
    // float sphereK = sdSphere(p3, 1.0);
    d = smoothMin(d, sphereK, 1.2);
    at3 += 0.14 / (0.2 + abs(sphereK));

    vec3 p4 = p + vec3(sin(time + 34.0) * 3.5, cos(time + 25.0) * 1.5, cos(time + 10.0) * 1.5);
    // vec3 p4 = p - vec3(2.4, -1.6, 0.2);
    float sphereH = sdSphere(p4, 1.65);
    // float sphereH = sdSphere(p4, 1.0);
    d = smoothMin(d, sphereH, 1.2);
    at4 += 0.14 / (0.2 + abs(sphereH));

    float spheres = 99999.999;
    for(float i = 0.0; i <= 10.0; i+=1.0){
        float coef = clamp(random1d1d(22.2 + i), 0.2, 0.3);
        float x = (random1d1d(i + 12.22) - 0.5) * 50.0;
        float y = -(fract(time*coef+random1d1d(i + 42.22)*222.0) * 50.0) + 25.0;
        float z = (random1d1d(14.21 + 100.0) - 0.5) * 30.0;
        vec3 rndPos = vec3(x, y, z);
        float s = sdSphere(p+rndPos, 0.6 * (coef+0.1));
        spheres = min(spheres, s);
    }

    d = smoothMin(d, spheres, 1.2);
    at5 += 0.17 / (0.2 + abs(spheres));

    d *= 0.8 * fbm(p1 + p2 + p3 + p4 + vec3(time*0.1));
    return d;
}

vec3 getNormal(vec3 p){
    vec2 err = vec2(0.001, 0.0);
    return normalize(vec3(
        distanceFunc(p + err.xyy) - distanceFunc(p - err.xyy),
        distanceFunc(p + err.yxy) - distanceFunc(p - err.yxy),
        distanceFunc(p + err.yyx) - distanceFunc(p - err.yyx)
    ));
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

    return mix(vec3(0.0902, 0.4235, 0.5255), vec3(0.9843, 1.0, 1.0), p.y) * mix(vec3(0.9843, 1.0, 1.0), vec3(0.2863, 0.6902, 0.8118), abs(uv.x));
}

vec3 lattice(vec2 uv, float size){
    vec3 color = vec3(0.0);
    vec3 gColor = gradate(uv);
    float f = fbm(vec3(uv, time*0.222));
    uv.y += pow(f, 4.0) - 0.3 * pow(f, 4.0) + 0.8 * pow(f, 3.0);
    uv.x += pow(f, 3.0) - 0.22 * pow(f, 7.0) + 0.9 * pow(f, 8.0);
    uv += vec2(time * 0.22, time * 0.02);
    uv *= size;

    vec2 iPos = floor(uv);
    vec2 fPos = (fract(uv) - 0.5);// * 2.0;

    float maxDist = 9999.9;
    
    for(float y = -1.0; y <= 1.0; y+=1.0){
        for(float x = -1.0; x <= 1.0; x+=1.0){
            vec2 neighbor = vec2(x, y);
            vec2 point = random2d2d(iPos + neighbor);
            point = sin(time + point * twoPi) * 0.4 + 0.5;
            vec2 diff = neighbor + point - fPos;
            float dist = length(diff);

            maxDist = min(maxDist, dist);
        }
    }

    vec3 col1 = mix(gColor, vec3(1.0), pow(maxDist, 12.0));
    color += col1*col1;
    color += pow(fbm(vec3(uv, time*0.2)) * 0.8, 8.0);

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
    color *= pow(vec3(0.0314, 0.3529, 0.5412), vec3(2.4));

    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 camPos = vec3(0.0, 0.0, -5.0);
    vec3 lookPos = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(lookPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, forward));
    up = normalize(cross(forward, right));
    float fov = 1.0;
    vec3 rayDir = normalize(uv.x * right + uv.y * up + fov * forward);

    float d, df = 0.0;
    vec3 p;
    for(int i = 0; i < 256; i++){
        p = camPos + rayDir * d;
        df = distanceFunc(p);
        if(df > 100.0){
            break;
        }
        if(df <= 0.001){
            break;
        }
        d += df;
    }

    if(df <= 0.001){
        vec3 normal = getNormal(p);
        rayDir = refract(rayDir, normal, 0.2);
    }

    float depth = length(p - camPos);
    vec2 uv2 = p.xy / (depth * rayDir.z);

    color += rectLattice(uv2, 6.0);
    color += lattice(uv2, 4.0);
    color += pow(at1 * 0.05, 8.0) * COLOR_T;
    color += pow(at2 * 0.05, 8.0) * COLOR_M;
    color += pow(at3 * 0.05, 8.0) * COLOR_K;
    color += pow(at4 * 0.05, 8.0) * COLOR_H;
    color += pow(at5 * 0.05, 8.0) * COLOR_N;

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}