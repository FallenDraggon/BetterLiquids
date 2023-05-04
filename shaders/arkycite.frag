#define HIGHP

#define S1 vec4(96.0, 131.0, 66.0, 255.0) / 255.0
#define S2 vec3(132.0, 169.0, 79.0) / 255.0
#define S3 vec3(210.0, 221.0, 118.0) / 255.0

#define NSCALE 170.0 / 2.0
#define DSCALE 160.0 / 2.0

uniform sampler2D u_texture;
uniform sampler2D u_noise;
uniform sampler2D u_flying;

uniform vec2 u_campos;
uniform vec2 u_resolution;
uniform float u_time;

varying vec2 v_texCoords;
uniform vec2 mscl;
uniform float tscal;
const float mth = 7.0;
const vec3 sky = vec3(0.5,0.8,1.0);
const vec3 basecol = vec3(0.1,0.5,0.05);

float ridge(float x){
	return min(max(0.5-(2.0*x),2.0*x-0.5),2.5-(2.0*x))-0.5;
}
float getNoise(vec2 p){
	return clamp(0.5+ (texture2D(u_noise,p).r-0.5)*1.7,0.0,1.0);
}

void main(){
    vec2 c = v_texCoords.xy;
    vec2 coords = (c * u_resolution) + u_campos;

    vec4 orig = texture2D(u_texture, c);

    float atime = u_time / 15000.0;
    float noise = (texture2D(u_noise, (coords) / DSCALE + vec2(atime) * vec2(-0.9, 0.8)).r + texture2D(u_noise, (coords) / DSCALE + vec2(atime * 1.1) * vec2(0.8, -1.0)).r) / 2.0;

    noise = abs(noise - 0.5) * 7.0 + 0.23;

    float btime = u_time / 9000.0;

    c += (vec2(
        texture2D(u_noise, (coords) / NSCALE + vec2(btime) * vec2(-0.9, 0.8)).r,
        texture2D(u_noise, (coords) / NSCALE + vec2(btime * 1.1) * vec2(0.8, -1.0)).r
    ) - vec2(0.5)) * 20.0 / u_resolution;

    vec4 color = texture2D(u_texture, c);
	vec3 tempcoolor = color.rgb;

    if(noise > 0.85){
        if(color.g >= (S2).g - 0.1){
            color.rgb = S3;
        }else{
            color.rgb = S2;
        }
    }else if(noise > 0.5){
        color.rgb = S2;
    }

    if(orig.g > 0.01){
        color = max(S1, color);
    }
	
	vec2 v = vec2(1.0/u_resolution.x, 1.0/u_resolution.y);
	vec2 o1 = 0.17*vec2(ridge(texture2D(u_noise,coords/mscl + vec2(btime)).r), ridge(texture2D(u_noise,coords/mscl + vec2(btime*vec2(-1,1))).r));
	vec2 wavecord = c + vec2(sin(btime/3.0 + coords.y/0.75) * v.x, 0.0);
	float hm = min(1.0,texture2D(u_texture, wavecord+vec2(0.0,5.0)*v).a*2.0);
	vec3 cam = normalize(vec3((c.x - 0.5)*(u_resolution.x/u_resolution.y),c.y, 1.0));
	vec3 light = normalize(vec3(0.0 , -0.5 , 0.7));
    vec3 normal =  normalize(vec3(o1.x, o1.y, -1.0));
	vec3 refl = reflect(cam,normal);
	
	vec4 fly = texture2D(u_flying, c+refl.xy*v*30.0);
	
	
	vec3 lightcol = vec3(pow(max(0.0 , -dot(refl,light)),700.0))* (0.8*tempcoolor+vec3(0.2));
	lightcol += sky*(pow(max(0.0 , -dot(refl,light)),10.0))*0.1;
	lightcol += sky*0.5*(length(o1)*0.8+0.2);
	
	vec3 rgbcol = basecol * vec3(getNoise(floor(coords)*0.10 )+(0.1));
	
	vec3 maincolor = color.rgb - rgbcol.rgb*0.3;
	
    
	
	
	maincolor += hm*lightcol*(1.0-fly.a) + (fly.a*fly.rgb * 0.2);
	maincolor*=(1.0-fly.a*0.2);
		
    gl_FragColor = vec4(maincolor,min(1.0,color.a*6.0));
}
