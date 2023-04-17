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
float at = 0.0;

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

float smoothMin(float a, float b, float k){
    float h = clamp(0.5 + 0.5 * (b-a)/k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

float sdPlane(vec3 p){
    return p.y;
}

float plane(vec3 p){
    return sdPlane(p);
}

float sdBox(vec3 p, vec3 s){
    vec3 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(max(q.x, q.y), q.z), 0.0);
}

float box(vec3 p){
    return sdBox(p, vec3(0.7));
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float sphere(vec3 p){
    return sdSphere(p, 1.0);
}

float sdGyroid(vec3 p, float coef){
    p *= coef;
    return abs(0.4 * dot(-cos(p), sin(p.zxy)) / coef) - 0.02;
}

float gyroid(vec3 p){
    return sdGyroid(p, 8.0);
}

float distanceFunc(vec3 p){
    float d = 0.0;
    vec3 p1 = p;
    p1.xz *= rotate(time * 0.1);
    float box = box(p1 - vec3(0.0, -0.2, 0.0));
    box = abs(box) - 0.03;

    float g = gyroid(p1);
    float boxGyroid = smoothMin(box, g, -0.02);
    d += boxGyroid;

    vec3 p2 = p - vec3(0.0, -1.0, 0.0);
    float plane = plane(p2);
    p2.xz += vec2(time)*0.2;
    p2.y += 5.0;
    float y = sdGyroid(p2, 1.0)*0.6;
    p2.y += 3.0;
    y += sdGyroid(p2, 1.0)*0.6;
    plane += y;
    d = min(d, plane);

    return d;
}

vec3 getNormal(vec3 p){
    vec2 err = vec2(0.0, 0.001);
    return normalize(vec3(
        distanceFunc(p + err.yxx) - distanceFunc(p - err.yxx),
        distanceFunc(p + err.xyx) - distanceFunc(p - err.xyx),
        distanceFunc(p + err.xxy) - distanceFunc(p - err.xxy)
    ));
}

float hash2d1d(vec2 p){
    p = fract(p * vec2(123.423, 261.123));
    p += dot(p + vec2(72.34, 52.12), p + vec2(22.34, 12.55));
    return fract(p.x + p.y);
}

float random2d1d(vec2 p){
    return fract(sin(dot(p, vec2(2221.314, 812.214)))*31412.124);
}

float glitter(vec2 uv){
    uv *= 10.0;
    vec2 iPos = floor(uv);
    vec2 fPos = fract(uv) - 0.5;
    float rn = random2d1d(iPos);

    float d = length(fPos);
    float m = smoothstep(0.5*rn, 0.0, d) / d * 5.0;
    m *= pow(sin(time + fract(rn * 20.0) * pi * 2.0) * 0.5 + 0.5, 50.0);
    return m;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 camPos = vec3(0.0, 1.0, -3.0);
    vec3 lookPos = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(lookPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, forward));
    up = normalize(cross(forward, right));
    float fov = 1.0;
    vec3 rayDir = normalize(uv.x * right + uv.y * up + forward * fov);

    float d = 0.0;
    float df = 0.0;
    vec3 p = vec3(0.0);
    for(int i = 0; i < 500; i++){
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
        vec3 r = reflect(rayDir, normal);
        vec3 lv = -normalize(p);
        float diff = dot(normal, lv) * 0.5 + 0.5;
        color += diff;
        float cd = length(p);

        if(cd > 1.2){
            // color *= COLOR_N;
            vec3 gp = -lv;
            gp.xz *= rotate(time * 0.1);
            float s = gyroid(gp);
            float w = cd * 0.01;
            color *= smoothstep(-w, w, s);

            color += glitter(p.xz) * smoothstep(-w, w, s);
            color /= pow(cd, 3.0);
        }
    }
    
    float uv2 = dot(uv, uv);
    float light = 0.002 / uv2;
    color += light * smoothstep(0.0, 0.5, d - 3.2);

    color = pow(color, vec3(0.4545));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);
    // color += glitter(uv);

    gl_FragColor = vec4(color, 1.0);
}