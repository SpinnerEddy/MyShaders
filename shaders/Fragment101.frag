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

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    uv = abs(uv * 1.2) - 0.5;
    uv *= rotate(time);

    uv = abs(uv * 0.8) - 0.3;
    uv *= rotate(time*0.9);

    uv = abs(uv * 1.5) - 0.42;
    uv *= rotate(time*0.8);

    float a = atan(uv.y, uv.x) - time * 0.9;
    float t = sin(a * 5.0) * (0.5 / abs(sin(length(uv * 15.0) - time * 5.0)));
    t -= abs(sin(length(uv*3.0) - time * 5.0));
    t -= abs(sin(length(uv*7.0) + time * 3.0));
    color += 0.2 / abs(1.1 + t - length(uv)) * COLOR_N;

    vec2 axis = 1.0 - smoothstep(-0.2, 0.2, abs(uv));
    color += 0.1/(axis.x + axis.y) * COLOR_N;

    gl_FragColor = vec4(color, 1.0);
}