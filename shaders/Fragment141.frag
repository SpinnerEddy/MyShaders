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
float twoPi = pi * 2.0;

vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

float snoise(vec2 v) {
    const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                        0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                        -0.577350269189626,  // -1.0 + 2.0 * C.x
                        0.024390243902439); // 1.0 / 41.0
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod289(i); // Avoid truncation effects in permutation
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
        + i.x + vec3(0.0, i1.x, 1.0 ));

    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

float random1d2d(vec2 p){
    return fract(sin(dot(p, vec2(23.6425, 79.1245))) * 24212.45123);
}

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

float easeInOutExpo(float t) {
    if (t == 0.0 || t == 1.0) {
        return t;
    }
    if ((t *= 2.0) < 1.0) {
        return 0.5 * pow(2.0, 10.0 * (t - 1.0));
    } else {
        return 0.5 * (-pow(2.0, -10.0 * (t - 1.0)) + 2.0);
    }
}

mat2 rotate(float a){
    float c = cos(a);
    float s = sin(a);
    return mat2(c, -s, s, c);
}

vec3 noiseTunnel(vec2 pt){
  float rInv = 1.0 / length(pt);
  pt = pt * rInv - vec2(rInv+time*1.7);
  vec3 tunnel = vec3(snoise(2.0*pt)+rInv/3.0);
  vec3 col = mix(vec3(0.0), vec3(1.0), tunnel);
  return col;
}


vec3 lattice(vec2 uv, float scl){
    uv *= scl;
    vec3 col = vec3(0.0);
    vec2 fPos = fract(uv) - 0.5;

    col += 0.1/dot(fPos, fPos);

    return col;
}

vec4 renderingFunc(vec2 uv){
    vec4 color = vec4(0.0);

    // color.rgb += 0.01 / dot(uv, uv);
    vec2 rOffset = vec2(random1d2d(vec2(floor(uv.x * 30.0), floor(uv.y * 40.0)))*0.07, 0.0);
    vec2 gOffset = vec2(random1d2d(vec2(floor(uv.x * 40.0), floor(uv.y * 50.0)))*0.08, 0.0);
    vec2 bOffset = vec2(random1d2d(vec2(floor(uv.x * 50.0), floor(uv.y * 60.0)))*0.09, 0.0);

    
    color.r = noiseTunnel(uv + rOffset).r*.19;
    color.g = noiseTunnel(uv + gOffset).g*.19;
    color.b = noiseTunnel(uv + bOffset).b*.19;
    color.rgb += noiseTunnel(uv);
    color.a = 1.0;

    color.rgb = pow(color.rgb, vec3(2.9));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);

    gl_FragColor = renderingFunc(uv);
}