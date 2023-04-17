#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define resolution u_resolution
#define time u_time

#define COLOR_T vec3(0.313, 0.816, 0.816)
#define COLOR_M vec3(0.745, 0.118, 0.243)

float pi = acos(-1.0);
float pi2 = pi * 2.0;

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

vec3 repeat(vec3 p, float interval){
    return mod(p, interval) - interval * 0.5;
}

vec2 repeat(vec2 p, float interval){
    return mod(p, interval) - interval * 0.5;
}

float sdBox(vec3 p, vec3 b){
    return length(max(abs(p) - b, 0.0));
}

float sdSphere(vec3 p, float r){
    return length(p) - r;
}

float sdBar(vec2 p, float interval, float w){
    return length(max(abs(repeat(p, interval)) - w, 0.0));
}

float sdTube(vec2 p, float interval, float w){
    return length(repeat(p, interval)) - w;
}

float dCage(vec3 p){
    float bar1 = sdBar(p.yz, 1.5, 0.1);
    float bar2 = sdBar(p.xz, 1.5, 0.1);
    float bar3 = sdBar(p.xy, 1.5, 0.1);

    float tube1 = sdTube(p.yz, 0.1, 0.025);
    float tube2 = sdTube(p.xz, 0.1, 0.025);
    float tube3 = sdTube(p.xy, 0.1, 0.025);

    float tubes = min(min(tube1, tube2), tube3);
    float bars = min(min(bar1, bar2), bar3);

    return max(bars, -tubes);
}

float distanceFunction(vec3 p){
    float d = 0.0;
    p.xy *= rotate(-0.22);
    d += dCage(p);

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

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
    vec3 camPos = vec3(-1.7, 1.3, -1.0 + time);
    vec3 lookPos = vec3(-1.7, 1.3, 0.0 + time);
    vec3 forward = normalize(lookPos - camPos);
    vec3 up = vec3(0.0, 1.0, 0.0);
    vec3 right = normalize(cross(forward, up));
    up = normalize(cross(right, forward));
    float fov = 1.0;
    vec3 rayDir = normalize(uv.x * right + uv.y * up + fov * forward);

    float df, d;
    vec3 p;
    for(int i = 0; i < 200; i++){
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
        vec3 lDir = vec3(-4.0, 2.0, -5.0);
        vec3 normal = getNormal(p);
        vec3 baseColor = vec3(0.0);
        if(dCage(p) <= 0.0001){
            baseColor = COLOR_M;
        }else{
            baseColor = vec3(0.93, 0.93, 1);
        }
        float fog = exp(-0.022 * d);
        color = mix(COLOR_T, color, fog);
        color += clamp(dot(normalize(lDir), normal), 0.1, 1.0) * baseColor;
    }else{
        color = mix(COLOR_T, vec3(1.0), rayDir.y);
    }
    float fog = clamp(d * 0.03, 0.0, 1.0);
    color += fog * COLOR_T;

    color = pow(color, vec3(0.4545));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}