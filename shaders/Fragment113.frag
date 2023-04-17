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

float sdPlane(vec3 p){
    return p.y;
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float sdSphere(vec3 iPos, vec3 fPos, vec3 c){
    float r = random3d1d(iPos + c);
    if(r > 0.99){
        r = fract(sin(r) * 1000.0) * 0.1;
    }
    else{ 
        r =- 0.1;
    }

    return length(fPos - c) - r;
}

float sdSphereR(vec3 p){
    float d = 0.0;
    p.y -= time * 2.4;
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
    // d += sdSphere(p1 - vec3(0.0, 0.5, 0.0), 0.5);
    d += sdSphereR(p1);

    return d;
}

vec3 getNormal(vec3 p){
    float err = 0.001;
    return normalize(vec3(distanceFunc(p + vec3(err, 0.0, 0.0)) - distanceFunc(p - vec3(err, 0.0, 0.0)),
                          distanceFunc(p + vec3(0.0, err, 0.0)) - distanceFunc(p - vec3(0.0, err, 0.0)),
                          distanceFunc(p + vec3(0.0, 0.0, err)) - distanceFunc(p - vec3(0.0, 0.0, err))));
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
    vec3 rayDir = normalize(uv.x * right + uv.y * up + fov * forward);
    vec3 lightPos = vec3(5.0, 5.0, -5.0);

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
    }

    if(df <= 0.0001){
        vec3 lv = lightPos - p;
        vec3 normal = getNormal(p);
        float l = clamp(dot(normal, normalize(lv)), 0.0, 1.0);
        color += l;
    }

    // color = mix(COLOR_N, vec3(1.0), smoothstep(0.0, 16.0, d));

    color = pow(color, vec3(0.4545));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}