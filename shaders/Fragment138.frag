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
float twoPi = pi * 2.0;

float random1d1d(float n){
    return sin(n) * 21422.214122;
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

float orb(vec2 p, float r){
    return r / length(abs(p));
}

vec3 lattice(vec2 uv, float size){
    vec3 color = vec3(0.0);
    vec3 gColor = COLOR_T*0.1;
    float f = fbm(vec3(uv, length(uv)));
    uv.y += pow(f, 4.0) - 0.3 * pow(f, 4.0) + 0.8 * pow(f, 3.0);
    uv.x += pow(f, 3.0) - 0.22 * pow(f, 7.0) + 0.9 * pow(f, 8.0);
    // uv += time * 0.22;
    uv *= size;

    vec2 iPos = floor(uv);
    vec2 fPos = (fract(uv) - 0.5);// * 2.0;

    float maxDist = 9999.9;
    
    for(float y = -1.0; y <= 1.0; y+=1.0){
        for(float x = -1.0; x <= 1.0; x+=1.0){
            vec2 neighbor = vec2(x, y);
            vec2 point = random2d2d(iPos + neighbor);
            point = sin(time + point * twoPi) * 0.252 + 0.5;
            vec2 diff = neighbor + point - fPos;
            float dist = length(diff);

            maxDist = min(maxDist, dist);
        }
    }

    vec3 col1 = mix(gColor, vec3(0.0, 0.9333, 1.0), pow(maxDist, 2.0));
    color += pow(col1, vec3(2.0));
    color += pow(fbm(vec3(uv, time*0.1)) * 0.8, 12.0);

    return color;
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

vec3 backgroundTex(vec2 uv, float size){
    vec3 color = vec3(0.0);

    float f = pow(length(skyTexture(uv, size))*5.0, 0.22);
    uv *= size/1.0;
    uv *= f * 1.3;

    color += skyTexture(uv, 3.0);

    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color += mix(backgroundTex(uv, 3.0), vec3(0.8863, 0.8196, 0.8196), orb(uv - vec2(0.6, 0.7), 0.2 + 0.03 * sin(time * 6.0)));
    color += lattice(uv, 3.0);
    color += lattice(uv*length(uv*1.3), 2.0);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}