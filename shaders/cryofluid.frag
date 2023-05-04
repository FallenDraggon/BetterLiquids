#define HIGHP

//shades of cryofluid
#define S1 vec3(53.0, 83.0, 93.0) / 100.0
#define S2 vec3(68.0, 90.0, 97.0) / 100.0
#define NSCALE 100.0 / 2.0

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

float ridge(float x){
	return min(max(0.5-(2.0*x),2.0*x-0.5),2.5-(2.0*x))-0.5;
}

void main(){
	float stime = tscal*u_time / 2.0;
	float btime = tscal*u_time / 500.0;
    vec2 c = v_texCoords.xy;
	
	vec2 v = vec2(1.0/u_resolution.x, 1.0/u_resolution.y);
	vec2 coords = vec2(c.x / v.x + u_campos.x, c.y / v.y + u_campos.y);	
	vec2 wavecord = c + vec2(sin(stime/3.0 + coords.y/0.75) * v.x, 0.0);

	vec4 fullcol =  texture2D(u_texture, wavecord);
	vec3 color = fullcol.rgb *0.7;
	float hm = texture2D(u_texture, wavecord+vec2(0.0,4.0)*v).a;
	vec2 o1 = 0.17*vec2(ridge(texture2D(u_noise,coords/mscl + vec2(btime)).r), ridge(texture2D(u_noise,coords/mscl + vec2(btime*vec2(-1,1))).r));
	
	vec3 cam = normalize(vec3((c.x - 0.5)*(u_resolution.x/u_resolution.y),c.y, 1.0));
	vec3 light = normalize(vec3(0.0 , -0.5 , 0.7));
    vec3 normal =  normalize(vec3(o1.x, o1.y, -1.0));
	
	vec3 refl = reflect(cam,normal);	
	vec4 fly = texture2D(u_flying, c+refl.xy*v*30.0);
	
	vec3 fdir = max(vec3(0.0) , vec3(-dot(refl+vec3(0.002 ,o1.x*0.02,0.0),light),-dot(refl,light),-dot(refl-vec3(0.002 ,o1.y*0.02,0.0),light)));
	vec3 lightcol = vec3(pow(fdir, vec3(700.0)))* (0.8*color+vec3(0.2));
	lightcol += sky*(pow(max(0.0 , -dot(refl,light)),1.0))*0.1;
	lightcol += sky*0.5*(length(o1)*0.8+0.2);
	

    float wave = abs(sin(coords.x * 1.1 + coords.y) + 0.1 * sin(2.5 * coords.x) + 0.15 * sin(3.0 * coords.y)) / 30.0;
    float noise = wave + (texture2D(u_noise, (coords) / NSCALE + vec2(btime) * vec2(-0.2, 0.8)).r + texture2D(u_noise, (coords) / NSCALE + vec2(btime * 1.1) * vec2(0.8, -1.0)).r) / 2.0;
   
    if(noise > 0.54 && noise < 0.57){
		color += hm*lightcol*(1.0-fly.a) + (fly.a*fly.rgb * 0.4);
		color*=(1.0-fly.a*0.4);
    }else {
        color += hm*lightcol*(1.0-fly.a) + (fly.a*fly.rgb * 0.2);
		color*=(1.0-fly.a*0.2);
    }

    gl_FragColor = vec4(color.rgb, min(1.0,fullcol.a*6.0));
}
