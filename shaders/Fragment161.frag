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

float random(vec2 p){
    return fract(sin(dot(p, vec2(12.9876, 89.124))) * 76222.2466);
}

mat2 rotate(float angle){
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
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

float triangle(vec2 p){
    vec2 fPolarPos = polarMod(p, 3.0);
    float penta = max(rect(fPolarPos, vec2(0.2)), -rect(fPolarPos, vec2(0.3)));
    return penta;
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

float morphing(vec2 p, float seed){
    float time = time * 1.2 + seed;
    int index = int(floor(mod(time, 4.0)));
    float a = smoothstep(0.1, 0.9, mod(time, 1.0));
    if(index == 0){
        return step(mix(hex(p), rect(p, vec2(0.2)), a), 0.1);
    }else if(index == 1){
        return step(mix(rect(p, vec2(0.2)), ellipse(p, 0.2), a), 0.1);
    }else if(index == 2){
        return step(mix(ellipse(p, 0.2), penta(p), a), 0.1);
    }else{
        return step(mix(penta(p), hex(p), a), 0.1);
    }
}

vec3 lattice(vec2 uv, float s){
    vec3 color = vec3(0.0);
    uv *= s;
    vec2 iPos = floor(uv);
    vec2 fPos = fract(uv) - 0.5;
    float randomNum = random(iPos);

    fPos *= rotate(time * 1.5 + randomNum * 10.0);

    color += step(morphing(fPos, randomNum + randomNum), 0.1);
    color *= vec3(random(iPos), random(iPos + vec2(2.2, 2.2)), random(iPos + vec2(22.2, 22.2)));
    return color;
}

// http://roy.red/posts/infinite-regression/
vec2 cInverse(vec2 a) {
    return vec2(a.x, -a.y) / dot(a, a);
}

vec2 cMul(vec2 a, vec2 b){
    return vec2(a.x*b.x - a.y*b.y, a.x*b.y + a.y*b.x);
}

vec2 cDiv(vec2 a, vec2 b){
    return cMul(a, cInverse(b));
}

vec2 cLog(vec2 a) {
    return vec2(0.5*log(dot(a,a)), atan(a.y, a.x));
}

vec2 cExp(vec2 a) {
    return exp(a.x) * vec2(cos(a.y), sin(a.y));
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    // http://roy.red/posts/infinite-regression/
    float ratio = 5.264;
    float r1 = 0.1;
    float r2 = 1.0;
    float scale = log2(r2 / r1);
    float angle = atan(scale/(2.0*pi));
    vec2 uv2 = cDiv(cLog(uv), cExp(vec2(0.0, angle)) * cos(angle));
    uv2.x = mod(uv2.x - time * 0.9, scale);
    vec2 uv3 = cExp(uv2);
    uv3 = abs(uv3);
    float value = pow(ratio, -floor(log(max(uv3.x, uv3.y) * 2.0)/log(ratio)));
    vec2 uv4 = uv3 * value;

    color += 2.0/length(uv4);
    color *= lattice(uv4, 1.0);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}