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

float sdCircle(vec2 p, float r){
    return length(p) - r;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(1.0);

    vec2 p = uv;
    // p.x -= fract(time * 0.4) * 3.0 - 1.5;
    // p.y += sin(time * 10.5) * 0.4;
    float d = sdCircle(p, 0.1);
    d = abs(d - 0.5);

    color = mix(color, vec3(0.16, 0.07, 0.31), smoothstep(d - 0.4, d - 0.4 + 0.02, 0.0));
    color = mix(color, vec3(0.16, 0.80, 0.80), smoothstep(d - 0.2, d - 0.2 + 0.02, 0.0));

    // color -= smoothstep(0.1, -0.1, sdCircle(p, 0.1));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}