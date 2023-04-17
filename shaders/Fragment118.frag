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

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

float kochSnowFlake(vec2 uv, int iter){
    float color = 0.0;

    uv.x = abs(uv.x);
    float angle = pi * 5.0 / 6.0;
    uv.y += tan(angle) * 0.5;
    vec2 theta = vec2(sin(angle), cos(angle));
    float dotValue = dot(uv - vec2(0.5, 0.0), theta);
    uv -= theta * max(0.0, dotValue) * 2.0;

    angle = twoPi/3.0;
    theta = vec2(sin(angle), cos(angle));
    uv.x += 0.5;
    float scale = 1.0;
    for(int i = 0; i < iter; i++){
        uv *= 3.0;
        scale *= 2.0;
        uv.x -= 1.5;

        uv.x = abs(uv.x);
        uv.x -= 0.5;
        uv -= theta * min(0.0, dot(uv, theta)) * 2.0;
    }

    float d = length(uv - vec2(clamp(uv.x, -1.0, 1.0), 0.0));
    color += smoothstep(0.03, 0.0, d/scale);

    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    color += kochSnowFlake(uv, 4);
    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}

