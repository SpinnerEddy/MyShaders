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

mat2 rotate(float angle){
    float c = cos(angle);
    float s = sin(angle);
    return mat2(c, -s, s, c);
}

float stroke(float x, float s, float w){
    float d = step(s, x+w*0.5) - step(s, x-w*0.5);
    return clamp(d, 0.0, 1.0);
}

float sdLine(vec2 p, vec2 a, vec2 b){
	vec2 pa = p-a;
	vec2 ba = b-a;
    float h = clamp(dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
    return length(pa - ba*h);
}

vec2 skew(vec2 uv){
    vec2 r = vec2(0.0);
    r.x = 1.1547*uv.x;
    r.y = uv.y+0.5*r.x;
    return r;
}

vec3 simplexGrid(vec2 uv){
    vec3 xyz = vec3(0.0);
    vec2 p = fract(skew(uv));
    if (p.x > p.y) {
        xyz.xy = 1.0-vec2(p.x,p.y-p.x);
        xyz.z = p.y;
    } else {
        xyz.yz = 1.0-vec2(p.x-p.y,p.y);
        xyz.x = p.x;
    }

    return fract(xyz);
}

vec3 traditionalStyle(vec2 uv, float s){
	vec3 col = vec3(0.0);
	vec3 grid = simplexGrid(uv * s);

	float lines = 0.0;
	lines += smoothstep(0.075, -0.075, sdLine(grid.xy, vec2(0.0), vec2(0.33)));
	lines = mix(lines, 1.0, smoothstep(0.075, -0.075, sdLine(grid.yz, vec2(0.0), vec2(0.33))));
	lines = mix(lines, 1.0, smoothstep(0.075, -0.075, sdLine(grid.xz, vec2(0.0), vec2(0.33))));
	lines = mix(lines, 1.0, smoothstep(0.075, -0.075, sdLine(grid.xy, vec2(0.0), vec2(1.0, 0.0))));
	lines = mix(lines, 1.0, smoothstep(0.075, -0.075, sdLine(grid.yz, vec2(0.0), vec2(1.0, 0.0))));
	lines = mix(lines, 1.0, smoothstep(0.075, -0.075, sdLine(grid.xz, vec2(0.0), vec2(0.0, 1.0))));

	col = mix(vec3(0.6941, 0.8078, 0.7137), vec3(0.0784, 0.2549, 0.0353), lines);
	return col;
}

float sinCurtain(vec2 p){
	float offset = 0.2 * sin(p.x) + cos(p.y * p.x*pi+pi*2.0+time * 4.0) * 0.1;
	return stroke(p.x, 0.2 + offset, 0.2);
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);

	color += traditionalStyle(uv + vec2(0.0, time * 0.1), 12.0);
	color = mix(color, vec3(0.8745, 0.9412, 0.8118), sinCurtain(vec2(fract(uv.x * 4.0 + time * 0.7), uv.y)));
    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}