/**
 * 西部对决 · 存档+外挂面板
 * 用法：在 roulette.html 的 </body> 前加 <script src="save.js"></script>
 * 密码"白沁"解锁外挂。不动原HTML。
 */
(function() {

var css = document.createElement('style');
css.textContent = [
  '.wd-ui{position:fixed;bottom:12px;left:12px;z-index:9999;display:flex;gap:6px;opacity:0.5;transition:opacity .3s}',
  '.wd-ui:hover{opacity:1}',
  '.wd-btn{background:rgba(30,15,10,.85);border:1px solid #6b3a2a;border-radius:8px;padding:5px 12px;color:#c0a090;font-size:.75em;cursor:pointer;font-family:inherit}',
  '.wd-btn:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}',
  '.wd-tst{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.88);color:#ff6b35;padding:16px 32px;border-radius:12px;z-index:99999;border:1px solid #8b4513;pointer-events:none;animation:wdF 1.5s forwards}',
  '@keyframes wdF{0%{opacity:0}15%{opacity:1}75%{opacity:1}100%{opacity:0}}',
  '.wd-info{position:fixed;bottom:50px;left:12px;z-index:9998;font-size:.6em;color:#5a4030}',
  '.wd-cp{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.75);z-index:99999;align-items:center;justify-content:center}',
  '.wd-cp.on{display:flex}',
  '.wd-cb{background:linear-gradient(135deg,#1e0e0a,#2a1510);border:2px solid #8b4513;border-radius:20px;padding:28px 32px;max-width:460px;width:90%;max-height:85vh;overflow-y:auto}',
  '.wd-cb h2{font-size:1.4em;color:#ff6b35;text-align:center;margin-bottom:4px}',
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
document.head.appendChild(css);

var SK='wd_guild_save',MK='wd_guild_saves',UK='wd_cheat_unlock',PW='\u767D\u6C81';
var CP=null,CB=null;

function $(id){return document.getElementById(id)}
function T(m){var e=document.createElement('div');e.className='wd-tst';e.textContent=m;document.body.appendChild(e);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e)},1500)}
function F(ts){if(!ts)return '';var d=Date.now()-ts,mi=Math.floor(d/60000);if(mi<1)return '\u521A\u521A';if(mi<60)return mi+'\u5206\u949F\u524D';var h=Math.floor(mi/60);if(h<24)return h+'\u5C0F\u65F6\u524D';return Math.floor(h/24)+'\u5929\u524D'}
function U(v){if(v===true||v===false){try{localStorage.setItem(UK,v?'1':'0')}catch(e){}}try{return localStorage.getItem(UK)==='1'}catch(e){return false}}
function hG(){return typeof S!=='undefined'&&S&&typeof S.p!=='undefined'&&S.p.length===2}
function iG(){return hG()&&S.phase!=='setup'&&S.phase!=='go'}

// Save
function cS(){if(!hG())return null;return{v:3,t:Date.now(),mode:S.mode,phase:S.phase,mult:S.mult,rd:S.rd,tr:S.tr,cp:S.cp,ld:S.ld,bp:S.bp,cc:S.cc,br:S.br,rs:S.rs,bf:S.bf,de:S.de,da:S.da,st:S.st,ps:S.ps,certShown:S.certShown,s:S.s,p:JSON.parse(JSON.stringify(S.p)),log:(S.log||[]).slice(-30)}}
function rS(s){if(!hG())return false;S.mode=s.mode||'local';S.phase=s.phase||'setup';S.mult=s.mult||1;S.rd=s.rd||0;S.tr=s.tr||0;S.cp=s.cp||0;S.ld=s.ld||0;S.bp=s.bp!=null?s.bp:-1;S.cc=s.cc||0;S.br=!!s.br;S.rs=!!s.rs;S.bf=!!s.bf;S.de=!!s.de;S.da=!!s.da;S.st=s.st||0;S.ps=s.ps||0;S.certShown=!!s.certShown;
  if(s.s){S.s.hp=s.s.hp||5;S.s.ch=s.s.ch||6;S.s.bu=s.s.bu||1;S.s.sk=s.s.sk||1;S.s.it=s.s.it||4;S.s.noSk=!!s.s.noSk}
  if(s.p&&s.p.length===2){for(var i=0;i<2;i++){var src=s.p[i],dst=S.p[i];dst.n=src.n||'';dst.hp=src.hp!=null?src.hp:5;dst.mx=src.mx||5;dst.al=src.al!==false;dst.ai=!!src.ai;dst.it=JSON.parse(JSON.stringify(src.it||{}));if(src.sel)dst.sel=src.sel.slice();dst.wa=!!src.wa;dst.wp=src.wp||0;dst.ba=!!src.ba;dst.bu=!!src.bu;dst.fa=!!src.fa;dst.fc=src.fc||0;dst.ft=src.ft||0}}
  if(s.log)S.log=s.log.slice();uUI();return true}
function uUI(){if(!hG())return;var p=S.phase,su=$('scrSetup'),gb=$('gameBoard');if(p==='setup'||p==='go'||p==='gameover'){if(su)su.classList.add('on');if(gb)gb.classList.remove('on');S.phase='setup';return}if(su)su.classList.remove('on');if(gb)gb.classList.add('on');var go=$('goO');if(go)go.classList.remove('on');var bl=$('blindO');if(bl)bl.classList.remove('on');var ri=$('rdInfo');if(ri)ri.textContent='\u7B2C '+S.rd+' \u56DE\u5408';var mi=$('mli');if(mi)mi.textContent='x'+S.mult+(S.da?' \u51B3\u6597':'');try{window.rdAll()}catch(e){}try{window.enActs()}catch(e){}try{window.upBan()}catch(e){}if(p==='duel_prompt')try{window.upDuel()}catch(e){}if(p==='loading'&&S.bp>=0){S.phase='play';S.rs=true;try{window.rdAll()}catch(e){}try{window.enActs()}catch(e){}try{window.upBan()}catch(e){}}}
function sG(){if(!hG()){T('\u6E38\u620F\u672A\u52A0\u8F7D');return}if(S.phase==='setup'){T('\u8FD8\u6CA1\u5F00\u59CB');return}var s=cS();if(!s){T('\u5B58\u6863\u5931\u8D25');return}try{localStorage.setItem(SK,JSON.stringify(s));var m=JSON.parse(localStorage.getItem(MK)||'[]');m.unshift({t:Date.now(),rd:S.rd,p1:S.p[0]?.n,p2:S.p[1]?.n});if(m.length>10)m.length=10;localStorage.setItem(MK,JSON.stringify(m));T('\u5DF2\u5B58\u6863(\u7B2C'+S.rd+'\u56DE\u5408)')}catch(e){T('\u5B58\u6863\u5931\u8D25')}}
function lG(){try{var r=localStorage.getItem(SK);if(!r){T('\u6CA1\u6709\u5B58\u6863');return}var s=JSON.parse(r);if(s.v!==3){T('\u5B58\u6863\u7248\u672C\u4E0D\u5339\u914D');return}if(!hG()){T('\u6E38\u620F\u672A\u52A0\u8F7D');return}if(rS(s))T('\u5DF2\u8BFB\u6863(\u7B2C'+s.rd+'\u56DE\u5408 '+F(s.t)+')');else T('\u8BFB\u6863\u5931\u8D25')}catch(e){T('\u8BFB\u6863\u5931\u8D25')}}
function dS(){try{localStorage.removeItem(SK);localStorage.removeItem(MK);T('\u5B58\u6863\u5DF2\u5220\u9664')}catch(e){}}
function uSI(){var i=$('wdSI');if(!i)return;try{var r=localStorage.getItem(SK);if(!r){i.textContent='';return}var s=JSON.parse(r),p1=s.p?.[0]?.n||'?',p2=s.p?.[1]?.n||'?';i.textContent='\u7B2C'+s.rd+'\u56DE\u5408 '+p1+'vs'+p2+' '+F(s.t)}catch(e){i.textContent=''}}

// Cheat panel
function rP(){if(!CB||!hG())return;var h0=CB.querySelector('.wch0'),h1=CB.querySelector('.wch1');if(h0)h0.textContent=S.p[0].hp+'/'+S.p[0].mx;if(h1)h1.textContent=S.p[1].hp+'/'+S.p[1].mx;var s0=CB.querySelector('.wcs0'),s1=CB.querySelector('.wcs1');if(s0)s0.value=S.p[0].hp;if(s1)s1.value=S.p[1].hp;var bs=CB.querySelectorAll('.wd-cbtn');for(var i=0;i<bs.length;i++){var b=bs[i];if(b.dataset.ng)b.disabled=!iG()}}
function cHP(i){if(!iG()){T('\u6E38\u620F\u672A\u5F00\u59CB');return}var sl=CB.querySelector(i===0?'.wcs0':'.wcs1');if(!sl)return;var v=parseInt(sl.value);if(isNaN(v))return;S.p[i].hp=Math.min(S.p[i].mx,Math.max(0,v));S.p[i].al=S.p[i].hp>0;try{window.rdAll()}catch(e){}rP();T(S.p[i].n+' HP:'+S.p[i].hp)}
function cRV(){if(!iG()||S.bp<0){T('\u6CA1\u6709\u5B50\u5F39');return}S.br=true;try{window.rdAll()}catch(e){}T('\u5B50\u5F39\u5728\u7B2C'+(S.bp+1)+'\u53D1')}
function cGI(pi,it){if(!iG()){T('\u6E38\u620F\u672A\u5F00\u59CB');return}if(it==='flag'&&!(S.s&&S.s.guildMode)){}S.p[pi].it[it]=1;if(it==='book'){S.p[pi].ba=false;S.p[pi].bu=false}if(it==='flag'){S.p[pi].fa=false;S.p[pi].fc=1;S.p[pi].ft=0}try{window.rdAll()}catch(e){}var ns={watch:'\u6000\u8868',book:'\u4E66',check:'\u67E5\u770B',flag:'\u65D7',wash:'\u6D17\u67AA',medkit:'\u6025\u6551',armor:'\u9632\u5F39',rapid:'\u8FDE\u5C04',freeze:'\u51B0\u51BB',swap:'\u4EA4\u6362'};T(S.p[pi].n+'\u83B7\u5F97'+(ns[it]||it))}
function cGA(pi){var ks=['watch','book','check','flag','wash','medkit','armor','rapid','freeze','swap'];for(var i=0;i<ks.length;i++)cGI(pi,ks[i])}
function cSK(){if(!iG()){T('\u6E38\u620F\u672A\u5F00\u59CB');return}try{S.bf=true;S.phase='ready';setTimeout(function(){if(S.phase!=='go'&&typeof window.nxtRd==='function')window.nxtRd()},100);T('\u8DF3\u8F6C\u4E0B\u4E00\u56DE\u5408')}catch(e){T('\u65E0\u6CD5\u8DF3\u8F6C')}}
function cFH(){if(!iG()){T('\u6E38\u620F\u672A\u5F00\u59CB');return}for(var i=0;i<2;i++){S.p[i].hp=S.p[i].mx;S.p[i].al=true}try{window.rdAll()}catch(e){}rP();T('\u5168\u4F53\u6EE1\u8840')}
function cSM(){if(!iG()){T('\u6E38\u620F\u672A\u5F00\u59CB');return}var sl=CB.querySelector('.wcms');if(!sl)return;S.mult=parseInt(sl.value);var mi=$('mli');if(mi)mi.textContent='x'+S.mult+(S.da?' \u51B3\u6597':'');T('\u500D\u7387 x'+S.mult)}
function cWN(){if(!iG()){T('\u6E38\u620F\u672A\u5F00\u59CB');return}var cp=S.cp,loser=cp===0?1:0;S.p[loser].hp=0;S.p[loser].al=false;try{window.gameOver(cp)}catch(e){T(S.p[cp].n+'\u80DC\u5229')}}
function cAllItems(pi){var ks=['watch','book','check','flag','wash','medkit','armor','rapid','freeze','swap'];for(var i=0;i<ks.length;i++)cGI(pi,ks[i])}
function aB(pr,text,fn,cls){var b=document.createElement('button');b.className='wd-cbtn'+(cls?' '+cls:'');b.dataset.ng='1';b.textContent=text;b.onclick=fn;pr.appendChild(b);return b}
function aS(title){var s=document.createElement('div');s.className='wd-cs';var st=document.createElement('div');st.className='st';st.textContent=title;s.appendChild(st);return s}
function mkP(){if(CP){CP.classList.toggle('on');if(CP.classList.contains('on'))rP();return}
  CP=document.createElement('div');CP.className='wd-cp';CP.id='wdCP';CB=document.createElement('div');CB.className='wd-cb';
  var h2=document.createElement('h2');h2.textContent='\u5916\u6302\u9762\u677F';CB.appendChild(h2);
  var sub=document.createElement('div');sub.className='sub';sub.textContent='\u5BC6\u7801\u5DF2\u89E3\u9501';CB.appendChild(sub);
  // HP
  var s1=aS('\u8840\u91CF');
  for(var i=0;i<2;i++){(function(ii){var r=document.createElement('div');r.className='wd-cr';var lb=document.createElement('label');lb.textContent='P'+(ii+1);var sl=document.createElement('input');sl.type='range';sl.className=ii===0?'wcs0':'wcs1';sl.min=0;sl.max=10;sl.value=5;sl.style.cssText='width:80px;accent-color:#ff6b35';var vl=document.createElement('span');vl.className=ii===0?'wch0':'wch1';vl.style.cssText='min-width:30px;color:#c0a090;font-size:.8em';vl.textContent=hG()?S.p[ii].hp+'/'+S.p[ii].mx:'5/5';r.appendChild(lb);r.appendChild(sl);r.appendChild(vl);r.appendChild(aB(r,'\u8BBE\u7F6E',function(){cHP(ii)}));s1.appendChild(r)})(i)}CB.appendChild(s1);
  // Items
  var s2=aS('\u9053\u5177');
  var its=[{t:'\u6000\u8868',k:'watch'},{t:'\u4E66',k:'book'},{t:'\u67E5\u770B',k:'check'},{t:'\u65D7',k:'flag'},{t:'\u6D17\u67AA',k:'wash'},{t:'\u6025\u6551',k:'medkit'},{t:'\u9632\u5F39',k:'armor'},{t:'\u8FDE\u5C04',k:'rapid'},{t:'\u51B0\u51BB',k:'freeze'},{t:'\u4EA4\u6362',k:'swap'},{t:'\u5168\u90E8',k:'all'}];
  for(var p=0;p<2;p++){(function(pi){var r=document.createElement('div');r.className='wd-cr';var lb=document.createElement('label');lb.textContent='P'+(pi+1);r.appendChild(lb);for(var j=0;j<its.length;j++){(function(itm,tt){if(itm==='all')r.appendChild(aB(r,tt,function(){cAllItems(pi)}));else r.appendChild(aB(r,tt,function(){cGI(pi,itm)}))})(its[j].k,its[j].t)}s2.appendChild(r)})(p)}CB.appendChild(s2);
  // Quick
  var s3=aS('\u5FEB\u6377');
  var r3=document.createElement('div');r3.className='wd-cr';
  aB(r3,'\u63ED\u793A',cRV);aB(r3,'\u4E0B\u56DE\u5408',cSK);aB(r3,'\u5168\u4F53\u6EE1\u8840',cFH,'gud');aB(r3,'\u5F53\u524D\u80DC\u5229',cWN,'dng');s3.appendChild(r3);CB.appendChild(s3);
  // Close
  var cl=document.createElement('button');cl.className='wd-ccl';cl.textContent='\u5173\u95ED';cl.onclick=function(){CP.classList.remove('on')};CB.appendChild(cl);
  CP.appendChild(CB);document.body.appendChild(CP);setTimeout(rP,100)}

function tCP(){if(U()){mkP();return}var pw=prompt('\u8BF7\u8F93\u5165\u5BC6\u7801:');if(pw===PW){U(true);T('\u5DF2\u89E3\u9501');mkP()}else if(pw!==null)T('\u5BC6\u7801\u9519\u8BEF')}

function bUI(){
  var ui=document.createElement('div');ui.className='wd-ui';ui.id='wdUI';
  function aB2(t,tt,fn){var b=document.createElement('button');b.className='wd-btn';b.textContent=t;b.title=tt;b.onclick=fn;ui.appendChild(b);return b}
  aB2('\u5B58\u6863','\u4FDD\u5B58\u8FDB\u5EA6',sG);aB2('\u8BFB\u6863','\u8BFB\u53D6\u5B58\u6863',lG);aB2('\u5220\u9664','\u5220\u9664\u5B58\u6863',dS);aB2('\u5916\u6302','\u5BC6\u7801\u767D\u6C81',tCP);
  var tag=document.createElement('span');tag.style.cssText='font-size:.6em;color:#4c4;display:'+(U()?'inline':'none');tag.textContent='\u2713';ui.appendChild(tag);
  var info=document.createElement('div');info.className='wd-info';info.id='wdSI';document.body.appendChild(ui);document.body.appendChild(info);uSI()
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',function(){setTimeout(bUI,500)});else setTimeout(bUI,500);setInterval(uSI,10000);

})();
