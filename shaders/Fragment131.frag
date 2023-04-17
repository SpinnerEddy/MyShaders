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

vec3 latticeTex(vec2 uv){
    vec3 col = vec3(0.0);
    float checker = mod(floor(uv.x) + floor(uv.y), 2.0);

    col += checker;
    return col;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

    color += latticeTex((uv - vec2(time * 0.4, 0.0)) * 10.0);
    color = mix(color, latticeTex((uv + vec2(time * 0.4, 0.0)) * 4.0), vec3(step((sin(length(uv) * 10.0 - time * 4.0) + 1.0) * 0.5, 0.5)));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}