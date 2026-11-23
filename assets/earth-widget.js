/* FLOXOV Planet Earth — dependency-free, self-hosted WebGL.
   Source texture: NASA Blue Marble Next Generation, packaged locally.
   No external scripts, CDNs, geolocation, cookies or backend calls.
   Night is a full-globe artistic blackout, scheduled by Krasnodar civil time (Europe/Moscow).
   Debug preview: ?earthPreview=day or ?earthPreview=night ; normal: omit the parameter.
*/
(() => {
  'use strict';
  const card = document.getElementById('floxovEarthCard');
  const canvas = document.getElementById('floxovEarthCanvas');
  const clock = document.getElementById('floxovEarthTime');
  if (!card || !canvas || !clock) return;
  const gl = canvas.getContext('webgl', {alpha:true, antialias:true, depth:true, stencil:false, powerPreference:'low-power'});
  if (!gl) { card.dataset.unavailable = 'true'; return; }
  const vertex = `
    attribute vec3 aPosition;
    attribute vec3 aNormal;
    attribute vec2 aUv;
    uniform float uRotation;
    uniform float uAspect;
    uniform float uScale;
    uniform float uOffsetX;
    uniform float uOffsetY;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main(){
      float c=cos(uRotation),s=sin(uRotation);
      vec3 p=vec3(c*aPosition.x+s*aPosition.z,aPosition.y,-s*aPosition.x+c*aPosition.z);
      vec3 n=normalize(vec3(c*aNormal.x+s*aNormal.z,aNormal.y,-s*aNormal.x+c*aNormal.z));
      vNormal=n;
      vPosition=p;
      vUv=aUv;
      gl_Position=vec4(p.x*uScale/uAspect+uOffsetX,p.y*uScale+uOffsetY,-p.z*0.5,1.0);
    }`;
  const fragment = `
    precision mediump float;
    uniform sampler2D uDayTexture;
    uniform float uNight;
    varying vec3 vNormal;
    varying vec3 vPosition;
    varying vec2 vUv;
    void main(){
      vec3 n=normalize(vNormal);
      vec3 sunlight=normalize(vec3(-0.50,0.40,0.76));
      float lighting=max(dot(n,sunlight),0.0);
      float ambient=0.19;
      float diffuse=ambient+lighting*0.89;
      vec3 day=texture2D(uDayTexture,vUv).rgb;
      day*=diffuse;
      float rim=pow(1.0-max(n.z,0.0),3.0);
      day+=vec3(0.015,0.033,0.047)*rim;
      // Entire sphere darkens uniformly. No separate atmospheric glow, blue halo or ozone shell.
      vec3 night=vec3(0.008,0.011,0.015)+day*0.025;
      gl_FragColor=vec4(mix(day,night,uNight),1.0);
    }`;
  function shader(type, source) {
    const sh=gl.createShader(type);gl.shaderSource(sh,source);gl.compileShader(sh);
    if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh));
    return sh;
  }
  let program;
  try {
    program=gl.createProgram();
    gl.attachShader(program,shader(gl.VERTEX_SHADER,vertex));
    gl.attachShader(program,shader(gl.FRAGMENT_SHADER,fragment));
    gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  } catch (e) {console.warn('FLOXOV Earth WebGL unavailable',e);card.dataset.unavailable='true';return;}
  gl.useProgram(program);
  // High-poly UV sphere with 128 longitude x 96 latitude segments.
  const positions=[], normals=[], uvs=[], indices=[];
  const latCount=96,lonCount=128;
  for(let y=0;y<=latCount;y++){
    const lat=Math.PI*(0.5-y/latCount),cl=Math.cos(lat),sl=Math.sin(lat);
    for(let x=0;x<=lonCount;x++){
      const lon=x/lonCount*Math.PI*2-Math.PI;
      const px=cl*Math.sin(lon),py=sl,pz=cl*Math.cos(lon);
      positions.push(px,py,pz); normals.push(px,py,pz); uvs.push(x/lonCount,1-y/latCount);
    }
  }
  for(let y=0;y<latCount;y++)for(let x=0;x<lonCount;x++){
    const a=y*(lonCount+1)+x,b=a+lonCount+1;
    indices.push(a,b,a+1,b,b+1,a+1);
  }
  function attribute(name,values,size){
    const loc=gl.getAttribLocation(program,name),buf=gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,buf);gl.bufferData(gl.ARRAY_BUFFER,new Float32Array(values),gl.STATIC_DRAW);
    gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,size,gl.FLOAT,false,0,0);
  }
  attribute('aPosition',positions,3);attribute('aNormal',normals,3);attribute('aUv',uvs,2);
  const indexBuffer=gl.createBuffer();gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER,new Uint16Array(indices),gl.STATIC_DRAW);
  const uniforms={};for(const key of ['uRotation','uAspect','uScale','uOffsetX','uOffsetY','uNight','uDayTexture'])uniforms[key]=gl.getUniformLocation(program,key);
  gl.uniform1i(uniforms.uDayTexture,0);
  gl.disable(gl.CULL_FACE);gl.disable(gl.BLEND);gl.enable(gl.DEPTH_TEST);gl.depthFunc(gl.LEQUAL);
  const texture=gl.createTexture();gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,texture);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.REPEAT);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([25,69,95,255]));
  let textureReady=false;
  const image=new Image();image.decoding='async';image.onload=()=>{
    gl.bindTexture(gl.TEXTURE_2D,texture);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
    gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,image);
    gl.generateMipmap(gl.TEXTURE_2D);textureReady=true;requestDraw();
  };
  image.onerror=()=>{card.dataset.unavailable='true';};
  image.src='./assets/earth-day.webp';
  const timeFormatter=new Intl.DateTimeFormat('ru-RU',{timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const partsFormatter=new Intl.DateTimeFormat('en-US',{timeZone:'Europe/Moscow',hour:'2-digit',minute:'2-digit',hourCycle:'h23'});
  const preview=new URLSearchParams(location.search).get('earthPreview');
  const forced=preview==='day'?14:preview==='night'?22:null;
  function getHour(){return forced===null?Number(partsFormatter.format(new Date())):forced;}
  function refreshTime(){
    clock.textContent=forced===null?timeFormatter.format(new Date()):`${String(forced).padStart(2,'0')}:00`;
    const hour=getHour();targetNight=hour>=20||hour<6?1:0;
  }
  let targetNight=0,night=0,angle=1.309,last=0,visible=true,inViewport=false,raf=0;
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function resize(){
    const bounds=card.getBoundingClientRect();if(!bounds.width||!bounds.height)return;
    const dpr=Math.min(window.devicePixelRatio||1,2);
    const w=Math.max(1,Math.round(bounds.width*dpr)),h=Math.max(1,Math.round(bounds.height*dpr));
    if(canvas.width!==w||canvas.height!==h){canvas.width=w;canvas.height=h;gl.viewport(0,0,w,h);}
    const compact=bounds.width<680;
    gl.uniform1f(uniforms.uAspect,bounds.width/bounds.height);
    gl.uniform1f(uniforms.uScale,compact?0.72:0.87);
    gl.uniform1f(uniforms.uOffsetX,compact?0.18:0.20);
    gl.uniform1f(uniforms.uOffsetY,compact?-0.10:0.0);
    requestDraw();
  }
  function render(){
    gl.clearColor(0,0,0,0);gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT);
    gl.uniform1f(uniforms.uRotation,angle);
    gl.uniform1f(uniforms.uNight,night);
    gl.drawElements(gl.TRIANGLES,indices.length,gl.UNSIGNED_SHORT,0);
  }
  function frame(now){
    raf=0;if(!visible||!inViewport||!textureReady)return;
    const dt=last?Math.min((now-last)/1000,.08):0;last=now;
    // Full nighttime color settles over ~10 seconds; no patchy day/night terminator.
    night+=(targetNight-night)*Math.min(1,dt*.42);
    if(Math.abs(targetNight-night)<.0004)night=targetNight;
    if(!reduceMotion)angle+=dt*.025;
    render();
    if(!reduceMotion||night!==targetNight)requestDraw();
  }
  function requestDraw(){if(!raf&&visible&&inViewport)raf=requestAnimationFrame(frame);}
  new ResizeObserver(resize).observe(card);
  const observer=new IntersectionObserver(entries=>{inViewport=entries[0].isIntersecting;if(inViewport){last=0;requestDraw();}}, {threshold:0.01});observer.observe(card);
  document.addEventListener('visibilitychange',()=>{visible=!document.hidden;last=0;if(visible){refreshTime();requestDraw();}});
  window.addEventListener('pageshow',()=>{refreshTime();resize();requestDraw();});
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();visible=false;card.dataset.unavailable='true';});
  refreshTime();night=targetNight;
  setInterval(()=>{refreshTime();requestDraw();},1000);
  resize();
})();
