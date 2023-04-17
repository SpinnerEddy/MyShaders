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

float gTime = 0.0;
float at = 0.0;

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

float random3d1d(vec3 p){
    vec3 randCoef = vec3(24.214214, 56.6235425, 92.2132345);
    return fract(sin(dot(p, randCoef)) * 2134.1351);
}

float smoothMin(float d1, float d2, float k){
    float h = exp(-k * d1) + exp(-k * d2);
    return -log(h) / k;
}

float sdPlane(vec3 p, vec3 n, float h){
  return dot(p,n) + h;
}

float sdHex(vec2 p, float h) {
    vec3 k = vec3(-sqrt(3.0)/2.0, tan(radians(30.0)), 0.5);
    p = abs(p);
    p -= 2.0 * min(dot(k.xz, p), 0.0) * k.xz;
    return length(p - vec2(clamp(p.x, -k.y * h, k.y * h), h)) * sign(p.y - h);
}

float deHexTiling(vec2 p, float radius, float scale) {
    vec2 rep = vec2(2.0 * sqrt(3.0), 2.0) * radius;
    vec2 p1 = mod(p, rep) - rep * 0.5;
    vec2 p2 = mod(p + 0.5 * rep, rep) - rep * 0.5;
    return min(
        sdHex(p1.xy, scale * radius),
        sdHex(p2.xy, scale * radius)
    );
}

float hexPlane(vec3 p) {
    p.xy *= rotate(p.z * 0.42);
    float plane1 = sdPlane(p, normalize(vec3(0.0, -1.0, 0.0)), 2.0);
    float hexPlane1 = max(deHexTiling(p.zx, 0.3, 0.9 + 0.1 * sin(-time * 3.0 + p.z*1.6)), plane1);

    float plane2 = sdPlane(p, normalize(vec3(0.0, 1.0, 0.0)), 2.0);
    float hexPlane2 = max(deHexTiling(p.zx, 0.3, 0.9 + 0.1 * sin(-time * 3.0 + p.z*1.6)), plane2);

    float plane3 = sdPlane(p, normalize(vec3(-1.0, 0.0, 0.0)), 2.0);
    float hexPlane3 = max(deHexTiling(p.yz, 0.3, 0.9 + 0.1 * sin(-time * 3.0 + p.z*1.6)), plane3);

    float plane4 = sdPlane(p, normalize(vec3(1.0, 0.0, 0.0)), 2.0);
    float hexPlane4 = max(deHexTiling(p.yz, 0.3, 0.9 + 0.1 * sin(-time * 3.0 + p.z*1.6)), plane4);

    float d = 0.0;
    d = min(min(min(hexPlane1, hexPlane2), hexPlane3), hexPlane4);
    return d;
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float sdSphere(vec3 iPos, vec3 fPos, vec3 c){
    float r = random3d1d(iPos + c);
    if(r > 0.95){
        r = fract(sin(r)) * 0.3;
    }
    else{ 
        r =- 0.5;
    }

    return length(fPos - c) - r;
}

float sdSphereR(vec3 p){
    float d = 0.0;
    p.z -= time * 6.4;
    vec3 iPos = floor(p);
    vec3 fPos = fract(p);

    d += sdSphere(iPos, fPos, vec3(0.0, 0.0, 0.0));
    d = min(d, sdSphere(iPos, fPos, vec3(0.0, 0.0, 1.0)));
    d = min(d, sdSphere(iPos, fPos, vec3(0.0, 1.0, 0.0)));
    d = min(d, sdSphere(iPos, fPos, vec3(1.0, 0.0, 0.0)));
    d = min(d, sdSphere(iPos, fPos, vec3(1.0, 1.0, 0.0)));
    d = min(d, sdSphere(iPos, fPos, vec3(1.0, 0.0, 1.0)));
    d = min(d, sdSphere(iPos, fPos, vec3(0.0, 1.0, 1.0)));
    d = min(d, sdSphere(iPos, fPos, vec3(1.0, 1.0, 1.0)));

    return d;
}

float distanceFunc(vec3 p){
    float d = 0.0;
    vec3 p1 = p;
    d += sdSphereR(p1 + vec3(0.5, 0.0, 0.0));
    at += d/30.0;
    
    vec3 p2 = p;
    d = smoothMin(d, hexPlane(p2), 3.0);

    return d;
}

vec3 getNormal(vec3 p){
    float err = 0.001;
    return normalize(vec3(distanceFunc(p + vec3(err, 0.0, 0.0)) - distanceFunc(p - vec3(err, 0.0, 0.0)),
                          distanceFunc(p + vec3(0.0, err, 0.0)) - distanceFunc(p - vec3(0.0, err, 0.0)),
                          distanceFunc(p + vec3(0.0, 0.0, err)) - distanceFunc(p - vec3(0.0, 0.0, err))));
}

vec3 renderingFunc(vec2 uv){
    gTime = time * 3.0;
    vec3 color = vec3(0.0);
    vec3 camPos = vec3(0.0, 0.0, -3.0 + gTime);
    vec3 lookPos = vec3(0.0, 0.0, 0.0+ gTime);
    vec3 forward = normalize(lookPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(up, forward));
    up = normalize(cross(forward, right));
    float fov = 1.0;
    vec3 rayDir = normalize(uv.x * right + uv.y * up + fov * forward);
    vec3 lightPos = vec3(5.0, 0.0, -10.0 + gTime);

    float df = 0.0;
    float d = 0.0;
    vec3 p;
    for(int i = 0; i < 100; i++){
        p = camPos + rayDir * d;
        df = distanceFunc(p);
        if(df > 100.0){
            break;
        }
        if(df <= 0.0001){
            break;
        }
        d += df;
        at += df*0.1;
    }

    if(df <= 0.0001){
        vec3 lv = lightPos - p;
        vec3 normal = getNormal(p);
        float l = clamp(dot(normal, normalize(lv)), 0.0, 1.0);
        color += pow(l, 200.0);
    }

    color = mix(color, COLOR_N, smoothstep(0.0, 16.0, d));
    color += at/5.0 * COLOR_N;

    color = pow(color, vec3(0.4545));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}