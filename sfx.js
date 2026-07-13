/**
 * 西部对决 · 音效系统
 * 用法：在 roulette.html 的 </body> 前加 <script src="sfx.js"></script>
 * 纯Web Audio合成，零音频文件，不动原HTML。
 */
(function(){

var css=document.createElement('style');
css.textContent='.sfx-btn{position:fixed;top:12px;right:12px;z-index:9999;background:rgba(30,15,10,.85);border:1px solid #6b3a2a;border-radius:8px;padding:4px 10px;color:#c0a090;font-size:.65em;cursor:pointer;font-family:inherit;opacity:0.4;transition:opacity .3s}.sfx-btn:hover{opacity:1}.sfx-btn.on{color:#4c6;border-color:#4c6}.sfx-btn.off{color:#a08070;opacity:0.25}';
document.head.appendChild(css);

var ctx=null,enabled=true,vol=0.3;

try{localStorage.getItem('wd_sfx');enabled=localStorage.getItem('wd_sfx')!=='0'}catch(e){}

function initAudio(){if(!ctx)try{ctx=new(window.AudioContext||window.webkitAudioContext)()}catch(e){}}
function isOn(){return enabled}

// Noise buffer
var noiseBuf=null;
function getNoise(){
  if(noiseBuf)return noiseBuf;
  if(!ctx)return null;
  var len=ctx.sampleRate*0.5,buf=ctx.createBuffer(1,len),d=buf.getChannelData(0);
  for(var i=0;i<len;i++)d[i]=Math.random()*2-1;
  noiseBuf=buf;return buf;
}

function playNoise(dur,startFreq,endFreq,volMult,gainShape){
  if(!ctx||!enabled)return;
  var gain=ctx.createGain();gain.connect(ctx.destination);
  var now=ctx.currentTime;
  gain.gain.setValueAtTime(vol*volMult,now);
  if(gainShape==='exp')gain.gain.exponentialRampToValueAtTime(0.001,now+dur);
  else gain.gain.linearRampToValueAtTime(0,now+dur);
  
  var src=ctx.createBufferSource();src.buffer=getNoise();
  var filter=ctx.createBiquadFilter();filter.type='lowpass';
  filter.frequency.setValueAtTime(startFreq,now);
  filter.frequency.exponentialRampToValueAtTime(endFreq,now+dur);
  src.connect(filter);filter.connect(gain);src.start(now);src.stop(now+dur);
}

function playTone(dur,freq,volMult,type,shape){
  if(!ctx||!enabled)return;
  var osc=ctx.createOscillator();osc.type=type||'sine';osc.frequency.setValueAtTime(freq,ctx.currentTime);
  var gain=ctx.createGain();gain.connect(ctx.destination);
  var now=ctx.currentTime;
  gain.gain.setValueAtTime(vol*volMult,now);
  if(shape==='exp')gain.gain.exponentialRampToValueAtTime(0.001,now+dur);
  else gain.gain.linearRampToValueAtTime(0,now+dur);
  osc.connect(gain);osc.start(now);osc.stop(now+dur);
}

var sounds={
  shoot:function(){
    initAudio();
    playNoise(0.15,2000,100,0.8,'exp');
    playTone(0.1,80,0.6,'sawtooth','exp');
    playTone(0.08,60,0.4,'square','exp');
  },
  miss:function(){
    initAudio();
    playTone(0.05,1200,0.3,'square','exp');
    setTimeout(function(){playTone(0.03,800,0.2,'square','exp')},40);
  },
  hit:function(){
    initAudio();
    playNoise(0.1,1500,200,0.6,'exp');
    playTone(0.12,100,0.5,'sine','exp');
    playTone(0.06,50,0.3,'sawtooth','exp');
  },
  crit:function(){
    initAudio();
    playNoise(0.2,3000,100,1,'exp');
    playTone(0.15,1200,0.5,'square','exp');
    playTone(0.1,1500,0.3,'sine','exp');
    setTimeout(function(){playTone(0.1,1800,0.2,'sine','exp')},50);
  },
  skip:function(){
    initAudio();
    playTone(0.08,600,0.2,'sine','exp');
    setTimeout(function(){playTone(0.06,800,0.15,'sine','exp')},60);
  },
  empty:function(){
    initAudio();
    playTone(0.04,2000,0.15,'sine','exp');
  },
  ach:function(){
    initAudio();
    playTone(0.12,880,0.3,'sine','exp');
    setTimeout(function(){playTone(0.12,1100,0.3,'sine','exp')},120);
    setTimeout(function(){playTone(0.2,1320,0.3,'sine','exp')},240);
  },
  spin:function(){
    initAudio();
    for(var i=0;i<6;i++){
      (function(d){setTimeout(function(){playTone(0.03,300+Math.random()*400,0.1,'sine','exp')},d*40)})(i);
    }
  },
  duel:function(){
    initAudio();
    playTone(0.15,300,0.4,'sawtooth','exp');
    playTone(0.15,400,0.3,'square','exp');
  }
};

function hook(){
  if(typeof G==='undefined'||!G)return;
  var origL=window.addL;
  if(!origL||origL.__sfx)return;
  window.addL=function(msg,cls){
    origL(msg,cls);
    try{
      if(!enabled)return;
      if(cls==='da'&&(msg.indexOf('砰!')>=0||msg.indexOf('击中')>=0)){
        if(msg.indexOf('暴击')>=0)sounds.crit();
        else{sounds.shoot();setTimeout(function(){sounds.hit()},80);}
      }else if(cls==='cr'&&msg.indexOf('暴击')>=0){sounds.crit()}
      else if(cls==='da'&&msg.indexOf('旗帜')>=0){sounds.empty()}
      else if(msg.indexOf('空枪')>=0||msg.indexOf('松了一口气')>=0){sounds.miss()}
      else if(cls==='sk'||msg.indexOf('跳过')>=0){sounds.skip()}
      else if(cls==='fl'){sounds.empty()}
      else if(cls==='du'){sounds.duel()}
      else if(msg.indexOf('装弹完成')>=0){sounds.spin()}
    }catch(e){}
  };
  window.addL.__sfx=true;
  
  // Hook achievement
  var origAch=window.checkAch;
  if(typeof origAch==='function'&&!origAch.__sfx){
    window.checkAch=function(){
      origAch();
      // Will be triggered by the addL hook
    };
    window.checkAch.__sfx=true;
  }
}

// Check for achievement toasts
setInterval(function(){
  if(!enabled||typeof G==='undefined')return;
  // Play achievement sound when we see it
  var toasts=document.querySelectorAll('.wa-tst');
  if(toasts.length>0&&toasts[toasts.length-1].dataset.sfx!=='1'){
    toasts[toasts.length-1].dataset.sfx='1';
    sounds.ach();
  }
},500);

var retry=setInterval(function(){if(typeof G!=='undefined'&&G&&typeof window.addL==='function'){hook();clearInterval(retry)}},500);

// UI
setTimeout(function(){
  var ui=document.createElement('div');ui.className='sfx-btn'+(enabled?' on':' off');
  ui.id='sfxBtn';ui.textContent=enabled?'🔊':'🔇';
  ui.title=enabled?'音效已开启':'音效已关闭';
  ui.onclick=function(){
    enabled=!enabled;
    try{localStorage.setItem('wd_sfx',enabled?'1':'0')}catch(e){}
    ui.textContent=enabled?'🔊':'🔇';
    ui.className='sfx-btn'+(enabled?' on':' off');
    ui.title=enabled?'音效已开启':'音效已关闭';
    if(enabled){initAudio();sounds.empty()}
  };
  document.body.appendChild(ui);
},800);

// Init on first interaction
document.addEventListener('click',function(){if(!ctx&&enabled)initAudio()},{once:true});

})();
