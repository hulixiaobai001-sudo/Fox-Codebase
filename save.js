/**
 * save.js - 西部对决 外挂面板+存档系统
 * 用法: roulette.html的</body>前加 <script src="save.js"></script>
 * 密码"白沁"解锁外挂面板。不动原HTML一行代码。
 */
(function(){
var styleEl=document.createElement('style');
styleEl.textContent=[
'.wd-ui{position:fixed;bottom:12px;left:12px;z-index:9999;display:flex;gap:6px;opacity:0.5}',
'.wd-ui:hover{opacity:1}',
'.wd-btn{background:rgba(30,15,10,.85);border:1px solid #6b3a2a;border-radius:8px;padding:5px 12px;color:#c0a090;font-size:.75em;cursor:pointer;font-family:inherit}',
'.wd-btn:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}',
'.wd-toast{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.88);color:#ff6b35;padding:16px 32px;border-radius:12px;font-size:1.15em;z-index:99999;border:1px solid #8b4513;pointer-events:none;animation:wdF 1.5s forwards}',
'@keyframes wdF{0%{opacity:0}15%{opacity:1}75%{opacity:1}100%{opacity:0}}',
'.wd-info{position:fixed;bottom:50px;left:12px;z-index:9998;font-size:.6em;color:#5a4030}',
'.wd-cp{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.75);z-index:99999;align-items:center;justify-content:center}',
'.wd-cp.on{display:flex}',
'.wd-cb{background:linear-gradient(135deg,#1e0e0a,#2a1510);border:2px solid #8b4513;border-radius:20px;padding:28px 32px;max-width:460px;width:90%;max-height:80vh;overflow-y:auto;box-shadow:0 0 60px rgba(255,107,53,.15)}',
'.wd-cb h2{font-size:1.4em;color:#ff6b35;margin-bottom:4px;text-align:center}',
'.wd-cb .sub{font-size:.7em;color:#6a5540;text-align:center;margin-bottom:16px}',
'.wd-cs{margin-bottom:14px}',
'.wd-cs .st{font-size:.85em;color:#dd8844;margin-bottom:6px;font-weight:bold}',
'.wd-cr{display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:4px}',
'.wd-cr label{font-size:.8em;color:#c0a090;min-width:50px}',
'.wd-cbtn{background:rgba(60,30,20,.5);border:1px solid #6b3a2a;border-radius:8px;padding:6px 14px;color:#c0a090;font-size:.8em;cursor:pointer;font-family:inherit}',
'.wd-cbtn:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}',
'.wd-cbtn.dng:hover{background:rgba(200,30,30,.2);border-color:#c33;color:#f55}',
'.wd-cbtn.gud:hover{background:rgba(50,200,80,.15);border-color:#3a5;color:#4d6}',
'.wd-cbtn:disabled{opacity:.3;cursor:not-allowed}',
'.wd-ccl{display:block;margin:16px auto;background:rgba(255,107,53,.1);border:1px solid #6b3a2a;border-radius:8px;padding:8px 28px;color:#a08070;cursor:pointer;font-family:inherit}',
'.wd-ccl:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}'
].join('\n');
document.head.appendChild(styleEl);

var GK='wd_guild_save',MK='wd_guild_saves',UK='wd_cheat_unlock',PW='白沁';
var CP=null,CB=null;

function $(id){return document.getElementById(id);}
function T(m){
  var e=document.createElement('div');e.className='wd-toast';
  e.textContent=m;document.body.appendChild(e);
  setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e)},1500);
}
function F(ts){
  if(!ts)return '';var d=Date.now()-ts,mi=Math.floor(d/60000);
  if(mi<1)return '刚刚';if(mi<60)return mi+'分钟前';
  var h=Math.floor(mi/60);if(h<24)return h+'小时前';
  return Math.floor(h/24)+'天前';
}
function U(v){
  if(v===true||v===false){try{localStorage.setItem(UK,v?'1':'0')}catch(e){}}
  try{return localStorage.getItem(UK)==='1'}catch(e){return false}
}
function hG(){return typeof S!=='undefined'&&S&&typeof S.p!=='undefined'&&S.p.length===2;}
function iG(){return hG()&&S.phase!=='setup'&&S.phase!=='go';}

function cS(){
  if(!hG())return null;
  return{v:2,t:Date.now(),mode:S.mode,diff:S.diff,phase:S.phase,flagOk:S.flagOk,guildMode:S.guildMode,mult:S.mult,rd:S.rd,tr:S.tr,cp:S.cp,ld:S.ld,bp:S.bp,cc:S.cc,br:S.br,rs:S.rs,bf:S.bf,de:S.de,da:S.da,st:S.st,ps:S.ps,certShown:S.certShown,p:JSON.parse(JSON.stringify(S.p)),log:(S.log||[]).slice(-30)};
}
function rS(s){
  if(!hG())return false;
  S.mode=s.mode||'local';S.diff=s.diff||'medium';S.phase=s.phase||'setup';
  S.flagOk=!!s.flagOk;S.guildMode=!!s.guildMode;S.mult=s.mult||1;
  S.rd=s.rd||0;S.tr=s.tr||0;S.cp=s.cp||0;S.ld=s.ld||0;
  S.bp=s.bp!=null?s.bp:-1;S.cc=s.cc||0;S.br=!!s.br;S.rs=!!s.rs;
  S.bf=!!s.bf;S.de=!!s.de;S.da=!!s.da;S.st=s.st||0;S.ps=s.ps||0;S.certShown=!!s.certShown;
  if(s.p&&s.p.length===2){
    for(var i=0;i<2;i++){
      var src=s.p[i],dst=S.p[i];
      dst.n=src.n||'';dst.hp=src.hp!=null?src.hp:5;dst.mx=src.mx||5;
      dst.al=src.al!==false;dst.ai=!!src.ai;
      dst.it=JSON.parse(JSON.stringify(src.it||{watch:1,book:1,check:1,flag:0}));
      dst.wa=!!src.wa;dst.wp=src.wp||0;dst.ba=!!src.ba;dst.bu=!!src.bu;
      dst.fa=!!src.fa;dst.fc=src.fc||0;dst.ft=src.ft||0;
    }
  }
  if(s.log)S.log=s.log.slice();uUI();return true;
}
function uUI(){
  if(!hG())return;
  var p=S.phase,su=$('setupScreen'),gb=$('gameBoard');
  if(p==='setup'||p==='go'||p==='gameover'){
    if(su)su.style.display='block';if(gb)gb.style.display='none';S.phase='setup';return;
  }
  if(su)su.style.display='none';if(gb)gb.style.display='block';
  var g=$('goOverlay');if(g)g.classList.remove('on');
  var b=$('blindOverlay');if(b)b.classList.remove('on');
  var ri=$('rdInfo');if(ri)ri.textContent='第 '+S.rd+' 回合';
  var mi=$('multI');if(mi)mi.textContent='x'+S.mult+(S.da?' 决斗':'');
  try{window.rdAll()}catch(e){}try{window.enActs()}catch(e){}try{window.upBan()}catch(e){}
  if(p==='duel_prompt')try{window.upDuel()}catch(e){}
  if(p==='loading'&&S.bp>=0){S.phase='play';S.rs=true;try{window.rdAll()}catch(e){}try{window.enActs()}catch(e){}try{window.upBan()}catch(e){}}
}
function sG(){
  if(!hG()){T('游戏未加载');return;}
  if(S.phase==='setup'){T('还没开始');return;}
  var s=cS();if(!s){T('存档失败');return;}
  try{
    localStorage.setItem(GK,JSON.stringify(s));
    var m=JSON.parse(localStorage.getItem(MK)||'[]');
    m.unshift({t:Date.now(),rd:S.rd,p1:S.p[0]?.n,p2:S.p[1]?.n});
    if(m.length>10)m.length=10;localStorage.setItem(MK,JSON.stringify(m));
    T('已存档(第'+S.rd+'回合)');
  }catch(e){T('存档失败:'+e.message);}
}
function lG(){
  try{
    var r=localStorage.getItem(GK);if(!r){T('没有存档');return;}
    var s=JSON.parse(r);if(s.v!==2){T('存档版本不兼容');return;}
    if(!hG()){T('游戏未加载');return;}
    if(rS(s))T('已读档(第'+s.rd+'回合'+F(s.t)+')');
    else T('读档失败');
  }catch(e){T('读档失败');}
}
function dS(){try{localStorage.removeItem(GK);localStorage.removeItem(MK);T('存档已删除');}catch(e){}}
function uSI(){
  var i=$('wdSI');if(!i)return;
  try{
    var r=localStorage.getItem(GK);if(!r){i.textContent='';return;}
    var s=JSON.parse(r),p1=s.p?.[0]?.n||'?',p2=s.p?.[1]?.n||'?';
    i.textContent='第'+s.rd+'回合 '+p1+'vs'+p2+' '+F(s.t);
  }catch(e){i.textContent='';}
}

function rP(){
  if(!CB||!hG())return;
  var h0=CB.querySelector('.wch0'),h1=CB.querySelector('.wch1');
  if(h0)h0.textContent=S.p[0].hp+'/'+S.p[0].mx;if(h1)h1.textContent=S.p[1].hp+'/'+S.p[1].mx;
  var s0=CB.querySelector('.wcs0'),s1=CB.querySelector('.wcs1');
  if(s0)s0.value=S.p[0].hp;if(s1)s1.value=S.p[1].hp;
  var ms=CB.querySelector('.wcms');
  if(ms){ms.value=S.mult;var mn=ms.nextElementSibling;if(mn)mn.textContent='x'+S.mult;}
  var bs=CB.querySelectorAll('.wd-cbtn');
  for(var i=0;i<bs.length;i++){var b=bs[i];if(b.dataset.ng)b.disabled=!iG();}
}
function cHP(i){
  if(!iG()){T('游戏未开始');return;}
  var sl=CB.querySelector(i===0?'.wcs0':'.wcs1');if(!sl)return;
  var v=parseInt(sl.value);if(isNaN(v))return;
  S.p[i].hp=Math.min(S.p[i].mx,Math.max(0,v));S.p[i].al=S.p[i].hp>0;
  try{window.rdAll()}catch(e){}rP();T(S.p[i].n+' HP:'+S.p[i].hp);
}
function cRV(){
  if(!iG()||S.bp<0){T('没有子弹位置');return;}
  S.br=true;try{window.rdAll()}catch(e){}T('子弹在第'+(S.bp+1)+'发');
}
function cGI(pi,it){
  if(!iG()){T('游戏未开始');return;}
  if(it==='flag'&&!S.guildMode){T('公会模式未开启');return;}
  S.p[pi].it[it]=1;
  if(it==='book'){S.p[pi].ba=false;S.p[pi].bu=false;}
  if(it==='flag'){S.p[pi].fa=false;S.p[pi].fc=1;S.p[pi].ft=0;}
  try{window.rdAll()}catch(e){}
  var ns={watch:'怀表',book:'书',check:'子弹',flag:'旗'};
  T(S.p[pi].n+' 获得'+(ns[it]||it));
}
function cGA(pi){cGI(pi,'watch');cGI(pi,'book');cGI(pi,'check');if(S.guildMode)cGI(pi,'flag');}
function cSK(){
  if(!iG()){T('游戏未开始');return;}
  try{S.bf=true;S.phase='ready';
    setTimeout(function(){if(S.phase!=='go'&&typeof window.nxtRd==='function')window.nxtRd()},100);
    T('跳转下一回合');
  }catch(e){T('无法跳转');}
}
function cFH(){
  if(!iG()){T('游戏未开始');return;}
  for(var i=0;i<2;i++){S.p[i].hp=S.p[i].mx;S.p[i].al=true;}
  try{window.rdAll()}catch(e){}rP();T('全体满血');
}
function cSM(){
  if(!iG()){T('游戏未开始');return;}
  var sl=CB.querySelector('.wcms');if(!sl)return;
  S.mult=parseInt(sl.value);
  var mi=$('multI');if(mi)mi.textContent='x'+S.mult+(S.da?' 决斗':'');
  T('倍率 x'+S.mult);
}
function cWN(){
  if(!iG()){T('游戏未开始');return;}
  var cp=S.cp,loser=cp===0?1:0;
  S.p[loser].hp=0;S.p[loser].al=false;
  try{window.gameOver(cp)}catch(e){T(S.p[cp].n+' 胜利');}
}
function aB(pr,text,fn,cls){
  var b=document.createElement('button');
  b.className='wd-cbtn'+(cls?' '+cls:'');b.dataset.ng='1';b.textContent=text;b.onclick=fn;
  pr.appendChild(b);return b;
}
function aS(title){
  var s=document.createElement('div');s.className='wd-cs';
  var st=document.createElement('div');st.className='st';st.textContent=title;
  s.appendChild(st);return s;
}
function mkP(){
  if(CP){CP.classList.toggle('on');if(CP.classList.contains('on'))rP();return;}
  CP=document.createElement('div');CP.className='wd-cp';CP.id='wdCP';
  CB=document.createElement('div');CB.className='wd-cb';
  var h2=document.createElement('h2');h2.textContent='外挂面板';CB.appendChild(h2);
  var sub=document.createElement('div');sub.className='sub';sub.textContent='密码已解锁';CB.appendChild(sub);
  var s1=aS('血量');
  for(var i=0;i<2;i++){(function(ii){
    var r=document.createElement('div');r.className='wd-cr';
    var lb=document.createElement('label');lb.textContent='P'+(ii+1);
    var sl=document.createElement('input');sl.type='range';sl.className=ii===0?'wcs0':'wcs1';sl.min=0;sl.max=5;sl.value=5;sl.style.cssText='width:80px;accent-color:#ff6b35';
    var vl=document.createElement('span');vl.className=ii===0?'wch0':'wch1';vl.style.cssText='min-width:30px;color:#c0a090';
    vl.textContent=hG()?S.p[ii].hp+'/'+S.p[ii].mx:'5/5';
    r.appendChild(lb);r.appendChild(sl);r.appendChild(vl);r.appendChild(aB(r,'设置',function(){cHP(ii);}));
    s1.appendChild(r);
  })(i);}CB.appendChild(s1);
  var s2=aS('道具');
  var its=[{t:'怀表',k:'watch'},{t:'书',k:'book'},{t:'查看',k:'check'},{t:'旗',k:'flag'},{t:'全部',k:'all'}];
  for(var p=0;p<2;p++){(function(pi){
    var r=document.createElement('div');r.className='wd-cr';
    var lb=document.createElement('label');lb.textContent='P'+(pi+1);r.appendChild(lb);
    for(var j=0;j<its.length;j++){(function(itm,tt){
      if(itm==='all')r.appendChild(aB(r,tt,function(){cGA(pi);}));
      else r.appendChild(aB(r,tt,function(){cGI(pi,itm);}));
    })(its[j].k,its[j].t);}s2.appendChild(r);
  })(p);}CB.appendChild(s2);
  var s3=aS('快捷');
  var r3=document.createElement('div');r3.className='wd-cr';
  aB(r3,'揭示',cRV);aB(r3,'下回合',cSK);aB(r3,'全体满血',cFH,'gud');aB(r3,'当前胜利',cWN,'dng');
  s3.appendChild(r3);CB.appendChild(s3);
  var s4=aS('倍率');
  var r4=document.createElement('div');r4.className='wd-cr';
  var ms=document.createElement('input');ms.type='range';ms.className='wcms';ms.min=1;ms.max=10;ms.value=1;ms.style.cssText='width:120px;accent-color:#ff6b35';
  var mv=document.createElement('span');mv.style.cssText='color:#ff6b35;min-width:24px';mv.textContent='x1';
  r4.appendChild(ms);r4.appendChild(mv);r4.appendChild(aB(r4,'设置',cSM));s4.appendChild(r4);CB.appendChild(s4);
  var cl=document.createElement('button');cl.className='wd-ccl';cl.textContent='关闭';
  cl.onclick=function(){CP.classList.remove('on');};CB.appendChild(cl);
  CP.appendChild(CB);document.body.appendChild(CP);setTimeout(rP,100);
}
function tCP(){
  if(U()){mkP();return;}
  var pw=prompt('请输入密码:');
  if(pw===PW){U(true);T('已解锁');mkP();}
  else if(pw!==null)T('密码错误');
}
function bUI(){
  var ui=document.createElement('div');ui.className='wd-ui';ui.id='wdUI';
  function aB2(t,tt,fn){var b=document.createElement('button');b.className='wd-btn';b.textContent=t;b.title=tt;b.onclick=fn;ui.appendChild(b);return b;}
  aB2('存档','保存进度',sG);aB2('读档','读取存档',lG);aB2('删除','删除存档',dS);aB2('外挂','密码白沁',tCP);
  var tag=document.createElement('span');tag.style.cssText='font-size:.6em;color:#4c4;display:'+(U()?'inline':'none');tag.textContent='✓';
  ui.appendChild(tag);
  var info=document.createElement('div');info.className='wd-info';info.id='wdSI';
  document.body.appendChild(ui);document.body.appendChild(info);uSI();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(bUI,500)});
else setTimeout(bUI,500);
setInterval(uSI,10000);

})();