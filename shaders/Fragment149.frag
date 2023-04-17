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
float twoPi = 2.0 * acos(-1.0);

vec2 mainPoint;

vec2 random2d2d(vec2 p){
    return fract(sin(vec2(dot(p.xy,vec2(12.532,95.235)), dot(p.xy,vec2(42.532,65.235))))*24627.1245);
}

float random1d2d(vec2 p){
    return fract(sin(dot(p.xy, vec2(12.532, 95.235))) * 24627.1245);
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

float orb(vec2 p, float r){
    return r / length(abs(p));
}

vec3 skyTexture(vec2 uv, float size){
    vec2 uv2 = uv * size;
    vec3 col = vec3(0.0);

    vec3 noiseCol = pow(vec3(fbm(vec3(uv2 + vec2(time*0.1, 0.0), 122.2))), vec3(2.0));
    noiseCol += pow(vec3(fbm(vec3(uv2 + vec2(time*0.2, 0.0), 422.2))), vec3(3.2));
    noiseCol += pow(vec3(fbm(vec3(uv2 + vec2(time*0.3, 0.0), 522.2))), vec3(4.0));
    noiseCol += pow(vec3(fbm(vec3(uv2 + vec2(time*0.4, 0.0), 622.2))), vec3(7.0));
    noiseCol += pow(vec3(fbm(vec3(uv2 + vec2(time*0.5, 0.0), 722.2))), vec3(9.0));

    col += mix(COLOR_N, vec3(1.0), pow(noiseCol, vec3(3.0)));

    return col;
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

            // p = 0.5 + 0.5 * sin(time + twoPi * p);

            vec2 di = o + p - fPos;
            float d = dot(di, di);

            //    edge > x
            // if(dist > d){
            //     returnDist = d;
            //     dist = returnDist;
            // }
            // dist = min(dist, d);
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

            // p = 0.5 + 0.5 * sin(time + twoPi * p);

            vec2 di = o + p - fPos;

            dist = mix(dist, min(dist, dot(0.5*(diff+di), normalize(di-diff))), (1.0 - step(dot(diff-di, diff-di), 0.0001)));
        }
    }

    mainPoint = point;
    returnParam = vec3(dist, diff);

    return returnParam;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 c = voronoi(uv, 10.0);
    vec3 skyColor = mix(skyTexture(uv, 3.0), vec3(0.8863, 0.8196, 0.8196), orb(uv - vec2(0.6, 0.7), 0.2 + 0.03 * sin(time * 6.0)));
    color += vec3((sin(length((uv + vec2(0.0, 1.0)) * 10.0) - time * 4.0)) * 0.7 + 0.5) * 0.02/c.x;
    color += mix(vec3(0.0), skyColor, step(mainPoint.x, 0.4));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}