
#ifdef GL_ES
precision mediump float;
#endif

uniform vec2 u_resolution;
uniform float u_time;

#define resolution u_resolution
#define time u_time

mat2 rotate(float a){
	float c = cos(a);
	float s = sin(a);
	return mat2(c, -s, s, c);
}

float random(vec3 v) { 
	return fract(sin(dot(v, vec3(12.9898, 78.233, 19.8321))) * 43758.5453);
}

float valueNoise(vec3 v) {
	vec3 i = floor(v);
	vec3 f = smoothstep(0.0, 1.0, fract(v));
	return  mix(
		mix(
			mix(random(i), random(i + vec3(1.0, 0.0, 0.0)), f.x),
			mix(random(i + vec3(0.0, 1.0, 0.0)), random(i + vec3(1.0, 1.0, 0.0)), f.x),
			f.y
		),
		mix(
			mix(random(i + vec3(0.0, 0.0, 1.0)), random(i + vec3(1.0, 0.0, 1.0)), f.x),
			mix(random(i + vec3(0.0, 1.0, 1.0)), random(i + vec3(1.0, 1.0, 1.0)), f.x),
			f.y
		),
		f.z
	);
}

float fbm(vec3 v) {
	float n = 0.0;
	float a = 0.5;
	for (int i = 0; i < 5; i++) {
		n += a * valueNoise(v);
		v *= 2.0;
		a *= 0.5;
	}
	return n;
}

// float smoothMin(float d1, float d2, float k){
// 	float h = exp(-k * d1) + exp(-k * d2);
// 	return -log(h) / k;
// }

float smoothMin(float a, float b, float k){
	float h = clamp(0.5 + 0.5 * (b-a)/k, 0.0, 1.0);
	return mix(b, a, h) - k*h*(1.0-h);
}

float sdSphere(vec3 p, float r){
	return length(p) - r;
}

float sdPlane(vec3 p){
	return p.y + 1.0;
}

float sdGyroid(vec3 p, float s){
	p *= s;
	return 0.7 * abs(dot(sin(p), cos(p.yzx)) / s) - 0.02;
}

float distanceFunc(vec3 p){
	vec3 p1 = p;
	float d = 0.0;
	// p1.xz *= rotate(time);
	float gyroid = sdGyroid(p1, 10.0);
	float sphere = sdSphere(p1, 2.0);
	sphere = abs(sphere) - 0.01;
	d += max(sphere, gyroid);

	// vec3 p2 = p;
	// d = min(d, sdPlane(p2));

	return d;
}

vec3 getNormal(vec3 p){
	vec2 err = vec2(0.0, 0.01);
	return normalize(vec3(
		distanceFunc(p + err.yxx) - distanceFunc(p - err.yxx),
		distanceFunc(p + err.xyx) - distanceFunc(p - err.xyx),
		distanceFunc(p + err.xxy) - distanceFunc(p - err.xxy)
	));
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(0.0);
	float t = time * 0.5;
	vec3 camPos = vec3(3.0 * cos(t), 1.0, 3.0 * sin(t));
	vec3 objectPos = vec3(0.0, 0.0, 0.0);
	vec3 forward = normalize(objectPos - camPos);
	vec3 up = vec3(0.0, 1.0, 0.0);
	vec3 right = normalize(cross(up, forward));
	up = normalize(cross(forward, right));
	float fov = 1.0;
	vec3 rayDir = normalize(uv.x * right + uv.y * up + forward * fov);

	float df, d = 0.0;
	vec3 p;
	bool hit = false;
	for(int i = 0; i < 100; i++){
		p = camPos + rayDir * d;
		df = distanceFunc(p);
		if(df <= 0.0001){
			hit = true;
			break;
		}
		d += df;
	}

	if(hit){
		vec3 normal = getNormal(p);
		vec3 toCam = -rayDir;
		float rim = 1.0 - max(0.0, dot(normal, toCam));
		rim = pow(rim, 4.0);
		color += rim;

		float frenel = dot(normal, normalize(rayDir));
		color += pow(1.0 - abs(frenel), 4.0);
		vec3 dir = vec3(1.0, 1.0, 0.4);
		float d = dot(normalize(p), dir);
		color = mix(color, vec3(0.8392, 0.1922, 0.1922), abs(pow(fract(d * 4.0 + time * 2.0), 10.0)));
		// color = mix(color, vec3(0.9137, 0.1216, 0.1216), abs(fract(d * 2.0 - time)));
	}

	// color *= exp()
	color = mix(color, vec3(0.0, 0.0, 0.0), smoothstep(0.0, 16.0, d));
	color = pow(color, vec3(1.0/sqrt(2.0)));

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution) / min(resolution.x, resolution.y);
    vec3 color = vec3(0.0);

    color += renderingFunc(uv);

    gl_FragColor = vec4(color, 1.0);
}