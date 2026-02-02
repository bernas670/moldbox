(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))e(s);new MutationObserver(s=>{for(const n of s)if(n.type==="childList")for(const r of n.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&e(r)}).observe(document,{childList:!0,subtree:!0});function i(s){const n={};return s.integrity&&(n.integrity=s.integrity),s.referrerPolicy&&(n.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?n.credentials="include":s.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function e(s){if(s.ep)return;s.ep=!0;const n=i(s);fetch(s.href,n)}})();const k={resolutionScale:50};function $(a){return a*(Math.PI/180)}class T{positions;angles;count;constructor(t,i,e){this.count=t,this.positions=new Float32Array(t*2),this.angles=new Float32Array(t),this.initializeRandom(i,e)}initializeCircle(t,i){const e=t/2,s=i/2,n=Math.min(t,i)*.3;for(let r=0;r<this.count;r++){const l=Math.random()*Math.PI*2,o=Math.sqrt(Math.random())*n;this.positions[r*2]=e+Math.cos(l)*o,this.positions[r*2+1]=s+Math.sin(l)*o,this.angles[r]=l+Math.PI}}initializeRandom(t,i){for(let e=0;e<this.count;e++)this.positions[e*2]=Math.random()*t,this.positions[e*2+1]=Math.random()*i,this.angles[e]=Math.random()*Math.PI*2}initializeRing(t,i){const e=t/2,s=i/2,n=Math.min(t,i)*.4;for(let r=0;r<this.count;r++){const l=r/this.count*Math.PI*2,o=(Math.random()-.5)*20;this.positions[r*2]=e+Math.cos(l)*(n+o),this.positions[r*2+1]=s+Math.sin(l)*(n+o),this.angles[r]=l+Math.PI}}getPosition(t){return[this.positions[t*2],this.positions[t*2+1]]}setPosition(t,i,e){this.positions[t*2]=i,this.positions[t*2+1]=e}reset(t,i,e){t!==this.count&&(this.count=t,this.positions=new Float32Array(t*2),this.angles=new Float32Array(t)),this.initializeRandom(i,e)}}const M={agentCount:5e3,sensorAngle:45,sensorDistance:9,turnSpeed:45,moveSpeed:1,depositAmount:5,followTrailIndex:0,depositTrailIndex:0};class I{params;agents;constructor(t,i,e){this.params={...t},this.agents=new T(t.agentCount,i,e),this.agents.initializeCircle(i,e)}updateAgentCount(t,i,e){t!==this.params.agentCount&&(this.params.agentCount=t,this.agents=new T(t,i,e),this.agents.initializeCircle(i,e))}reset(t,i){this.agents.reset(this.params.agentCount,t,i),this.agents.initializeCircle(t,i)}}const D={diffusionRate:.1,decayRate:.98};class O{params;data;buffer;width;height;constructor(t,i,e){this.params={...t},this.width=i,this.height=e,this.data=new Float32Array(i*e),this.buffer=new Float32Array(i*e)}index(t,i){return i*this.width+t}sample(t,i){const e=Math.floor(t),s=Math.floor(i);return e<0||e>=this.width||s<0||s>=this.height?0:this.data[this.index(e,s)]}deposit(t,i,e){const s=Math.floor(t),n=Math.floor(i);s<0||s>=this.width||n<0||n>=this.height||(this.data[this.index(s,n)]+=e)}diffuse(){const{width:t,height:i,data:e,buffer:s,params:n}=this,r=n.diffusionRate;for(let l=0;l<i;l++)for(let o=0;o<t;o++){let p=0,c=0;for(let v=-1;v<=1;v++)for(let b=-1;b<=1;b++){const w=o+b,d=l+v;w>=0&&w<t&&d>=0&&d<i&&(p+=e[this.index(w,d)],c++)}const u=this.index(o,l),m=e[u],g=p/c;s[u]=m+(g-m)*r}this.data.set(s)}decay(){const t=this.params.decayRate;for(let i=0;i<this.data.length;i++)this.data[i]*=t}clear(){this.data.fill(0)}resize(t,i){this.width=t,this.height=i,this.data=new Float32Array(t*i),this.buffer=new Float32Array(t*i)}drawCircle(t,i,e,s){const n=e*e,r=Math.max(0,Math.floor(t-e)),l=Math.min(this.width-1,Math.ceil(t+e)),o=Math.max(0,Math.floor(i-e)),p=Math.min(this.height-1,Math.ceil(i+e));for(let c=o;c<=p;c++)for(let u=r;u<=l;u++){const m=u-t,g=c-i;m*m+g*g<=n&&(this.data[this.index(u,c)]+=s)}}eraseCircle(t,i,e){const s=e*e,n=Math.max(0,Math.floor(t-e)),r=Math.min(this.width-1,Math.ceil(t+e)),l=Math.max(0,Math.floor(i-e)),o=Math.min(this.height-1,Math.ceil(i+e));for(let p=l;p<=o;p++)for(let c=n;c<=r;c++){const u=c-t,m=p-i;u*u+m*m<=s&&(this.data[this.index(c,p)]=0)}}}const E=[[0,.8,.9],[.9,.3,.1],[.2,.9,.3],[.9,.2,.6],[.6,.4,.9],[.9,.9,.2]];class P{gl;width;height;trailTexture;program;quadVAO;textureData;constructor(t,i,e){this.gl=t,this.width=i,this.height=e,this.textureData=new Uint8Array(i*e*4),this.initShaders(),this.initBuffers(),this.initTexture()}initShaders(){const t=this.gl,i=`#version 300 es
    in vec2 a_position;
    out vec2 v_uv;
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      // Flip Y to match screen coordinates
      v_uv = vec2(a_position.x * 0.5 + 0.5, 0.5 - a_position.y * 0.5);
    }`,e=`#version 300 es
    precision highp float;
    in vec2 v_uv;
    uniform sampler2D u_trail;
    out vec4 fragColor;

    void main() {
      vec3 color = texture(u_trail, v_uv).rgb;
      // Add slight background tint
      vec3 bg = vec3(0.0, 0.02, 0.05);
      fragColor = vec4(bg + color, 1.0);
    }`,s=t.createShader(t.VERTEX_SHADER);if(t.shaderSource(s,i),t.compileShader(s),!t.getShaderParameter(s,t.COMPILE_STATUS))throw new Error(`Vertex shader error: ${t.getShaderInfoLog(s)}`);const n=t.createShader(t.FRAGMENT_SHADER);if(t.shaderSource(n,e),t.compileShader(n),!t.getShaderParameter(n,t.COMPILE_STATUS))throw new Error(`Fragment shader error: ${t.getShaderInfoLog(n)}`);if(this.program=t.createProgram(),t.attachShader(this.program,s),t.attachShader(this.program,n),t.linkProgram(this.program),!t.getProgramParameter(this.program,t.LINK_STATUS))throw new Error(`Program link error: ${t.getProgramInfoLog(this.program)}`);t.deleteShader(s),t.deleteShader(n)}initBuffers(){const t=this.gl,i=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);this.quadVAO=t.createVertexArray(),t.bindVertexArray(this.quadVAO);const e=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,e),t.bufferData(t.ARRAY_BUFFER,i,t.STATIC_DRAW);const s=t.getAttribLocation(this.program,"a_position");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),t.bindVertexArray(null)}initTexture(){const t=this.gl;this.trailTexture=t.createTexture(),t.bindTexture(t.TEXTURE_2D,this.trailTexture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,this.width,this.height,0,t.RGBA,t.UNSIGNED_BYTE,null),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}render(t){const i=this.gl,e=this.width*this.height;for(let s=0;s<e;s++){const n=s*3,r=s*4;this.textureData[r]=Math.min(255,Math.max(0,Math.floor(t[n]*25))),this.textureData[r+1]=Math.min(255,Math.max(0,Math.floor(t[n+1]*25))),this.textureData[r+2]=Math.min(255,Math.max(0,Math.floor(t[n+2]*25))),this.textureData[r+3]=255}i.bindTexture(i.TEXTURE_2D,this.trailTexture),i.texSubImage2D(i.TEXTURE_2D,0,0,0,this.width,this.height,i.RGBA,i.UNSIGNED_BYTE,this.textureData),i.viewport(0,0,i.canvas.width,i.canvas.height),i.clearColor(0,0,0,1),i.clear(i.COLOR_BUFFER_BIT),i.useProgram(this.program),i.activeTexture(i.TEXTURE0),i.bindTexture(i.TEXTURE_2D,this.trailTexture),i.uniform1i(i.getUniformLocation(this.program,"u_trail"),0),i.bindVertexArray(this.quadVAO),i.drawArrays(i.TRIANGLES,0,6)}resize(t,i){this.width=t,this.height=i,this.textureData=new Uint8Array(t*i*4),this.gl.deleteTexture(this.trailTexture),this.initTexture()}get currentWidth(){return this.width}get currentHeight(){return this.height}}class V{canvas;renderer;species=[];trails=[];compositeData;params;simWidth;simHeight;running=!1;animationId=0;frameCount=0;fpsTime=0;currentFps=0;onFpsUpdate;onSpeciesChange;onTrailChange;constructor(t,i={}){this.canvas=t,this.params={...k,...i};const e=t.getContext("webgl2",{alpha:!1,antialias:!1,preserveDrawingBuffer:!1});if(!e)throw new Error("WebGL2 not supported");const{width:s,height:n}=this.calculateResolution();this.simWidth=s,this.simHeight=n,this.compositeData=new Float32Array(s*n*3),this.renderer=new P(e,this.simWidth,this.simHeight),this.addTrail({name:"Trail 1",color:E[0],...D}),this.addSpecies({name:"Species 1",...M})}calculateResolution(){const t=this.params.resolutionScale/100;return{width:Math.floor(this.canvas.width*t),height:Math.floor(this.canvas.height*t)}}compositeTrails(){this.compositeData.fill(0);for(const t of this.trails){const i=t.params.color,e=t.data;for(let s=0;s<e.length;s++){const n=e[s],r=s*3;this.compositeData[r]+=i[0]*n,this.compositeData[r+1]+=i[1]*n,this.compositeData[r+2]+=i[2]*n}}}step(){const{simWidth:t,simHeight:i}=this;for(const e of this.species){const{agents:s,params:n}=e,r=$(n.sensorAngle),l=$(n.turnSpeed),o=this.trails[n.followTrailIndex],p=this.trails[n.depositTrailIndex];if(!(!o||!p))for(let c=0;c<s.count;c++){let u=s.positions[c*2],m=s.positions[c*2+1],g=s.angles[c];const v=n.sensorDistance,b=g-r,w=o.sample(u+Math.cos(b)*v,m+Math.sin(b)*v),d=o.sample(u+Math.cos(g)*v,m+Math.sin(g)*v),h=g+r,f=o.sample(u+Math.cos(h)*v,m+Math.sin(h)*v);d>w&&d>f||(d<w&&d<f?g+=(Math.random()<.5?-1:1)*l:w>f?g-=l:f>w?g+=l:g+=(Math.random()-.5)*l*.5),u+=Math.cos(g)*n.moveSpeed,m+=Math.sin(g)*n.moveSpeed,u<0&&(u+=t),u>=t&&(u-=t),m<0&&(m+=i),m>=i&&(m-=i),s.positions[c*2]=u,s.positions[c*2+1]=m,s.angles[c]=g,p.deposit(u,m,n.depositAmount)}}for(const e of this.trails)e.diffuse(),e.decay();this.compositeTrails(),this.renderer.render(this.compositeData)}loop=t=>{this.running&&(this.frameCount++,t-this.fpsTime>=1e3&&(this.currentFps=this.frameCount,this.frameCount=0,this.fpsTime=t,this.onFpsUpdate?.(this.currentFps)),this.step(),this.animationId=requestAnimationFrame(this.loop))};start(){this.running||(this.running=!0,this.fpsTime=performance.now(),this.frameCount=0,this.animationId=requestAnimationFrame(this.loop))}stop(){this.running=!1,this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=0)}toggle(){this.running?this.stop():this.start()}reset(){for(const t of this.species)t.reset(this.simWidth,this.simHeight);for(const t of this.trails)t.clear()}resize(t,i){this.canvas.width=t,this.canvas.height=i,this.applyResolution()}applyResolution(){const{width:t,height:i}=this.calculateResolution();if(!(t===this.simWidth&&i===this.simHeight)){this.simWidth=t,this.simHeight=i,this.compositeData=new Float32Array(t*i*3),this.renderer.resize(t,i);for(const e of this.trails)e.resize(t,i);for(const e of this.species)e.reset(t,i)}}addTrail(t){const i=this.trails.length,e={name:`Trail ${i+1}`,color:E[i%E.length],...D,...t},s=new O(e,this.simWidth,this.simHeight);return this.trails.push(s),this.onTrailChange?.(),s}removeTrail(t){if(this.trails.length>1&&t>=0&&t<this.trails.length){this.trails.splice(t,1);for(const i of this.species)i.params.followTrailIndex>=this.trails.length&&(i.params.followTrailIndex=0),i.params.depositTrailIndex>=this.trails.length&&(i.params.depositTrailIndex=0);this.onTrailChange?.()}}getTrails(){return this.trails}getTrailNames(){return this.trails.map(t=>t.params.name)}updateTrailParams(t,i){const e=this.trails[t];e&&Object.assign(e.params,i)}addSpecies(t){const e={name:`Species ${this.species.length+1}`,...M,...t},s=new I(e,this.simWidth,this.simHeight);return this.species.push(s),this.onSpeciesChange?.(),s}removeSpecies(t){this.species.length>1&&t>=0&&t<this.species.length&&(this.species.splice(t,1),this.onSpeciesChange?.())}getSpecies(){return this.species}updateSpeciesParams(t,i){const e=this.species[t];if(!e)return;const s=e.params.agentCount;Object.assign(e.params,i),i.agentCount!==void 0&&i.agentCount!==s&&e.updateAgentCount(i.agentCount,this.simWidth,this.simHeight)}updateParams(t){Object.assign(this.params,t),t.resolutionScale!==void 0&&this.applyResolution()}getParams(){return{...this.params}}setFpsCallback(t){this.onFpsUpdate=t}setSpeciesChangeCallback(t){this.onSpeciesChange=t}setTrailChangeCallback(t){this.onTrailChange=t}getTrail(t){return this.trails[t]}getSimDimensions(){return{width:this.simWidth,height:this.simHeight}}isRunning(){return this.running}getFps(){return this.currentFps}}class x{constructor(t,i,e,s,n="div"){this.parent=t,this.object=i,this.property=e,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(n),this.domElement.classList.add("lil-controller"),this.domElement.classList.add(s),this.$name=document.createElement("div"),this.$name.classList.add("lil-name"),x.nextNameID=x.nextNameID||0,this.$name.id=`lil-gui-name-${++x.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("lil-widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",r=>r.stopPropagation()),this.domElement.addEventListener("keyup",r=>r.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(e)}name(t){return this._name=t,this.$name.textContent=t,this}onChange(t){return this._onChange=t,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(t=!0){return this.disable(!t)}disable(t=!0){return t===this._disabled?this:(this._disabled=t,this.domElement.classList.toggle("lil-disabled",t),this.$disable.toggleAttribute("disabled",t),this)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(t){const i=this.parent.add(this.object,this.property,t);return i.name(this._name),this.destroy(),i}min(t){return this}max(t){return this}step(t){return this}decimals(t){return this}listen(t=!0){return this._listening=t,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const t=this.save();t!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=t}getValue(){return this.object[this.property]}setValue(t){return this.getValue()!==t&&(this.object[this.property]=t,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(t){return this.setValue(t),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class H extends x{constructor(t,i,e){super(t,i,e,"lil-boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function A(a){let t,i;return(t=a.match(/(#|0x)?([a-f0-9]{6})/i))?i=t[2]:(t=a.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?i=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=a.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(i=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),i?"#"+i:!1}const U={isPrimitive:!0,match:a=>typeof a=="string",fromHexString:A,toHexString:A},_={isPrimitive:!0,match:a=>typeof a=="number",fromHexString:a=>parseInt(a.substring(1),16),toHexString:a=>"#"+a.toString(16).padStart(6,0)},X={isPrimitive:!1,match:a=>Array.isArray(a)||ArrayBuffer.isView(a),fromHexString(a,t,i=1){const e=_.fromHexString(a);t[0]=(e>>16&255)/255*i,t[1]=(e>>8&255)/255*i,t[2]=(e&255)/255*i},toHexString([a,t,i],e=1){e=255/e;const s=a*e<<16^t*e<<8^i*e<<0;return _.toHexString(s)}},Y={isPrimitive:!1,match:a=>Object(a)===a,fromHexString(a,t,i=1){const e=_.fromHexString(a);t.r=(e>>16&255)/255*i,t.g=(e>>8&255)/255*i,t.b=(e&255)/255*i},toHexString({r:a,g:t,b:i},e=1){e=255/e;const s=a*e<<16^t*e<<8^i*e<<0;return _.toHexString(s)}},z=[U,_,X,Y];function B(a){return z.find(t=>t.match(a))}class N extends x{constructor(t,i,e,s){super(t,i,e,"lil-color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=B(this.initialValue),this._rgbScale=s,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const n=A(this.$text.value);n&&this._setValueFromHexString(n)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(t){if(this._format.isPrimitive){const i=this._format.fromHexString(t);this.setValue(i)}else this._format.fromHexString(t,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(t){return this._setValueFromHexString(t),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class C extends x{constructor(t,i,e){super(t,i,e,"lil-function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",s=>{s.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class W extends x{constructor(t,i,e,s,n,r){super(t,i,e,"lil-number"),this._initInput(),this.min(s),this.max(n);const l=r!==void 0;this.step(l?r:this._getImplicitStep(),l),this.updateDisplay()}decimals(t){return this._decimals=t,this.updateDisplay(),this}min(t){return this._min=t,this._onUpdateMinMax(),this}max(t){return this._max=t,this._onUpdateMinMax(),this}step(t,i=!0){return this._step=t,this._stepExplicit=i,this}updateDisplay(){const t=this.getValue();if(this._hasSlider){let i=(t-this._min)/(this._max-this._min);i=Math.max(0,Math.min(i,1)),this.$fill.style.width=i*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?t:t.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches&&(this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any")),this.$widget.appendChild(this.$input),this.$disable=this.$input;const i=()=>{let h=parseFloat(this.$input.value);isNaN(h)||(this._stepExplicit&&(h=this._snap(h)),this.setValue(this._clamp(h)))},e=h=>{const f=parseFloat(this.$input.value);isNaN(f)||(this._snapClampSetValue(f+h),this.$input.value=this.getValue())},s=h=>{h.key==="Enter"&&this.$input.blur(),h.code==="ArrowUp"&&(h.preventDefault(),e(this._step*this._arrowKeyMultiplier(h))),h.code==="ArrowDown"&&(h.preventDefault(),e(this._step*this._arrowKeyMultiplier(h)*-1))},n=h=>{this._inputFocused&&(h.preventDefault(),e(this._step*this._normalizeMouseWheel(h)))};let r=!1,l,o,p,c,u;const m=5,g=h=>{l=h.clientX,o=p=h.clientY,r=!0,c=this.getValue(),u=0,window.addEventListener("mousemove",v),window.addEventListener("mouseup",b)},v=h=>{if(r){const f=h.clientX-l,y=h.clientY-o;Math.abs(y)>m?(h.preventDefault(),this.$input.blur(),r=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(f)>m&&b()}if(!r){const f=h.clientY-p;u-=f*this._step*this._arrowKeyMultiplier(h),c+u>this._max?u=this._max-c:c+u<this._min&&(u=this._min-c),this._snapClampSetValue(c+u)}p=h.clientY},b=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",v),window.removeEventListener("mouseup",b)},w=()=>{this._inputFocused=!0},d=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",i),this.$input.addEventListener("keydown",s),this.$input.addEventListener("wheel",n,{passive:!1}),this.$input.addEventListener("mousedown",g),this.$input.addEventListener("focus",w),this.$input.addEventListener("blur",d)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("lil-slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("lil-fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("lil-has-slider");const t=(d,h,f,y,R)=>(d-h)/(f-h)*(R-y)+y,i=d=>{const h=this.$slider.getBoundingClientRect();let f=t(d,h.left,h.right,this._min,this._max);this._snapClampSetValue(f)},e=d=>{this._setDraggingStyle(!0),i(d.clientX),window.addEventListener("mousemove",s),window.addEventListener("mouseup",n)},s=d=>{i(d.clientX)},n=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",s),window.removeEventListener("mouseup",n)};let r=!1,l,o;const p=d=>{d.preventDefault(),this._setDraggingStyle(!0),i(d.touches[0].clientX),r=!1},c=d=>{d.touches.length>1||(this._hasScrollBar?(l=d.touches[0].clientX,o=d.touches[0].clientY,r=!0):p(d),window.addEventListener("touchmove",u,{passive:!1}),window.addEventListener("touchend",m))},u=d=>{if(r){const h=d.touches[0].clientX-l,f=d.touches[0].clientY-o;Math.abs(h)>Math.abs(f)?p(d):(window.removeEventListener("touchmove",u),window.removeEventListener("touchend",m))}else d.preventDefault(),i(d.touches[0].clientX)},m=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",u),window.removeEventListener("touchend",m)},g=this._callOnFinishChange.bind(this),v=400;let b;const w=d=>{if(Math.abs(d.deltaX)<Math.abs(d.deltaY)&&this._hasScrollBar)return;d.preventDefault();const f=this._normalizeMouseWheel(d)*this._step;this._snapClampSetValue(this.getValue()+f),this.$input.value=this.getValue(),clearTimeout(b),b=setTimeout(g,v)};this.$slider.addEventListener("mousedown",e),this.$slider.addEventListener("touchstart",c,{passive:!1}),this.$slider.addEventListener("wheel",w,{passive:!1})}_setDraggingStyle(t,i="horizontal"){this.$slider&&this.$slider.classList.toggle("lil-active",t),document.body.classList.toggle("lil-dragging",t),document.body.classList.toggle(`lil-${i}`,t)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(t){let{deltaX:i,deltaY:e}=t;return Math.floor(t.deltaY)!==t.deltaY&&t.wheelDelta&&(i=0,e=-t.wheelDelta/120,e*=this._stepExplicit?1:10),i+-e}_arrowKeyMultiplier(t){let i=this._stepExplicit?1:10;return t.shiftKey?i*=10:t.altKey&&(i/=10),i}_snap(t){let i=0;return this._hasMin?i=this._min:this._hasMax&&(i=this._max),t-=i,t=Math.round(t/this._step)*this._step,t+=i,t=parseFloat(t.toPrecision(15)),t}_clamp(t){return t<this._min&&(t=this._min),t>this._max&&(t=this._max),t}_snapClampSetValue(t){this.setValue(this._clamp(this._snap(t)))}get _hasScrollBar(){const t=this.parent.root.$children;return t.scrollHeight>t.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class j extends x{constructor(t,i,e,s){super(t,i,e,"lil-option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("lil-focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("lil-focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(s)}options(t){return this._values=Array.isArray(t)?t:Object.values(t),this._names=Array.isArray(t)?t:Object.keys(t),this.$select.replaceChildren(),this._names.forEach(i=>{const e=document.createElement("option");e.textContent=i,this.$select.appendChild(e)}),this.updateDisplay(),this}updateDisplay(){const t=this.getValue(),i=this._values.indexOf(t);return this.$select.selectedIndex=i,this.$display.textContent=i===-1?t:this._names[i],this}}class G extends x{constructor(t,i,e){super(t,i,e,"lil-string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",s=>{s.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var q=`.lil-gui {
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
}`;function K(a){const t=document.createElement("style");t.innerHTML=a;const i=document.querySelector("head link[rel=stylesheet], head style");i?document.head.insertBefore(t,i):document.head.appendChild(t)}let F=!1;class S{constructor({parent:t,autoPlace:i=t===void 0,container:e,width:s,title:n="Controls",closeFolders:r=!1,injectStyles:l=!0,touchStyles:o=!0}={}){if(this.parent=t,this.root=t?t.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("button"),this.$title.classList.add("lil-title"),this.$title.setAttribute("aria-expanded",!0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("lil-children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(n),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("lil-root"),o&&this.domElement.classList.add("lil-allow-touch-styles"),!F&&l&&(K(q),F=!0),e?e.appendChild(this.domElement):i&&(this.domElement.classList.add("lil-auto-place","autoPlace"),document.body.appendChild(this.domElement)),s&&this.domElement.style.setProperty("--width",s+"px"),this._closeFolders=r}add(t,i,e,s,n){if(Object(e)===e)return new j(this,t,i,e);const r=t[i];switch(typeof r){case"number":return new W(this,t,i,e,s,n);case"boolean":return new H(this,t,i);case"string":return new G(this,t,i);case"function":return new C(this,t,i)}console.error(`gui.add failed
	property:`,i,`
	object:`,t,`
	value:`,r)}addColor(t,i,e=1){return new N(this,t,i,e)}addFolder(t){const i=new S({parent:this,title:t});return this.root._closeFolders&&i.close(),i}load(t,i=!0){return t.controllers&&this.controllers.forEach(e=>{e instanceof C||e._name in t.controllers&&e.load(t.controllers[e._name])}),i&&t.folders&&this.folders.forEach(e=>{e._title in t.folders&&e.load(t.folders[e._title])}),this}save(t=!0){const i={controllers:{},folders:{}};return this.controllers.forEach(e=>{if(!(e instanceof C)){if(e._name in i.controllers)throw new Error(`Cannot save GUI with duplicate property "${e._name}"`);i.controllers[e._name]=e.save()}}),t&&this.folders.forEach(e=>{if(e._title in i.folders)throw new Error(`Cannot save GUI with duplicate folder "${e._title}"`);i.folders[e._title]=e.save()}),i}open(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("lil-closed",this._closed),this}close(){return this.open(!1)}_setClosed(t){this._closed!==t&&(this._closed=t,this._callOnOpenClose(this))}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const i=this.$children.clientHeight;this.$children.style.height=i+"px",this.domElement.classList.add("lil-transition");const e=n=>{n.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("lil-transition"),this.$children.removeEventListener("transitionend",e))};this.$children.addEventListener("transitionend",e);const s=t?this.$children.scrollHeight:0;this.domElement.classList.toggle("lil-closed",!t),requestAnimationFrame(()=>{this.$children.style.height=s+"px"})}),this}title(t){return this._title=t,this.$title.textContent=t,this}reset(t=!0){return(t?this.controllersRecursive():this.controllers).forEach(e=>e.reset()),this}onChange(t){return this._onChange=t,this}_callOnChange(t){this.parent&&this.parent._callOnChange(t),this._onChange!==void 0&&this._onChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(t){this.parent&&this.parent._callOnFinishChange(t),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onOpenClose(t){return this._onOpenClose=t,this}_callOnOpenClose(t){this.parent&&this.parent._callOnOpenClose(t),this._onOpenClose!==void 0&&this._onOpenClose.call(this,t)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(t=>t.destroy())}controllersRecursive(){let t=Array.from(this.controllers);return this.folders.forEach(i=>{t=t.concat(i.controllersRecursive())}),t}foldersRecursive(){let t=Array.from(this.folders);return this.folders.forEach(i=>{t=t.concat(i.foldersRecursive())}),t}}class Z{gui;simulation;params;controlState;fpsDisplay;speciesFolders=[];speciesContainer;trailFolders=[];trailsContainer;constructor(t){this.simulation=t,this.params=t.getParams(),this.controlState={drawMode:"draw",brushRadius:20,selectedTrailIndex:0},this.fpsDisplay={fps:"0 FPS"},this.gui=new S({title:"Slime Mold Simulation"}),this.setupControls(),t.setFpsCallback(i=>{this.fpsDisplay.fps=`${i} FPS`}),t.setSpeciesChangeCallback(()=>{this.rebuildSpeciesUI()}),t.setTrailChangeCallback(()=>{this.rebuildTrailsUI(),this.rebuildSpeciesUI()})}setupControls(){const t=this.gui.addFolder("Performance");t.add(this.fpsDisplay,"fps").name("Frame Rate").disable(),t.add(this.params,"resolutionScale",25,100,5).name("Resolution Scale %").onChange(l=>{this.simulation.updateParams({resolutionScale:l})}),this.trailsContainer=this.gui.addFolder("Trails"),this.rebuildTrailsUI();const i={addTrail:()=>{this.simulation.addTrail()}};this.trailsContainer.add(i,"addTrail").name("+ Add Trail"),this.speciesContainer=this.gui.addFolder("Species"),this.rebuildSpeciesUI();const e={addSpecies:()=>{this.simulation.addSpecies()}};this.speciesContainer.add(e,"addSpecies").name("+ Add Species");const s=this.gui.addFolder("Interaction");s.add(this.controlState,"drawMode",["draw","erase"]).name("Draw Mode"),s.add(this.controlState,"brushRadius",5,100,1).name("Brush Radius"),this.updateTrailDrawDropdown(s);const n=this.gui.addFolder("Actions"),r={pause:()=>this.simulation.toggle(),reset:()=>this.simulation.reset()};n.add(r,"pause").name("Pause / Resume (Space)"),n.add(r,"reset").name("Reset (R)"),t.open(),this.trailsContainer.open(),this.speciesContainer.open()}updateTrailDrawDropdown(t){const i=this.simulation.getTrailNames(),e={};i.forEach((s,n)=>{e[s]=n}),t.add(this.controlState,"selectedTrailIndex",e).name("Draw on Trail")}rebuildTrailsUI(){for(const i of this.trailFolders)i.destroy();this.trailFolders=[];const t=this.simulation.getTrails();for(let i=0;i<t.length;i++){const e=t[i],s=this.createTrailFolder(e,i);this.trailFolders.push(s)}}createTrailFolder(t,i){const e=this.trailsContainer.addFolder(t.params.name),s=t.params;e.add(s,"name").name("Name").onChange(r=>{e.title(r)});const n={color:this.rgbToHex(s.color)};if(e.addColor(n,"color").name("Color").onChange(r=>{s.color=this.hexToRgb(r)}),e.add(s,"diffusionRate",0,.5,.01).name("Diffusion Rate"),e.add(s,"decayRate",.9,1,.001).name("Decay Rate"),this.simulation.getTrails().length>1){const r={remove:()=>{this.simulation.removeTrail(i)}};e.add(r,"remove").name("Remove Trail")}return e.open(),e}rebuildSpeciesUI(){for(const i of this.speciesFolders)i.destroy();this.speciesFolders=[];const t=this.simulation.getSpecies();for(let i=0;i<t.length;i++){const e=t[i],s=this.createSpeciesFolder(e,i);this.speciesFolders.push(s)}}createSpeciesFolder(t,i){const e=this.speciesContainer.addFolder(t.params.name),s=t.params;e.add(s,"name").name("Name").onChange(l=>{e.title(l)}),e.add(s,"agentCount",100,2e4,100).name("Agents").onChange(l=>{this.simulation.updateSpeciesParams(i,{agentCount:l})});const n=this.simulation.getTrailNames(),r={};if(n.forEach((l,o)=>{r[l]=o}),e.add(s,"followTrailIndex",r).name("Follow Trail"),e.add(s,"depositTrailIndex",r).name("Deposit Trail"),e.add(s,"sensorAngle",10,90,1).name("Sensor Angle"),e.add(s,"sensorDistance",1,30,1).name("Sensor Distance"),e.add(s,"turnSpeed",5,180,1).name("Turn Speed"),e.add(s,"moveSpeed",.5,5,.1).name("Move Speed"),e.add(s,"depositAmount",1,20,.5).name("Deposit Amount"),this.simulation.getSpecies().length>1){const l={remove:()=>{this.simulation.removeSpecies(i)}};e.add(l,"remove").name("Remove Species")}return e.open(),e}rgbToHex(t){const i=Math.round(t[0]*255),e=Math.round(t[1]*255),s=Math.round(t[2]*255);return`#${i.toString(16).padStart(2,"0")}${e.toString(16).padStart(2,"0")}${s.toString(16).padStart(2,"0")}`}hexToRgb(t){const i=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return i?[parseInt(i[1],16)/255,parseInt(i[2],16)/255,parseInt(i[3],16)/255]:[1,1,1]}getControlState(){return this.controlState}destroy(){this.gui.destroy()}}class J{canvas;simulation;controls;isDrawing=!1;lastX=0;lastY=0;constructor(t,i,e){this.canvas=t,this.simulation=i,this.controls=e,this.setupMouseEvents(),this.setupTouchEvents(),this.setupKeyboardEvents()}getSimPosition(t,i){const e=this.canvas.getBoundingClientRect(),s=this.simulation.getSimDimensions(),n=(t-e.left)/e.width*s.width,r=(i-e.top)/e.height*s.height;return[n,r]}handleDraw(t,i){const e=this.controls.getControlState(),s=this.simulation.getTrail(e.selectedTrailIndex);if(!s)return;const n=this.simulation.getSimDimensions(),r=this.canvas.getBoundingClientRect(),l=n.width/r.width,o=e.brushRadius*l;switch(e.drawMode){case"draw":s.drawCircle(t,i,o,50);break;case"erase":s.eraseCircle(t,i,o);break}}setupMouseEvents(){this.canvas.addEventListener("mousedown",t=>{if(t.button!==0)return;this.isDrawing=!0;const[i,e]=this.getSimPosition(t.clientX,t.clientY);this.lastX=i,this.lastY=e,this.handleDraw(i,e)}),this.canvas.addEventListener("mousemove",t=>{if(!this.isDrawing)return;const[i,e]=this.getSimPosition(t.clientX,t.clientY),s=i-this.lastX,n=e-this.lastY,r=Math.sqrt(s*s+n*n),l=Math.max(1,Math.floor(r/2));for(let o=1;o<=l;o++){const p=o/l;this.handleDraw(this.lastX+s*p,this.lastY+n*p)}this.lastX=i,this.lastY=e}),this.canvas.addEventListener("mouseup",()=>{this.isDrawing=!1}),this.canvas.addEventListener("mouseleave",()=>{this.isDrawing=!1})}setupTouchEvents(){this.canvas.addEventListener("touchstart",t=>{if(t.preventDefault(),t.touches.length!==1)return;this.isDrawing=!0;const i=t.touches[0],[e,s]=this.getSimPosition(i.clientX,i.clientY);this.lastX=e,this.lastY=s,this.handleDraw(e,s)},{passive:!1}),this.canvas.addEventListener("touchmove",t=>{if(t.preventDefault(),!this.isDrawing||t.touches.length!==1)return;const i=t.touches[0],[e,s]=this.getSimPosition(i.clientX,i.clientY),n=e-this.lastX,r=s-this.lastY,l=Math.sqrt(n*n+r*r),o=Math.max(1,Math.floor(l/2));for(let p=1;p<=o;p++){const c=p/o;this.handleDraw(this.lastX+n*c,this.lastY+r*c)}this.lastX=e,this.lastY=s},{passive:!1}),this.canvas.addEventListener("touchend",()=>{this.isDrawing=!1}),this.canvas.addEventListener("touchcancel",()=>{this.isDrawing=!1})}setupKeyboardEvents(){document.addEventListener("keydown",t=>{if(!(t.target instanceof HTMLInputElement))switch(t.code){case"Space":t.preventDefault(),this.simulation.toggle();break;case"KeyR":t.preventDefault(),this.simulation.reset();break}})}}function L(){const a=document.getElementById("app"),t=document.createElement("canvas");t.id="canvas",a.appendChild(t);function i(){t.width=window.innerWidth,t.height=window.innerHeight}i();const e=document.createElement("div");e.id="instructions",e.innerHTML=`
    <kbd>Space</kbd> Pause/Resume &nbsp;
    <kbd>R</kbd> Reset &nbsp;
    <kbd>Click & Drag</kbd> Paint trails
  `,document.body.appendChild(e);let s,n;try{s=new V(t),n=new Z(s),new J(t,s,n);let r;window.addEventListener("resize",()=>{clearTimeout(r),r=window.setTimeout(()=>{i(),s.resize(t.width,t.height)},100)}),s.start()}catch(r){console.error("Failed to initialize simulation:",r),a.innerHTML=`
      <div style="color: #ff4444; font-family: monospace; padding: 20px; text-align: center;">
        <h2>WebGL2 Error</h2>
        <p>${r instanceof Error?r.message:"Unknown error"}</p>
        <p style="margin-top: 10px; color: #888;">
          This simulation requires WebGL2 with float texture support.
        </p>
      </div>
    `}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",L):L();
