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

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

float easeInOutExpo(float t) {
    if (t == 0.0 || t == 1.0) {
        return t;
    }
    if ((t *= 2.0) < 1.0) {
        return 0.5 * pow(2.0, 10.0 * (t - 1.0));
    } else {
        return 0.5 * (-pow(2.0, -10.0 * (t - 1.0)) + 2.0);
    }
}

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

float hash2d1d(vec2 p){
    p = fract(p * vec2(234.124, 456.3245));
    p += dot(p, p + 562.2124);
    return fract(p.x * p.y);
}

float squareFrame(vec2 p){
    float k = 1.2;
    p = abs(p);
    return pow(pow(p.x, k) + pow(p.y, k), 1.0/k);
}

vec4 lattice(vec2 uv, vec3 baseColor, bool isSquare, float weight){
    vec3 col = vec3(0.0);

    vec2 iPos = floor(uv);
    vec2 fPos = (fract(uv) - 0.5) * 2.0;

    fPos.x *= mix(1.0, -1.0, step(0.5, hash2d1d(iPos)));
    float s = mix(1.0, -1.0, step(fPos.x + fPos.y, 0.0));

    vec2 cp = fPos - vec2(1.0, 1.0) * s;
    float c = isSquare ? squareFrame(cp) : length(cp);
    float w = 0.01;
    float wei = weight + weight * (sin(length(uv) * 2.2 - time) * 0.5 + 0.5);
    float edge = abs(c - 1.0) - wei;
    float circular = smoothstep(w, -w, edge);
    col += circular;
    col *= baseColor;

    float a = atan(cp.x, cp.y);

    // col += step(0.98, fPos.x) + step(0.98, fPos.y);

    float alpha = cos(a * 2.0) * 0.5 + 0.5;
    col *= mix(0.9, 1.0, alpha);

    float dir = mod(iPos.x + iPos.y, 2.0) * 2.0 - 1.0;
    col *= 1.0 + sin(dir * a * 30.0 + edge * 30.0 - time * 10.0);

    return vec4(col, alpha) * circular;
}

vec4 renderingFunc(vec2 uv){
    vec4 color = vec4(0.0);
    
    float it = time * 0.3;
    float ft = mod(it, 4.0);

    float t1 = linearStep(0.6, 0.8, ft);
    float t2 = linearStep(1.0, 1.2, ft);
    float t3 = linearStep(1.5, 1.8, ft);
    float t4 = linearStep(2.2, 2.6, ft);
    float t5 = linearStep(2.9, 3.4, ft);
    float t6 = linearStep(3.5, 3.9, ft);
    // float scaleCoef = mix(1.0, 5.0,  easeInOutExpo(t1));
    float scaleCoef = mix(1.0, 3.0,  step(0.5, t1));
    scaleCoef = mix(scaleCoef, 5.0,  step(0.5, t2));
    scaleCoef = mix(scaleCoef, 1.0,  easeInOutExpo(t3));
    float theta = mix(0.0, twoPi, easeInOutExpo(t3));
    float effectCoef = mix(1.0, length(-uv) * 4.0, easeInOutExpo(t4));
    theta = mix(theta, 0.0, easeInOutExpo(t5));
    effectCoef = mix(effectCoef, 1.0, easeInOutExpo(t6));

    uv *= scaleCoef * effectCoef;
    uv *= rotate(theta);

    vec4 l1 = lattice(uv, COLOR_T, false, 0.05);
    vec4 l2 = lattice(uv + 0.5, COLOR_M, true, 0.2);
    color = mix(l1, l2, step(l1.a, l2.a));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

    gl_FragColor = renderingFunc(uv);
}