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
#define COLOR_S2 vec3(0.4235, 0.6, 0.3059)
#define COLOR_S3 vec3(0.6745, 0.8118, 0.5804)

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

float sdEllipse(vec2 p, float r){
    return length(p) - r;
}

float sdRing(vec2 p, float r, float w){
    float outE = step(sdEllipse(p, r), 0.01);
    float inE = step(sdEllipse(p, r - w), 0.01);

    return outE - inE;
}

float sdStar(vec2 uv, float s){
    float pi2 = pi * 2.0;
    float a = atan(uv.y, uv.x) / pi2;
    float seg = a * 5.0;
    a = ((floor(seg)+0.5)/5.0 + mix(s, -s, step(0.5, fract(seg)))) * pi2;
    return abs(dot(vec2(cos(a), sin(a)), uv));
}

vec3 sdBaseBall(vec2 p, float r){
    vec3 color = vec3(0.0);

    float addPosX = r * 1.4;

    float ball = step(sdEllipse(p, r), 0.01);
    vec2 ringPos1 = p - vec2(addPosX, 0.0);
    vec2 ringPos2 = p + vec2(addPosX, 0.0);
    float divide1 = step(sin(atan(ringPos1.y, ringPos1.x) * 30.0 + 1.0), 0.01);
    float divide2 = step(sin(atan(ringPos2.y, ringPos2.x) * 30.0 + 1.0), 0.01);
    float ring1 = sdRing(ringPos1, r, r / 5.0) * divide1;
    float ring2 = sdRing(ringPos2, r, r / 5.0) * divide2;
    color += ball;
    color -= min(ball, ring1) * vec3(0.0, 1.0, 1.0);
    color -= min(ball, ring2) * vec3(0.0, 1.0, 1.0);

    color -= step(sdStar(p, 0.1), 0.02);

    return color;
}

vec3 ballLattice(vec2 uv, vec2 s){
    uv.x *= s.x;
    uv.y *= s.y;
    vec2 iPos = floor(uv);
    vec2 fPos = fract(uv) - 0.5;

    vec3 color = sdBaseBall(fPos * rotate(random2d(iPos) * pi * 2.0), 0.2);

    return color;
}

vec3 starLattice(vec2 uv, vec2 s){
    uv.x *= s.x;
    uv.y *= s.y;
    vec2 iPos = floor(uv);
    vec2 fPos = fract(uv) - 0.5;

    vec3 color = step(sdStar(fPos * rotate(random2d(iPos) * pi * 2.0), 0.1), 0.07) * COLOR_S;

    return color;
}

vec3 sketch(vec2 uv){
    vec3 color = vec3(0.0);
    color += COLOR_S2;
    
    color += ballLattice(uv, vec2(6.0));
    color += starLattice(uv + vec2(0.25), vec2(6.0));

    color *= smoothstep(0.01, 0.0, abs(uv.y - 0.5) - 0.5);
    return color;
}

void main(){
    vec2 uv = gl_FragCoord.xy / resolution;

    float t = uv.x * 7.2 - 2.2 + time + uv.y * 2.2;
    uv.y += sin(t) * 0.05;
    vec3 color = vec3(0.0);

    color = sketch(uv);

    color *= pow(0.8 + ((cos(t) + 1.0) / 2.0) * 0.5, 1.22);

    gl_FragColor = vec4(color, 1.0);
}