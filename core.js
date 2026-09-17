/* Dependency-free state, color, navigation and animation helpers. */
(function(root,factory){const api=factory();if(typeof module==="object"&&module.exports)module.exports=api;else root.BlobbyCore=api;})(typeof globalThis!=="undefined"?globalThis:this,function(){
"use strict";
const themes={
 midnight:{name:"Midnight",bg:"#10131e",panel:"#1a2030",ink:"#f1f4ff",muted:"#a8b3ce",line:"#414c64",accent:"#a5b6ff",mode:"dark"},
 arctic:{name:"Arctic",bg:"#eef4fa",panel:"#ffffff",ink:"#17283e",muted:"#526780",line:"#a1b2c6",accent:"#245bce",mode:"light"},
 aurora:{name:"Aurora",bg:"#0c201c",panel:"#17312b",ink:"#e7fff5",muted:"#a5c9b9",line:"#4a7463",accent:"#73e2ae",mode:"dark"},
 sunset:{name:"Sunset",bg:"#271322",panel:"#3b2031",ink:"#fff0f4",muted:"#e0b0c5",line:"#855069",accent:"#ffb285",mode:"dark"},
 ocean:{name:"Ocean",bg:"#0b2032",panel:"#123148",ink:"#e7f8ff",muted:"#aacbdc",line:"#477790",accent:"#68d7ef",mode:"dark"},
 monochrome:{name:"Monochrome",bg:"#161616",panel:"#252525",ink:"#f4f4f4",muted:"#b8b8b8",line:"#626262",accent:"#eeeeee",mode:"dark"}
};
const layouts={
 centered:{name:"Centered",layout:"centered",width:900,gap:16,tile:110,cols:4,showShortcuts:true,showRecent:true,subtitle:true},
 compact:{name:"Compact",layout:"compact",width:1000,gap:8,tile:64,cols:4,showShortcuts:true,showRecent:true,subtitle:true},
 dashboard:{name:"Dashboard",layout:"dashboard",width:1160,gap:16,tile:100,cols:3,showShortcuts:true,showRecent:true,subtitle:true},
 minimal:{name:"Minimal",layout:"minimal",width:760,gap:14,tile:90,cols:4,showShortcuts:false,showRecent:false,subtitle:true}
};
const appearanceKeys=["baseTheme","accent","mode","large","effects","gradient","animated","hover","shadows","glow","glass","entrance","snow","density","speed"];
const layoutKeys=["layout","width","gap","tile","cols","showShortcuts","showRecent","subtitle"];
const defaults={baseTheme:"midnight",accent:"#a5b6ff",mode:"preset",large:false,effects:true,gradient:true,animated:false,hover:true,shadows:true,glow:false,glass:false,entrance:false,snow:false,density:35,speed:1,fast:false,engine:"google",remember:true,autofocus:true,...layouts.centered};
delete defaults.name;
const engines={google:["Google","https://www.google.com/search?q="],duck:["DuckDuckGo","https://duckduckgo.com/?q="],bing:["Bing","https://www.bing.com/search?q="]};
const defaultLinks=[{label:"Google",url:"https://www.google.com/"},{label:"Wikipedia",url:"https://www.wikipedia.org/"},{label:"YouTube",url:"https://www.youtube.com/"},{label:"Khan Academy",url:"https://www.khanacademy.org/"}];
const clone=x=>JSON.parse(JSON.stringify(x));
const pick=(obj,keys)=>Object.fromEntries(keys.map(k=>[k,obj[k]]));
function safeUrl(raw){if(typeof raw!=="string")return null;try{const u=new URL(raw);return ["https:","http:"].includes(u.protocol)&&!u.username&&!u.password?u.href:null;}catch{return null;}}
function resolve(text,engine="google"){text=text.trim();if(!text)return null;
 if(/^(localhost|[\w-]+(?:\.[\w-]+)+):\d+(?:[/?#]|$)/i.test(text))return safeUrl((text.startsWith("localhost")?"http://":"https://")+text);
 if(/^[a-z][a-z0-9+.-]*:/i.test(text))return safeUrl(text);
 if(!/\s/.test(text)&&(/^[\w-]+(?:\.[\w-]+)+(?:[/:?#]|$)/.test(text)||/^localhost(?:[/:]|$)/.test(text)))return safeUrl((text.startsWith("localhost")?"http://":"https://")+text);
 return engines[engine][1]+encodeURIComponent(text);
}
function hex(value){if(typeof value!=="string")return null;const s=value.trim();if(/^#[0-9a-f]{6}$/i.test(s))return s.toLowerCase();if(/^#[0-9a-f]{3}$/i.test(s))return "#"+s.slice(1).split("").map(x=>x+x).join("");return null;}
function rgb(h){return [1,3,5].map(i=>parseInt(h.slice(i,i+2),16));}
function luminance(h){const c=rgb(h).map(x=>{x/=255;return x<=.04045?x/12.92:Math.pow((x+.055)/1.055,2.4);});return c[0]*.2126+c[1]*.7152+c[2]*.0722;}
function contrast(a,b){const x=luminance(a),y=luminance(b);return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);}
function readableAccent(accent,theme){if(Math.min(contrast(accent,theme.bg),contrast(accent,theme.panel))>=4.5)return accent;
 const target=luminance(theme.bg)>.4?"#000000":"#ffffff",a=rgb(accent),b=rgb(target);
 for(let i=1;i<=20;i++){const t=i/20,c="#"+a.map((x,k)=>Math.round(x+(b[k]-x)*t).toString(16).padStart(2,"0")).join("");if(Math.min(contrast(c,theme.bg),contrast(c,theme.panel))>=4.5)return c;}return target;
}
function hueColor(h){h=(Number(h)%360+360)%360;const c=.72,x=c*(1-Math.abs((h/60)%2-1)),m=.64-c/2;const v=h<60?[c,x,0]:h<120?[x,c,0]:h<180?[0,c,x]:h<240?[0,x,c]:h<300?[x,0,c]:[c,0,x];return "#"+v.map(v=>Math.round((v+m)*255).toString(16).padStart(2,"0")).join("");}
function hueOf(h){const [r,g,b]=rgb(h).map(x=>x/255),max=Math.max(r,g,b),min=Math.min(r,g,b),d=max-min;if(!d)return 0;return Math.round(((max===r?(g-b)/d:max===g?(b-r)/d+2:(r-g)/d+4)*60+360)%360);}
function sanitizePrefs(raw){const p=clone(defaults);if(!raw||typeof raw!=="object")return p;for(const k of Object.keys(p))if(typeof raw[k]===typeof p[k])p[k]=raw[k];
 if(!Object.prototype.hasOwnProperty.call(themes,p.baseTheme))p.baseTheme="midnight";if(!Object.prototype.hasOwnProperty.call(layouts,p.layout))p.layout="centered";if(!Object.prototype.hasOwnProperty.call(engines,p.engine))p.engine="google";if(!["preset","light","dark","system"].includes(p.mode))p.mode="preset";p.accent=hex(p.accent)||defaults.accent;
 for(const [k,min,max]of [["width",600,1280],["gap",6,32],["tile",56,160],["cols",1,6],["density",10,100],["speed",.3,2]])p[k]=Number.isFinite(p[k])?Math.max(min,Math.min(max,p[k])):defaults[k];
 p.cols=Math.round(p.cols);p.density=Math.round(p.density);return p;
}
function records(x,n){return (Array.isArray(x)?x:[]).filter(i=>i&&typeof i.label==="string"&&safeUrl(i.url)).slice(0,n).map(i=>({label:i.label.slice(0,100),url:safeUrl(i.url),...(Number.isFinite(i.time)?{time:i.time}:{})}));}
function migrate(read){const saved=read("blobby.v3",null);if(saved&&typeof saved==="object")return {prefs:sanitizePrefs(saved.prefs),links:records(saved.links,12),recent:records(saved.recent,20),themes:savedPresets(saved.themes,appearanceKeys),layouts:savedPresets(saved.layouts,layoutKeys)};
 const old=read("blobby.settings",{})||{},colors={blue:"#a3b2ff",mint:"#85dec6",pink:"#f4abd5",gold:"#efce80"};
 const p=sanitizePrefs({...old,baseTheme:old.theme==="light"?"arctic":"midnight",accent:colors[old.accent]||defaults.accent,mode:old.theme||"preset",effects:old.motion!==false,...(old.compact?layouts.compact:{}),showRecent:old.showRecent!==false});
 return {prefs:p,links:records(read("blobby.shortcuts",defaultLinks),12),recent:records(read("blobby.recent",read("litebrowse.recent",[])),20),themes:[],layouts:[]};
}
function savedPresets(v,keys){return(Array.isArray(v)?v:[]).filter(x=>x&&typeof x.name==="string").slice(0,20).map(x=>({name:x.name.slice(0,40),values:pick(sanitizePrefs(x.values),keys),order:Array.isArray(x.order)?x.order.filter(safeUrl).slice(0,12):[]}));}
function effective(p,reduced=false,hidden=false){const active=p.effects&&!p.fast,move=active&&!reduced&&!hidden;return {effects:active,gradient:active&&p.gradient,animated:move&&p.gradient&&p.animated,hover:move&&p.hover,shadows:active&&p.shadows,glow:active&&p.glow,glass:active&&p.glass,entrance:move&&p.entrance,snow:move&&p.snow};}
function reorder(items,from,to){if(from<0||to<0||from>=items.length||to>=items.length)return items;const next=items.slice();next.splice(to,0,next.splice(from,1)[0]);return next;}
function restoreOrder(links,order){const ranks=new Map(order.map((u,i)=>[u,i]));return links.slice().sort((a,b)=>(ranks.get(a.url)??999)-(ranks.get(b.url)??999));}
class Snow{
 constructor(canvas,env){this.canvas=canvas;this.env=env;this.frame=null;this.particles=[];this.ctx=null;this.last=0;}
 stop(){if(this.frame!==null)this.env.cancel(this.frame);this.frame=null;this.particles=[];this.ctx=null;this.canvas.hidden=true;this.canvas.width=0;this.canvas.height=0;this.last=0;}
 configure(enabled,density,speed,color){if(!enabled){this.stop();return;}const {width,height}=this.env.size();const key=[density,speed,width,height,color].join(":");if(this.frame!==null&&key===this.key)return;this.stop();this.key=key;this.speed=speed;this.color=color;this.canvas.width=width;this.canvas.height=height;this.ctx=this.canvas.getContext("2d");if(!this.ctx)return;this.canvas.hidden=false;
 this.particles=Array.from({length:Math.min(100,density)},()=>({x:Math.random()*width,y:Math.random()*height,r:1+Math.random()*2,v:16+Math.random()*24}));this.frame=this.env.request(t=>this.tick(t));}
 tick(t){if(!this.ctx)return;const dt=this.last?Math.min((t-this.last)/1000,.05):0;this.last=t;const w=this.canvas.width,h=this.canvas.height,c=this.ctx;c.clearRect(0,0,w,h);c.fillStyle=this.color;c.globalAlpha=.55;c.beginPath();for(const p of this.particles){p.y+=p.v*this.speed*dt;p.x+=4*this.speed*dt;if(p.y>h+4)p.y=-4;if(p.x>w+4)p.x=-4;c.moveTo(p.x+p.r,p.y);c.arc(p.x,p.y,p.r,0,Math.PI*2);}c.fill();this.frame=this.env.request(x=>this.tick(x));}
}
return {themes,layouts,defaults,engines,defaultLinks,appearanceKeys,layoutKeys,clone,pick,safeUrl,resolve,hex,rgb,contrast,readableAccent,hueColor,hueOf,sanitizePrefs,migrate,effective,reorder,restoreOrder,Snow};
});
