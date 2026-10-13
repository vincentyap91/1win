const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const events={},animations=[];
const reduced={matches:false,addEventListener(type,callback){this.callback=callback;}};
function element(){return {dataset:{},getBoundingClientRect:()=>({width:300,height:500}),animate(frames,options){let finish;const a={frames,options,cancelled:false,finished:new Promise(resolve=>finish=resolve),cancel(){this.cancelled=true;finish();},finish(){finish();}};animations.push(a);return a;}};}
const card=element(),backdrop=element(),drawer=element();
const container={querySelectorAll(selector){return selector.includes('backdrop')?[backdrop]:[card];}};
const context={window:{},document:{documentElement:{dataset:{}},body:{dataset:{}},addEventListener:(name,handler)=>events[name]=handler},matchMedia:()=>reduced,getComputedStyle:()=>({getPropertyValue:()=>'',opacity:'1',transform:'none'}),innerWidth:1440,requestAnimationFrame:callback=>callback(),setTimeout,Promise,WeakMap,Set};
vm.runInNewContext(fs.readFileSync(process.argv[2],'utf8'),context);
const motion=context.window.PREVIEW_MOTION;
(async()=>{
 const enter=motion.modal(container);assert.equal(animations.length,2);assert.equal(animations[0].options.duration,250);assert.match(animations[0].frames[0].transform,/scale\(0.96\)/);animations.forEach(a=>a.finish());await enter;
 context.innerWidth=390;const sheet=motion.modal(container);assert.match(animations.at(-2).frames[0].transform,/translateY\(100%\)/);animations.slice(-2).forEach(a=>a.finish());await sheet;
 const opening=motion.drawer(drawer,true);const openingAnimation=animations.at(-1);const closing=motion.drawer(drawer,false);assert.equal(openingAnimation.cancelled,true);animations.at(-1).finish();await Promise.all([opening,closing]);
 reduced.matches=true;const gentle=motion.modal(container);assert.equal(animations.at(-1).options.duration,125);assert.ok(animations.slice(-2).every(a=>a.frames.every(f=>!('transform' in f))));animations.slice(-2).forEach(a=>a.finish());await gentle;
 reduced.matches=false;const pending=motion.drawer(drawer,true);const last=animations.at(-1);events.keydown();const count=animations.length;await motion.drawer(drawer,false);assert.equal(last.cancelled,true);assert.equal(animations.length,count);await pending;
 console.log(JSON.stringify({passed:true,checks:['desktop entry 250ms','mobile sheet','interrupted drawer','reduced fade 125ms','keyboard cancels animation'],note:'Isolated scheduling/frames checks; browser layout is verified separately.'}));
})().catch(e=>{console.error(e);process.exitCode=1;});
