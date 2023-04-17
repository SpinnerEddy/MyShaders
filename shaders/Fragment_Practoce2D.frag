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

float sdCircle(vec2 uv, float r){
    
}

float stroke(float x, float s, float w){
    float d = step(s, x + w) - step(s, x - w);
    return clamp(d, 0.0, 1.0);
}

float function08(vec2 uv){
    float col = 0.0;

    col += stroke((uv.x - uv.y), 0.0, 0.15);
    col += stroke((uv.x + uv.y), 0.0, 0.15);

    return col;
}

float function07(vec2 uv){
    float col = 0.0;

    col += stroke((uv.x - uv.y), 0.0, 0.15);
    col += stroke((uv.x + uv.y), 0.0, 0.15);

    return col;
}

float function06(vec2 uv){
    float col = 0.0;

    col += stroke((uv.x - uv.y), 0.0, 0.15);

    return col;
}

float function05(vec2 uv){
    float col = 0.0;

    col += stroke(uv.x, cos(uv.y * pi) * 0.15 - 0.25, 0.05);
    col += stroke(uv.x, cos(uv.y * pi) * 0.15, 0.05);
    col += stroke(uv.x, cos(uv.y * pi) * 0.15 + 0.25, 0.05);

    return col;
}

float function04(vec2 uv){
    float col = 0.0;

    col += stroke(uv.x, 0.0, 0.05);

    return col;
}

float function03(vec2 uv){
    float col = 0.0;

    col += step(0.0, (uv.x + uv.y));

    return col;
}

float function02(vec2 uv){
    float col = 0.0;

    col += step(cos(uv.y * pi + pi/2.0) * 0.25, uv.x);

    return col;
}

float function01(vec2 uv){
    float col = 0.0;

    col += step(0.0, uv.x);

    return col;
}

float function00(vec2 uv){
    float col = 0.0;

    return col;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += function07(uv) * COLOR_N;

    gl_FragColor = vec4(color, 1.0);
}