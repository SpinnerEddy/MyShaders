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

float sdEllipse(vec2 uv, float r){
    return length(uv) - r;
}

vec3 lattice(vec2 uv, float s){ 
    uv *= s;

    vec3 color = vec3(0.0);
    vec2 iPos = floor(uv);
    vec2 addPos = vec2(0.0, mod(iPos.x, 2.0) * 0.5);
    vec2 fPos = fract(uv + addPos) - 0.5;

    color += smoothstep(-0.1, 0.1, sdEllipse(fPos, sin(time + iPos.x * 0.065) * 0.5 + 0.5));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    uv *= rotate(-pi/12.0);

    color += lattice(uv, 12.0) * COLOR_N;
    gl_FragColor = vec4(color, 1.0);
}