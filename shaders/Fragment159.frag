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

float pi = acos(-1.0);
vec2 mainPoint;
float voronoiStrength = 0.02;

mat2 rotate(float angle){
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

vec2 random2d2d(vec2 p){
    return fract(sin(vec2(dot(p.xy,vec2(12.532,95.235)), dot(p.xy,vec2(42.532,65.235))))*24627.1245);
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

vec3 voronoi(vec2 uv, float s)
{
    vec2 uv2 = uv * s;

    vec2 iPos= floor(uv2);
    vec2 fPos = fract(uv2);

    vec3 returnParam = vec3(0.0);
    float dist = 999.0;
    vec2 point = vec2(8.0);
    vec2 offset = vec2(8.0);
    vec2 diff = vec2(8.0);
    for(int y = -1; y <= 1; y++){
        for(int x = -1 ; x <= 1; x++){
            vec2 o = vec2(float(x), float(y));
            vec2 p = random2d2d(iPos + o);

            vec2 di = o + p - fPos;
            float d = dot(di, di);

            point = mix(point, p, (1.0 - step(dist, d)));
            offset = mix(offset, o, (1.0 - step(dist, d)));
            diff = mix(diff, di, (1.0 - step(dist, d)));
            dist = mix(dist, d, (1.0 - step(dist, d)));
        }
    }

    dist = 999.0;
    for(int y = -2; y <= 2; y++){
        for(int x = -2 ; x <= 2; x++){
            vec2 o = offset + vec2(float(x), float(y));
            vec2 p = random2d2d(iPos + o);

            vec2 di = o + p - fPos;

            dist = mix(dist, min(dist, dot(0.5*(diff+di), normalize(di-diff))), (1.0 - step(dot(diff-di, diff-di), 0.0001)));
        }
    }

    mainPoint = point;
    returnParam = vec3(dist, diff);

    return returnParam;
}

vec2 polarMod(vec2 p, float r){
    float a = atan(p.x, p.y) + (pi/r);
    float n = pi * 2.0 / r;
    a = floor(a/n) * n;
    return p * rotate(a);
}

float rect(vec2 p, vec2 s){
    vec2 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float ellipse(vec2 p, float r){
    return length(p) - r;
}

float penta(vec2 p){
    vec2 fPolarPos = polarMod(p, 5.0);
    float penta = max(rect(fPolarPos, vec2(0.2)), -rect(fPolarPos, vec2(0.3)));
    return penta;
}

float hex(vec2 p){
    vec2 fPolarPos = polarMod(p, 6.0);
    float penta = max(rect(fPolarPos, vec2(0.2)), -rect(fPolarPos, vec2(0.3)));
    return penta;
}

float cutinPolygon(vec2 uv, float timeSeed){
    float color = 0.0;

    float timer = time * 0.8 + timeSeed;
    int index = int(floor(mod(timer, 4.0)));
    float expCoef = -20.0;

    if(index == 0){
        float iUvY = floor((uv.y * 0.5 + 0.5) * 100.0);
        uv.x += (step(mod(iUvY, 2.0), 0.0) - 0.5) * exp(expCoef * fract(timer)) * 5.0;
        // uv.x += (step(uv.y, 0.0) - 0.5) * exp(-10.0 * fract(timer)) * 5.0;
        vec2 fPos = (fract(uv * 10.0) - 0.5) * 2.0;
        float tile = step(abs(fPos.x), 0.1) + step(abs(fPos.y), 0.1);
        uv *= rotate(time * 0.5);
        color += mix(tile, 1.0 - tile, step(ellipse(uv, 0.5), 0.0));
    }
    else if(index == 1){
        float iUvX = floor((uv.x * 0.5 + 0.5) * 80.0);
        uv.y += (step(mod(iUvX, 2.0), 0.0) - 0.5) * exp(expCoef * fract(timer)) * 5.0;
        float tile = voronoiStrength/voronoi(uv, 4.0).x;
        uv *= rotate(time * 0.5);
        color += mix(1.0 - tile, tile, step(hex(uv), 0.1));
    }
    else if(index == 2){
        float iUvY = floor((uv.y * 0.5 + 0.5) * 20.0);
        uv.x += (step(1.0 - mod(iUvY, 2.0), 0.0) - 0.5) * exp(expCoef * fract(timer)) * 5.0;
        vec2 fPos = (fract(uv * 10.0) - 0.5) * 2.0;
        float tile = step(abs(fPos.x), 0.1) + step(abs(fPos.y), 0.1);
        uv *= rotate(time * 0.5);
        color += mix(tile, 1.0 - tile, step(penta(uv), 0.1));
    }
    else{
        float iUvX = floor((uv.x * 0.5 + 0.5) * 40.0);
        uv.y += (step(1.0 - mod(iUvX, 2.0), 0.0) - 0.5) * exp(expCoef * fract(timer)) * 5.0;
        float tile = voronoiStrength/voronoi(uv, 4.0).x;
        uv *= rotate(time * 0.5);
        color += mix(1.0 - tile, tile, step(rect(uv, vec2(0.5)), 0.0));
    }

    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color.r = cutinPolygon(uv, -0.02);
    color.g = cutinPolygon(uv, 0.0);
    color.b = cutinPolygon(uv, 0.02);

    return color;   
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}