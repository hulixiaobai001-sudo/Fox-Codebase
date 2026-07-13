/**
 * 西部对决 · 成就+战绩系统
 * 用法：在 roulette.html 的 </body> 前加 <script src="achieve.js"></script>
 * 不动原HTML一行代码，纯外挂。
 */
(function(){

var css=document.createElement('style');
css.textContent=[
'.wa-ui{position:fixed;bottom:12px;right:12px;z-index:9999;display:flex;gap:6px;opacity:0.5;transition:opacity .3s}',
'.wa-ui:hover{opacity:1}',
'.wa-btn{background:rgba(30,15,10,.85);border:1px solid #6b3a2a;border-radius:8px;padding:5px 10px;color:#c0a090;font-size:.7em;cursor:pointer;font-family:inherit}',
'.wa-btn:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}',
'.wa-tst{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.9);color:#fc3;padding:16px 28px;border-radius:14px;z-index:99999;border:2px solid #fc3;text-align:center;pointer-events:none;animation:waF 2.5s forwards;font-size:.9em;min-width:200px}',
'.wa-tst .wa-ico{font-size:2em;display:block;margin-bottom:4px}',
'.wa-tst .wa-nm{font-weight:bold;color:#fff;font-size:1em}',
'.wa-tst .wa-ds{color:#c0a090;font-size:.75em;margin-top:2px}',
'@keyframes waF{0%{opacity:0;transform:translate(-50%,-50%) scale(.8)}15%{opacity:1}75%{opacity:1}100%{opacity:0}}',
'.wa-panel{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);z-index:99998;align-items:center;justify-content:center}',
'.wa-panel.on{display:flex}',
'.wa-box{background:linear-gradient(135deg,#1e0e0a,#2a1510);border:2px solid #8b4513;border-radius:20px;padding:24px 28px;max-width:460px;width:90%;max-height:85vh;overflow-y:auto}',
'.wa-box h2{font-size:1.3em;color:#ff6b35;text-align:center;margin-bottom:4px}',
'.wa-box .st{font-size:.7em;color:#6a5540;text-align:center;margin-bottom:14px}',
'.wa-ach{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}',
'.wa-ac{background:rgba(30,15,10,.5);border:1px solid rgba(139,69,19,.3);border-radius:10px;padding:8px 10px;text-align:center;opacity:.35;filter:grayscale(1)}',
'.wa-ac.unlocked{opacity:1;filter:none;border-color:#fc3}',
'.wa-ac .aico{font-size:1.3em;display:block}',
'.wa-ac .anm{font-size:.72em;color:#f0e6d3;font-weight:bold;margin-top:2px}',
'.wa-ac .ads{font-size:.6em;color:#8a7a60}',
'.wa-stats{font-size:.78em;color:#c0a090;line-height:1.8;text-align:center}',
'.wa-stats .sn{color:#ff6b35;font-weight:bold}',
'.wa-close{display:block;margin:14px auto 0;background:rgba(255,107,53,.1);border:1px solid #6b3a2a;border-radius:8px;padding:7px 24px;color:#a08070;cursor:pointer;font-family:inherit;font-size:.8em}',
'.wa-close:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}'
].join('\n');
document.head.appendChild(css);

var AK='wd_achieve',SK='wd_achieve_stats';
var AKList=[
  {id:'first_blood',name:'第一滴血',desc:'第一次击中对手',ico:'💧',check:function(){return S.fb}},
  {id:'miss_king',name:'空枪王',desc:'累计空枪5次',ico:'💨',check:function(){return S.ms>=5}},
  {id:'comeback',name:'绝地翻盘',desc:'1HP反杀获胜',ico:'🔥',check:function(){return S.cb}},
  {id:'crit_master',name:'暴击大师',desc:'打出3次暴击',ico:'💥',check:function(){return S.cr>=3}},
  {id:'skip_master',name:'跳过达人',desc:'跳过5次',ico:'🏃',check:function(){return S.sk>=5}},
  {id:'hard_die',name:'命硬',desc:'累计被击中10次未死',ico:'💪',check:function(){return S.ht>=10}},
  {id:'veteran',name:'百战老兵',desc:'完成10局游戏',ico:'🎖',check:function(){return S.pl>=10}},
  {id:'winner',name:'常胜将军',desc:'赢得5局',ico:'🏆',check:function(){return S.wi>=5}}
];
var S={fb:0,ms:0,cb:0,cr:0,sk:0,ht:0,pl:0,wi:0,ls:0,tr:0,hi:0,mi:0,se:0};
var curMs=0,lastHit=false,gameStats={};
var panelOpen=false;

function loadS(){try{var d=JSON.parse(localStorage.getItem(AK));for(var k in d)S[k]=d[k]}catch(e){}}
function saveS(){try{localStorage.setItem(AK,JSON.stringify(S))}catch(e){}}
function loadGS(){try{var d=JSON.parse(localStorage.getItem(AK+'_gs'));for(var k in d)gameStats[k]=d[k]}catch(e){}}
function saveGS(){try{localStorage.setItem(AK+'_gs',JSON.stringify(gameStats))}catch(e){}}

function T(m,c){var e=document.createElement('div');e.className='wa-tst';e.innerHTML=m;document.body.appendChild(e);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e)},2600)}

function checkAch(){
  AKList.forEach(function(a){
    if(!S[a.id]&&a.check()){
      S[a.id]=1;saveS();
      T('<span class="wa-ico">'+a.ico+'</span><span class="wa-nm">成就解锁: '+a.name+'</span><span class="wa-ds">'+a.desc+'</span>');
    }
  });
}

function hook(){
  if(typeof G==='undefined'||!G)return;
  var origAddL=window.addL;
  if(!origAddL||origAddL.__hooked)return;
  window.addL=function(msg,cls){
    origAddL(msg,cls);
    try{
      if(typeof G==='undefined')return;
      if(!G.phase||G.phase==='setup')return;
      if(cls==='da'&&msg.indexOf('击中')>=0){
        S.hi++;curMs=0;lastHit=true;
        if(!S.fb){S.fb=1;saveS()}
        checkAch();
      }
      if(cls==='cr'){S.cr++;saveS();checkAch()}
      if(msg.indexOf('空枪')>=0||msg.indexOf('松了一口气')>=0){
        S.mi++;curMs++;lastHit=false;
        if(S.ms<5&&curMs>=5){S.ms=Math.max(S.ms,5);saveS();checkAch()}
      }
      if(msg.indexOf('跳过')>=0&&msg.indexOf('倒')<0&&msg.indexOf('挡')<0){
        S.sk++;saveS();checkAch()
      }
      if(cls==='da'&&(msg.indexOf('HP')>=0||msg.indexOf('失去')>=0)){
        S.ht++;saveS();checkAch()
      }
    }catch(e){}
  };
  window.addL.__hooked=true;

  var origGO=window.gameOver;
  if(origGO&&!origGO.__hooked){
    window.gameOver=function(wi){
      origGO(wi);
      try{
        S.pl++;
        if(wi===0||wi===1){S.wi++;saveS()}
        gameStats.last={winner:G.p[wi].n,rd:G.rd,hp:G.p[wi].hp+':'+G.p[wi].mx,date:new Date().toLocaleDateString()};
        saveGS();
        if(G.p[wi]&&G.p[wi].hp===1&&!S.cb){S.cb=1;saveS();checkAch()}
        checkAch();
        saveS();
      }catch(e){}
    };
    window.gameOver.__hooked=true;
  }
}

var hookInt=setInterval(function(){
  if(typeof G!=='undefined'&&G){hook();clearInterval(hookInt)}
},500);

function showPanel(){
  panelOpen=true;
  var p=document.getElementById('waPanel');
  if(!p){
    p=document.createElement('div');p.className='wa-panel';p.id='waPanel';
    var b=document.createElement('div');b.className='wa-box';b.id='waBox';
    b.innerHTML='<h2>🏆 成就 & 战绩</h2><div class="st">自动记录 无需任何操作</div>';
    var aDiv=document.createElement('div');aDiv.className='wa-ach';aDiv.id='waAchDiv';
    b.appendChild(aDiv);
    var sDiv=document.createElement('div');sDiv.className='wa-stats';sDiv.id='waStatsDiv';
    b.appendChild(sDiv);
    var cl=document.createElement('button');cl.className='wa-close';cl.textContent='关闭';
    cl.onclick=function(){p.classList.remove('on');panelOpen=false};
    b.appendChild(cl);
    p.appendChild(b);document.body.appendChild(p);
  }
  p.classList.add('on');
  var ad=document.getElementById('waAchDiv');ad.innerHTML='';
  AKList.forEach(function(a){
    var d=document.createElement('div');d.className='wa-ac'+(S[a.id]?' unlocked':'');
    d.innerHTML='<span class="aico">'+a.ico+'</span><span class="anm">'+a.name+'</span><span class="ads">'+a.desc+'</span>';
    ad.appendChild(d);
  });
  var sd=document.getElementById('waStatsDiv');
  var lastG=gameStats.last||{};
  sd.innerHTML=
    '<span class="sn">'+S.wi+'</span> 胜 / <span class="sn">'+(S.pl-S.wi)+'</span> 负 · 共 <span class="sn">'+S.pl+'</span> 局<br>'+
    '命中: <span class="sn">'+S.hi+'</span> · 空枪: <span class="sn">'+S.mi+'</span> · 暴击: <span class="sn">'+S.cr+'</span><br>'+
    '跳过: <span class="sn">'+S.sk+'</span> · 被击中: <span class="sn">'+S.ht+'</span> 次'+
    (lastG.rd?'<br><br>上局: '+lastG.winner+' 胜 ('+lastG.rd+'回合)':'');
}

loadS();loadGS();
setInterval(function(){if(typeof G!=='undefined'&&G&&G.phase!=='setup'){checkAch();saveS()}},5000);

setTimeout(function(){
  var ui=document.createElement('div');ui.className='wa-ui';ui.id='waUI';
  var bt=document.createElement('button');bt.className='wa-btn';bt.textContent='🏆成就';
  bt.onclick=showPanel;bt.title='查看成就与战绩';ui.appendChild(bt);
  document.body.appendChild(ui);
},800);

})();