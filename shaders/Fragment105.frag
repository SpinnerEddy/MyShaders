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

float sdRect(vec2 p, vec2 s){
    vec2 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float sdCircle(vec2 p, float r){
    return length(p) - r;
}

vec3 lattice(vec2 uv, float size){
    vec3 color = vec3(0.0);
    vec3 gradateX = mix(COLOR_T, COLOR_M, (uv.x + 1.0) / 2.0);
    vec3 gradateY = mix(COLOR_K, COLOR_H, (uv.y + 1.0) / 2.0);
    uv *= size;

    uv.x += step(1.0, mod(uv.y, 2.0)) * 0.5;

    vec2 iPos = floor(uv);
    vec2 fPos = (fract(uv) - 0.5);// * 2.0;
    
    float angle = pi * 0.25 + (iPos.x * iPos.y) * 0.1;
    color += mix(COLOR_N, mix(gradateX, gradateY, angle/twoPi), smoothstep(0.01, -0.01, sdRect(fPos * rotate(angle), vec2(sqrt(2.0) * 0.25))));

    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color += lattice(uv, 5.0);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}