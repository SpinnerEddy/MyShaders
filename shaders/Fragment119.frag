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

float random1d1d(float n){
    return sin(n) * 21422.214122;
}

float stroke(float x, float s, float w){
    float d = step(s, x + w * 0.5) - step(s, x - w * 0.5);
    return clamp(d, 0.0, 1.0);
}

float fill(float x, float s){
    return 1.0 - step(s, x);
}

float flip(float c, float d){
    return mix(c, 1.0 - c, d);
}

float sdRect(vec2 p, vec2 s){
    vec2 q = abs(p) - s;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

float sdEllipse(vec2 p, float r){
    return length(p) - r;
}

float elasticOut(float t) {
	return sin(-13.0 * (t + 1.0) * pi / 2.0) * pow(2.0, -10.0 * t) + 1.0;
}

float qinticInOut(float t){
    return (t < 0.5)
            ?  0.5 * pow(2.0 * t, 5.0)
            : -0.5 * pow(2.0 * (t - 1.0), 5.0) + 1.0;
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

float bounceOut(float t) {
	const float a = 4.0 / 11.0;
	const float b = 8.0 / 11.0;
	const float c = 9.0 / 10.0;
	
	const float ca = 4356.0 / 361.0;
	const float cb = 35442.0 / 1805.0;
	const float cc = 16061.0 / 1805.0;
	
	float t2 = t * t;
	
	return t < a
		? 7.5625 * t2
		: t < b
		? 9.075 * t2 - 9.9 * t + 3.4
		: t < c
		? ca * t2 - cb * t + cc
		: 10.8 * t * t - 20.52 * t + 10.72;
}

float bounceIn(float t) {
	return 1.0 - bounceOut(1.0 - t);
}

float bounceInOut(float t) {
	return t < 0.5
	? 0.5 * (1.0 - bounceOut(1.0 - t * 2.0))
	: 0.5 * bounceOut(t * 2.0 - 1.0) + 0.5;
}

float linearStep(float start, float end, float t){
    return clamp((t - start) / (end - start), 0.0, 1.0);
}

float wipe(vec2 p, float t){
    float a = atan(-p.x, -p.y);
    float v = (t * twoPi < a + pi) ? 0.0 : 1.0;
    return v;
}

vec3 renderingFunc(vec2 uv){
    vec3 color = vec3(1.0);

    float it = time * 0.7;
    float ft = mod(it, 7.0);

    /*-----左から青い線が出る -> 縦に広がる -> 背景塗り替え-------*/
    float t1 = 1.0 - linearStep(0.1, 0.4, ft);  // tが0.1 ~ 0.4のときに0から1に動く
    float t2 = linearStep(0.6, 0.9, ft);  // tが0.6 ~ 0.9のときに0から1に動く
    vec2 rectOffsetPos = vec2(-2.2 * easeInOutExpo(t1), 0.0);  // 四角形の位置の変化量
    vec2 rectOffsetSize = vec2(0.0, 0.98 * easeInOutExpo(t2)); // 四角形の大きさの変化量

    float rect = smoothstep(0.02, 0.0, sdRect(uv - rectOffsetPos, vec2(1.0, 0.02) + rectOffsetSize));
    color = mix(color, COLOR_N, rect);

    /*-----4つの円が端から出来て端から消える-------*/
    float circleTT1 = linearStep(1.0, 1.5, ft);  // tが1.0 ~ 1.2のときに0から1に動く
    float circleTT2 = linearStep(1.3, 1.8, ft);  // tが1.3 ~ 1.5のときに0から1に動く
    float circleTM1 = linearStep(1.05, 1.55, ft);  // tが1.05 ~ 1.25のときに0から1に動く
    float circleTM2 = linearStep(1.35, 1.85, ft);  // tが1.35 ~ 1.55のときに0から1に動く
    float circleTK1 = linearStep(1.1, 1.6, ft);  // tが1.1 ~ 1.3のときに0から1に動く
    float circleTK2 = linearStep(1.4, 1.9, ft);  // tが1.4 ~ 1.6のときに0から1に動く
    float circleTH1 = linearStep(1.15, 1.65, ft);  // tが1.15 ~ 1.35のときに0から1に動く
    float circleTH2 = linearStep(1.45, 1.95, ft);  // tが1.45 ~ 1.65のときに0から1に動く

    vec2 offsetTE = vec2(0.3, 0.2);
    float ellipseT1 = wipe(uv - offsetTE, easeInOutExpo(circleTT1)) * stroke(sdEllipse(uv - offsetTE, 0.3), 0.05, 0.2);
    float ellipseT2 = wipe(uv - offsetTE, easeInOutExpo(circleTT2)) * stroke(sdEllipse(uv - offsetTE, 0.3), 0.05, 0.2);
    color = mix(color, COLOR_T, ellipseT1 - ellipseT2);

    vec2 offsetME = vec2(-0.2, 0.3);
    float ellipseM1 = wipe(uv - offsetME, easeInOutExpo(circleTM1)) * stroke(sdEllipse(uv - offsetME, 0.3), 0.05, 0.2);
    float ellipseM2 = wipe(uv - offsetME, easeInOutExpo(circleTM2)) * stroke(sdEllipse(uv - offsetME, 0.3), 0.05, 0.2);
    color = mix(color, COLOR_M, ellipseM1 - ellipseM2);

    vec2 offsetKE = vec2(0.3, -0.2);
    float ellipseK1 = wipe(uv - offsetKE, easeInOutExpo(circleTK1)) * stroke(sdEllipse(uv - offsetKE, 0.3), 0.05, 0.2);
    float ellipseK2 = wipe(uv - offsetKE, easeInOutExpo(circleTK2)) * stroke(sdEllipse(uv - offsetKE, 0.3), 0.05, 0.2);
    color = mix(color, COLOR_K, ellipseK1 - ellipseK2);

    vec2 offsetHE = vec2(-0.2, -0.3);
    float ellipseH1 = wipe(uv - offsetHE, easeInOutExpo(circleTH1)) * stroke(sdEllipse(uv - offsetHE, 0.3), 0.05, 0.2);
    float ellipseH2 = wipe(uv - offsetHE, easeInOutExpo(circleTH2)) * stroke(sdEllipse(uv - offsetHE, 0.3), 0.05, 0.2);
    color = mix(color, COLOR_H, ellipseH1 - ellipseH2);

    /*-----バウンドを伴う動きで円が登場-------*/
    float boundingEllipseTime = 1.0 - linearStep(2.15, 2.85, ft);  // tが2.15 ~ 2.85のときに0から1に動く    
    vec2 boundOffsetPos = vec2(0.0, 2.2 * bounceIn(boundingEllipseTime));  // 四角形の位置の変化量

    /*-----円が4色に分かれて分裂-------*/
    float ct = linearStep(3.0, 3.8, ft);
    float rt = linearStep(4.2, 5.0, ft);
    float st = linearStep(5.2, 6.0, ft);
    float subT = ct - rt;
    float vt = 1.0 - bounceInOut(st);
    vec2 offsetTC = vec2(-0.5 * easeInOutExpo(subT), 0.5 * easeInOutExpo(subT));
    vec2 offsetMC = vec2(0.5 * easeInOutExpo(subT),  0.5 * easeInOutExpo(subT));
    vec2 offsetKC = vec2(0.5 * easeInOutExpo(subT), -0.5 * easeInOutExpo(subT));
    vec2 offsetHC = vec2(-0.5 * easeInOutExpo(subT), -0.5 * easeInOutExpo(subT));
    float cOffset = 0.2 - 0.2 * easeInOutExpo(subT);
    float rotateOffset = (pi * 0.5) * easeInOutExpo(subT);
    uv *= rotate(rotateOffset);
    color = mix(color, COLOR_T, smoothstep(0.05*vt, 0.0, sdEllipse(uv - boundOffsetPos - offsetTC, 0.1*vt)));
    color = mix(color, COLOR_M, smoothstep(0.05*vt, 0.0, sdRect(uv - boundOffsetPos - offsetMC, vec2(0.1)*vt)));
    color = mix(color, COLOR_K, smoothstep(0.05*vt, 0.0, sdEllipse(uv - boundOffsetPos - offsetKC, 0.1*vt)));
    color = mix(color, COLOR_H, smoothstep(0.05*vt, 0.0, sdRect(uv - boundOffsetPos - offsetHC, vec2(0.1)*vt)));
    color = mix(color, vec3(1.0), smoothstep(cOffset*vt, 0.0, sdEllipse(uv - boundOffsetPos, cOffset*vt)));

    /*-----左から青い線が出る -> 縦に広がる -> 背景塗り替え-------*/
    float tt1 = 1.0 - linearStep(6.1, 6.4, ft);  // tが2.1 ~ 2.4のときに0から1に動く
    float tt2 = linearStep(6.6, 6.9, ft);  // tが2.6 ~ 2.9のときに0から1に動く
    float mt1 = 1.0 - linearStep(6.15, 6.45, ft);  // tが2.15 ~ 2.45のときに0から1に動く
    float mt2 = linearStep(6.6, 6.9, ft);  // tが2.6 ~ 2.9のときに0から1に動く
    float kt1 = 1.0 - linearStep(6.2, 6.5, ft);  // tが2.2 ~ 2.5のときに0から1に動く
    float kt2 = linearStep(6.6, 6.9, ft);  // tが2.6 ~ 2.9のときに0から1に動く
    float ht1 = 1.0 - linearStep(6.25, 6.55, ft);  // tが2.25 ~ 2.55のときに0から1に動く
    float ht2 = linearStep(6.6, 6.9, ft);  // tが2.6 ~ 2.9のときに0から1に動く

    vec2 rectOffsetPosT = vec2(-4.2 * easeInOutExpo(tt1), 0.0);  // 四角形の位置の変化量
    vec2 rectOffsetSizeT = vec2(0.0, 3.98 * easeInOutExpo(tt2)); // 四角形の大きさの変化量
    vec2 rectPosT = (uv - rectOffsetPosT) - vec2(0.0, 0.15);
    float rectT = smoothstep(0.02, 0.0, sdRect(rectPosT, vec2(1.0, 0.02)));
    color = mix(color, COLOR_T, rectT);
    float spreadRectT = smoothstep(0.02, 0.0, sdRect(rectPosT, vec2(1.0, 0.02) + rectOffsetSizeT));
    color = mix(color, vec3(1.0), spreadRectT);

    vec2 rectOffsetPosM = vec2(4.2 * easeInOutExpo(mt1), 0.0);  // 四角形の位置の変化量
    vec2 rectOffsetSizeM = vec2(0.0, 3.98 * easeInOutExpo(mt2)); // 四角形の大きさの変化量
    vec2 rectPosM = (uv - rectOffsetPosM) + vec2(0.0, 0.15);
    float rectM = smoothstep(0.02, 0.0, sdRect(rectPosM, vec2(1.0, 0.02)));
    color = mix(color, COLOR_M, rectM);
    float spreadRectM = smoothstep(0.02, 0.0, sdRect(rectPosM, vec2(1.0, 0.02) + rectOffsetSizeM));
    color = mix(color, vec3(1.0), spreadRectM);

    vec2 rectOffsetPosK = vec2(-4.2 * easeInOutExpo(kt1), 0.0);  // 四角形の位置の変化量
    vec2 rectOffsetSizeK = vec2(0.0, 3.98 * easeInOutExpo(kt2)); // 四角形の大きさの変化量
    vec2 rectPosK = (uv - rectOffsetPosK) + vec2(0.0, 0.45);
    float rectK = smoothstep(0.02, 0.0, sdRect(rectPosK, vec2(1.0, 0.02)));
    color = mix(color, COLOR_K, rectK);
    float spreadRectK = smoothstep(0.02, 0.0, sdRect(rectPosK, vec2(1.0, 0.02) + rectOffsetSizeK));
    color = mix(color, vec3(1.0), spreadRectK);

    vec2 rectOffsetPosH = vec2(4.2 * easeInOutExpo(ht1), 0.0);  // 四角形の位置の変化量
    vec2 rectOffsetSizeH = vec2(0.0, 3.98 * easeInOutExpo(ht2)); // 四角形の大きさの変化量
    vec2 rectPosH = (uv - rectOffsetPosH) - vec2(0.0, 0.45);
    float rectH = smoothstep(0.02, 0.0, sdRect(rectPosH, vec2(1.0, 0.02)));
    color = mix(color, COLOR_H, rectH);
    float spreadRectH = smoothstep(0.02, 0.0, sdRect(rectPosH, vec2(1.0, 0.02) + rectOffsetSizeH));
    color = mix(color, vec3(1.0), spreadRectH);

    return color;
}

void main(){
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    vec3 color = renderingFunc(uv);
    gl_FragColor = vec4(color, 1.0);
}

