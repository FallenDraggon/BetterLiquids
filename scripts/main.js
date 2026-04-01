
function readString(path){
        return Vars.tree.get(path, true).readString();
 }
function extendShader2(shadername, ext){
	return extendShader(shadername,ext);//extend(Shaders.SurfaceShader, readString("shaders/"+shadername+".frag"),ext);
}

function extendShader(shadername, ext){
	const shad = new Shader(readString("shaders/screenspace.vert"), readString("shaders/"+shadername+".frag"));
	return extend(Shaders.SurfaceShader, "space", Object.assign({
			setVertexAttribute(name, size, type, normalize, stride, buffer) {
				shad.setVertexAttribute(name, size, type, normalize, stride, buffer);
			},
			enableVertexAttribute(location){
				shad.enableVertexAttribute(location);
			},
			disableVertexAttribute(name){
				shad.disableVertexAttribute(name);
				//3553
			},
			fetchUniformLocation(name, pedantic) {
				return shad.fetchUniformLocation(name,pedantic);
			},
			getAttributeLocation(name){
				return shad.getAttributeLocation(name);
			},
			getAttributes(){
				return shad.getAttributes();
			},
			getUniforms(){
				return shad.getUniforms();
			},
			getAttributeSize(name){
				return shad.getAttributeSize(name);
			},
			bind(){
				shad.bind();
			},
			hasUniform(name) {
				return shad.hasUniform(name);
			},
			getUniformType(name) {
				return shad.getUniformType(name);
			},
			getUniformLocation(name) {
				return shad.getUniformLocation(name);
			},
			getUniformSize(name) {
				return shad.getUniformSize(name);
			},
			dispose() {
				shad.dispose();
				this.super$dispose();
			},
			isDisposed() {
				return shad.isDisposed();
			}
		},ext));
}
function addShader(shader, name){
    Shaders[name] = shader;
	let original = CacheLayer[name];
    if(CacheLayer[name]){
        CacheLayer[name].shader = shader;
    }
}

function initShader(){
	Shaders.water = extendShader2("water", {
		apply(){
            if(!flyingbuffer.isDisposed()) {
                flyingbuffer.getTexture().bind(2);
                this.super$apply();
                this.setUniformi("u_flying", 2);
                this.setUniformf("mscl",new Vec2(300.0,60.0));
                this.setUniformf("tscal",1.0);
            }
		}}
	);
	addShader(Shaders.water,"water");

	Shaders.tar = extendShader2("tar", {
		apply(){
            if(!flyingbuffer.isDisposed()) {
                flyingbuffer.getTexture().bind(2);
                this.super$apply();
                this.setUniformi("u_flying", 2);
                this.setUniformf("mscl",new Vec2(300.0,200.0));
                this.setUniformf("tscal",0.2);
		    }
		}}
	);
	addShader(Shaders.tar,"tar");

	Shaders.cryofluid = extendShader2("cryofluid", {
		apply(){
            if(!flyingbuffer.isDisposed()) {
                flyingbuffer.getTexture().bind(2);
                this.super$apply();
                this.setUniformi("u_flying", 2);
                this.setUniformf("mscl",new Vec2(300.0,200.0));
                this.setUniformf("tscal",0.2);
			}
		}}
	);
	addShader(Shaders.cryofluid,"cryofluid");

	Shaders.arkycite = extendShader2("arkycite", {
		apply(){
            if(!flyingbuffer.isDisposed()) {
                flyingbuffer.getTexture().bind(2);
                this.super$apply();
                this.setUniformi("u_flying", 2);
                this.setUniformf("mscl",new Vec2(300.0,200.0));
                this.setUniformf("tscal",0.2);
			}
		}}
	);
	addShader(Shaders.arkycite,"arkycite");

	Shaders.mud = extendShader2("mud", {
		apply(){
            if(!flyingbuffer.isDisposed()) {
                flyingbuffer.getTexture().bind(2);
                this.super$apply();
                this.setUniformi("u_flying", 2);
                this.setUniformf("mscl",new Vec2(100.0,100.0));
                this.setUniformf("tscal",0.02);
			}
		}}
	);
	addShader(Shaders.mud,"mud");

	Shaders.slag = extendShader2("slag", {
	apply(){
        if(!flyingbuffer.isDisposed()) {
            flyingbuffer.getTexture().bind(2);
            this.super$apply();
            this.setUniformi("u_flying", 2);
            this.setUniformf("mscl",new Vec2(300.0,200.0));
            this.setUniformf("tscal",0.2);
        }
    }
	});
	addShader(Shaders.slag,"slag");

}
var flyingbuffer;
Events.run(Trigger.draw, () => {
    if(!flyingbuffer) return;
  if(flyingbuffer.getWidth() != Core.graphics.width || flyingbuffer.getHeight() != Core.graphics.height){
        flyingbuffer.resize(Core.graphics.width, Core.graphics.height);
    }
    Draw.draw(Layer.flyingUnitLow - 0.01, run(() => {
        flyingbuffer.begin(Color.clear);
    }));
    Draw.draw(Layer.flyingUnit + 0.01, run(() => {
        flyingbuffer.end();
        flyingbuffer.blit(Shaders.screenspace);
    }));
});

Events.on(EventType.ClientLoadEvent,
    cons(e => {
        Log.info("Better liquids load")
        flyingbuffer = new FrameBuffer(Core.graphics.width, Core.graphics.height);
        initShader();
    })
);
