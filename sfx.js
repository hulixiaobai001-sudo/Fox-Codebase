/**
 * 西部对决 · 音效系统 v2（重击版）
 * 用法：在 roulette.html 的 </body> 前加 <script src="sfx.js"></script>
 * 纯Web Audio合成，零音频文件。
 */
(function(){

var css=document.createElement('style');
css.textContent='.sfx-btn{position:fixed;top:12px;right:12px;z-index:9999;background:rgba(30,15,10,.85);border:1px solid #6b3a2a;border-radius:8px;padding:4px 10px;color:#c0a090;font-size:.65em;cursor:pointer;font-family:inherit;opacity:0.4;transition:opacity .3s}.sfx-btn:hover{opacity:1}.sfx-btn.on{color:#f55;border-color:#f55}.sfx-btn.off{color:#a08070;opacity:0.25}';
document.head.appendChild(css);

var ctx=null,enabled=true,vol=0.5;
try{enabled=localStorage.getItem('wd_sfx')!=='0'}catch(e){}

function init(){if(!ctx)try{ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}

// Master compressor for punch
var compressor=null;
function getMaster(){
  if(compressor)return compressor;
  if(!ctx)return null;
  compressor=ctx.createDynamicsCompressor();
  compressor.threshold.setValueAtTime(-12,ctx.currentTime);
  compressor.knee.setValueAtTime(6,ctx.currentTime);
  compressor.ratio.setValueAtTime(8,ctx.currentTime);
  compressor.attack.setValueAtTime(0.003,ctx.currentTime);
  compressor.release.setValueAtTime(0.1,ctx.currentTime);
  compressor.connect(ctx.destination);
  return compressor;
}

function noise(ctx2,len){
  var b=ctx2.createBuffer(1,len||ctx2.sampleRate*0.3),d=b.getChannelData(0);
  for(var i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  return b;
}

function bang(dur,low,high,vol2,dist){
  if(!ctx||!enabled)return;
  var m=getMaster();if(!m)return;
  var now=ctx.currentTime;

  // Noise burst (crack)
  var src=ctx.createBufferSource();src.buffer=noise(ctx);
  var env=ctx.createGain();env.gain.setValueAtTime(vol*vol2*0.6,now);env.gain.exponentialRampToValueAtTime(0.001,now+dur*1.5);
  var filt=ctx.createBiquadFilter();filt.type='highpass';filt.frequency.setValueAtTime(high,now);filt.frequency.exponentialRampToValueAtTime(high*2,now+dur);
  src.connect(filt);filt.connect(env);env.connect(m);src.start(now);src.stop(now+dur*2);

  // Low thump
  var osc=ctx.createOscillator();osc.type='sine';osc.frequency.setValueAtTime(low,now);osc.frequency.exponentialRampToValueAtTime(low*0.3,now+dur);
  var genv=ctx.createGain();genv.gain.setValueAtTime(vol*vol2*0.8,now);genv.gain.exponentialRampToValueAtTime(0.001,now+dur*1.2);
  osc.connect(genv);genv.connect(m);osc.start(now);osc.stop(now+dur*2);
}

function snd(nm){
  if(!ctx||!enabled)return;
  var m=getMaster();if(!m)return;
  var now=ctx.currentTime;

  if(nm==='shoot'){
    // Gunshot: deep BOOM + sharp crack
    bang(0.15,120,3000,0.7);
    // Secondary crack
    setTimeout(function(){if(!ctx||!enabled)return;bang(0.05,800,5000,0.4)},30);
    // Reverb-like tail
    setTimeout(function(){if(!ctx||!enabled)return;bang(0.2,60,800,0.2)},60);
  }
  else if(nm==='hit'){
    // Hit: meaty thud
    bang(0.08,80,400,0.5);
    // Impact crunch
    setTimeout(function(){if(!ctx||!enabled)return;bang(0.04,200,800,0.3)},20);
    // Blood squish
    setTimeout(function(){if(!ctx||!enabled)return;bang(0.06,50,300,0.15)},10);
  }
  else if(nm==='crit'){
    // Critical: BIG BOOM + extra everything
    bang(0.2,100,4000,1);
    setTimeout(function(){if(!ctx||!enabled)return;bang(0.1,150,6000,0.7)},20);
    setTimeout(function(){if(!ctx||!enabled)return;bang(0.3,50,500,0.3)},40);
    // Metal ring
    var osc2=ctx.createOscillator();osc2.type='square';osc2.frequency.setValueAtTime(800,now);osc2.frequency.exponentialRampToValueAtTime(1200,now+0.2);
    var g2=ctx.createGain();g2.gain.setValueAtTime(vol*0.3,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.3);
    osc2.connect(g2);g2.connect(m);osc2.start(now);osc2.stop(now+0.3);
  }
  else if(nm==='miss'){
    // Empty: sharp metallic CLICK
    var o1=ctx.createOscillator();o1.type='square';o1.frequency.setValueAtTime(1500,now);o1.frequency.exponentialRampToValueAtTime(800,now+0.04);
    var g1=ctx.createGain();g1.gain.setValueAtTime(vol*0.25,now);g1.gain.exponentialRampToValueAtTime(0.001,now+0.06);
    o1.connect(g1);g1.connect(m);o1.start(now);o1.stop(now+0.06);
    var o2=ctx.createOscillator();o2.type='sine';o2.frequency.setValueAtTime(2000,now);
    var g2=ctx.createGain();g2.gain.setValueAtTime(vol*0.1,now);g2.gain.exponentialRampToValueAtTime(0.001,now+0.03);
    o2.connect(g2);g2.connect(m);o2.start(now);o2.stop(now+0.03);
  }
  else if(nm==='spin'){
    // Cylinder spin: ratcheting clicks
    for(var i=0;i<8;i++){
      (function(d){setTimeout(function(){if(!ctx||!enabled)return;
        var o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(200+Math.random()*600,ctx.currentTime);
        var g=ctx.createGain();g.gain.setValueAtTime(vol*0.12,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.03);
        o.connect(g);g.connect(getMaster());o.start(ctx.currentTime);o.stop(ctx.currentTime+0.03);
      },d*50)})(i);
    }
    // Spin whoosh
    setTimeout(function(){if(!ctx||!enabled)return;
      var n=ctx.createBufferSource();n.buffer=noise(ctx,ctx.sampleRate*0.2);
      var f=ctx.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(400,ctx.currentTime);f.frequency.exponentialRampToValueAtTime(200,ctx.currentTime+0.15);
      var g=ctx.createGain();g.gain.setValueAtTime(vol*0.08,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.2);
      n.connect(f);f.connect(g);g.connect(getMaster());n.start(ctx.currentTime);n.stop(ctx.currentTime+0.2);
    },50);
  }
  else if(nm==='skip'){
    // Whoosh down
    var n=ctx.createBufferSource();n.buffer=noise(ctx,ctx.sampleRate*0.15);
    var f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.setValueAtTime(800,now);f.frequency.exponentialRampToValueAtTime(200,now+0.12);
    var g=ctx.createGain();g.gain.setValueAtTime(vol*0.15,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.15);
    n.connect(f);f.connect(g);g.connect(m);n.start(now);n.stop(now+0.15);
  }
  else if(nm==='ach'){
    // Triumph: rising arpeggio
    var notes=[523,659,784,1047]; // C5 E5 G5 C6
    notes.forEach(function(freq,i){
      setTimeout(function(){if(!ctx||!enabled)return;
        var o=ctx.createOscillator();o.type='square';o.frequency.setValueAtTime(freq,ctx.currentTime);
        var g=ctx.createGain();g.gain.setValueAtTime(vol*0.2,ctx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,ctx.currentTime+0.4);
        o.connect(g);g.connect(getMaster());o.start(ctx.currentTime);o.stop(ctx.currentTime+0.4);
      },i*100);
    });
    // Accompanying boom
    setTimeout(function(){bang(0.3,60,300,0.3)},0);
  }
  else if(nm==='duel'){
    // Duel: dramatic low rumble
    bang(0.3,50,400,0.5);
    setTimeout(function(){bang(0.2,40,300,0.4)},100);
    setTimeout(function(){bang(0.4,30,200,0.3)},200);
  }
  else if(nm==='gameover'){
    // Game over: descending sad tone
    var o=ctx.createOscillator();o.type='sawtooth';o.frequency.setValueAtTime(400,now);o.frequency.exponentialRampToValueAtTime(100,now+0.8);
    var g=ctx.createGain();g.gain.setValueAtTime(vol*0.25,now);g.gain.exponentialRampToValueAtTime(0.001,now+1);
    o.connect(g);g.connect(m);o.start(now);o.stop(now+1);
  }
  else if(nm==='flag'){
    // Flag shield: magical chime
    var o=ctx.createOscillator();o.type='sine';o.frequency.setValueAtTime(880,now);o.frequency.exponentialRampToValueAtTime(1320,now+0.15);
    var g=ctx.createGain();g.gain.setValueAtTime(vol*0.2,now);g.gain.exponentialRampToValueAtTime(0.001,now+0.3);
    o.connect(g);g.connect(m);o.start(now);o.stop(now+0.3);
  }
}

// Hook game
function hook(){
  if(typeof G==='undefined'||!G)return;
  var orig=window.addL;
  if(!orig||orig.__sfx)return;
  window.addL=function(msg,cls){
    orig(msg,cls);
    try{
      if(!enabled||!ctx)return;
      var isHit=cls==='da'&&(msg.indexOf('砰!')>=0||msg.indexOf('击中')>=0);
      var isCrit=cls==='cr'||msg.indexOf('暴击')>=0;
      if(isHit&&isCrit){snd('shoot');setTimeout(function(){snd('crit')},50)}
      else if(isHit){snd('shoot');setTimeout(function(){snd('hit')},60)}
      else if(msg.indexOf('空枪')>=0||msg.indexOf('松了一口气')>=0){snd('miss')}
      else if(msg.indexOf('跳过')>=0&&msg.indexOf('挡')<0){snd('skip')}
      else if(cls==='fl'||msg.indexOf('旗帜')>=0){snd('flag')}
      else if(cls==='du'){snd('duel')}
      else if(msg.indexOf('装弹完成')>=0){snd('spin')}
      else if(msg.indexOf('倒下了')>=0){snd('gameover')}
    }catch(e){}
  };
  window.addL.__sfx=true;
}

// Check for achievement toasts
setInterval(function(){
  if(!enabled||typeof G==='undefined')return;
  var ts=document.querySelectorAll('.wa-tst');
  if(ts.length>0&&ts[ts.length-1].dataset.sfx!=='1'){
    ts[ts.length-1].dataset.sfx='1';
    snd('ach');
  }
},300);

var rt=setInterval(function(){if(typeof G!=='undefined'&&G&&typeof window.addL==='function'){hook();clearInterval(rt)}},500);

// UI
setTimeout(function(){
  var ui=document.createElement('div');ui.className='sfx-btn'+(enabled?' on':' off');
  ui.id='sfxBtn';ui.textContent=enabled?'🔊':'🔇';
  ui.title=enabled?'音效开启':'音效关闭';
  ui.onclick=function(){
    enabled=!enabled;
    try{localStorage.setItem('wd_sfx',enabled?'1':'0')}catch(e){}
    init();
    ui.textContent=enabled?'🔊':'🔇';
    ui.className='sfx-btn'+(enabled?' on':' off');
    if(enabled){init();snd('miss')}
  };
  document.body.appendChild(ui);
},800);

// Init on first interaction
document.addEventListener('click',function(){if(!ctx)init()},{once:true});
document.addEventListener('touchstart',function(){if(!ctx)init()},{once:true});

})();
