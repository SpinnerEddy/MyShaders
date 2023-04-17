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

vec3 lattice(vec2 uv, float size){
    vec3 col = vec3(0.0);
    uv *= size;
    uv.x += step(1.0, mod(uv.y, 2.0)) * 0.5;
    vec2 fPos = (fract(uv) - 0.5) * 2.0;
    vec2 iPos = floor(uv);
    float ellipses = smoothstep(-0.4, 0.4, length(fPos) - (0.4 + 0.5 * sin(time * 4.0 - iPos.y * 0.3)));
    col += mix(COLOR_N, vec3(1.0), ellipses);

    return col;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color += lattice(uv, 10.0);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}