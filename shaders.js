/* Axsimaros Observatory II: physically inspired real-time shaders.
   Black-hole ray bending is an illustrative numerical approximation, not a validated GR solver. */
const GLSL_NOISE=`
float hash31(vec3 p){p=fract(p*.1031);p+=dot(p,p.yzx+33.33);return fract((p.x+p.y)*p.z);}
float noise(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(mix(hash31(i),hash31(i+vec3(1,0,0)),f.x),mix(hash31(i+vec3(0,1,0)),hash31(i+vec3(1,1,0)),f.x),f.y),mix(mix(hash31(i+vec3(0,0,1)),hash31(i+vec3(1,0,1)),f.x),mix(hash31(i+vec3(0,1,1)),hash31(i+vec3(1,1,1)),f.x),f.y),f.z);}
float fbm(vec3 p){float f=0.,a=.5;for(int i=0;i<5;i++){f+=a*noise(p);p=p*2.03+vec3(1.2,3.4,5.6);a*=.5;}return f;}
vec3 film(vec3 x){return clamp((x*(2.51*x+.03))/(x*(2.43*x+.59)+.14),0.,1.);}
`;
const meshVertex=`attribute vec3 aPos;attribute vec3 aNormal;uniform mat4 uVP;uniform mat4 uModel;varying vec3 vLocal;varying vec3 vNormal;varying vec3 vWorld;void main(){vLocal=aPos;vec4 w=uModel*vec4(aPos,1.);vWorld=w.xyz;vNormal=normalize(mat3(uModel)*aNormal);gl_Position=uVP*w;}`;
const meshFragment=`precision highp float;
varying vec3 vLocal;varying vec3 vNormal;varying vec3 vWorld;
uniform vec3 uColor,uLight,uEye,uCenter;uniform float uKind,uTime,uAlpha,uRadius,uHasTexture,uHasNight;
uniform sampler2D uMap,uNight;
${GLSL_NOISE}
void main(){vec3 n=normalize(vNormal),v=normalize(uEye-vWorld),l=normalize(uLight-vWorld);float nl=dot(n,l);float mu=max(dot(n,v),0.);vec3 c=uColor;float alpha=uAlpha;
if(uKind>10.5){gl_FragColor=vec4(uColor,alpha);return;}
if(uKind>9.5){float rim=pow(1.-abs(dot(n,v)),3.);float daylight=smoothstep(-.35,.5,nl);gl_FragColor=vec4(uColor*(.2+daylight*1.7),rim*(.10+daylight*.58));return;}
if(uKind>8.5){float f=fbm(vLocal*8.+vec3(uTime*.012,0,0));float cloud=smoothstep(.48,.69,f);gl_FragColor=vec4(vec3(.87,.94,1.)*(.12+max(0.,nl)),cloud*.57);return;}
if(uKind>6.5){float r=length(vLocal.xz);float band=.67+.18*sin(r*95.)+.10*sin(r*231.);if(uHasTexture>.5)band=texture2D(uMap,vec2(clamp((r-1.22)/1.12,0.,1.),.5)).a;float gap=1.-.87*exp(-pow((r-1.93)*55.,2.));vec3 q=vWorld-uCenter;float t=dot(-q,l);float shadow=t>0.&&length(q+t*l)<uRadius?.14:1.;float inner=smoothstep(1.22,1.31,r),outer=1.-smoothstep(2.24,2.34,r);c*=band*gap*shadow*(.35+.65*abs(nl));gl_FragColor=vec4(c,alpha*inner*outer*gap);return;}
vec3 local=normalize(vLocal);vec2 uv=vec2(atan(local.z,local.x)/6.2831853+.5,acos(clamp(local.y,-1.,1.))/3.14159265);
float f=fbm(local*12.);
if(uKind<.5){float granules=noise(local*190.+uTime*.1);float hot=fbm(local*37.+vec3(uTime*.023));c=mix(uColor*.55,mix(uColor,vec3(1.),.68),hot*.7+granules*.3);if(uHasTexture>.5)c=mix(c,texture2D(uMap,uv).rgb,.35);c*=1.55*(.5+.5*pow(mu,.45));gl_FragColor=vec4(pow(film(c),vec3(.4545)),1.);return;}
if(uKind<1.5)c*=.6+.65*f;
else if(uKind<2.5){float land=fbm(local*3.7);c=mix(vec3(.015,.09,.24),vec3(.17,.29,.10),smoothstep(.49,.54,land));c=mix(c,vec3(.6,.52,.32),smoothstep(.6,.72,land));}
else {float band=sin(local.y*43.+fbm(local*9.)*5.);c*=.82+.23*band;}
if(uHasTexture>.5)c=texture2D(uMap,uv).rgb;
vec3 linear=pow(max(c,vec3(.001)),vec3(2.2));float lambert=max(0.,nl);vec3 radiance=linear*(.018+lambert*1.55);
if(uKind>1.5&&uKind<2.5){float water=clamp((c.b-c.r)*4.,0.,1.);vec3 h=normalize(l+v);radiance+=vec3(.9,1.,1.)*pow(max(dot(n,h),0.),100.)*water*.45*lambert;if(uHasNight>.5)radiance+=pow(texture2D(uNight,uv).rgb,vec3(1.5))*(1.-smoothstep(-.3,.1,nl))*1.7;radiance+=vec3(.07,.25,.65)*pow(1.-mu,4.)*smoothstep(-.15,.5,nl)*.45;}
gl_FragColor=vec4(pow(film(radiance),vec3(.4545)),alpha);
}`;
const pointVertex=`attribute vec3 aPos;attribute vec3 aColor;attribute float aSize;uniform mat4 uVP,uModel;uniform float uPixel,uTime,uSwirl;varying vec3 vColor;void main(){vec3 pos=aPos;float r=length(pos.xz);float a=uTime*uSwirl/(2.+r);pos.xz=mat2(cos(a),-sin(a),sin(a),cos(a))*pos.xz;vec4 p=uVP*uModel*vec4(pos,1.);gl_Position=p;gl_PointSize=clamp(aSize*uPixel/max(p.w,.01),1.,180.);vColor=aColor;}`;
const pointFragment=`precision mediump float;varying vec3 vColor;void main(){vec2 q=gl_PointCoord-.5;float r=dot(q,q)*4.;if(r>1.)discard;float a=exp(-r*6.)*(1.-smoothstep(.7,1.,r));gl_FragColor=vec4(vColor,a);}`;
const screenVertex=`attribute vec3 aPos;varying vec2 vUV;void main(){vUV=aPos.xy*.5+.5;gl_Position=vec4(aPos.xy,0.,1.);}`;
const screenFragment=`precision highp float;varying vec2 vUV;
uniform vec3 uEye,uRight,uUp,uForward,uResolution;uniform float uScene,uTime,uDistance,uGrid,uGridStyle,uSpacing,uLens,uDoppler,uDensity,uBand,uSteps;
${GLSL_NOISE}
vec3 sky(vec3 d){float band=exp(-pow((d.y+.18*d.x-.12*d.z)*5.,2.));float haze=fbm(d*8.)*.6+fbm(d*22.)*.4;vec3 col=vec3(.003,.005,.011)+vec3(.025,.030,.048)*band*pow(haze,2.);vec2 uv=vec2(atan(d.z,d.x)/6.2831853+.5,asin(clamp(d.y,-1.,1.))/3.14159+.5);
for(int i=0;i<2;i++){float scale=i==0?550.:1050.;vec2 cell=floor(uv*scale);vec2 q=fract(uv*scale)-.5;float h=hash31(vec3(cell,float(i)+15.));float star=smoothstep(.9965,.9998,h)*exp(-dot(q,q)*(i==0?48.:90.));vec3 tint=mix(vec3(.55,.72,1.),vec3(1.,.79,.56),hash31(vec3(cell,73.)));col+=tint*star*(i==0?1.1:.45);}
return col;}
vec3 grid(vec3 bg,vec3 ro,vec3 rd){if(uGrid<.5||abs(rd.y)<.0001)return bg;float t=(-.7-ro.y)/rd.y;if(t<=0.)return bg;vec3 hit=ro+rd*t;float footprint=max(.0001,t*.72/uResolution.y);float s=uSpacing;vec2 p=hit.xz/s;vec2 d=abs(fract(p+.5)-.5)*s;float minor=1.-smoothstep(footprint*.4,footprint*1.6,min(d.x,d.y));vec2 d10=abs(fract(p/10.+.5)-.5)*s*10.;float major=1.-smoothstep(footprint*.5,footprint*2.,min(d10.x,d10.y));if(uGridStyle>.5){float r=length(hit.xz);float ring=abs(fract(r/s+.5)-.5)*s;float angle=atan(hit.z,hit.x);float spoke=abs(sin(angle*12.))*r;minor=1.-smoothstep(footprint*.4,footprint*1.7,ring);major=1.-smoothstep(footprint*.5,footprint*1.8,spoke);}
float fade=exp(-t/(uDistance*6.))*smoothstep(.015,.15,abs(rd.y));vec3 c=vec3(.12,.22,.29)*minor*.45+vec3(.17,.38,.45)*major*.6;float ax=1.-smoothstep(footprint,footprint*2.,abs(hit.x));float az=1.-smoothstep(footprint,footprint*2.,abs(hit.z));c+=vec3(.22,.45,.39)*ax+vec3(.40,.17,.25)*az;c*=1.-smoothstep(.3,1.,footprint/s);return bg+c*fade;}
vec3 diskLight(vec3 p,vec3 ray){float r=length(p.xz),a=atan(p.z,p.x);float omega=1.7/pow(max(r,3.),1.5);float flow=a-uTime*omega;float ripples=.72+.10*sin(r*12.+fbm(vec3(cos(flow)*5.,sin(flow)*5.,r)) *5.);float lanes=fbm(vec3(cos(flow)*r*2.,sin(flow)*r*2.,r*3.));float radial=smoothstep(3.,3.2,r)*(1.-smoothstep(8.,11.,r));float temp=pow(3./r,.65);vec3 color=mix(vec3(1.,.20,.035),vec3(1.,.86,.58),temp);vec3 velocity=normalize(vec3(-p.z,0.,p.x));float beta=.46*sqrt(3./r);float beam=uDoppler>.5?pow(sqrt(1.-beta*beta)/(1.+beta*dot(velocity,ray)),3.):1.;return color*(.2+1.9*lanes)*ripples*radial*beam*temp*1.35;}
vec3 blackhole(vec3 ro,vec3 rd){vec3 p=ro,ray=rd,col=vec3(0.);float transmission=1.,closest=1000.;bool captured=false;
for(int i=0;i<180;i++){if(float(i)>uSteps)break;float r=length(p);closest=min(closest,r);if(r<1.025){captured=true;break;}if(r>max(length(ro)*1.5,45.))break;float ds=clamp(r*.065,.035,1.4);vec3 prev=p;float L2=dot(cross(p,ray),cross(p,ray));vec3 acc=-1.5*L2*p/pow(r,5.)*uLens;ray=normalize(ray+acc*ds);p+=ray*ds;
if(prev.y*p.y<=0.){vec3 q=mix(prev,p,prev.y/(prev.y-p.y));float rr=length(q.xz);if(rr>3.&&rr<11.){col+=diskLight(q,ray)*transmission;transmission*=.13;}}
float ringGlow=exp(-pow((r-2.65)*6.,2.))*.0008;col+=vec3(1.,.55,.22)*ringGlow;}
if(!captured)col+=sky(ray)*transmission;float glow=exp(-pow((closest-3.)/2.3,2.))*.035;col+=vec3(.65,.20,.055)*glow;return pow(film(col),vec3(.4545));}
float density(vec3 p){vec3 q=p/7.;float envelope=1.-smoothstep(.5,1.5,length(q*vec3(.78,1.27,1.)));vec3 warp=vec3(fbm(q*2.+4.),fbm(q*2.+14.),fbm(q*2.+24.));float n=fbm(q*6.5+warp*2.7+vec3(0,uTime*.001,0));float cavity=smoothstep(.5,2.5,length(p-vec3(2.,.4,1.)));return pow(max(0.,n-.39)*3.4,1.5)*envelope*cavity*uDensity;}
vec3 nebula(vec3 ro,vec3 rd){float b=dot(ro,rd),c=dot(ro,ro)-225.,disc=b*b-c;if(disc<0.)return pow(film(sky(rd)),vec3(.4545));float start=max(0.,-b-sqrt(disc)),end=-b+sqrt(disc);float dt=(end-start)/80.;float t=start+dt*hash31(vec3(gl_FragCoord.xy,2.));vec3 col=vec3(0.);float tr=1.;
for(int i=0;i<80;i++){vec3 p=ro+rd*t;float d=density(p);if(d>.005){float blue=fbm(p*.17+11.);vec3 color=mix(vec3(.78,.10,.26),vec3(.08,.38,.84),smoothstep(.38,.62,blue));if(uBand>.5)color=mix(vec3(.9,.31,.065),vec3(.12,.65,.68),smoothstep(.35,.68,blue));float st1=length(p-vec3(2.,.4,1.)),st2=length(p-vec3(-3.,-1.,-2.));float light=.2+2.4/(1.+st1*st1*.22)+1.4/(1.+st2*st2*.3);float absorb=1.-exp(-d*dt*.95);col+=tr*color*light*absorb;tr*=1.-absorb;if(tr<.025)break;}t+=dt;}
vec3 stars=vec3(0.);vec3 q1=vec3(2.,.4,1.)-ro;float ds1=length(q1-rd*dot(q1,rd));vec3 q2=vec3(-3.,-1.,-2.)-ro;float ds2=length(q2-rd*dot(q2,rd));stars+=vec3(.65,.8,1.)*.045/(.008+ds1*ds1);stars+=vec3(1.,.65,.35)*.024/(.007+ds2*ds2);col+=stars*(.15+tr)+sky(rd)*tr;return pow(film(col),vec3(.4545));}
vec3 galaxy(vec3 ro,vec3 rd){float b=dot(ro,rd),disc=b*b-dot(ro,ro)+400.;if(disc<0.)return pow(film(sky(rd)),vec3(.4545));float t=max(0.,-b-sqrt(disc)),end=-b+sqrt(disc),dt=(end-t)/88.;vec3 col=vec3(0.);float tr=1.;for(int i=0;i<88;i++){vec3 p=ro+rd*(t+dt*.5);float r=length(p.xz),a=atan(p.z,p.x)+uTime*.055/(r+2.);float arms=pow(.5+.5*cos(4.*(a-log(r+1.)*2.6)),9.);float structure=.38+.62*fbm(p*1.8);float layer=exp(-p.y*p.y*7.);float disk=exp(-r/8.)*(1.-smoothstep(15.,18.,r));float core=exp(-r*r*.13-p.y*p.y*.9);vec3 emission=(vec3(.16,.27,.60)*arms*structure+vec3(.035,.055,.085))*disk*layer+vec3(.72,.36,.15)*core;float dust=pow(.5+.5*cos(4.*(a-log(r+1.)*2.6-.12)),16.)*disk*layer*1.1;col+=tr*emission*dt;tr*=exp(-dust*dt);t+=dt;}return pow(film(col+sky(rd)*tr),vec3(.4545));}
void main(){vec2 p=(vUV*2.-1.);p.x*=uResolution.x/uResolution.y;vec3 ray=normalize(uForward+(uRight*p.x+uUp*p.y)*.3764);vec3 col;if(uScene>.5&&uScene<1.5)col=blackhole(uEye,ray);else if(uScene>2.5)col=galaxy(uEye,ray);else if(uScene>1.5)col=nebula(uEye,ray);else col=pow(film(sky(ray)),vec3(.4545));col=grid(col,uEye,ray);gl_FragColor=vec4(col,1.);}
`;
const postFragment=`precision highp float;varying vec2 vUV;uniform sampler2D uSceneMap;uniform vec3 uResolution;uniform float uBloom,uExposure;void main(){vec3 c=texture2D(uSceneMap,vUV).rgb;vec3 glow=vec3(0.);for(int i=0;i<12;i++){float a=float(i)*.5235988;vec2 dir=vec2(cos(a),sin(a));vec3 s=texture2D(uSceneMap,vUV+dir*3./uResolution.xy).rgb;vec3 t=texture2D(uSceneMap,vUV+dir*9./uResolution.xy).rgb;glow+=max(s-.58,0.)*.015+max(t-.58,0.)*.008;}c=(c+glow*uBloom)*uExposure;float vignette=1.-.12*pow(length((vUV-.5)*1.2),2.);gl_FragColor=vec4(c*vignette,1.);}`;
