(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&i(r)}).observe(document,{childList:!0,subtree:!0});function e(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function i(s){if(s.ep)return;s.ep=!0;const n=e(s);fetch(s.href,n)}})();const H={resolutionScale:50,wrapEdges:!0};function L(l){return l*(Math.PI/180)}class I{positions;angles;count;constructor(t,e,i){this.count=t,this.positions=new Float32Array(t*2),this.angles=new Float32Array(t),this.initializeRandom(e,i)}initializeCircle(t,e){const i=t/2,s=e/2,n=Math.min(t,e)*.3;for(let r=0;r<this.count;r++){const a=Math.random()*Math.PI*2,h=Math.sqrt(Math.random())*n;this.positions[r*2]=i+Math.cos(a)*h,this.positions[r*2+1]=s+Math.sin(a)*h,this.angles[r]=a+Math.PI}}initializeRandom(t,e){for(let i=0;i<this.count;i++)this.positions[i*2]=Math.random()*t,this.positions[i*2+1]=Math.random()*e,this.angles[i]=Math.random()*Math.PI*2}initializeRing(t,e){const i=t/2,s=e/2,n=Math.min(t,e)*.4;for(let r=0;r<this.count;r++){const a=r/this.count*Math.PI*2,h=(Math.random()-.5)*20;this.positions[r*2]=i+Math.cos(a)*(n+h),this.positions[r*2+1]=s+Math.sin(a)*(n+h),this.angles[r]=a+Math.PI}}getPosition(t){return[this.positions[t*2],this.positions[t*2+1]]}setPosition(t,e,i){this.positions[t*2]=e,this.positions[t*2+1]=i}reset(t,e,i){t!==this.count&&(this.count=t,this.positions=new Float32Array(t*2),this.angles=new Float32Array(t)),this.initializeRandom(e,i)}}const R={agentCount:5e3,sensorAngle:45,sensorDistance:9,turnSpeed:45,moveSpeed:1,depositAmount:5,followTrailIndex:0,depositTrailIndex:0};class k{params;agents;constructor(t,e,i){this.params={...t},this.agents=new I(t.agentCount,e,i),this.agents.initializeCircle(e,i)}updateAgentCount(t,e,i){t!==this.params.agentCount&&(this.params.agentCount=t,this.agents=new I(t,e,i),this.agents.initializeCircle(e,i))}reset(t,e){this.agents.reset(this.params.agentCount,t,e),this.agents.initializeCircle(t,e)}}const P={diffusionRate:.1,decayRate:.98};class O{params;data;buffer;width;height;constructor(t,e,i){this.params={...t},this.width=e,this.height=i,this.data=new Float32Array(e*i),this.buffer=new Float32Array(e*i)}index(t,e){return e*this.width+t}sample(t,e,i=!1){let s=Math.floor(t),n=Math.floor(e);if(i)s=(s%this.width+this.width)%this.width,n=(n%this.height+this.height)%this.height;else if(s<0||s>=this.width||n<0||n>=this.height)return 0;return this.data[this.index(s,n)]}deposit(t,e,i){const s=Math.floor(t),n=Math.floor(e);s<0||s>=this.width||n<0||n>=this.height||(this.data[this.index(s,n)]+=i)}diffuse(){const{width:t,height:e,data:i,buffer:s,params:n}=this,r=n.diffusionRate;for(let a=0;a<e;a++)for(let h=0;h<t;h++){let u=0,c=0;for(let w=-1;w<=1;w++)for(let p=-1;p<=1;p++){const b=h+p,d=a+w;b>=0&&b<t&&d>=0&&d<e&&(u+=i[this.index(b,d)],c++)}const g=this.index(h,a),m=i[g],v=u/c;s[g]=m+(v-m)*r}this.data.set(s)}decay(){const t=this.params.decayRate;for(let e=0;e<this.data.length;e++)this.data[e]*=t}clear(){this.data.fill(0)}resize(t,e){this.width=t,this.height=e,this.data=new Float32Array(t*e),this.buffer=new Float32Array(t*e)}drawCircle(t,e,i,s){const n=i*i,r=Math.max(0,Math.floor(t-i)),a=Math.min(this.width-1,Math.ceil(t+i)),h=Math.max(0,Math.floor(e-i)),u=Math.min(this.height-1,Math.ceil(e+i));for(let c=h;c<=u;c++)for(let g=r;g<=a;g++){const m=g-t,v=c-e;m*m+v*v<=n&&(this.data[this.index(g,c)]+=s)}}eraseCircle(t,e,i){const s=i*i,n=Math.max(0,Math.floor(t-i)),r=Math.min(this.width-1,Math.ceil(t+i)),a=Math.max(0,Math.floor(e-i)),h=Math.min(this.height-1,Math.ceil(e+i));for(let u=a;u<=h;u++)for(let c=n;c<=r;c++){const g=c-t,m=u-e;g*g+m*m<=s&&(this.data[this.index(c,u)]=0)}}}const $=[[0,.8,.9],[.9,.3,.1],[.2,.9,.3],[.9,.2,.6],[.6,.4,.9],[.9,.9,.2]];class X{gl;width;height;trailTexture;program;quadVAO;textureData;constructor(t,e,i){this.gl=t,this.width=e,this.height=i,this.textureData=new Uint8Array(e*i*4),this.initShaders(),this.initBuffers(),this.initTexture()}initShaders(){const t=this.gl,e=`#version 300 es
    in vec2 a_position;
    out vec2 v_uv;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      // Flip Y to match screen coordinates
      v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
    }`,i=`#version 300 es
    precision highp float;
    in vec2 v_uv;
    uniform sampler2D u_trail;
    out vec4 fragColor;

    void main() {
      vec3 color = texture(u_trail, v_uv).rgb;
      // Add slight background tint
      vec3 bg = vec3(0.0, 0.02, 0.05);
      fragColor = vec4(bg + color, 1.0);
    }`,s=t.createShader(t.VERTEX_SHADER);if(t.shaderSource(s,e),t.compileShader(s),!t.getShaderParameter(s,t.COMPILE_STATUS))throw new Error(`Vertex shader error: ${t.getShaderInfoLog(s)}`);const n=t.createShader(t.FRAGMENT_SHADER);if(t.shaderSource(n,i),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`Fragment shader error: ${t.getShaderInfoLog(n)}`);if(this.program=t.createProgram(),t.attachShader(this.program,s),t.attachShader(this.program,n),t.linkProgram(this.program),!t.getProgramParameter(this.program,t.LINK_STATUS))throw new Error(`Program link error: ${t.getProgramInfoLog(this.program)}`);t.deleteShader(s),t.deleteShader(n)}initBuffers(){const t=this.gl,e=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);this.quadVAO=t.createVertexArray(),t.bindVertexArray(this.quadVAO);const i=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW);const s=t.getAttribLocation(this.program,"a_position");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),t.bindVertexArray(null)}initTexture(){const t=this.gl;this.trailTexture=t.createTexture(),t.bindTexture(t.TEXTURE_2D,this.trailTexture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,this.width,this.height,0,t.RGBA,t.UNSIGNED_BYTE,null),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}render(t){const e=this.gl,i=this.width*this.height;for(let s=0;s<i;s++){const n=s*3,r=s*4;this.textureData[r]=Math.min(255,Math.max(0,Math.floor(t[n]*25))),this.textureData[r+1]=Math.min(255,Math.max(0,Math.floor(t[n+1]*25))),this.textureData[r+2]=Math.min(255,Math.max(0,Math.floor(t[n+2]*25))),this.textureData[r+3]=255}e.bindTexture(e.TEXTURE_2D,this.trailTexture),e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.width,this.height,e.RGBA,e.UNSIGNED_BYTE,this.textureData),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(this.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.trailTexture),e.uniform1i(e.getUniformLocation(this.program,"u_trail"),0),e.bindVertexArray(this.quadVAO),e.drawArrays(e.TRIANGLES,0,6)}resize(t,e){this.width=t,this.height=e,this.textureData=new Uint8Array(t*e*4),this.gl.deleteTexture(this.trailTexture),this.initTexture()}get currentWidth(){return this.width}get currentHeight(){return this.height}}class Y{canvas;renderer;species=[];trails=[];compositeData;params;simWidth;simHeight;running=!1;animationId=0;frameCount=0;fpsTime=0;currentFps=0;onFpsUpdate;onSpeciesChange;onTrailChange;constructor(t,e={}){this.canvas=t,this.params={...H,...e};const i=t.getContext("webgl2",{alpha:!1,antialias:!1,preserveDrawingBuffer:!1});if(!i)throw new Error("WebGL2 not supported");const{width:s,height:n}=this.calculateResolution();this.simWidth=s,this.simHeight=n,this.compositeData=new Float32Array(s*n*3),this.renderer=new X(i,this.simWidth,this.simHeight),this.addTrail({name:"Trail 1",color:$[0],...P}),this.addSpecies({name:"Species 1",...R})}calculateResolution(){const t=this.params.resolutionScale/100;return{width:Math.floor(this.canvas.width*t),height:Math.floor(this.canvas.height*t)}}compositeTrails(){this.compositeData.fill(0);for(const t of this.trails){const e=t.params.color,i=t.data;for(let s=0;s<i.length;s++){const n=i[s],r=s*3;this.compositeData[r]+=e[0]*n,this.compositeData[r+1]+=e[1]*n,this.compositeData[r+2]+=e[2]*n}}}step(){const{simWidth:t,simHeight:e,params:i}=this,s=i.wrapEdges;for(const n of this.species){const{agents:r,params:a}=n,h=L(a.sensorAngle),u=L(a.turnSpeed),c=this.trails[a.followTrailIndex],g=this.trails[a.depositTrailIndex];if(!(!c||!g))for(let m=0;m<r.count;m++){let v=r.positions[m*2],w=r.positions[m*2+1],p=r.angles[m];const b=a.sensorDistance,d=p-h,o=c.sample(v+Math.cos(d)*b,w+Math.sin(d)*b,s),f=c.sample(v+Math.cos(p)*b,w+Math.sin(p)*b,s),C=p+h,S=c.sample(v+Math.cos(C)*b,w+Math.sin(C)*b,s);f>o&&f>S||(f<o&&f<S?p+=(Math.random()<.5?-1:1)*u:o>S?p-=u:S>o?p+=u:p+=(Math.random()-.5)*u*.5);let x=v+Math.cos(p)*a.moveSpeed,y=w+Math.sin(p)*a.moveSpeed;s?(x<0&&(x+=t),x>=t&&(x-=t),y<0&&(y+=e),y>=e&&(y-=e),v=x,w=y):((x<0||x>=t)&&(p=Math.PI-p,x=Math.max(0,Math.min(t-.01,x))),(y<0||y>=e)&&(p=-p,y=Math.max(0,Math.min(e-.01,y))),v=x,w=y),r.positions[m*2]=v,r.positions[m*2+1]=w,r.angles[m]=p,g.deposit(v,w,a.depositAmount)}}for(const n of this.trails)n.diffuse(),n.decay();this.compositeTrails(),this.renderer.render(this.compositeData)}loop=t=>{this.running&&(this.frameCount++,t-this.fpsTime>=1e3&&(this.currentFps=this.frameCount,this.frameCount=0,this.fpsTime=t,this.onFpsUpdate?.(this.currentFps)),this.step(),this.animationId=requestAnimationFrame(this.loop))};start(){this.running||(this.running=!0,this.fpsTime=performance.now(),this.frameCount=0,this.animationId=requestAnimationFrame(this.loop))}stop(){this.running=!1,this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=0)}toggle(){this.running?this.stop():this.start()}reset(){for(const t of this.species)t.reset(this.simWidth,this.simHeight);for(const t of this.trails)t.clear()}resize(t,e){this.canvas.width=t,this.canvas.height=e,this.applyResolution()}applyResolution(){const{width:t,height:e}=this.calculateResolution();if(!(t===this.simWidth&&e===this.simHeight)){this.simWidth=t,this.simHeight=e,this.compositeData=new Float32Array(t*e*3),this.renderer.resize(t,e);for(const i of this.trails)i.resize(t,e);for(const i of this.species)i.reset(t,e)}}addTrail(t){const e=this.trails.length,i={name:`Trail ${e+1}`,color:$[e%$.length],...P,...t},s=new O(i,this.simWidth,this.simHeight);return this.trails.push(s),this.onTrailChange?.(),s}removeTrail(t){if(this.trails.length>1&&t>=0&&t<this.trails.length){this.trails.splice(t,1);for(const e of this.species)e.params.followTrailIndex>=this.trails.length&&(e.params.followTrailIndex=0),e.params.depositTrailIndex>=this.trails.length&&(e.params.depositTrailIndex=0);this.onTrailChange?.()}}getTrails(){return this.trails}getTrailNames(){return this.trails.map(t=>t.params.name)}updateTrailParams(t,e){const i=this.trails[t];i&&Object.assign(i.params,e)}addSpecies(t){const i={name:`Species ${this.species.length+1}`,...R,...t},s=new k(i,this.simWidth,this.simHeight);return this.species.push(s),this.onSpeciesChange?.(),s}removeSpecies(t){this.species.length>1&&t>=0&&t<this.species.length&&(this.species.splice(t,1),this.onSpeciesChange?.())}getSpecies(){return this.species}updateSpeciesParams(t,e){const i=this.species[t];if(!i)return;const s=i.params.agentCount;Object.assign(i.params,e),e.agentCount!==void 0&&e.agentCount!==s&&i.updateAgentCount(e.agentCount,this.simWidth,this.simHeight)}updateParams(t){Object.assign(this.params,t),t.resolutionScale!==void 0&&this.applyResolution()}getParams(){return{...this.params}}setFpsCallback(t){this.onFpsUpdate=t}setSpeciesChangeCallback(t){this.onSpeciesChange=t}setTrailChangeCallback(t){this.onTrailChange=t}getTrail(t){return this.trails[t]}getSimDimensions(){return{width:this.simWidth,height:this.simHeight}}isRunning(){return this.running}getFps(){return this.currentFps}exportConfig(t){return{name:t,createdAt:new Date().toISOString(),params:{...this.params},trails:this.trails.map(e=>({...e.params})),species:this.species.map(e=>({...e.params}))}}loadConfig(t){Object.assign(this.params,t.params),this.applyResolution(),this.trails=[],this.species=[];for(const e of t.trails){const i=new O({...e},this.simWidth,this.simHeight);this.trails.push(i)}for(const e of t.species){const i=new k({...e},this.simWidth,this.simHeight);this.species.push(i)}this.onTrailChange?.(),this.onSpeciesChange?.()}}class _{constructor(t,e,i,s,n="div"){this.parent=t,this.object=e,this.property=i,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(n),this.domElement.classList.add("lil-controller"),this.domElement.classList.add(s),this.$name=document.createElement("div"),this.$name.classList.add("lil-name"),_.nextNameID=_.nextNameID||0,this.$name.id=`lil-gui-name-${++_.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("lil-widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",r=>r.stopPropagation()),this.domElement.addEventListener("keyup",r=>r.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(i)}name(t){return this._name=t,this.$name.textContent=t,this}onChange(t){return this._onChange=t,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(t=!0){return this.disable(!t)}disable(t=!0){return t===this._disabled?this:(this._disabled=t,this.domElement.classList.toggle("lil-disabled",t),this.$disable.toggleAttribute("disabled",t),this)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(t){const e=this.parent.add(this.object,this.property,t);return e.name(this._name),this.destroy(),e}min(t){return this}max(t){return this}step(t){return this}decimals(t){return this}listen(t=!0){return this._listening=t,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const t=this.save();t!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=t}getValue(){return this.object[this.property]}setValue(t){return this.getValue()!==t&&(this.object[this.property]=t,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(t){return this.setValue(t),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class z extends _{constructor(t,e,i){super(t,e,i,"lil-boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function M(l){let t,e;return(t=l.match(/(#|0x)?([a-f0-9]{6})/i))?e=t[2]:(t=l.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?e=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=l.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(e=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),e?"#"+e:!1}const B={isPrimitive:!0,match:l=>typeof l=="string",fromHexString:M,toHexString:M},E={isPrimitive:!0,match:l=>typeof l=="number",fromHexString:l=>parseInt(l.substring(1),16),toHexString:l=>"#"+l.toString(16).padStart(6,0)},N={isPrimitive:!1,match:l=>Array.isArray(l)||ArrayBuffer.isView(l),fromHexString(l,t,e=1){const i=E.fromHexString(l);t[0]=(i>>16&255)/255*e,t[1]=(i>>8&255)/255*e,t[2]=(i&255)/255*e},toHexString([l,t,e],i=1){i=255/i;const s=l*i<<16^t*i<<8^e*i<<0;return E.toHexString(s)}},W={isPrimitive:!1,match:l=>Object(l)===l,fromHexString(l,t,e=1){const i=E.fromHexString(l);t.r=(i>>16&255)/255*e,t.g=(i>>8&255)/255*e,t.b=(i&255)/255*e},toHexString({r:l,g:t,b:e},i=1){i=255/i;const s=l*i<<16^t*i<<8^e*i<<0;return E.toHexString(s)}},j=[B,E,N,W];function G(l){return j.find(t=>t.match(l))}class q extends _{constructor(t,e,i,s){super(t,e,i,"lil-color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=G(this.initialValue),this._rgbScale=s,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const n=M(this.$text.value);n&&this._setValueFromHexString(n)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(t){if(this._format.isPrimitive){const e=this._format.fromHexString(t);this.setValue(e)}else this._format.fromHexString(t,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(t){return this._setValueFromHexString(t),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class D extends _{constructor(t,e,i){super(t,e,i,"lil-function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",s=>{s.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class K extends _{constructor(t,e,i,s,n,r){super(t,e,i,"lil-number"),this._initInput(),this.min(s),this.max(n);const a=r!==void 0;this.step(a?r:this._getImplicitStep(),a),this.updateDisplay()}decimals(t){return this._decimals=t,this.updateDisplay(),this}min(t){return this._min=t,this._onUpdateMinMax(),this}max(t){return this._max=t,this._onUpdateMinMax(),this}step(t,e=!0){return this._step=t,this._stepExplicit=e,this}updateDisplay(){const t=this.getValue();if(this._hasSlider){let e=(t-this._min)/(this._max-this._min);e=Math.max(0,Math.min(e,1)),this.$fill.style.width=e*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?t:t.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches&&(this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any")),this.$widget.appendChild(this.$input),this.$disable=this.$input;const e=()=>{let o=parseFloat(this.$input.value);isNaN(o)||(this._stepExplicit&&(o=this._snap(o)),this.setValue(this._clamp(o)))},i=o=>{const f=parseFloat(this.$input.value);isNaN(f)||(this._snapClampSetValue(f+o),this.$input.value=this.getValue())},s=o=>{o.key==="Enter"&&this.$input.blur(),o.code==="ArrowUp"&&(o.preventDefault(),i(this._step*this._arrowKeyMultiplier(o))),o.code==="ArrowDown"&&(o.preventDefault(),i(this._step*this._arrowKeyMultiplier(o)*-1))},n=o=>{this._inputFocused&&(o.preventDefault(),i(this._step*this._normalizeMouseWheel(o)))};let r=!1,a,h,u,c,g;const m=5,v=o=>{a=o.clientX,h=u=o.clientY,r=!0,c=this.getValue(),g=0,window.addEventListener("mousemove",w),window.addEventListener("mouseup",p)},w=o=>{if(r){const f=o.clientX-a,C=o.clientY-h;Math.abs(C)>m?(o.preventDefault(),this.$input.blur(),r=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(f)>m&&p()}if(!r){const f=o.clientY-u;g-=f*this._step*this._arrowKeyMultiplier(o),c+g>this._max?g=this._max-c:c+g<this._min&&(g=this._min-c),this._snapClampSetValue(c+g)}u=o.clientY},p=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",w),window.removeEventListener("mouseup",p)},b=()=>{this._inputFocused=!0},d=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",e),this.$input.addEventListener("keydown",s),this.$input.addEventListener("wheel",n,{passive:!1}),this.$input.addEventListener("mousedown",v),this.$input.addEventListener("focus",b),this.$input.addEventListener("blur",d)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("lil-slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("lil-fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("lil-has-slider");const t=(d,o,f,C,S)=>(d-o)/(f-o)*(S-C)+C,e=d=>{const o=this.$slider.getBoundingClientRect();let f=t(d,o.left,o.right,this._min,this._max);this._snapClampSetValue(f)},i=d=>{this._setDraggingStyle(!0),e(d.clientX),window.addEventListener("mousemove",s),window.addEventListener("mouseup",n)},s=d=>{e(d.clientX)},n=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",s),window.removeEventListener("mouseup",n)};let r=!1,a,h;const u=d=>{d.preventDefault(),this._setDraggingStyle(!0),e(d.touches[0].clientX),r=!1},c=d=>{d.touches.length>1||(this._hasScrollBar?(a=d.touches[0].clientX,h=d.touches[0].clientY,r=!0):u(d),window.addEventListener("touchmove",g,{passive:!1}),window.addEventListener("touchend",m))},g=d=>{if(r){const o=d.touches[0].clientX-a,f=d.touches[0].clientY-h;Math.abs(o)>Math.abs(f)?u(d):(window.removeEventListener("touchmove",g),window.removeEventListener("touchend",m))}else d.preventDefault(),e(d.touches[0].clientX)},m=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",g),window.removeEventListener("touchend",m)},v=this._callOnFinishChange.bind(this),w=400;let p;const b=d=>{if(Math.abs(d.deltaX)<Math.abs(d.deltaY)&&this._hasScrollBar)return;d.preventDefault();const f=this._normalizeMouseWheel(d)*this._step;this._snapClampSetValue(this.getValue()+f),this.$input.value=this.getValue(),clearTimeout(p),p=setTimeout(v,w)};this.$slider.addEventListener("mousedown",i),this.$slider.addEventListener("touchstart",c,{passive:!1}),this.$slider.addEventListener("wheel",b,{passive:!1})}_setDraggingStyle(t,e="horizontal"){this.$slider&&this.$slider.classList.toggle("lil-active",t),document.body.classList.toggle("lil-dragging",t),document.body.classList.toggle(`lil-${e}`,t)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(t){let{deltaX:e,deltaY:i}=t;return Math.floor(t.deltaY)!==t.deltaY&&t.wheelDelta&&(e=0,i=-t.wheelDelta/120,i*=this._stepExplicit?1:10),e+-i}_arrowKeyMultiplier(t){let e=this._stepExplicit?1:10;return t.shiftKey?e*=10:t.altKey&&(e/=10),e}_snap(t){let e=0;return this._hasMin?e=this._min:this._hasMax&&(e=this._max),t-=e,t=Math.round(t/this._step)*this._step,t+=e,t=parseFloat(t.toPrecision(15)),t}_clamp(t){return t<this._min&&(t=this._min),t>this._max&&(t=this._max),t}_snapClampSetValue(t){this.setValue(this._clamp(this._snap(t)))}get _hasScrollBar(){const t=this.parent.root.$children;return t.scrollHeight>t.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class J extends _{constructor(t,e,i,s){super(t,e,i,"lil-option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("lil-focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("lil-focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(s)}options(t){return this._values=Array.isArray(t)?t:Object.values(t),this._names=Array.isArray(t)?t:Object.keys(t),this.$select.replaceChildren(),this._names.forEach(e=>{const i=document.createElement("option");i.textContent=e,this.$select.appendChild(i)}),this.updateDisplay(),this}updateDisplay(){const t=this.getValue(),e=this._values.indexOf(t);return this.$select.selectedIndex=e,this.$display.textContent=e===-1?t:this._names[e],this}}class Z extends _{constructor(t,e,i){super(t,e,i,"lil-string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",s=>{s.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var Q=`.lil-gui {
  font-family: var(--font-family);
  font-size: var(--font-size);
  line-height: 1;
  font-weight: normal;
  font-style: normal;
  text-align: left;
  color: var(--text-color);
  user-select: none;
  -webkit-user-select: none;
  touch-action: manipulation;
  --background-color: #1f1f1f;
  --text-color: #ebebeb;
  --title-background-color: #111111;
  --title-text-color: #ebebeb;
  --widget-color: #424242;
  --hover-color: #4f4f4f;
  --focus-color: #595959;
  --number-color: #2cc9ff;
  --string-color: #a2db3c;
  --font-size: 11px;
  --input-font-size: 11px;
  --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
  --font-family-mono: Menlo, Monaco, Consolas, "Droid Sans Mono", monospace;
  --padding: 4px;
  --spacing: 4px;
  --widget-height: 20px;
  --title-height: calc(var(--widget-height) + var(--spacing) * 1.25);
  --name-width: 45%;
  --slider-knob-width: 2px;
  --slider-input-width: 27%;
  --color-input-width: 27%;
  --slider-input-min-width: 45px;
  --color-input-min-width: 45px;
  --folder-indent: 7px;
  --widget-padding: 0 0 0 3px;
  --widget-border-radius: 2px;
  --checkbox-size: calc(0.75 * var(--widget-height));
  --scrollbar-width: 5px;
}
.lil-gui, .lil-gui * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
.lil-gui.lil-root {
  width: var(--width, 245px);
  display: flex;
  flex-direction: column;
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-title {
  background: var(--title-background-color);
  color: var(--title-text-color);
}
.lil-gui.lil-root > .lil-children {
  overflow-x: hidden;
  overflow-y: auto;
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar {
  width: var(--scrollbar-width);
  height: var(--scrollbar-width);
  background: var(--background-color);
}
.lil-gui.lil-root > .lil-children::-webkit-scrollbar-thumb {
  border-radius: var(--scrollbar-width);
  background: var(--focus-color);
}
@media (pointer: coarse) {
  .lil-gui.lil-allow-touch-styles, .lil-gui.lil-allow-touch-styles .lil-gui {
    --widget-height: 28px;
    --padding: 6px;
    --spacing: 6px;
    --font-size: 13px;
    --input-font-size: 16px;
    --folder-indent: 10px;
    --scrollbar-width: 7px;
    --slider-input-min-width: 50px;
    --color-input-min-width: 65px;
  }
}
.lil-gui.lil-force-touch-styles, .lil-gui.lil-force-touch-styles .lil-gui {
  --widget-height: 28px;
  --padding: 6px;
  --spacing: 6px;
  --font-size: 13px;
  --input-font-size: 16px;
  --folder-indent: 10px;
  --scrollbar-width: 7px;
  --slider-input-min-width: 50px;
  --color-input-min-width: 65px;
}
.lil-gui.lil-auto-place, .lil-gui.autoPlace {
  max-height: 100%;
  position: fixed;
  top: 0;
  right: 15px;
  z-index: 1001;
}

.lil-controller {
  display: flex;
  align-items: center;
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
}
.lil-controller.lil-disabled {
  opacity: 0.5;
}
.lil-controller.lil-disabled, .lil-controller.lil-disabled * {
  pointer-events: none !important;
}
.lil-controller > .lil-name {
  min-width: var(--name-width);
  flex-shrink: 0;
  white-space: pre;
  padding-right: var(--spacing);
  line-height: var(--widget-height);
}
.lil-controller .lil-widget {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  min-height: var(--widget-height);
}
.lil-controller.lil-string input {
  color: var(--string-color);
}
.lil-controller.lil-boolean {
  cursor: pointer;
}
.lil-controller.lil-color .lil-display {
  width: 100%;
  height: var(--widget-height);
  border-radius: var(--widget-border-radius);
  position: relative;
}
@media (hover: hover) {
  .lil-controller.lil-color .lil-display:hover:before {
    content: " ";
    display: block;
    position: absolute;
    border-radius: var(--widget-border-radius);
    border: 1px solid #fff9;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
  }
}
.lil-controller.lil-color input[type=color] {
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}
.lil-controller.lil-color input[type=text] {
  margin-left: var(--spacing);
  font-family: var(--font-family-mono);
  min-width: var(--color-input-min-width);
  width: var(--color-input-width);
  flex-shrink: 0;
}
.lil-controller.lil-option select {
  opacity: 0;
  position: absolute;
  width: 100%;
  max-width: 100%;
}
.lil-controller.lil-option .lil-display {
  position: relative;
  pointer-events: none;
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  line-height: var(--widget-height);
  max-width: 100%;
  overflow: hidden;
  word-break: break-all;
  padding-left: 0.55em;
  padding-right: 1.75em;
  background: var(--widget-color);
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-display.lil-focus {
    background: var(--focus-color);
  }
}
.lil-controller.lil-option .lil-display.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-option .lil-display:after {
  font-family: "lil-gui";
  content: "↕";
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  padding-right: 0.375em;
}
.lil-controller.lil-option .lil-widget,
.lil-controller.lil-option select {
  cursor: pointer;
}
@media (hover: hover) {
  .lil-controller.lil-option .lil-widget:hover .lil-display {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number input {
  color: var(--number-color);
}
.lil-controller.lil-number.lil-has-slider input {
  margin-left: var(--spacing);
  width: var(--slider-input-width);
  min-width: var(--slider-input-min-width);
  flex-shrink: 0;
}
.lil-controller.lil-number .lil-slider {
  width: 100%;
  height: var(--widget-height);
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
  padding-right: var(--slider-knob-width);
  overflow: hidden;
  cursor: ew-resize;
  touch-action: pan-y;
}
@media (hover: hover) {
  .lil-controller.lil-number .lil-slider:hover {
    background: var(--hover-color);
  }
}
.lil-controller.lil-number .lil-slider.lil-active {
  background: var(--focus-color);
}
.lil-controller.lil-number .lil-slider.lil-active .lil-fill {
  opacity: 0.95;
}
.lil-controller.lil-number .lil-fill {
  height: 100%;
  border-right: var(--slider-knob-width) solid var(--number-color);
  box-sizing: content-box;
}

.lil-dragging .lil-gui {
  --hover-color: var(--widget-color);
}
.lil-dragging * {
  cursor: ew-resize !important;
}
.lil-dragging.lil-vertical * {
  cursor: ns-resize !important;
}

.lil-gui .lil-title {
  height: var(--title-height);
  font-weight: 600;
  padding: 0 var(--padding);
  width: 100%;
  text-align: left;
  background: none;
  text-decoration-skip: objects;
}
.lil-gui .lil-title:before {
  font-family: "lil-gui";
  content: "▾";
  padding-right: 2px;
  display: inline-block;
}
.lil-gui .lil-title:active {
  background: var(--title-background-color);
  opacity: 0.75;
}
@media (hover: hover) {
  body:not(.lil-dragging) .lil-gui .lil-title:hover {
    background: var(--title-background-color);
    opacity: 0.85;
  }
  .lil-gui .lil-title:focus {
    text-decoration: underline var(--focus-color);
  }
}
.lil-gui.lil-root > .lil-title:focus {
  text-decoration: none !important;
}
.lil-gui.lil-closed > .lil-title:before {
  content: "▸";
}
.lil-gui.lil-closed > .lil-children {
  transform: translateY(-7px);
  opacity: 0;
}
.lil-gui.lil-closed:not(.lil-transition) > .lil-children {
  display: none;
}
.lil-gui.lil-transition > .lil-children {
  transition-duration: 300ms;
  transition-property: height, opacity, transform;
  transition-timing-function: cubic-bezier(0.2, 0.6, 0.35, 1);
  overflow: hidden;
  pointer-events: none;
}
.lil-gui .lil-children:empty:before {
  content: "Empty";
  padding: 0 var(--padding);
  margin: var(--spacing) 0;
  display: block;
  height: var(--widget-height);
  font-style: italic;
  line-height: var(--widget-height);
  opacity: 0.5;
}
.lil-gui.lil-root > .lil-children > .lil-gui > .lil-title {
  border: 0 solid var(--widget-color);
  border-width: 1px 0;
  transition: border-color 300ms;
}
.lil-gui.lil-root > .lil-children > .lil-gui.lil-closed > .lil-title {
  border-bottom-color: transparent;
}
.lil-gui + .lil-controller {
  border-top: 1px solid var(--widget-color);
  margin-top: 0;
  padding-top: var(--spacing);
}
.lil-gui .lil-gui .lil-gui > .lil-title {
  border: none;
}
.lil-gui .lil-gui .lil-gui > .lil-children {
  border: none;
  margin-left: var(--folder-indent);
  border-left: 2px solid var(--widget-color);
}
.lil-gui .lil-gui .lil-controller {
  border: none;
}

.lil-gui label, .lil-gui input, .lil-gui button {
  -webkit-tap-highlight-color: transparent;
}
.lil-gui input {
  border: 0;
  outline: none;
  font-family: var(--font-family);
  font-size: var(--input-font-size);
  border-radius: var(--widget-border-radius);
  height: var(--widget-height);
  background: var(--widget-color);
  color: var(--text-color);
  width: 100%;
}
@media (hover: hover) {
  .lil-gui input:hover {
    background: var(--hover-color);
  }
  .lil-gui input:active {
    background: var(--focus-color);
  }
}
.lil-gui input:disabled {
  opacity: 1;
}
.lil-gui input[type=text],
.lil-gui input[type=number] {
  padding: var(--widget-padding);
  -moz-appearance: textfield;
}
.lil-gui input[type=text]:focus,
.lil-gui input[type=number]:focus {
  background: var(--focus-color);
}
.lil-gui input[type=checkbox] {
  appearance: none;
  width: var(--checkbox-size);
  height: var(--checkbox-size);
  border-radius: var(--widget-border-radius);
  text-align: center;
  cursor: pointer;
}
.lil-gui input[type=checkbox]:checked:before {
  font-family: "lil-gui";
  content: "✓";
  font-size: var(--checkbox-size);
  line-height: var(--checkbox-size);
}
@media (hover: hover) {
  .lil-gui input[type=checkbox]:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui button {
  outline: none;
  cursor: pointer;
  font-family: var(--font-family);
  font-size: var(--font-size);
  color: var(--text-color);
  width: 100%;
  border: none;
}
.lil-gui .lil-controller button {
  height: var(--widget-height);
  text-transform: none;
  background: var(--widget-color);
  border-radius: var(--widget-border-radius);
}
@media (hover: hover) {
  .lil-gui .lil-controller button:hover {
    background: var(--hover-color);
  }
  .lil-gui .lil-controller button:focus {
    box-shadow: inset 0 0 0 1px var(--focus-color);
  }
}
.lil-gui .lil-controller button:active {
  background: var(--focus-color);
}

@font-face {
  font-family: "lil-gui";
  src: url("data:application/font-woff2;charset=utf-8;base64,d09GMgABAAAAAALkAAsAAAAABtQAAAKVAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHFQGYACDMgqBBIEbATYCJAMUCwwABCAFhAoHgQQbHAbIDiUFEYVARAAAYQTVWNmz9MxhEgodq49wYRUFKE8GWNiUBxI2LBRaVnc51U83Gmhs0Q7JXWMiz5eteLwrKwuxHO8VFxUX9UpZBs6pa5ABRwHA+t3UxUnH20EvVknRerzQgX6xC/GH6ZUvTcAjAv122dF28OTqCXrPuyaDER30YBA1xnkVutDDo4oCi71Ca7rrV9xS8dZHbPHefsuwIyCpmT7j+MnjAH5X3984UZoFFuJ0yiZ4XEJFxjagEBeqs+e1iyK8Xf/nOuwF+vVK0ur765+vf7txotUi0m3N0m/84RGSrBCNrh8Ee5GjODjF4gnWP+dJrH/Lk9k4oT6d+gr6g/wssA2j64JJGP6cmx554vUZnpZfn6ZfX2bMwPPrlANsB86/DiHjhl0OP+c87+gaJo/gY084s3HoYL/ZkWHTRfBXvvoHnnkHvngKun4KBE/ede7tvq3/vQOxDXB1/fdNz6XbPdcr0Vhpojj9dG+owuSKFsslCi1tgEjirjXdwMiov2EioadxmqTHUCIwo8NgQaeIasAi0fTYSPTbSmwbMOFduyh9wvBrESGY0MtgRjtgQR8Q1bRPohn2UoCRZf9wyYANMXFeJTysqAe0I4mrherOekFdKMrYvJjLvOIUM9SuwYB5DVZUwwVjJJOaUnZCmcEkIZZrKqNvRGRMvmFZsmhP4VMKCSXBhSqUBxgMS7h0cZvEd71AWkEhGWaeMFcNnpqyJkyXgYL7PQ1MoSq0wDAkRtJIijkZSmqYTiSImfLiSWXIZwhRh3Rug2X0kk1Dgj+Iu43u5p98ghopcpSo0Uyc8SnjlYX59WUeaMoDqmVD2TOWD9a4pCRAzf2ECgwGcrHjPOWY9bNxq/OL3I/QjwEAAAA=") format("woff2");
}`;function tt(l){const t=document.createElement("style");t.innerHTML=l;const e=document.querySelector("head link[rel=stylesheet], head style");e?document.head.insertBefore(t,e):document.head.appendChild(t)}let V=!1;class F{constructor({parent:t,autoPlace:e=t===void 0,container:i,width:s,title:n="Controls",closeFolders:r=!1,injectStyles:a=!0,touchStyles:h=!0}={}){if(this.parent=t,this.root=t?t.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("button"),this.$title.classList.add("lil-title"),this.$title.setAttribute("aria-expanded",!0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("lil-children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(n),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("lil-root"),h&&this.domElement.classList.add("lil-allow-touch-styles"),!V&&a&&(tt(Q),V=!0),i?i.appendChild(this.domElement):e&&(this.domElement.classList.add("lil-auto-place","autoPlace"),document.body.appendChild(this.domElement)),s&&this.domElement.style.setProperty("--width",s+"px"),this._closeFolders=r}add(t,e,i,s,n){if(Object(i)===i)return new J(this,t,e,i);const r=t[e];switch(typeof r){case"number":return new K(this,t,e,i,s,n);case"boolean":return new z(this,t,e);case"string":return new Z(this,t,e);case"function":return new D(this,t,e)}console.error(`gui.add failed
	property:`,e,`
	object:`,t,`
	value:`,r)}addColor(t,e,i=1){return new q(this,t,e,i)}addFolder(t){const e=new F({parent:this,title:t});return this.root._closeFolders&&e.close(),e}load(t,e=!0){return t.controllers&&this.controllers.forEach(i=>{i instanceof D||i._name in t.controllers&&i.load(t.controllers[i._name])}),e&&t.folders&&this.folders.forEach(i=>{i._title in t.folders&&i.load(t.folders[i._title])}),this}save(t=!0){const e={controllers:{},folders:{}};return this.controllers.forEach(i=>{if(!(i instanceof D)){if(i._name in e.controllers)throw new Error(`Cannot save GUI with duplicate property "${i._name}"`);e.controllers[i._name]=i.save()}}),t&&this.folders.forEach(i=>{if(i._title in e.folders)throw new Error(`Cannot save GUI with duplicate folder "${i._title}"`);e.folders[i._title]=i.save()}),e}open(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("lil-closed",this._closed),this}close(){return this.open(!1)}_setClosed(t){this._closed!==t&&(this._closed=t,this._callOnOpenClose(this))}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const e=this.$children.clientHeight;this.$children.style.height=e+"px",this.domElement.classList.add("lil-transition");const i=n=>{n.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("lil-transition"),this.$children.removeEventListener("transitionend",i))};this.$children.addEventListener("transitionend",i);const s=t?this.$children.scrollHeight:0;this.domElement.classList.toggle("lil-closed",!t),requestAnimationFrame(()=>{this.$children.style.height=s+"px"})}),this}title(t){return this._title=t,this.$title.textContent=t,this}reset(t=!0){return(t?this.controllersRecursive():this.controllers).forEach(i=>i.reset()),this}onChange(t){return this._onChange=t,this}_callOnChange(t){this.parent&&this.parent._callOnChange(t),this._onChange!==void 0&&this._onChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(t){this.parent&&this.parent._callOnFinishChange(t),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onOpenClose(t){return this._onOpenClose=t,this}_callOnOpenClose(t){this.parent&&this.parent._callOnOpenClose(t),this._onOpenClose!==void 0&&this._onOpenClose.call(this,t)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(t=>t.destroy())}controllersRecursive(){let t=Array.from(this.controllers);return this.folders.forEach(e=>{t=t.concat(e.controllersRecursive())}),t}foldersRecursive(){let t=Array.from(this.folders);return this.folders.forEach(e=>{t=t.concat(e.foldersRecursive())}),t}}const A="slime-ca-configs";class T{static generateId(){return Date.now().toString(36)+Math.random().toString(36).substr(2)}static getAll(){try{const t=localStorage.getItem(A);return t?JSON.parse(t):[]}catch{return[]}}static save(t){const e=this.getAll(),i={id:this.generateId(),name:t.name,createdAt:t.createdAt,config:t};return e.push(i),localStorage.setItem(A,JSON.stringify(e)),i}static delete(t){const e=this.getAll().filter(i=>i.id!==t);localStorage.setItem(A,JSON.stringify(e))}static get(t){return this.getAll().find(e=>e.id===t)}static rename(t,e){const i=this.getAll(),s=i.find(n=>n.id===t);s&&(s.name=e,s.config.name=e,localStorage.setItem(A,JSON.stringify(i)))}}class et{gui;simulation;params;controlState;fpsDisplay;speciesFolders=[];speciesContainer;trailFolders=[];trailsContainer;interactionFolder;trailDrawController=null;presetsFolder;presetState;configSelectController=null;constructor(t){this.simulation=t,this.params=t.getParams(),this.controlState={drawMode:"draw",brushRadius:20,selectedTrailIndex:0},this.fpsDisplay={fps:"0 FPS"},this.presetState={configName:"",selectedConfigId:""},this.gui=new F({title:"Slime Mold Simulation"}),this.setupControls(),t.setFpsCallback(e=>{this.fpsDisplay.fps=`${e} FPS`}),t.setSpeciesChangeCallback(()=>{this.rebuildSpeciesUI()}),t.setTrailChangeCallback(()=>{this.rebuildTrailsUI(),this.rebuildSpeciesUI(),this.rebuildTrailDrawDropdown()})}setupControls(){const t=this.gui.addFolder("Performance");t.add(this.fpsDisplay,"fps").name("Frame Rate").disable().listen(),t.add(this.params,"resolutionScale",25,100,5).name("Resolution Scale %").onChange(a=>{this.simulation.updateParams({resolutionScale:a})}),this.gui.addFolder("Simulation").add(this.params,"wrapEdges").name("Wrap Edges").onChange(a=>{this.simulation.updateParams({wrapEdges:a})}),this.trailsContainer=this.gui.addFolder("Trails"),this.rebuildTrailsUI();const i={addTrail:()=>{this.simulation.addTrail()}};this.trailsContainer.add(i,"addTrail").name("+ Add Trail"),this.speciesContainer=this.gui.addFolder("Species"),this.rebuildSpeciesUI();const s={addSpecies:()=>{this.simulation.addSpecies()}};this.speciesContainer.add(s,"addSpecies").name("+ Add Species"),this.interactionFolder=this.gui.addFolder("Interaction"),this.interactionFolder.add(this.controlState,"drawMode",["draw","erase"]).name("Draw Mode"),this.interactionFolder.add(this.controlState,"brushRadius",5,100,1).name("Brush Radius"),this.rebuildTrailDrawDropdown();const n=this.gui.addFolder("Actions"),r={pause:()=>this.simulation.toggle(),reset:()=>this.simulation.reset()};n.add(r,"pause").name("Pause / Resume (Space)"),n.add(r,"reset").name("Reset (R)"),this.presetsFolder=this.gui.addFolder("Presets"),this.setupPresetsUI(),t.open(),this.trailsContainer.open(),this.speciesContainer.open()}setupPresetsUI(){this.presetsFolder.add(this.presetState,"configName").name("Config Name");const t={save:()=>{const s=this.presetState.configName.trim();if(!s){alert("Please enter a name for the configuration");return}const n=this.simulation.exportConfig(s);T.save(n),this.presetState.configName="",this.rebuildConfigDropdown()}};this.presetsFolder.add(t,"save").name("Save Current"),this.rebuildConfigDropdown();const e={load:()=>{const s=this.presetState.selectedConfigId;if(!s){alert("Please select a configuration to load");return}const n=T.get(s);n&&(this.simulation.loadConfig(n.config),this.params=this.simulation.getParams(),this.rebuildAllUI())}};this.presetsFolder.add(e,"load").name("Load Selected");const i={delete:()=>{const s=this.presetState.selectedConfigId;if(!s){alert("Please select a configuration to delete");return}confirm("Delete this configuration?")&&(T.delete(s),this.presetState.selectedConfigId="",this.rebuildConfigDropdown())}};this.presetsFolder.add(i,"delete").name("Delete Selected")}rebuildConfigDropdown(){this.configSelectController&&this.configSelectController.destroy();const t=T.getAll(),e={"-- Select --":""};for(const i of t){const s=new Date(i.createdAt).toLocaleDateString();e[`${i.name} (${s})`]=i.id}this.presetState.selectedConfigId&&!t.find(i=>i.id===this.presetState.selectedConfigId)&&(this.presetState.selectedConfigId=""),this.configSelectController=this.presetsFolder.add(this.presetState,"selectedConfigId",e).name("Saved Configs")}rebuildAllUI(){this.rebuildTrailsUI(),this.rebuildSpeciesUI(),this.rebuildTrailDrawDropdown()}rebuildTrailDrawDropdown(){this.trailDrawController&&this.trailDrawController.destroy();const t=this.simulation.getTrailNames(),e={};t.forEach((i,s)=>{e[i]=s}),this.controlState.selectedTrailIndex>=t.length&&(this.controlState.selectedTrailIndex=0),this.trailDrawController=this.interactionFolder.add(this.controlState,"selectedTrailIndex",e).name("Draw on Trail")}rebuildTrailsUI(){for(const e of this.trailFolders)e.destroy();this.trailFolders=[];const t=this.simulation.getTrails();for(let e=0;e<t.length;e++){const i=t[e],s=this.createTrailFolder(i,e);this.trailFolders.push(s)}}createTrailFolder(t,e){const i=this.trailsContainer.addFolder(t.params.name),s=t.params;i.add(s,"name").name("Name").onChange(r=>{i.title(r)});const n={color:this.rgbToHex(s.color)};if(i.addColor(n,"color").name("Color").onChange(r=>{s.color=this.hexToRgb(r)}),i.add(s,"diffusionRate",0,.5,.01).name("Diffusion Rate"),i.add(s,"decayRate",.9,1,.001).name("Decay Rate"),this.simulation.getTrails().length>1){const r={remove:()=>{this.simulation.removeTrail(e)}};i.add(r,"remove").name("Remove Trail")}return i.open(),i}rebuildSpeciesUI(){for(const e of this.speciesFolders)e.destroy();this.speciesFolders=[];const t=this.simulation.getSpecies();for(let e=0;e<t.length;e++){const i=t[e],s=this.createSpeciesFolder(i,e);this.speciesFolders.push(s)}}createSpeciesFolder(t,e){const i=this.speciesContainer.addFolder(t.params.name),s=t.params;i.add(s,"name").name("Name").onChange(a=>{i.title(a)}),i.add(s,"agentCount",100,2e4,100).name("Agents").onChange(a=>{this.simulation.updateSpeciesParams(e,{agentCount:a})});const n=this.simulation.getTrailNames(),r={};if(n.forEach((a,h)=>{r[a]=h}),i.add(s,"followTrailIndex",r).name("Follow Trail"),i.add(s,"depositTrailIndex",r).name("Deposit Trail"),i.add(s,"sensorAngle",10,90,1).name("Sensor Angle"),i.add(s,"sensorDistance",1,30,1).name("Sensor Distance"),i.add(s,"turnSpeed",5,180,1).name("Turn Speed"),i.add(s,"moveSpeed",.5,5,.1).name("Move Speed"),i.add(s,"depositAmount",1,20,.5).name("Deposit Amount"),this.simulation.getSpecies().length>1){const a={remove:()=>{this.simulation.removeSpecies(e)}};i.add(a,"remove").name("Remove Species")}return i.open(),i}rgbToHex(t){const e=Math.round(t[0]*255),i=Math.round(t[1]*255),s=Math.round(t[2]*255);return`#${e.toString(16).padStart(2,"0")}${i.toString(16).padStart(2,"0")}${s.toString(16).padStart(2,"0")}`}hexToRgb(t){const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?[parseInt(e[1],16)/255,parseInt(e[2],16)/255,parseInt(e[3],16)/255]:[1,1,1]}getControlState(){return this.controlState}destroy(){this.gui.destroy()}}class it{canvas;simulation;controls;isDrawing=!1;lastX=0;lastY=0;constructor(t,e,i){this.canvas=t,this.simulation=e,this.controls=i,this.setupMouseEvents(),this.setupTouchEvents(),this.setupKeyboardEvents()}getSimPosition(t,e){const i=this.canvas.getBoundingClientRect(),s=this.simulation.getSimDimensions(),n=(t-i.left)/i.width*s.width,r=(e-i.top)/i.height*s.height;return[n,r]}handleDraw(t,e){const i=this.controls.getControlState(),s=this.simulation.getTrail(i.selectedTrailIndex);if(!s)return;const n=this.simulation.getSimDimensions(),r=this.canvas.getBoundingClientRect(),a=n.width/r.width,h=i.brushRadius*a;switch(i.drawMode){case"draw":s.drawCircle(t,e,h,50);break;case"erase":s.eraseCircle(t,e,h);break}}setupMouseEvents(){this.canvas.addEventListener("mousedown",t=>{if(t.button!==0)return;this.isDrawing=!0;const[e,i]=this.getSimPosition(t.clientX,t.clientY);this.lastX=e,this.lastY=i,this.handleDraw(e,i)}),this.canvas.addEventListener("mousemove",t=>{if(!this.isDrawing)return;const[e,i]=this.getSimPosition(t.clientX,t.clientY),s=e-this.lastX,n=i-this.lastY,r=Math.sqrt(s*s+n*n),a=Math.max(1,Math.floor(r/2));for(let h=1;h<=a;h++){const u=h/a;this.handleDraw(this.lastX+s*u,this.lastY+n*u)}this.lastX=e,this.lastY=i}),this.canvas.addEventListener("mouseup",()=>{this.isDrawing=!1}),this.canvas.addEventListener("mouseleave",()=>{this.isDrawing=!1})}setupTouchEvents(){this.canvas.addEventListener("touchstart",t=>{if(t.preventDefault(),t.touches.length!==1)return;this.isDrawing=!0;const e=t.touches[0],[i,s]=this.getSimPosition(e.clientX,e.clientY);this.lastX=i,this.lastY=s,this.handleDraw(i,s)},{passive:!1}),this.canvas.addEventListener("touchmove",t=>{if(t.preventDefault(),!this.isDrawing||t.touches.length!==1)return;const e=t.touches[0],[i,s]=this.getSimPosition(e.clientX,e.clientY),n=i-this.lastX,r=s-this.lastY,a=Math.sqrt(n*n+r*r),h=Math.max(1,Math.floor(a/2));for(let u=1;u<=h;u++){const c=u/h;this.handleDraw(this.lastX+n*c,this.lastY+r*c)}this.lastX=i,this.lastY=s},{passive:!1}),this.canvas.addEventListener("touchend",()=>{this.isDrawing=!1}),this.canvas.addEventListener("touchcancel",()=>{this.isDrawing=!1})}setupKeyboardEvents(){document.addEventListener("keydown",t=>{if(!(t.target instanceof HTMLInputElement))switch(t.code){case"Space":t.preventDefault(),this.simulation.toggle();break;case"KeyR":t.preventDefault(),this.simulation.reset();break}})}}function U(){const l=document.getElementById("app"),t=document.createElement("canvas");t.id="canvas",l.appendChild(t);function e(){t.width=window.innerWidth,t.height=window.innerHeight}e();const i=document.createElement("div");i.id="instructions",i.innerHTML=`
    <kbd>Space</kbd> Pause/Resume &nbsp;
    <kbd>R</kbd> Reset &nbsp;
    <kbd>Click & Drag</kbd> Paint trails
  `,document.body.appendChild(i);let s,n;try{s=new Y(t),n=new et(s),new it(t,s,n);let r;window.addEventListener("resize",()=>{clearTimeout(r),r=window.setTimeout(()=>{e(),s.resize(t.width,t.height)},100)}),s.start()}catch(r){console.error("Failed to initialize simulation:",r),l.innerHTML=`
      <div style="color: #ff4444; font-family: monospace; padding: 20px; text-align: center;">
        <h2>WebGL2 Error</h2>
        <p>${r instanceof Error?r.message:"Unknown error"}</p>
        <p style="margin-top: 10px; color: #888;">
          This simulation requires WebGL2 with float texture support.
        </p>
      </div>
    `}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",U):U();
