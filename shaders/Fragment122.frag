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
float pi2 = pi * 2.0;

float random(vec3 v) { 
	return fract(sin(dot(v, vec3(12.9898, 78.233, 19.8321))) * 43758.5453);
}

float random(vec2 v) { 
	return fract(sin(dot(v, vec2(12.9898, 78.233))) * 43758.5453);
}

float random(float n){
    return fract(sin(n * 222.222) * 2222.55);
}

vec3 random3d(float n){
    return vec3(random(n), random(n+200.0), random(n+400.0));
}

mat2 rotate(float angle){
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

float fill(float x, float size){
    return 1.0 - step(size, x);
}

float stroke(float x, float s, float w){
    float d = step(s, x + w * 0.5) - step(s, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

float star(vec2 uv, float s){
    float a = atan(uv.y, uv.x) / pi2;
    float seg = a * 5.0;
    a = ((floor(seg)+0.5)/5.0 + mix(s, -s, step(0.5, fract(seg)))) * pi2;
    return abs(dot(vec2(cos(a), sin(a)), uv));
}

float polySDF(vec2 uv, float v){
    float a = atan(uv.x, uv.y) + pi;
    float r = length(uv);
    float vv = pi2 / v;
    return cos(floor(0.5 + a/vv)*vv-a)*r;
}

float wipe(vec2 p, float t){
    float a = atan(-p.x, -p.y);
    float v = (t * pi2 < a + pi) ? 0.0 : 1.0;
    return v;
}

float starFill(vec2 uv, float size, float tSeed){
    float ft = fract(time*0.3+tSeed);

    float rSeed = tSeed * pi2;

    float t1 = linearStep(0.1, 0.4, ft);
    float t2 = linearStep(0.6, 0.9, ft);
    float v1 = wipe(uv*rotate(rSeed), t1);
    float v2 = wipe(uv*rotate(rSeed), t2);

    float s = star(uv.yx, 0.1);
    return fill(s, size) * mix(0.0, 1.0, v1 - v2);
}

float starLine(vec2 uv, float size, float tSeed){
    float ft = fract(time*0.3+tSeed);

    float rSeed = tSeed * pi2;

    float t1 = linearStep(0.1, 0.4, ft);
    float t2 = linearStep(0.6, 0.9, ft);
    float v1 = wipe(uv*rotate(rSeed), t1);
    float v2 = wipe(uv*rotate(rSeed), t2);

    float s =star(uv.yx, 0.1);
    return stroke(s, size, 0.02) * mix(0.0, 1.0, v1 - v2);
}

vec3 starLattice(vec2 uv, float s){
    vec3 color = vec3(0.0);
    uv *= s;
    uv += time;

    vec2 fPos = fract(uv) - 0.5;
    vec2 iPos = floor(uv);

    vec2 p = fPos+vec2(0.0, 0.1);
    
    float seed = random(iPos);
    vec3 col1 = random3d(seed);
    vec3 col2 = random3d(seed+100.0);
    vec3 col3 = random3d(seed+200.0); 
    color += starFill(p, 0.09, seed)*col1;
    color += starLine(p, 0.12, seed + 0.1)*col2;
    color += starLine(p, 0.15, seed + 0.2)*col3;

    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color += starLattice(uv, 5.0);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}