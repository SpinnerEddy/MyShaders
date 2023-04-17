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

float random2d(vec2 uv){
    return fract(sin(dot(uv, vec2(124.21, 74.124))) * 12455.751);
}

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

float wipe(vec2 p, float t){
    float a = atan(-p.x, -p.y);
    float v = (t * twoPi < a + pi) ? 0.0 : 1.0;
    return v;
}

float expInOut(float t){
    return (t == 0.0 || t == 1.0)
            ? t
            : (t < 0.5) 
            ?  0.5 * pow(2.0, 20.0 * (t - 0.5)) 
            : -0.5 * pow(2.0, 20.0 * (0.5 - t)) + 1.0;
}

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

float sdEllipse(vec2 uv, float r){
    return length(uv) - r;
}

float sdRing(vec2 uv, float r, float w){
    float ellipse1 = sdEllipse(uv, r);
    float ellipse2 = sdEllipse(uv, r - w);

    return max(ellipse1, -ellipse2);
}

float easingRing(vec2 uv, float r, float w, float tCoef, float tSeed, float rSeed){
    float t = time * tCoef + tSeed;
    float ft = fract(t);
    float c = 0.0;
    float t1 = linearStep(0.1, 0.4, ft);  // tが0.1 ~ 0.4のときに0から1に動く
    float t2 = linearStep(0.6, 0.9, ft);  // tが0.6 ~ 0.9のときに0から1に動く
    t1 = expInOut(t1);
    t2 = expInOut(t2);
    float v1 = wipe(uv*rotate(rSeed * pi), t1);
    float v2 = wipe(uv*rotate(rSeed * pi), t2);

    c = smoothstep(0.03, -0.03, sdRing(uv, r, w)) * mix(0.0, 1.0, v1 - v2);
    return c;
}

vec3 colorEasingRing(vec2 uv)
{
    vec2 iPos = floor(uv);
    vec2 fPos = fract(uv) - 0.5;
    vec3 color = vec3(0.0);
    color += easingRing(fPos, 0.45, 0.05, 0.22, random2d(iPos) * 0.2, random2d(iPos)) * COLOR_H;
    color += easingRing(fPos, 0.40, 0.05, 0.22, random2d(iPos) * 0.2 + 0.02, random2d(iPos)) * COLOR_H;
    color += easingRing(fPos, 0.35, 0.05, 0.22, random2d(iPos) * 0.2 + 0.04, random2d(iPos)) * COLOR_T;
    color += easingRing(fPos, 0.30, 0.05, 0.22, random2d(iPos) * 0.2 + 0.06, random2d(iPos)) * COLOR_T;
    color += easingRing(fPos, 0.25, 0.05, 0.22, random2d(iPos) * 0.2 + 0.08, random2d(iPos)) * COLOR_M;
    color += easingRing(fPos, 0.20, 0.05, 0.22, random2d(iPos) * 0.2 + 0.1, random2d(iPos)) * COLOR_M;
    color += easingRing(fPos, 0.15, 0.05, 0.22, random2d(iPos) * 0.2 + 0.12, random2d(iPos)) * COLOR_K;
    color += easingRing(fPos, 0.10, 0.05, 0.22, random2d(iPos) * 0.2 + 0.14, random2d(iPos)) * COLOR_K;

    return color;
}

vec3 lattice(vec2 uv, float s, float tCoef){ 
    uv *= s;
    float t = time * tCoef;

    vec3 color = vec3(0.0);
    

    uv.x += fract(t) * 2.0 * ((fract(t) > 0.5) ? (fract(uv.y * 0.5) > 0.5 ? 1.0 : -1.0) : 0.0);
    uv.y += fract(t) * 2.0 * ((fract(t) <= 0.5) ? (fract(uv.x * 0.5) > 0.5 ? 1.0 : -1.0) : 0.0);


    color += colorEasingRing(uv);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);
    float ft = fract(time * 0.2);  // 0 ~ 1

    color += COLOR_N;
    color += lattice(uv, 4.0, 0.0);
    gl_FragColor = vec4(color, 1.0);
}