/* Functional checks with a small DOM harness; no browser or device emulation. */
const fs=require("node:fs"),vm=require("node:vm"),assert=require("node:assert/strict");
const base=fs.existsSync(__dirname+"/../dist/index.html")?__dirname+"/../dist/":__dirname+"/../";
const C=require(base+"core.js");
const html=fs.readFileSync(base+"index.html","utf8");
const app=fs.readFileSync(base+"app.js","utf8");
function harness(seed={},blocked=false){
 const all=[],events={},frames=new Map();let sequence=0,cancels=0;
 class Element{
  constructor(tag="div"){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attributes={};this.style={setProperty(k,v){this[k]=v;}};this.hidden=false;this.value="";this.type="";this.listeners={};this.classes=new Set();this.classList={add:x=>this.classes.add(x),remove:x=>this.classes.delete(x),toggle:(x,on)=>on?this.classes.add(x):this.classes.delete(x)};all.push(this);}
  append(...items){this.children.push(...items);}
  replaceChildren(...items){this.children=items;}
  setAttribute(k,v){this.attributes[k]=v;if(k==="class")this.className=v;}
  addEventListener(k,fn){(this.listeners[k]??=[]).push(fn);}
  removeEventListener(k,fn){this.listeners[k]=(this.listeners[k]||[]).filter(x=>x!==fn);}
  dispatch(k,e={}){for(const fn of this.listeners[k]||[])fn(e);if(this["on"+k])return this["on"+k](e);}
  focus(){doc.activeElement=this;}
  showModal(){this.open=true;}
  close(){this.open=false;this.dispatch("close");}
  reset(){}
  querySelector(sel){const descendants=this.children.flatMap(x=>[x,...x.children||[]]);return descendants.find(x=>sel==="button"&&x.tagName==="BUTTON")||null;}
  getContext(){return {clearRect(){},beginPath(){},moveTo(){},arc(){},fill(){}};}
 }
 function matches(e,sel){if(sel==="dialog[open]")return e.tagName==="DIALOG"&&e.open;if(sel===".drag-over")return e.classes.has("drag-over");const m=sel.match(/^\[data-([\w-]+)\]$/);if(m)return Object.hasOwn(e.dataset,m[1].replace(/-([a-z])/g,(_,c)=>c.toUpperCase()));return false;}
 const doc={documentElement:new Element("html"),body:new Element("body"),activeElement:new Element(),hidden:false,getElementById:id=>all.find(e=>e.id===id)||null,createElement:tag=>new Element(tag),querySelectorAll:s=>all.filter(e=>matches(e,s)),querySelector:s=>all.find(e=>matches(e,s))||null,addEventListener:(k,f)=>{(events[k]??=[]).push(f);}};
 for(const m of html.matchAll(/<([a-z]+)([^>]*\bid="([^"]+)"[^>]*)>/g)){const e=new Element(m[1]);e.id=m[3];for(const a of m[2].matchAll(/([\w-]+)="([^"]*)"/g)){if(a[1]==="type")e.type=a[2];} }
 const data=new Map(Object.entries(seed)),media={};
 const context={BlobbyCore:C,document:doc,URL,console,innerWidth:1100,innerHeight:800,localStorage:{getItem:k=>{if(blocked)throw Error("blocked");return data.get(k)||null;},setItem:(k,v)=>{if(blocked)throw Error("blocked");data.set(k,v);}},matchMedia:q=>media[q]??=( {matches:false,addEventListener:(k,f)=>{media[q].listener=f;}}),window:{addEventListener:(k,f)=>{(events[k]??=[]).push(f);},open(){}},requestAnimationFrame:f=>{frames.set(++sequence,f);return sequence;},cancelAnimationFrame:id=>{cancels++;frames.delete(id);},location:{assign(u){this.url=u;}}};
 vm.runInNewContext(app,context);
 const $=id=>doc.getElementById(id);
 const change=(id,value,type="change")=>{const e=$(id);if(e.type==="checkbox")e.checked=value;else e.value=value;e.dispatch(type);};
 const clickText=(parent,text)=>{const q=parent.children.flatMap(x=>[x,...x.children]);const b=q.find(x=>x.tagName==="BUTTON"&&x.textContent===text);assert(b,"button "+text);return b.onclick();};
 return {$,change,clickText,data,context,frames,media,doc,events,get cancels(){return cancels;},async answer(value){$("questionInput").value=value;$("questionForm").onsubmit({preventDefault(){}});await Promise.resolve();await Promise.resolve();}};
}
(async()=>{
 assert.equal(C.resolve("cats & dogs"),"https://www.google.com/search?q=cats%20%26%20dogs");
 assert.equal(C.resolve("example.com"),"https://example.com/");
 assert.equal(C.resolve("example.com:8080"),"https://example.com:8080/");
 for(const bad of ["javascript:alert(1)","data:text/html,x","file:///etc/passwd","https://user:password@example.com"])assert.equal(C.resolve(bad),null);
 for(const t of Object.values(C.themes))for(const accent of ["#000000","#ffffff","#ff0000","#00ff00","#0000ff",t.accent]){
  const adjusted=C.readableAccent(accent,t);assert(C.contrast(adjusted,t.bg)>=4.5);assert(C.contrast(adjusted,t.panel)>=4.5);
  assert(Math.max(C.contrast(accent,"#000000"),C.contrast(accent,"#ffffff"))>=4.5);
 }
 const old={"blobby.settings":JSON.stringify({theme:"light",accent:"pink",fast:true,compact:true}),"blobby.shortcuts":JSON.stringify([{label:"Kept",url:"https://example.com/"}])};
 const m=C.migrate((k,f)=>old[k]?JSON.parse(old[k]):f);assert.equal(m.prefs.accent,"#f4abd5");assert.equal(m.prefs.layout,"compact");assert.equal(m.links[0].label,"Kept");
 const h=harness();assert.equal(h.$("shortcuts").children.length,4);
 h.$("query").value="a & b";h.$("searchForm").onsubmit({preventDefault(){}});assert(h.$("browserFrames").children[0].src.endsWith("a%20%26%20b"));
 h.$("homeButton").onclick();h.change("engine","duck");h.$("query").value="hello";h.$("searchForm").onsubmit({preventDefault(){}});assert.equal(h.$("browserFrames").children[0].src,"https://duckduckgo.com/?q=hello");
 h.change("snow",true);assert.equal(h.frames.size,1);assert.equal(h.$("snowCanvas").hidden,false);
 h.change("fast",true);assert.equal(h.frames.size,0);assert.equal(h.$("snowCanvas").width,0);assert(h.$("recentSection").hidden);assert(h.$("snow").checked);assert(h.$("snow").disabled);assert(h.cancels>0);
 h.change("fast",false);assert.equal(h.frames.size,1);
 h.doc.hidden=true;h.events.visibilitychange.forEach(f=>f());assert.equal(h.frames.size,0);
 h.doc.hidden=false;h.events.visibilitychange.forEach(f=>f());assert.equal(h.frames.size,1);
 h.media["(prefers-reduced-motion: reduce)"].matches=true;h.media["(prefers-reduced-motion: reduce)"].listener();assert.equal(h.frames.size,0);assert(h.$("snow").disabled);
 h.media["(prefers-reduced-motion: reduce)"].matches=false;h.media["(prefers-reduced-motion: reduce)"].listener();assert.equal(h.frames.size,1);
 h.change("effects",false);assert.equal(h.frames.size,0);h.change("effects",true);assert.equal(h.frames.size,1);
 h.$("themeGrid").children[2].onclick();assert.equal(h.doc.documentElement.style["--bg"],C.themes.aurora.bg);
 h.$("accentHex").value="#123456";h.$("accentHex").oninput();h.$("accentHex").onchange();
 h.clickText(h.$("panel-appearance"),"Save custom theme");await h.answer("My theme");assert.equal(h.$("savedThemes").children.length,1);
 h.$("themeGrid").children[1].onclick();h.$("savedThemes").children[0].children[0].onclick();assert.equal(h.$("accentPicker").value,"#123456");
 h.$("layoutGrid").children[2].onclick();h.change("width",1100,"input");h.change("width",1100);
 h.clickText(h.$("panel-layout"),"Save custom layout");await h.answer("My layout");
 h.$("layoutGrid").children[3].onclick();assert(h.$("shortcutSection").hidden);
 h.$("savedLayouts").children[0].children[0].onclick();assert.equal(h.doc.documentElement.dataset.layout,"dashboard");assert.equal(h.doc.documentElement.style["--width"],"1100px");
 h.$("manageButton").onclick();h.$("shortcutName").value="Example";h.$("shortcutUrl").value="example.com";h.$("shortcutForm").onsubmit({preventDefault(){}});assert.equal(h.$("shortcuts").children.length,5);
 h.$("shortcutEditor").children[4].children[1].onclick();assert.equal(h.$("shortcutEditor").children[3].children[0].textContent,"Example");
 const again=harness(Object.fromEntries(h.data));assert.equal(again.$("accentPicker").value,"#123456");assert.equal(again.$("savedLayouts").children.length,1);assert.equal(again.$("savedThemes").children.length,1);assert.equal(again.$("shortcuts").children.length,5);
 const blocked=harness({},true);blocked.change("snow",true);blocked.change("fast",true);assert.equal(blocked.frames.size,0);assert(blocked.$("saveStatus").textContent.includes("unavailable"));blocked.$("query").value="example.com";blocked.$("searchForm").onsubmit({preventDefault(){}});assert.equal(blocked.$("browserFrames").children[0].src,"https://example.com/");
 for(const file of ["core.js","app.js","style.css"])assert(html.includes("./"+file)&&fs.existsSync(base+file));
 assert(html.includes("browserFrames"));assert(!html.includes("Made for your WebView."));assert(html.includes("made by panga"));
 console.log("PASS: tabbed navigation, search, safe URLs, 6-theme contrast, migration, theme/layout save and restore, shortcut edit/reorder, persistence, unavailable storage, snow lifecycle, performance overrides, reduced motion, visibility pause, relative assets.");
})().catch(e=>{console.error(e);process.exitCode=1;});
