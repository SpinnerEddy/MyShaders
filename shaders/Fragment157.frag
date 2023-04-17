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

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec2 polar = vec2(log(length(uv)), atan(uv.y, uv.x));
    polar.x -= time;
    mat2 matrix = mat2(1.0, -1.0, 1.0, 1.0) * 8.0;
    vec2 uv2 = polar * matrix;
    vec2 values = vec2(sin(uv2.x), sin(uv2.y));
    float swirl1 = step(values.x, 0.2);
    float swirl2 = step(values.y, 0.2);
    vec2 baseUv = uv * 0.5 + 0.5;
    // color += mix(COLOR_N, mix(mix(COLOR_H, COLOR_K, baseUv.x), mix(COLOR_T, COLOR_M, baseUv.x), baseUv.y), min(swirl1, swirl2));
    color += min(swirl1, swirl2);
    // color += swirl1 * 0.5;
    // color += swirl2 * 0.5;
    // color += swirl1;
    // color += swirl2;

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}