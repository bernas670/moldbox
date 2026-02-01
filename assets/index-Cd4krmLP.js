(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))i(s);new MutationObserver(s=>{for(const r of s)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function e(s){const r={};return s.integrity&&(r.integrity=s.integrity),s.referrerPolicy&&(r.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?r.credentials="include":s.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(s){if(s.ep)return;s.ep=!0;const r=e(s);fetch(s.href,r)}})();class R{width;height;data;buffer;constructor(t,e){this.width=t,this.height=e,this.data=new Float32Array(t*e*3),this.buffer=new Float32Array(t*e*3)}index(t,e){return(e*this.width+t)*3}sample(t,e){const i=Math.floor(t),s=Math.floor(e);if(i<0||i>=this.width||s<0||s>=this.height)return 0;const r=this.index(i,s);return this.data[r]+this.data[r+1]+this.data[r+2]}sampleChannel(t,e,i){const s=Math.floor(t),r=Math.floor(e);return s<0||s>=this.width||r<0||r>=this.height?0:this.data[this.index(s,r)+i]}deposit(t,e,i,s){const r=Math.floor(t),n=Math.floor(e);if(r<0||r>=this.width||n<0||n>=this.height)return;const l=this.index(r,n);this.data[l]+=i[0]*s,this.data[l+1]+=i[1]*s,this.data[l+2]+=i[2]*s}diffuse(t){const{width:e,height:i,data:s,buffer:r}=this;for(let n=0;n<i;n++)for(let l=0;l<e;l++){const a=this.index(l,n);for(let c=0;c<3;c++){let g=0,u=0;for(let f=-1;f<=1;f++)for(let v=-1;v<=1;v++){const w=l+v,d=n+f;w>=0&&w<e&&d>=0&&d<i&&(g+=s[this.index(w,d)+c],u++)}const p=s[a+c],m=g/u;r[a+c]=p+(m-p)*t}}this.data.set(r)}decay(t){const{data:e}=this;for(let i=0;i<e.length;i++)e[i]*=t}resize(t,e){this.width=t,this.height=e,this.data=new Float32Array(t*e*3),this.buffer=new Float32Array(t*e*3)}clear(){this.data.fill(0)}drawCircle(t,e,i,s,r){const n=i*i,l=Math.max(0,Math.floor(t-i)),a=Math.min(this.width-1,Math.ceil(t+i)),c=Math.max(0,Math.floor(e-i)),g=Math.min(this.height-1,Math.ceil(e+i));for(let u=c;u<=g;u++)for(let p=l;p<=a;p++){const m=p-t,f=u-e;if(m*m+f*f<=n){const v=this.index(p,u);this.data[v]+=s[0]*r,this.data[v+1]+=s[1]*r,this.data[v+2]+=s[2]*r}}}eraseCircle(t,e,i){const s=i*i,r=Math.max(0,Math.floor(t-i)),n=Math.min(this.width-1,Math.ceil(t+i)),l=Math.max(0,Math.floor(e-i)),a=Math.min(this.height-1,Math.ceil(e+i));for(let c=l;c<=a;c++)for(let g=r;g<=n;g++){const u=g-t,p=c-e;if(u*u+p*p<=s){const m=this.index(g,c);this.data[m]=0,this.data[m+1]=0,this.data[m+2]=0}}}}const k={diffusionRate:.1,decayRate:.98,resolution:400};function $(o){return o*(Math.PI/180)}class M{positions;angles;count;constructor(t,e,i){this.count=t,this.positions=new Float32Array(t*2),this.angles=new Float32Array(t),this.initializeRandom(e,i)}initializeCircle(t,e){const i=t/2,s=e/2,r=Math.min(t,e)*.3;for(let n=0;n<this.count;n++){const l=Math.random()*Math.PI*2,a=Math.sqrt(Math.random())*r;this.positions[n*2]=i+Math.cos(l)*a,this.positions[n*2+1]=s+Math.sin(l)*a,this.angles[n]=l+Math.PI}}initializeRandom(t,e){for(let i=0;i<this.count;i++)this.positions[i*2]=Math.random()*t,this.positions[i*2+1]=Math.random()*e,this.angles[i]=Math.random()*Math.PI*2}initializeRing(t,e){const i=t/2,s=e/2,r=Math.min(t,e)*.4;for(let n=0;n<this.count;n++){const l=n/this.count*Math.PI*2,a=(Math.random()-.5)*20;this.positions[n*2]=i+Math.cos(l)*(r+a),this.positions[n*2+1]=s+Math.sin(l)*(r+a),this.angles[n]=l+Math.PI}}getPosition(t){return[this.positions[t*2],this.positions[t*2+1]]}setPosition(t,e,i){this.positions[t*2]=e,this.positions[t*2+1]=i}reset(t,e,i){t!==this.count&&(this.count=t,this.positions=new Float32Array(t*2),this.angles=new Float32Array(t)),this.initializeRandom(e,i)}}const D={agentCount:5e3,sensorAngle:45,sensorDistance:9,turnSpeed:45,moveSpeed:1,depositAmount:5};class I{params;agents;constructor(t,e,i){this.params={...t},this.agents=new M(t.agentCount,e,i),this.agents.initializeCircle(e,i)}updateAgentCount(t,e,i){t!==this.params.agentCount&&(this.params.agentCount=t,this.agents=new M(t,e,i),this.agents.initializeCircle(e,i))}reset(t,e){this.agents.reset(this.params.agentCount,t,e),this.agents.initializeCircle(t,e)}}const E=[[0,.8,.9],[.9,.3,.1],[.2,.9,.3],[.9,.2,.6],[.6,.4,.9],[.9,.9,.2]];class O{gl;width;height;trailTexture;program;quadVAO;textureData;constructor(t,e,i){this.gl=t,this.width=e,this.height=i,this.textureData=new Uint8Array(e*i*4),this.initShaders(),this.initBuffers(),this.initTexture()}initShaders(){const t=this.gl,e=`#version 300 es
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
    }`,s=t.createShader(t.VERTEX_SHADER);if(t.shaderSource(s,e),t.compileShader(s),!t.getShaderParameter(s,t.COMPILE_STATUS))throw new Error(`Vertex shader error: ${t.getShaderInfoLog(s)}`);const r=t.createShader(t.FRAGMENT_SHADER);if(t.shaderSource(r,i),t.compileShader(r),!t.getShaderParameter(r,t.COMPILE_STATUS))throw new Error(`Fragment shader error: ${t.getShaderInfoLog(r)}`);if(this.program=t.createProgram(),t.attachShader(this.program,s),t.attachShader(this.program,r),t.linkProgram(this.program),!t.getProgramParameter(this.program,t.LINK_STATUS))throw new Error(`Program link error: ${t.getProgramInfoLog(this.program)}`);t.deleteShader(s),t.deleteShader(r)}initBuffers(){const t=this.gl,e=new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1]);this.quadVAO=t.createVertexArray(),t.bindVertexArray(this.quadVAO);const i=t.createBuffer();t.bindBuffer(t.ARRAY_BUFFER,i),t.bufferData(t.ARRAY_BUFFER,e,t.STATIC_DRAW);const s=t.getAttribLocation(this.program,"a_position");t.enableVertexAttribArray(s),t.vertexAttribPointer(s,2,t.FLOAT,!1,0,0),t.bindVertexArray(null)}initTexture(){const t=this.gl;this.trailTexture=t.createTexture(),t.bindTexture(t.TEXTURE_2D,this.trailTexture),t.texImage2D(t.TEXTURE_2D,0,t.RGBA,this.width,this.height,0,t.RGBA,t.UNSIGNED_BYTE,null),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MIN_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_MAG_FILTER,t.LINEAR),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_S,t.CLAMP_TO_EDGE),t.texParameteri(t.TEXTURE_2D,t.TEXTURE_WRAP_T,t.CLAMP_TO_EDGE)}render(t){const e=this.gl,i=this.width*this.height;for(let s=0;s<i;s++){const r=s*3,n=s*4;this.textureData[n]=Math.min(255,Math.max(0,Math.floor(t[r]*25))),this.textureData[n+1]=Math.min(255,Math.max(0,Math.floor(t[r+1]*25))),this.textureData[n+2]=Math.min(255,Math.max(0,Math.floor(t[r+2]*25))),this.textureData[n+3]=255}e.bindTexture(e.TEXTURE_2D,this.trailTexture),e.texSubImage2D(e.TEXTURE_2D,0,0,0,this.width,this.height,e.RGBA,e.UNSIGNED_BYTE,this.textureData),e.viewport(0,0,e.canvas.width,e.canvas.height),e.clearColor(0,0,0,1),e.clear(e.COLOR_BUFFER_BIT),e.useProgram(this.program),e.activeTexture(e.TEXTURE0),e.bindTexture(e.TEXTURE_2D,this.trailTexture),e.uniform1i(e.getUniformLocation(this.program,"u_trail"),0),e.bindVertexArray(this.quadVAO),e.drawArrays(e.TRIANGLES,0,6)}resize(t,e){this.width=t,this.height=e,this.textureData=new Uint8Array(t*e*4),this.gl.deleteTexture(this.trailTexture),this.initTexture()}get currentWidth(){return this.width}get currentHeight(){return this.height}}class P{canvas;renderer;species=[];trailMap;params;simWidth;simHeight;running=!1;animationId=0;frameCount=0;fpsTime=0;currentFps=0;onFpsUpdate;onSpeciesChange;constructor(t,e={}){this.canvas=t,this.params={...k,...e};const i=t.getContext("webgl2",{alpha:!1,antialias:!1,preserveDrawingBuffer:!1});if(!i)throw new Error("WebGL2 not supported");this.simWidth=this.params.resolution,this.simHeight=this.params.resolution,this.renderer=new O(i,this.simWidth,this.simHeight),this.trailMap=new R(this.simWidth,this.simHeight),this.addSpecies({name:"Species 1",color:E[0],...D})}step(){const{params:t,trailMap:e,simWidth:i,simHeight:s}=this;for(const r of this.species){const{agents:n,params:l}=r,a=$(l.sensorAngle),c=$(l.turnSpeed),g=l.color;for(let u=0;u<n.count;u++){let p=n.positions[u*2],m=n.positions[u*2+1],f=n.angles[u];const v=l.sensorDistance,w=f-a,d=e.sample(p+Math.cos(w)*v,m+Math.sin(w)*v),h=e.sample(p+Math.cos(f)*v,m+Math.sin(f)*v),b=f+a,_=e.sample(p+Math.cos(b)*v,m+Math.sin(b)*v);h>d&&h>_||(h<d&&h<_?f+=(Math.random()<.5?-1:1)*c:d>_?f-=c:_>d?f+=c:f+=(Math.random()-.5)*c*.5),p+=Math.cos(f)*l.moveSpeed,m+=Math.sin(f)*l.moveSpeed,p<0&&(p+=i),p>=i&&(p-=i),m<0&&(m+=s),m>=s&&(m-=s),n.positions[u*2]=p,n.positions[u*2+1]=m,n.angles[u]=f,e.deposit(p,m,g,l.depositAmount)}}e.diffuse(t.diffusionRate),e.decay(t.decayRate),this.renderer.render(e.data)}loop=t=>{this.running&&(this.frameCount++,t-this.fpsTime>=1e3&&(this.currentFps=this.frameCount,this.frameCount=0,this.fpsTime=t,this.onFpsUpdate?.(this.currentFps)),this.step(),this.animationId=requestAnimationFrame(this.loop))};start(){this.running||(this.running=!0,this.fpsTime=performance.now(),this.frameCount=0,this.animationId=requestAnimationFrame(this.loop))}stop(){this.running=!1,this.animationId&&(cancelAnimationFrame(this.animationId),this.animationId=0)}toggle(){this.running?this.stop():this.start()}reset(){for(const t of this.species)t.reset(this.simWidth,this.simHeight);this.trailMap.clear()}resize(t,e){this.canvas.width=t,this.canvas.height=e}addSpecies(t){const e=this.species.length,i={name:`Species ${e+1}`,color:E[e%E.length],...D,...t},s=new I(i,this.simWidth,this.simHeight);return this.species.push(s),this.onSpeciesChange?.(),s}removeSpecies(t){this.species.length>1&&t>=0&&t<this.species.length&&(this.species.splice(t,1),this.onSpeciesChange?.())}getSpecies(){return this.species}updateSpeciesParams(t,e){const i=this.species[t];if(!i)return;const s=i.params.agentCount;Object.assign(i.params,e),e.agentCount!==void 0&&e.agentCount!==s&&i.updateAgentCount(e.agentCount,this.simWidth,this.simHeight)}updateParams(t){const e=this.params.resolution;Object.assign(this.params,t),t.resolution!==void 0&&t.resolution!==e&&this.setResolution(this.params.resolution)}setResolution(t){this.simWidth=t,this.simHeight=t,this.renderer.resize(t,t),this.trailMap.resize(t,t);for(const e of this.species)e.reset(t,t)}getParams(){return{...this.params}}setFpsCallback(t){this.onFpsUpdate=t}setSpeciesChangeCallback(t){this.onSpeciesChange=t}getTrailMap(){return this.trailMap}getSimDimensions(){return{width:this.simWidth,height:this.simHeight}}isRunning(){return this.running}getFps(){return this.currentFps}}class x{constructor(t,e,i,s,r="div"){this.parent=t,this.object=e,this.property=i,this._disabled=!1,this._hidden=!1,this.initialValue=this.getValue(),this.domElement=document.createElement(r),this.domElement.classList.add("lil-controller"),this.domElement.classList.add(s),this.$name=document.createElement("div"),this.$name.classList.add("lil-name"),x.nextNameID=x.nextNameID||0,this.$name.id=`lil-gui-name-${++x.nextNameID}`,this.$widget=document.createElement("div"),this.$widget.classList.add("lil-widget"),this.$disable=this.$widget,this.domElement.appendChild(this.$name),this.domElement.appendChild(this.$widget),this.domElement.addEventListener("keydown",n=>n.stopPropagation()),this.domElement.addEventListener("keyup",n=>n.stopPropagation()),this.parent.children.push(this),this.parent.controllers.push(this),this.parent.$children.appendChild(this.domElement),this._listenCallback=this._listenCallback.bind(this),this.name(i)}name(t){return this._name=t,this.$name.textContent=t,this}onChange(t){return this._onChange=t,this}_callOnChange(){this.parent._callOnChange(this),this._onChange!==void 0&&this._onChange.call(this,this.getValue()),this._changed=!0}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(){this._changed&&(this.parent._callOnFinishChange(this),this._onFinishChange!==void 0&&this._onFinishChange.call(this,this.getValue())),this._changed=!1}reset(){return this.setValue(this.initialValue),this._callOnFinishChange(),this}enable(t=!0){return this.disable(!t)}disable(t=!0){return t===this._disabled?this:(this._disabled=t,this.domElement.classList.toggle("lil-disabled",t),this.$disable.toggleAttribute("disabled",t),this)}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}options(t){const e=this.parent.add(this.object,this.property,t);return e.name(this._name),this.destroy(),e}min(t){return this}max(t){return this}step(t){return this}decimals(t){return this}listen(t=!0){return this._listening=t,this._listenCallbackID!==void 0&&(cancelAnimationFrame(this._listenCallbackID),this._listenCallbackID=void 0),this._listening&&this._listenCallback(),this}_listenCallback(){this._listenCallbackID=requestAnimationFrame(this._listenCallback);const t=this.save();t!==this._listenPrevValue&&this.updateDisplay(),this._listenPrevValue=t}getValue(){return this.object[this.property]}setValue(t){return this.getValue()!==t&&(this.object[this.property]=t,this._callOnChange(),this.updateDisplay()),this}updateDisplay(){return this}load(t){return this.setValue(t),this._callOnFinishChange(),this}save(){return this.getValue()}destroy(){this.listen(!1),this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.controllers.splice(this.parent.controllers.indexOf(this),1),this.parent.$children.removeChild(this.domElement)}}class V extends x{constructor(t,e,i){super(t,e,i,"lil-boolean","label"),this.$input=document.createElement("input"),this.$input.setAttribute("type","checkbox"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$widget.appendChild(this.$input),this.$input.addEventListener("change",()=>{this.setValue(this.$input.checked),this._callOnFinishChange()}),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.checked=this.getValue(),this}}function A(o){let t,e;return(t=o.match(/(#|0x)?([a-f0-9]{6})/i))?e=t[2]:(t=o.match(/rgb\(\s*(\d*)\s*,\s*(\d*)\s*,\s*(\d*)\s*\)/))?e=parseInt(t[1]).toString(16).padStart(2,0)+parseInt(t[2]).toString(16).padStart(2,0)+parseInt(t[3]).toString(16).padStart(2,0):(t=o.match(/^#?([a-f0-9])([a-f0-9])([a-f0-9])$/i))&&(e=t[1]+t[1]+t[2]+t[2]+t[3]+t[3]),e?"#"+e:!1}const H={isPrimitive:!0,match:o=>typeof o=="string",fromHexString:A,toHexString:A},y={isPrimitive:!0,match:o=>typeof o=="number",fromHexString:o=>parseInt(o.substring(1),16),toHexString:o=>"#"+o.toString(16).padStart(6,0)},X={isPrimitive:!1,match:o=>Array.isArray(o)||ArrayBuffer.isView(o),fromHexString(o,t,e=1){const i=y.fromHexString(o);t[0]=(i>>16&255)/255*e,t[1]=(i>>8&255)/255*e,t[2]=(i&255)/255*e},toHexString([o,t,e],i=1){i=255/i;const s=o*i<<16^t*i<<8^e*i<<0;return y.toHexString(s)}},U={isPrimitive:!1,match:o=>Object(o)===o,fromHexString(o,t,e=1){const i=y.fromHexString(o);t.r=(i>>16&255)/255*e,t.g=(i>>8&255)/255*e,t.b=(i&255)/255*e},toHexString({r:o,g:t,b:e},i=1){i=255/i;const s=o*i<<16^t*i<<8^e*i<<0;return y.toHexString(s)}},Y=[H,y,X,U];function z(o){return Y.find(t=>t.match(o))}class B extends x{constructor(t,e,i,s){super(t,e,i,"lil-color"),this.$input=document.createElement("input"),this.$input.setAttribute("type","color"),this.$input.setAttribute("tabindex",-1),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$text=document.createElement("input"),this.$text.setAttribute("type","text"),this.$text.setAttribute("spellcheck","false"),this.$text.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$display.appendChild(this.$input),this.$widget.appendChild(this.$display),this.$widget.appendChild(this.$text),this._format=z(this.initialValue),this._rgbScale=s,this._initialValueHexString=this.save(),this._textFocused=!1,this.$input.addEventListener("input",()=>{this._setValueFromHexString(this.$input.value)}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$text.addEventListener("input",()=>{const r=A(this.$text.value);r&&this._setValueFromHexString(r)}),this.$text.addEventListener("focus",()=>{this._textFocused=!0,this.$text.select()}),this.$text.addEventListener("blur",()=>{this._textFocused=!1,this.updateDisplay(),this._callOnFinishChange()}),this.$disable=this.$text,this.updateDisplay()}reset(){return this._setValueFromHexString(this._initialValueHexString),this}_setValueFromHexString(t){if(this._format.isPrimitive){const e=this._format.fromHexString(t);this.setValue(e)}else this._format.fromHexString(t,this.getValue(),this._rgbScale),this._callOnChange(),this.updateDisplay()}save(){return this._format.toHexString(this.getValue(),this._rgbScale)}load(t){return this._setValueFromHexString(t),this._callOnFinishChange(),this}updateDisplay(){return this.$input.value=this._format.toHexString(this.getValue(),this._rgbScale),this._textFocused||(this.$text.value=this.$input.value.substring(1)),this.$display.style.backgroundColor=this.$input.value,this}}class C extends x{constructor(t,e,i){super(t,e,i,"lil-function"),this.$button=document.createElement("button"),this.$button.appendChild(this.$name),this.$widget.appendChild(this.$button),this.$button.addEventListener("click",s=>{s.preventDefault(),this.getValue().call(this.object),this._callOnChange()}),this.$button.addEventListener("touchstart",()=>{},{passive:!0}),this.$disable=this.$button}}class N extends x{constructor(t,e,i,s,r,n){super(t,e,i,"lil-number"),this._initInput(),this.min(s),this.max(r);const l=n!==void 0;this.step(l?n:this._getImplicitStep(),l),this.updateDisplay()}decimals(t){return this._decimals=t,this.updateDisplay(),this}min(t){return this._min=t,this._onUpdateMinMax(),this}max(t){return this._max=t,this._onUpdateMinMax(),this}step(t,e=!0){return this._step=t,this._stepExplicit=e,this}updateDisplay(){const t=this.getValue();if(this._hasSlider){let e=(t-this._min)/(this._max-this._min);e=Math.max(0,Math.min(e,1)),this.$fill.style.width=e*100+"%"}return this._inputFocused||(this.$input.value=this._decimals===void 0?t:t.toFixed(this._decimals)),this}_initInput(){this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("aria-labelledby",this.$name.id),window.matchMedia("(pointer: coarse)").matches&&(this.$input.setAttribute("type","number"),this.$input.setAttribute("step","any")),this.$widget.appendChild(this.$input),this.$disable=this.$input;const e=()=>{let h=parseFloat(this.$input.value);isNaN(h)||(this._stepExplicit&&(h=this._snap(h)),this.setValue(this._clamp(h)))},i=h=>{const b=parseFloat(this.$input.value);isNaN(b)||(this._snapClampSetValue(b+h),this.$input.value=this.getValue())},s=h=>{h.key==="Enter"&&this.$input.blur(),h.code==="ArrowUp"&&(h.preventDefault(),i(this._step*this._arrowKeyMultiplier(h))),h.code==="ArrowDown"&&(h.preventDefault(),i(this._step*this._arrowKeyMultiplier(h)*-1))},r=h=>{this._inputFocused&&(h.preventDefault(),i(this._step*this._normalizeMouseWheel(h)))};let n=!1,l,a,c,g,u;const p=5,m=h=>{l=h.clientX,a=c=h.clientY,n=!0,g=this.getValue(),u=0,window.addEventListener("mousemove",f),window.addEventListener("mouseup",v)},f=h=>{if(n){const b=h.clientX-l,_=h.clientY-a;Math.abs(_)>p?(h.preventDefault(),this.$input.blur(),n=!1,this._setDraggingStyle(!0,"vertical")):Math.abs(b)>p&&v()}if(!n){const b=h.clientY-c;u-=b*this._step*this._arrowKeyMultiplier(h),g+u>this._max?u=this._max-g:g+u<this._min&&(u=this._min-g),this._snapClampSetValue(g+u)}c=h.clientY},v=()=>{this._setDraggingStyle(!1,"vertical"),this._callOnFinishChange(),window.removeEventListener("mousemove",f),window.removeEventListener("mouseup",v)},w=()=>{this._inputFocused=!0},d=()=>{this._inputFocused=!1,this.updateDisplay(),this._callOnFinishChange()};this.$input.addEventListener("input",e),this.$input.addEventListener("keydown",s),this.$input.addEventListener("wheel",r,{passive:!1}),this.$input.addEventListener("mousedown",m),this.$input.addEventListener("focus",w),this.$input.addEventListener("blur",d)}_initSlider(){this._hasSlider=!0,this.$slider=document.createElement("div"),this.$slider.classList.add("lil-slider"),this.$fill=document.createElement("div"),this.$fill.classList.add("lil-fill"),this.$slider.appendChild(this.$fill),this.$widget.insertBefore(this.$slider,this.$input),this.domElement.classList.add("lil-has-slider");const t=(d,h,b,_,T)=>(d-h)/(b-h)*(T-_)+_,e=d=>{const h=this.$slider.getBoundingClientRect();let b=t(d,h.left,h.right,this._min,this._max);this._snapClampSetValue(b)},i=d=>{this._setDraggingStyle(!0),e(d.clientX),window.addEventListener("mousemove",s),window.addEventListener("mouseup",r)},s=d=>{e(d.clientX)},r=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("mousemove",s),window.removeEventListener("mouseup",r)};let n=!1,l,a;const c=d=>{d.preventDefault(),this._setDraggingStyle(!0),e(d.touches[0].clientX),n=!1},g=d=>{d.touches.length>1||(this._hasScrollBar?(l=d.touches[0].clientX,a=d.touches[0].clientY,n=!0):c(d),window.addEventListener("touchmove",u,{passive:!1}),window.addEventListener("touchend",p))},u=d=>{if(n){const h=d.touches[0].clientX-l,b=d.touches[0].clientY-a;Math.abs(h)>Math.abs(b)?c(d):(window.removeEventListener("touchmove",u),window.removeEventListener("touchend",p))}else d.preventDefault(),e(d.touches[0].clientX)},p=()=>{this._callOnFinishChange(),this._setDraggingStyle(!1),window.removeEventListener("touchmove",u),window.removeEventListener("touchend",p)},m=this._callOnFinishChange.bind(this),f=400;let v;const w=d=>{if(Math.abs(d.deltaX)<Math.abs(d.deltaY)&&this._hasScrollBar)return;d.preventDefault();const b=this._normalizeMouseWheel(d)*this._step;this._snapClampSetValue(this.getValue()+b),this.$input.value=this.getValue(),clearTimeout(v),v=setTimeout(m,f)};this.$slider.addEventListener("mousedown",i),this.$slider.addEventListener("touchstart",g,{passive:!1}),this.$slider.addEventListener("wheel",w,{passive:!1})}_setDraggingStyle(t,e="horizontal"){this.$slider&&this.$slider.classList.toggle("lil-active",t),document.body.classList.toggle("lil-dragging",t),document.body.classList.toggle(`lil-${e}`,t)}_getImplicitStep(){return this._hasMin&&this._hasMax?(this._max-this._min)/1e3:.1}_onUpdateMinMax(){!this._hasSlider&&this._hasMin&&this._hasMax&&(this._stepExplicit||this.step(this._getImplicitStep(),!1),this._initSlider(),this.updateDisplay())}_normalizeMouseWheel(t){let{deltaX:e,deltaY:i}=t;return Math.floor(t.deltaY)!==t.deltaY&&t.wheelDelta&&(e=0,i=-t.wheelDelta/120,i*=this._stepExplicit?1:10),e+-i}_arrowKeyMultiplier(t){let e=this._stepExplicit?1:10;return t.shiftKey?e*=10:t.altKey&&(e/=10),e}_snap(t){let e=0;return this._hasMin?e=this._min:this._hasMax&&(e=this._max),t-=e,t=Math.round(t/this._step)*this._step,t+=e,t=parseFloat(t.toPrecision(15)),t}_clamp(t){return t<this._min&&(t=this._min),t>this._max&&(t=this._max),t}_snapClampSetValue(t){this.setValue(this._clamp(this._snap(t)))}get _hasScrollBar(){const t=this.parent.root.$children;return t.scrollHeight>t.clientHeight}get _hasMin(){return this._min!==void 0}get _hasMax(){return this._max!==void 0}}class W extends x{constructor(t,e,i,s){super(t,e,i,"lil-option"),this.$select=document.createElement("select"),this.$select.setAttribute("aria-labelledby",this.$name.id),this.$display=document.createElement("div"),this.$display.classList.add("lil-display"),this.$select.addEventListener("change",()=>{this.setValue(this._values[this.$select.selectedIndex]),this._callOnFinishChange()}),this.$select.addEventListener("focus",()=>{this.$display.classList.add("lil-focus")}),this.$select.addEventListener("blur",()=>{this.$display.classList.remove("lil-focus")}),this.$widget.appendChild(this.$select),this.$widget.appendChild(this.$display),this.$disable=this.$select,this.options(s)}options(t){return this._values=Array.isArray(t)?t:Object.values(t),this._names=Array.isArray(t)?t:Object.keys(t),this.$select.replaceChildren(),this._names.forEach(e=>{const i=document.createElement("option");i.textContent=e,this.$select.appendChild(i)}),this.updateDisplay(),this}updateDisplay(){const t=this.getValue(),e=this._values.indexOf(t);return this.$select.selectedIndex=e,this.$display.textContent=e===-1?t:this._names[e],this}}class j extends x{constructor(t,e,i){super(t,e,i,"lil-string"),this.$input=document.createElement("input"),this.$input.setAttribute("type","text"),this.$input.setAttribute("spellcheck","false"),this.$input.setAttribute("aria-labelledby",this.$name.id),this.$input.addEventListener("input",()=>{this.setValue(this.$input.value)}),this.$input.addEventListener("keydown",s=>{s.code==="Enter"&&this.$input.blur()}),this.$input.addEventListener("blur",()=>{this._callOnFinishChange()}),this.$widget.appendChild(this.$input),this.$disable=this.$input,this.updateDisplay()}updateDisplay(){return this.$input.value=this.getValue(),this}}var G=`.lil-gui {
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
}`;function q(o){const t=document.createElement("style");t.innerHTML=o;const e=document.querySelector("head link[rel=stylesheet], head style");e?document.head.insertBefore(t,e):document.head.appendChild(t)}let F=!1;class S{constructor({parent:t,autoPlace:e=t===void 0,container:i,width:s,title:r="Controls",closeFolders:n=!1,injectStyles:l=!0,touchStyles:a=!0}={}){if(this.parent=t,this.root=t?t.root:this,this.children=[],this.controllers=[],this.folders=[],this._closed=!1,this._hidden=!1,this.domElement=document.createElement("div"),this.domElement.classList.add("lil-gui"),this.$title=document.createElement("button"),this.$title.classList.add("lil-title"),this.$title.setAttribute("aria-expanded",!0),this.$title.addEventListener("click",()=>this.openAnimated(this._closed)),this.$title.addEventListener("touchstart",()=>{},{passive:!0}),this.$children=document.createElement("div"),this.$children.classList.add("lil-children"),this.domElement.appendChild(this.$title),this.domElement.appendChild(this.$children),this.title(r),this.parent){this.parent.children.push(this),this.parent.folders.push(this),this.parent.$children.appendChild(this.domElement);return}this.domElement.classList.add("lil-root"),a&&this.domElement.classList.add("lil-allow-touch-styles"),!F&&l&&(q(G),F=!0),i?i.appendChild(this.domElement):e&&(this.domElement.classList.add("lil-auto-place","autoPlace"),document.body.appendChild(this.domElement)),s&&this.domElement.style.setProperty("--width",s+"px"),this._closeFolders=n}add(t,e,i,s,r){if(Object(i)===i)return new W(this,t,e,i);const n=t[e];switch(typeof n){case"number":return new N(this,t,e,i,s,r);case"boolean":return new V(this,t,e);case"string":return new j(this,t,e);case"function":return new C(this,t,e)}console.error(`gui.add failed
	property:`,e,`
	object:`,t,`
	value:`,n)}addColor(t,e,i=1){return new B(this,t,e,i)}addFolder(t){const e=new S({parent:this,title:t});return this.root._closeFolders&&e.close(),e}load(t,e=!0){return t.controllers&&this.controllers.forEach(i=>{i instanceof C||i._name in t.controllers&&i.load(t.controllers[i._name])}),e&&t.folders&&this.folders.forEach(i=>{i._title in t.folders&&i.load(t.folders[i._title])}),this}save(t=!0){const e={controllers:{},folders:{}};return this.controllers.forEach(i=>{if(!(i instanceof C)){if(i._name in e.controllers)throw new Error(`Cannot save GUI with duplicate property "${i._name}"`);e.controllers[i._name]=i.save()}}),t&&this.folders.forEach(i=>{if(i._title in e.folders)throw new Error(`Cannot save GUI with duplicate folder "${i._title}"`);e.folders[i._title]=i.save()}),e}open(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),this.domElement.classList.toggle("lil-closed",this._closed),this}close(){return this.open(!1)}_setClosed(t){this._closed!==t&&(this._closed=t,this._callOnOpenClose(this))}show(t=!0){return this._hidden=!t,this.domElement.style.display=this._hidden?"none":"",this}hide(){return this.show(!1)}openAnimated(t=!0){return this._setClosed(!t),this.$title.setAttribute("aria-expanded",!this._closed),requestAnimationFrame(()=>{const e=this.$children.clientHeight;this.$children.style.height=e+"px",this.domElement.classList.add("lil-transition");const i=r=>{r.target===this.$children&&(this.$children.style.height="",this.domElement.classList.remove("lil-transition"),this.$children.removeEventListener("transitionend",i))};this.$children.addEventListener("transitionend",i);const s=t?this.$children.scrollHeight:0;this.domElement.classList.toggle("lil-closed",!t),requestAnimationFrame(()=>{this.$children.style.height=s+"px"})}),this}title(t){return this._title=t,this.$title.textContent=t,this}reset(t=!0){return(t?this.controllersRecursive():this.controllers).forEach(i=>i.reset()),this}onChange(t){return this._onChange=t,this}_callOnChange(t){this.parent&&this.parent._callOnChange(t),this._onChange!==void 0&&this._onChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onFinishChange(t){return this._onFinishChange=t,this}_callOnFinishChange(t){this.parent&&this.parent._callOnFinishChange(t),this._onFinishChange!==void 0&&this._onFinishChange.call(this,{object:t.object,property:t.property,value:t.getValue(),controller:t})}onOpenClose(t){return this._onOpenClose=t,this}_callOnOpenClose(t){this.parent&&this.parent._callOnOpenClose(t),this._onOpenClose!==void 0&&this._onOpenClose.call(this,t)}destroy(){this.parent&&(this.parent.children.splice(this.parent.children.indexOf(this),1),this.parent.folders.splice(this.parent.folders.indexOf(this),1)),this.domElement.parentElement&&this.domElement.parentElement.removeChild(this.domElement),Array.from(this.children).forEach(t=>t.destroy())}controllersRecursive(){let t=Array.from(this.controllers);return this.folders.forEach(e=>{t=t.concat(e.controllersRecursive())}),t}foldersRecursive(){let t=Array.from(this.folders);return this.folders.forEach(e=>{t=t.concat(e.foldersRecursive())}),t}}class K{gui;simulation;params;controlState;fpsDisplay;speciesFolders=[];speciesContainer;constructor(t){this.simulation=t,this.params=t.getParams(),this.controlState={drawMode:"draw",brushRadius:20,drawColor:E[0]},this.fpsDisplay={fps:"0 FPS"},this.gui=new S({title:"Slime Mold Simulation"}),this.setupControls(),t.setFpsCallback(e=>{this.fpsDisplay.fps=`${e} FPS`}),t.setSpeciesChangeCallback(()=>{this.rebuildSpeciesUI()})}setupControls(){const t=this.gui.addFolder("Performance");t.add(this.fpsDisplay,"fps").name("Frame Rate").disable(),t.add(this.params,"resolution",200,800,50).name("Resolution").onChange(a=>{this.simulation.updateParams({resolution:a})});const e=this.gui.addFolder("Trail (Global)");e.add(this.params,"diffusionRate",0,.5,.01).name("Diffusion Rate").onChange(a=>{this.simulation.updateParams({diffusionRate:a})}),e.add(this.params,"decayRate",.9,1,.001).name("Decay Rate").onChange(a=>{this.simulation.updateParams({decayRate:a})}),this.speciesContainer=this.gui.addFolder("Species"),this.rebuildSpeciesUI();const i={addSpecies:()=>{this.simulation.addSpecies()}};this.speciesContainer.add(i,"addSpecies").name("+ Add Species");const s=this.gui.addFolder("Interaction");s.add(this.controlState,"drawMode",["draw","erase"]).name("Draw Mode"),s.add(this.controlState,"brushRadius",5,100,1).name("Brush Radius");const r={color:this.rgbToHex(this.controlState.drawColor)};s.addColor(r,"color").name("Draw Color").onChange(a=>{this.controlState.drawColor=this.hexToRgb(a)});const n=this.gui.addFolder("Actions"),l={pause:()=>this.simulation.toggle(),reset:()=>this.simulation.reset()};n.add(l,"pause").name("Pause / Resume (Space)"),n.add(l,"reset").name("Reset (R)"),t.open(),e.open(),this.speciesContainer.open()}rebuildSpeciesUI(){for(const e of this.speciesFolders)e.destroy();this.speciesFolders=[];const t=this.simulation.getSpecies();for(let e=0;e<t.length;e++){const i=t[e],s=this.createSpeciesFolder(i,e);this.speciesFolders.push(s)}}createSpeciesFolder(t,e){const i=this.speciesContainer.addFolder(t.params.name),s=t.params;i.add(s,"name").name("Name").onChange(n=>{i.title(n)});const r={color:this.rgbToHex(s.color)};if(i.addColor(r,"color").name("Color").onChange(n=>{s.color=this.hexToRgb(n)}),i.add(s,"agentCount",100,2e4,100).name("Agents").onChange(n=>{this.simulation.updateSpeciesParams(e,{agentCount:n})}),i.add(s,"sensorAngle",10,90,1).name("Sensor Angle"),i.add(s,"sensorDistance",1,30,1).name("Sensor Distance"),i.add(s,"turnSpeed",5,180,1).name("Turn Speed"),i.add(s,"moveSpeed",.5,5,.1).name("Move Speed"),i.add(s,"depositAmount",1,20,.5).name("Deposit Amount"),this.simulation.getSpecies().length>1){const n={remove:()=>{this.simulation.removeSpecies(e)}};i.add(n,"remove").name("Remove Species")}return i.open(),i}rgbToHex(t){const e=Math.round(t[0]*255),i=Math.round(t[1]*255),s=Math.round(t[2]*255);return`#${e.toString(16).padStart(2,"0")}${i.toString(16).padStart(2,"0")}${s.toString(16).padStart(2,"0")}`}hexToRgb(t){const e=/^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);return e?[parseInt(e[1],16)/255,parseInt(e[2],16)/255,parseInt(e[3],16)/255]:[1,1,1]}getControlState(){return this.controlState}destroy(){this.gui.destroy()}}class Z{canvas;simulation;controls;isDrawing=!1;lastX=0;lastY=0;constructor(t,e,i){this.canvas=t,this.simulation=e,this.controls=i,this.setupMouseEvents(),this.setupTouchEvents(),this.setupKeyboardEvents()}getSimPosition(t,e){const i=this.canvas.getBoundingClientRect(),s=this.simulation.getSimDimensions(),r=(t-i.left)/i.width*s.width,n=(e-i.top)/i.height*s.height;return[r,n]}handleDraw(t,e){const i=this.controls.getControlState(),s=this.simulation.getTrailMap(),r=this.simulation.getSimDimensions(),n=this.canvas.getBoundingClientRect(),l=r.width/n.width,a=i.brushRadius*l;switch(i.drawMode){case"draw":s.drawCircle(t,e,a,i.drawColor,50);break;case"erase":s.eraseCircle(t,e,a);break}}setupMouseEvents(){this.canvas.addEventListener("mousedown",t=>{if(t.button!==0)return;this.isDrawing=!0;const[e,i]=this.getSimPosition(t.clientX,t.clientY);this.lastX=e,this.lastY=i,this.handleDraw(e,i)}),this.canvas.addEventListener("mousemove",t=>{if(!this.isDrawing)return;const[e,i]=this.getSimPosition(t.clientX,t.clientY),s=e-this.lastX,r=i-this.lastY,n=Math.sqrt(s*s+r*r),l=Math.max(1,Math.floor(n/2));for(let a=1;a<=l;a++){const c=a/l;this.handleDraw(this.lastX+s*c,this.lastY+r*c)}this.lastX=e,this.lastY=i}),this.canvas.addEventListener("mouseup",()=>{this.isDrawing=!1}),this.canvas.addEventListener("mouseleave",()=>{this.isDrawing=!1})}setupTouchEvents(){this.canvas.addEventListener("touchstart",t=>{if(t.preventDefault(),t.touches.length!==1)return;this.isDrawing=!0;const e=t.touches[0],[i,s]=this.getSimPosition(e.clientX,e.clientY);this.lastX=i,this.lastY=s,this.handleDraw(i,s)},{passive:!1}),this.canvas.addEventListener("touchmove",t=>{if(t.preventDefault(),!this.isDrawing||t.touches.length!==1)return;const e=t.touches[0],[i,s]=this.getSimPosition(e.clientX,e.clientY),r=i-this.lastX,n=s-this.lastY,l=Math.sqrt(r*r+n*n),a=Math.max(1,Math.floor(l/2));for(let c=1;c<=a;c++){const g=c/a;this.handleDraw(this.lastX+r*g,this.lastY+n*g)}this.lastX=i,this.lastY=s},{passive:!1}),this.canvas.addEventListener("touchend",()=>{this.isDrawing=!1}),this.canvas.addEventListener("touchcancel",()=>{this.isDrawing=!1})}setupKeyboardEvents(){document.addEventListener("keydown",t=>{if(!(t.target instanceof HTMLInputElement))switch(t.code){case"Space":t.preventDefault(),this.simulation.toggle();break;case"KeyR":t.preventDefault(),this.simulation.reset();break}})}}function L(){const o=document.getElementById("app"),t=document.createElement("canvas");t.id="canvas",o.appendChild(t);function e(){t.width=window.innerWidth,t.height=window.innerHeight}e();const i=document.createElement("div");i.id="instructions",i.innerHTML=`
    <kbd>Space</kbd> Pause/Resume &nbsp;
    <kbd>R</kbd> Reset &nbsp;
    <kbd>Click & Drag</kbd> Paint trails
  `,document.body.appendChild(i);let s,r;try{s=new P(t),r=new K(s),new Z(t,s,r);let n;window.addEventListener("resize",()=>{clearTimeout(n),n=window.setTimeout(()=>{e(),s.resize(t.width,t.height)},100)}),s.start()}catch(n){console.error("Failed to initialize simulation:",n),o.innerHTML=`
      <div style="color: #ff4444; font-family: monospace; padding: 20px; text-align: center;">
        <h2>WebGL2 Error</h2>
        <p>${n instanceof Error?n.message:"Unknown error"}</p>
        <p style="margin-top: 10px; color: #888;">
          This simulation requires WebGL2 with float texture support.
        </p>
      </div>
    `}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",L):L();
