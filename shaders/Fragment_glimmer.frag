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

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

float random1d2d(vec2 n){
    return fract(sin(dot(n, vec2(12.5467, 74.1245)))*12509.1245);
}

vec2 random2d2d(vec2 n){
    float a = random1d2d(n);
    float b = random1d2d(n+vec2(575.124, 222.12));
    return vec2(a, b);
}

float repeat(float p, float rCoef){
    return mod(p, rCoef) - rCoef * 0.5;
}

vec2 repeat(vec2 p, float rCoef){
    return mod(p, rCoef) - rCoef * 0.5;
}

float sdPlane(vec3 p, vec4 n){
    return dot(p, normalize(n.xyz)) + n.w;
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float sdBox(vec3 p, vec3 s){
    vec3 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

vec2 polarMod(vec2 p, float r) {
    float a =  atan(p.x, p.y) + pi/r;
    float n = pi2 / r;
    a = floor(a/n)*n;
    return p*rotate(-a);
}

vec3 kifs(vec3 p, float t){
    for(int i = 0; i < 4; i++){
        float t1 = t + float(i);
        p.xy *= rotate(t1);
        p.xz *= rotate(t1 * 0.722);

        p = abs(p);
        p -= vec3(3.2, 8.5, 2.4);
    }

    return p;
}

float smoothMin(float d1, float d2, float k){
    float h = exp(-k * d1) + exp(-k * d2);
    return -log(h) / k;
}

float sdTriPrism(vec3 p, vec2 h){
  vec3 q = abs(p);
  return max(q.z-h.y,max(q.x*sin(pi/3.0)+p.y*sin(pi/6.0),-p.y)-h.x*sin(pi/6.0));
}

float distanceFunction(vec3 p){
    float d = 0.0;
    vec3 p1 = p;
    float rt = time * 0.1;
    p1.xy *= rotate(2.15 + rt);
    p1.yz *= rotate(3.8 + rt);
    p1.xz *= rotate(1.0 + rt);
    // p1.z = repeat(p1.z, 70.0);
    // p1.x = repeat(p1.x, 60.0);
    // p1.y = repeat(p1.y, 40.0);
    p1 = kifs(p1, 5.22);
    p1.xy *= rotate(time * 0.1);
    p1.yz *= rotate(time * 0.3);
    p1.xy = polarMod(p1.xy, 20.0);
    d += sdTriPrism(p1, vec2(2.0, 5.5)) * 0.8;

    return d;
}

vec3 getNormal(vec3 p){
    vec2 err = vec2(0.001, 0.0);
    return normalize(vec3(
        distanceFunction(p + err.xyy) - distanceFunction(p - err.xyy),
        distanceFunction(p + err.yxy) - distanceFunction(p - err.yxy),
        distanceFunction(p + err.yyx) - distanceFunction(p - err.yyx)
    ));
}

float starOrb(vec2 uv, vec2 p, float flare){
    float c = 0.0;
    uv -= p;
    float d = length(uv);
    c += 0.2/d;

    float ray = max(0.0, 1.0 - abs(uv.x*uv.y*200.0));
    c += ray*flare;
    uv *= rotate(pi/4.0);
    ray = max(0.0, 1.0 - abs(uv.x*uv.y*500.0));
    c += ray*0.2*flare;

    c *= smoothstep(0.4, 0.2, d);

    return c;
}

vec3 latticeStarField(vec2 uv, float s, vec2 subPos){
    vec3 color = vec3(0.0);

    uv *= s;
    uv += subPos;

    vec2 fPos = fract(uv) - 0.5;
    vec2 iPos = floor(uv);

    for(float y = -1.0; y <= 1.0; y+=1.0){
        for(float x = -1.0; x <= 1.0; x+=1.0){
            vec2 offset = vec2(x, y);
            float n = random1d2d(iPos+offset);
            float s = fract(n*4052.22);
            float star = starOrb(fPos-offset, vec2(n, fract(n*34.24)), smoothstep(0.1, 0.02, s)); 
            color += pow(star * s, 2.0);
        }
    }
    
    return color;
}

vec3 latticeStarFieldRGB(vec2 uv, float s, vec2 subPos){
    vec3 color = vec3(0.0);

    uv *= s;
    uv += subPos;

    vec2 fPos = fract(uv) - 0.5;
    vec2 iPos = floor(uv);

    for(float y = -1.0; y <= 1.0; y+=1.0){
        for(float x = -1.0; x <= 1.0; x+=1.0){
            vec2 offset = vec2(x, y);
            float n = random1d2d(iPos+offset);
            float s = fract(n*4052.22);
            float star = starOrb(fPos-offset, vec2(n, fract(n*34.24)), smoothstep(0.1, 0.02, s)); 
            vec3 rgb = sin(vec3(0.18, 0.3569, 0.8118)*fract(n*2232.24)*2445.34)*0.5+0.5;
            color += star * s * rgb;
        }
    }
    
    return color;
}

vec3 background(vec3 rayDir){
    float k = rayDir.y * 0.5 + 0.5;
    vec3 color = vec3(0.0);
    for(float i = 0.0; i <= 1.0; i+=1.0/5.0){
        float depth = fract(time*0.02 + i);
        float scale = mix(3.0, 0.01, depth);
        float fade = depth*smoothstep(100.0, 0.001, depth);
        color += latticeStarField(rayDir.xy*rotate(i*234.25), scale, vec2(i*222.87))*(fade*(sin(i*200.0+time*4.0) * 0.1 + 0.1));
    }
    return mix(vec3(0.0, 0.0, 0.0), color, k);
}

vec3 background(vec2 uv){
    float k = uv.y * 0.5 + 0.5;
    vec3 color = vec3(0.0);
    for(float i = 0.0; i <= 1.0; i+=1.0/4.0){
        float depth = fract(time*0.1 + i);
        float scale = mix(10.0, 0.01, depth);
        float fade = depth*smoothstep(30.0, 0.01, depth);
        color += latticeStarFieldRGB(uv*rotate(i*234.25), scale, vec2(i*222.87))*(fade*(sin(i*10.0+time*2.0) * 0.01 + 0.01));
    }
    return mix(vec3(0.0235, 0.0235, 0.0235), color, k);
}


vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 camPos = vec3(0.0, 5.0, -45.0);
    vec3 lookPos = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(lookPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(forward, up));
    up = normalize(cross(right, forward));
    float fov = 1.0;
    vec3 rayDir = normalize(uv.x * right + uv.y * up + fov * forward);

    float df, d;
    vec3 p;
    for(int i = 0; i < 400; i++){
        p = camPos + rayDir * d;
        df = distanceFunction(p);
        if(df > 100.0){
            break;
        }
        if(df <= 0.0001){
            break;
        }
        d += df;
    }

    if(df <= 0.0001){
        vec3 normal = getNormal(p);
        rayDir = refract(rayDir, normal, 0.9);
    }
    float depth = length(p - camPos);
    vec2 uv2 = p.xy / (depth * rayDir.z);
    color = background(uv2);
    color = mix(color, pow(background(rayDir), vec3(2.0)), smoothstep(0.0, 32.0, d));
    color = pow(color, vec3(0.4545));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}