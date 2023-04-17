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

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

float sdBox(vec3 p, vec3 s){
    vec3 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float distanceFunc(vec3 p){
    vec3 p1 = p;
    p1.xz *= rotate(time * 0.5);
    p1.xy *= rotate(time * 0.3);
    float box = sdBox(p1, vec3(0.5, 0.5, 0.5));

    return box;
}

vec3 getNormal(vec3 p){
    vec2 err = vec2(0.001, 0.0);

    return normalize(vec3(
        distanceFunc(p + err.xyy) - distanceFunc(p - err.xyy),
        distanceFunc(p + err.yxy) - distanceFunc(p - err.yxy),
        distanceFunc(p + err.yyx) - distanceFunc(p - err.yyx)
    ));
}

vec3 backgroundTexture(vec2 uv){
    vec3 col = vec3(0.0);

    uv *= rotate(time * 0.2 + sin(time * 2.0) * 0.9);
    float wave = uv.y + sin(uv.x * cos(uv.x * uv.x * 10.0 - time * 5.0)) * 0.7;
    float glowLine = 0.02/abs(wave);
    float glowLineDot = dot(glowLine, glowLine);

    float wave2 = uv.x + sin(uv.y * cos(uv.y * uv.y * 7.0 - time * 3.0)) * 0.3;
    float glowLine2 = 0.02/abs(wave2);
    float glowLineDot2 = dot(glowLine2, glowLine2);
    col = mix(COLOR_N, vec3(1.0), vec3(glowLineDot + glowLineDot2));

    return col;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 camPos = vec3(0.0, 0.0, -2.0);
    vec3 lookPos = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(lookPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, forward));
    up = normalize(cross(forward, right));
    float fov = 1.0;
    vec3 rayDir = normalize(uv.x * right + uv.y * up + fov * forward);

    vec3 p;
    float d, df;
    for(int i = 0; i < 400; i++){
        p = camPos + rayDir * d;
        df = distanceFunc(p);
        if(df > 100.0){
            break;
        }
        if(df <= 0.001){
            break;
        }
        d += df;
    }

    if(df <= 0.001){
        vec3 normal = getNormal(p);
        rayDir = refract(rayDir, normal, 0.0002);
    }

    float depth = length(p - camPos);
    vec2 uv2 = p.xy / (depth * rayDir.z);

    float cMap = (1.0 - length(uv2)) * (1.0 - length(uv2));
    color.r += backgroundTexture(uv2 - vec2(0.1 * cMap)).r;
    color.g += backgroundTexture(uv2 - vec2(0.00 * cMap)).g;
    color.b += backgroundTexture(uv2 + vec2(0.1 * cMap)).b;


    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}