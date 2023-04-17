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
float pi2 = pi * 2.0;

float fill(float x, float s){
    return 1.0 - step(s, x);
}

float stroke(float x, float s, float w){
    float d = step(s, x+w*0.5) - step(s, x-w*0.5);
    return clamp(d, 0.0, 1.0);
}

float flip(float v, float t){
    return mix(v, 1.0 - v, t);
}

float sdRect(vec2 p, vec2 s){
    return max(abs(p.x / s.x), abs(p.y / s.y));
}

float sdCross(vec2 p, float s){
    vec2 size = vec2(0.25, s);
    return min(sdRect(p, size.xy), sdRect(p, size.yx));
}

float sdCircle(vec2 p, float r){
    return length(p) - r;
}

float sdVesica(vec2 p, float w){
    vec2 offset = vec2(w * 5.0, 0.0);
    return max(sdCircle(p-offset, 0.1), sdCircle(p+offset, 0.1));
}

float sdTriangle(vec2 p){
    p = p * 2.0;
    return max(abs(p.x) * cos(120.0) + p.y * sin(30.0), -p.y * sin(30.0) * 0.4);
}

float sdStar(vec2 p, float s){
    p *= 2.0;
    float a = atan(p.y, p.x) / pi2;
    float seg = a * 5.0;
    a = ((floor(seg) + 0.5)/ 5.0 + mix(s, -s, step(0.5, fract(seg)))) * pi2;
    return abs(dot(vec2(cos(a), sin(a)), p));
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    // 01
    // color += step(0.0, uv.x);

    // 02
    // color += step(cos(uv.y*pi+pi*0.5) * 0.25, uv.x);

    // 03
    // color += step(0.0, (uv.x+uv.y));

    // 04
    // color += stroke(uv.x, 0.0, 0.15);

    // 05
    // float offset = cos(uv.y*pi+pi*0.5) * 0.25;
    // color += stroke(uv.x, 0.28+offset, 0.15);
    // color += stroke(uv.x, 0.0+offset, 0.15);
    // color += stroke(uv.x, -0.28+offset, 0.15);

    // 06
    // float df = (uv.x - uv.y) * 0.5;
    // color += stroke(df, 0.0, 0.1);

    // 07
    // float df = (uv.x - uv.y) * 0.5;
    // color += stroke(df, 0.0, 0.1);
    // df = (uv.x + uv.y) * 0.5;
    // color += stroke(df, 0.0, 0.1);

    // 08
    // color += stroke(sdCircle(uv, 0.5), 0.0, 0.025);

    // 09
    // color += fill(sdCircle(uv, 0.65), 0.0);
    // vec2 offset = vec2(0.15, 0.1);
    // color -= fill(sdCircle(uv - offset, 0.5), 0.0);

    // 10
    // float df = sdRect(uv, vec2(1.0, 1.0));
    // color += stroke(df, 0.5, 0.125);
    // color += fill(df, 0.1);

    // 11
    // float df = sdRect(uv, vec2(1.0, 1.0));
    // color += fill(df, 0.5);
    // float crossDf = sdCross(uv, 1.0);
    // color *= step(0.5, fract(crossDf*4.0));
    // color *= step(1.0, crossDf);
    // color += fill(crossDf, 0.5);
    // color += stroke(df, 0.65, 0.05);
    // color += stroke(df, 0.75, 0.025);

    // 12
    // float rect = sdRect(uv, vec2(0.5, 1.0));
    // float line = (uv.x + uv.y) * 0.5;
    // color += flip(fill(rect, 0.5), stroke(line, 0.0, 0.01));

    // 13
    // vec2 offset = vec2(0.15, 0.0);
    // float left = sdCircle(uv+offset, 0.5);
    // float right = sdCircle(uv-offset, 0.5);
    // color += flip(stroke(left, 0.0, 0.05), fill(right, 0.0));

    // 14
    // float sdf = sdVesica(uv, 0.2);
    // float line = (uv.x + uv.y) * 0.5;
    // color += flip(fill(sdf, 1.0), step(line, 0.0));

    // 15
    // color += fill(sdTriangle(uv), 0.4);
    // uv.y *= -1.0;
    // color -= fill(sdTriangle(uv - vec2(0.0, -0.4)), 0.2);

    // 28
    color += fill(sdStar(uv.yx, 0.1), 0.2);
    color += stroke(sdStar(uv.yx, 0.1), 0.4, 0.1);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    // vec2 uv = gl_FragCoord.xy / resolution;
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}