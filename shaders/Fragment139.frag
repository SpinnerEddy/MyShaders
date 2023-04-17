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

vec4 lattice(vec2 uv){
    vec3 col = vec3(0.0);
    float a = 0.0;

    float ft = fract((time * 5.7 - uv.x * 5.0 - uv.y * 5.0) * 0.05);  // 0 ~ 1
    // float ft = fract(time * 0.25);  // 0 ~ 1
    vec2 uvShiftVel = mix(vec2(1.0, 1.0), vec2(1.0, 1.0), step(0.5, ft));
    uv += uvShiftVel * time;
    float t1 = linearStep(0.3, 0.7, ft);
    float t2 = linearStep(0.6, 0.9, ft);
    float tCoef = mix(-8.0, 2.0, step(0.5, ft));
    vec3 baseCol = mix(vec3(1.0, 0.0, 0.0), vec3(0.0, 0.0, 1.0), step(0.5, ft));
    float baseRippleCoef = mix(4.0, 12.0, step(0.5, ft));
    vec3 baseRippleCol1 = mix(COLOR_N, vec3(1.0), step(0.5, ft));
    vec3 baseRippleCol2 = mix(vec3(1.0), COLOR_N, step(0.5, ft));

    vec2 fPos = (fract(uv) - 0.5) * 2.0;
    // col.rgb += sin((length(fPos) * baseRippleCoef) - time * tCoef) * 0.5 + 0.5 * baseCol;
    col.rgb += mix(baseRippleCol1, baseRippleCol2, sin((length(fPos) * baseRippleCoef) - time * tCoef) * 0.5 + 0.5);
    // col.rg = fPos;

    return vec4(col, a);
}

vec4 renderingFunc(vec2 uv){
    vec4 color = vec4(0.0);

    uv *= 5.0;

    color = lattice(uv);
    color.a = 1.0;

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

    gl_FragColor = renderingFunc(uv);
}