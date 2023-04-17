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
#define pi2 pi*2.0

struct RayInfo{
    vec3 camPos;
    vec3 rayDir;
    vec3 color;
    bool isHit;
    vec3 reflectionAttenuation;
};

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);

    return mat2(c, -s, s, c);
}

vec3 repeat(vec3 p, vec3 rCoef){
    return mod(p, rCoef) - rCoef * 0.5;
}

vec2 repeat(vec2 p, vec2 rCoef){
    return mod(p, rCoef) - rCoef * 0.5;
}

float repeat(float p, float rCoef){
    return mod(p, rCoef) - rCoef * 0.5;
}

float dfSubtraction(float d1, float d2){
    return max(d1, -d2);
}

float dfUnion(float d1, float d2){
    return min(d1, d2);
}


vec3 kifs(vec3 p, float t, int iter){
    for(int i = 0; i < iter; i++){
        float t1 = t + float(i);
        p.yz *= rotate(t1 * p.z * 0.01);
        p = abs(p);
        p -= vec3(1.5, 0.3, 0.1);
    }

    return p;
}

vec2 polarMod(vec2 p, float r) {
    float a =  atan(p.x, p.y) + pi/r;
    float n = pi2 / r;
    a = floor(a/n)*n;
    return p*rotate(-a);
}

float sdBox(vec3 p, vec3 s){
    vec3 q = abs(p) - s;
    return length(max(q, 0.0))+min(max(q.x, max(q.y, q.z)), 0.0);
}

float dBox(vec3 p){
    p.y -= 2.0;
    return sdBox(p, vec3(1.0));
}

float sdBoundingBox(vec3 p, vec3 s){
    float box = sdBox(p, s);
    vec3 subS = s * 0.8;
    vec3 addS = s * 0.2 + 0.01;
    float subBox1 = sdBox(p, subS+vec3(addS.x, 0.0, 0.0));
    float subBox2 = sdBox(p, subS+vec3(0.0, addS.y, 0.0));
    float subBox3 = sdBox(p, subS+vec3(0.0, 0.0, addS.z));
    
    return dfSubtraction(dfSubtraction(dfSubtraction(box, subBox1), subBox2), subBox3);
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float dSphereT(vec3 p){
    return sdSphere(p + vec3(1.5, 0.0, 1.5), 1.0);
}

float dSphereM(vec3 p){
    return sdSphere(p + vec3(-1.5, 0.0, 1.5), 1.0);
}

float dSphereK(vec3 p){
    return sdSphere(p + vec3(-1.5, 0.0, -1.5), 1.0);
}

float dSphereH(vec3 p){
    return sdSphere(p + vec3(1.5, 0.0, -1.5), 1.0);
}

float sdPlane(vec3 p, vec3 n, float h){
    return dot(p, normalize(n)) + h;
}

float dPlane(vec3 p){
    return sdPlane(p, vec3(0.0, 1.0, 0.0), 1.0);
}

float dObject(vec3 p){
    return dPlane(p);
}

float distanceFunc(vec3 p){
    float d = 0.0;
    float plane = dPlane(p);
    d += plane;

    float sphere = dSphereT(p);
    d = min(d, sphere);
    sphere = dSphereM(p);
    d = min(d, sphere);
    sphere = dSphereK(p);
    d = min(d, sphere);
    sphere = dSphereH(p);
    d = min(d, sphere);
    
    return d;
}

vec3 getNormal(vec3 p){
    vec2 err = vec2(0.001, 0.0);
    return normalize(vec3(distanceFunc(p+err.xyy)-distanceFunc(p-err.xyy),
                          distanceFunc(p+err.yxy)-distanceFunc(p-err.yxy),
                          distanceFunc(p+err.yyx)-distanceFunc(p-err.yyx)));
}

float getAO(vec3 p, vec3 n){
    float occ = 0.0;
    float sca = 1.0;

    for(int i = 0; i < 5; i++){
        float h = 0.01 + 0.12 * float(i) / 4.0;
        float d = distanceFunc(p + h * n);
        occ += (h - d) * sca;
        if(occ > 0.35){
            break;
        }
    }

    return clamp(1.0 - 3.0 * occ, 0.0, 1.0) * (0.5 + 0.5 * n.y);
}

float getSoftShadow(vec3 camPos, vec3 rayDir, float tMin, float tMax){
    float tp = (0.8 - camPos.y) / rayDir.y;
    if(tp > 0.0){
        tMax = min(tMax, tp);
    }

    float res = 1.0;
    float t = tMin;
    for(int i = 0; i < 24; i++){
        float h = distanceFunc(camPos + rayDir * t);
        float s = clamp(8.0 * h / t, 0.0, 1.0);
        res = min(res, s * s * (3.0 - 2.0 * s));
        t += clamp(h, 0.02, 0.2);
        if(res < 0.004 || tMax < t){
            break;
        }
    }

    return clamp(res, 0.0, 1.0);
}

vec3 acesFilm(vec3 x){
    float a = 2.51;
    float b = 0.03;
    float c = 2.43;
    float d = 0.59;
    float e = 0.14;
    return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0);
}

float fresnelSchlick(float f0, float c){
    return f0 + (1.0 - f0) * pow((1.0 - c), 5.0);
}

RayInfo rayMarching(vec3 camPos, vec3 rayDir, vec3 reflectionAttenuation){
    RayInfo info;
    info.camPos = camPos;
    info.rayDir = rayDir;
    info.color = vec3(0.0);
    info.isHit = false;
    info.reflectionAttenuation = reflectionAttenuation;

    vec3 p;
    float d, df = 0.0;
    for(int i = 0; i < 400; i++){
        p = camPos + rayDir * d;
        df = distanceFunc(p);
        if(df <= 0.0001){
            info.isHit = true;
            break;
        }
        d += df;
    }

    if(info.isHit){
        vec3 normal = getNormal(p);
        vec3 light = normalize(vec3(-1.0, 1.0, -1.0));

        vec3 ref = reflect(rayDir, normal);
        float f0 = 1.0;

        vec3 albedo = vec3(1.0);
        float metalic = 0.5;
        if(dPlane(p) < 0.0001){
            float chenker = mod(floor(p.x) + floor(p.z), 2.0);
            albedo = mix(COLOR_N, vec3(1.0), chenker);
            metalic = 0.3;
            f0 = 0.5;
        }
        if(dSphereT(p) < 0.0001){
            albedo = COLOR_T;
            metalic = 0.3;
            f0 = 0.1;
        }
        if(dSphereM(p) < 0.0001){
            albedo = COLOR_M;
            metalic = 0.3;
            f0 = 0.1;
        }
        if(dSphereK(p) < 0.0001){
            albedo = COLOR_K;
            metalic = 0.3;
            f0 = 0.1;
        }
        if(dSphereH(p) < 0.0001){
            albedo = COLOR_H;
            metalic = 0.3;
            f0 = 0.1;
        }

        float diffuse = clamp(dot(normal, light), 0.0, 1.0);
        float specular = pow(clamp(dot(reflect(light, normal), rayDir) ,0.0, 1.0), 10.0);
        float ao = getAO(p, normal);
        float shadow = getSoftShadow(p, light, 0.25, 3.0);

        info.color += albedo * diffuse * shadow * (1.0 - metalic);
        info.color += albedo * specular * shadow * metalic;
        info.color += albedo * ao * mix(vec3(0.0), vec3(1.0), 0.45);

        float fog = exp(-0.022 * d);
        info.color = mix(COLOR_N, info.color, fog);

        info.reflectionAttenuation *= albedo * fresnelSchlick(f0, dot(ref, normal));

        info.camPos = p + 0.01 * normal;
        info.rayDir = ref;
    }else{
        info.color = mix(vec3(0.15, 0.34, 0.6)/2.0, vec3(0.7), rayDir.y);
    }
    float fog = (1.0 - clamp(d/30.0, 0.0, 1.0));
    info.color *= pow(fog, 2.0);

    return info;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 camPos  = vec3(3.0 * cos(time), 2.0, -3.0 * sin(time));
    vec3 lookPos = vec3(0.0, 0.0, 0.0);
    vec3 forward = normalize(lookPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(forward, up));
    up = normalize(cross(right, forward));
    float camFov = 60.0;
    float fov = tan((camFov/360.0) * pi);
    vec3 rayDir = normalize(uv.x * right + uv.y * up + forward * fov);

    vec3 ra = vec3(1.0);
    for(int i = 0; i < 3; i++){
        RayInfo info = rayMarching(camPos, rayDir, ra);
        color += info.reflectionAttenuation * info.color * ra;
        if(!info.isHit){
            break;
        }
        ra = info.reflectionAttenuation;
        camPos = info.camPos;
        rayDir = info.rayDir;
    }

    color = acesFilm(color*2.2);

    color = pow(color, vec3(1.0/2.2));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy)/min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);
    
    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}