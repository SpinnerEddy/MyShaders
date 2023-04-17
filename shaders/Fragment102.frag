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

#define pi acos(-1.0)

float random2d(vec2 uv){
    return fract(sin(dot(uv, vec2(124.21, 74.124))) * 12455.751);
}

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

float sdRect(vec2 p, vec2 s){
    vec2 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float lattice(vec2 uv, float s){ 
    float t = (uv.x + uv.y) * 10.0;
    uv *= s;

    vec2 fPos = fract(uv) - 0.5;
    vec2 iPos = floor(uv);

    float len = sin(-4.0 * time + t) * 0.25 + 0.25;

    return step(sdRect(fPos, vec2(len)), 0.01);
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += lattice(uv, 2.0) * COLOR_N;
    color += lattice(uv, 4.0) * COLOR_T;
    color += lattice(uv, 8.0) * COLOR_M;
    color += lattice(uv, 16.0) * COLOR_K;
    color += lattice(uv, 32.0) * COLOR_H;
    gl_FragColor = vec4(color, 1.0);
}