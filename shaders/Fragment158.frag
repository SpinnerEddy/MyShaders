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

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

vec2 polarMod(vec2 p, float r){
    float a = atan(p.x, p.y) + (pi/r);
    float n = pi * 2.0 / r;
    a = floor(a/n) * n;
    return p * rotate(a);
}

vec2 repeat(vec2 p, float repCoef){
    return (fract(p/repCoef - 0.5) - 0.5) * repCoef;
}

float sdRect(vec2 p, vec2 s){
    vec2 q  = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float sdFrameRect(vec2 p, vec2 s, float w){
    float outRect = sdRect(p, s);
    float inRect = sdRect(p, s - w);
    return max(outRect, -inRect);
}

float rectFlower(vec2 uv, float tCoef){
    vec2 p = uv * 8.0;
    p = repeat(p, 2.0);
    p = polarMod(p, 18.0);
    vec2 err = vec2(1.0, 0.5);
    for(int i = 0; i < 3; i++){
        p = abs(p);
        p.xy *= rotate(pow(float(i), float(i)) * 0.4);
        p = abs(p);
        p -= err;
        err *= 0.582;
        p = polarMod(p, float(i) + 4.0);
    }

    return sdFrameRect(p, vec2(0.1 * sin(length(uv) + time + tCoef) + 0.4), 0.1);
}


vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec2 uv2 = (uv - 0.5) * 2.0;

    uv *= rotate(time*0.2);
    float a = (atan(uv.y, uv.x) + pi) / (2.0 * pi);
    vec2 polar = vec2(a * 2.0, 0.1 / length(uv)+ time * 0.1);

    color += mix(COLOR_N, COLOR_T, 0.1 / rectFlower(polar, 0.0));
    color = mix(color, COLOR_M, 0.1 / rectFlower(polar, 1.0));
    color = mix(color, COLOR_K, 0.1 / rectFlower(polar, 2.0));
    color = mix(color, COLOR_H, 0.1 / rectFlower(polar, 3.0));

    color += 2.0/length(uv);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}