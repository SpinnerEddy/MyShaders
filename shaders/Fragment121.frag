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

float cubicInOut(float t) {
	return t < 0.5
	?  4.0 * t * t * t
	: -4.0 * pow(t - 1.0, 3.0) + 1.0;
}

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

float wipe(vec2 p, float t){
    float a = atan(-p.x, -p.y);
    float v = (t * twoPi < a + pi) ? 0.0 : 1.0;
    return v;
}

float ripple(vec2 iPos){
    return sin(length(iPos) * 0.3 - time * 3.0);
}

float border(vec2 iPos){
    return sin(iPos.x * 0.8 - time * 3.0);
}

float swirl(vec2 iPos){
    return sin(atan(iPos.y, iPos.x) * 5.0 + time * 3.0);
}

float sinWave(vec2 iPos){
    float wave = iPos.y + sin(iPos.x * 10.0 + time + 4.0) * 20.5;
    return 0.3 /abs(wave + 0.1);
}

vec3 lattice(vec2 uv, float size) {
    vec2 r = vec2(1, 1.73);
    vec2 h = r*.5;
    vec3 color = vec3(0.0);
    vec2 uv2 = uv * size;
    vec2 a = mod(uv2, r)-h;
    vec2 b = mod(uv2-h, r)-h;
    vec2 gv = dot(a, a) < dot(b,b) ? a : b;
    vec2 iPos = gv - uv2;

    float t = time * 0.8;
    int index = int(mod(t, 4.0));
    float aTime = smoothstep(0.2, 0.8, cubicInOut(mod(t, 1.0)));
    if(index == 0){
        color += mix(ripple(iPos), border(iPos), aTime); 
    }else if(index == 1){
        color += mix(border(iPos), swirl(iPos), aTime); 
    }else if(index == 2){
        color += mix(swirl(iPos), sinWave(iPos), aTime);
    }else{
        color += mix(sinWave(iPos), ripple(iPos), aTime);
    }

    return color;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color.r += lattice(uv, 20.0).r;
    color.g += lattice(uv, 21.0).g;
    color.b += lattice(uv, 22.0).b;

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}

