/**
 * 西部对决 · 150成就严判系统
 * 数据校验+防篡改+全自动追踪
 */
(function(){

// ====== CSS ======
var css=document.createElement('style');
css.textContent=[
'.wa-ui{position:fixed;bottom:12px;right:12px;z-index:9999;display:flex;gap:6px;opacity:0.45;transition:opacity .3s}',
'.wa-ui:hover{opacity:1}',
'.wa-btn{background:rgba(30,15,10,.85);border:1px solid #6b3a2a;border-radius:8px;padding:5px 10px;color:#c0a090;font-size:.7em;cursor:pointer;font-family:inherit}',
'.wa-btn:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}',
'.wa-tst{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.92);color:#fc3;padding:16px 28px;border-radius:14px;z-index:99999;border:2px solid #fc3;text-align:center;pointer-events:none;animation:waF 2.5s forwards;font-size:.9em;min-width:200px}',
'.wa-tst .wi{font-size:2em;display:block}.wa-tst .wn{font-weight:bold;color:#fff}.wa-tst .wd{color:#c0a090;font-size:.75em;margin-top:2px}',
'@keyframes waF{0%{opacity:0;transform:translate(-50%,-50%) scale(.8)}15%{opacity:1}75%{opacity:1}100%{opacity:0}}',
'.wa-panel{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.82);z-index:99998;align-items:center;justify-content:center}',
'.wa-panel.on{display:flex}',
'.wa-box{background:linear-gradient(135deg,#1e0e0a,#2a1510);border:2px solid #8b4513;border-radius:20px;padding:20px 24px;max-width:560px;width:92%;max-height:85vh;overflow-y:auto}',
'.wa-box .h2{font-size:1.2em;color:#ff6b35;text-align:center;font-weight:bold}.wa-box .st{font-size:.68em;color:#6a5540;text-align:center;margin-bottom:10px}',
'.wa-tabs{display:flex;gap:4px;justify-content:center;margin-bottom:10px;flex-wrap:wrap}',
'.wa-tab{padding:4px 14px;border-radius:12px;border:1px solid rgba(139,69,19,.4);background:rgba(30,15,10,.5);color:#a08070;cursor:pointer;font-size:.7em;font-family:inherit}',
'.wa-tab.on{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#ff6b35}',
'.wa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(110px,1fr));gap:6px;margin-bottom:10px}',
'.wa-ac{background:rgba(30,15,10,.5);border:1px solid rgba(139,69,19,.2);border-radius:8px;padding:6px 6px;text-align:center;opacity:.3;filter:grayscale(1);cursor:pointer;transition:.2s;position:relative}',
'.wa-ac:hover{border-color:var(--ac-clr,#c8943a)}',
'.wa-ac.un{opacity:1;filter:none;border-color:var(--ac-clr,#c8943a)}',
'.wa-ac .ai{font-size:1.1em;display:block}.wa-ac .an{font-size:.62em;color:#e0d8d0;font-weight:bold;margin-top:1px;line-height:1.2}',
'.wa-ac .at{font-size:.45em;color:#5a4a30;position:absolute;bottom:1px;right:3px}',
'.wa-ac.un .at{color:#8a7a50}',
'.wa-tier{position:absolute;top:1px;right:3px;font-size:.45em;color:var(--ac-clr,#8a7a50)}',
'.wa-stats{font-size:.72em;color:#c0a090;line-height:1.7;text-align:center}',
'.wa-stats .sn{color:#ff6b35;font-weight:bold}',
'.wa-det{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:99999;align-items:center;justify-content:center}',
'.wa-det.on{display:flex}',
'.wa-db{background:linear-gradient(135deg,#2a1510,#1a0a08);border:2px solid var(--ac-clr,#c8943a);border-radius:16px;padding:20px 24px;max-width:340px;width:85%;text-align:center}',
'.wa-db .di{font-size:2.2em;display:block}.wa-db .dn{font-size:1.1em;color:#ff6b35;font-weight:bold}.wa-db .dd{font-size:.78em;color:#c0a090;margin:6px 0;line-height:1.5}',
'.wa-db .dt{font-size:.65em;color:#6a5540}.wa-db .ds{font-size:.65em;color:#4c6;margin-top:4px;display:none}.wa-db .ds.on{display:block}',
'.wa-db .dc{font-size:.55em;color:#5a4030;margin-top:6px}',
'.wa-db button{background:rgba(255,107,53,.1);border:1px solid #6b3a2a;border-radius:8px;padding:6px 20px;color:#a08070;cursor:pointer;margin-top:10px;font-family:inherit;font-size:.75em}',
'.wa-db button:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}'
].join('\n');
document.head.appendChild(css);

// ====== DATA ======
var CK='wd_ach_v4', TK='wd_ach_v4_t';
var _S={fb:0,ms:0,cr:0,sk:0,ht:0,sh:0,pl:0,wi:0,lo:0,du:0,rv:0};
var _UT={};
var _GS={last:{}};
var _chk=0; // checksum

// Tier colors
var TC={1:'#b08840',2:'#c0c0c0',3:'#ff6b35',4:'#d8f',5:'#f44',H:'#8cf'};

// 150 achievements - generated from patterns + specials
var TIERS=['I','II','III','IV','V','VI','VII','VIII','IX','X'];
var CATS=['战斗','生涯','挑战','道具','联机','收集'];

function genAch(){
  var a=[],id=0;
  function add(o){o.i=++id;a.push(o);}
  // === 战斗 (30) ===
  var bt=['sh','ms','cr','sk','ht','du'];
  var bn={sh:'开枪',ms:'空枪',cr:'暴击',sk:'跳过',ht:'被击中',du:'决斗'};
  var bi={sh:'🔫',ms:'💨',cr:'💥',sk:'🏃',ht:'💪',du:'⚔️'};
  var th={sh:[10,25,50,100,200,500],ms:[5,15,30,60,100,200],cr:[3,8,15,25,50,100],sk:[5,15,30,50,100,200],ht:[5,15,30,50,100,200],du:[3,10,25,50,100]};
  bt.forEach(function(t){
    (th[t]||[]).forEach(function(n,ti){
      var tr=Math.min(ti+1,5);
      add({id:t+n,n:bn[t]+' '+TIERS[ti],d:'累计'+bn[t]+n+'次',ic:bi[t],c:'战斗',ch:function(s,k){return s[k]>=n},kv:t,thr:n,ti:tr});
    });
  });
  // 额外战斗成就
  add({id:'fb',n:'第一滴血',d:'第一次击中对手',ic:'💧',c:'战斗',ch:function(s){return s.fb>=1},ti:1});
  add({id:'ht1n',n:'无伤之躯',d:'一局内未被击中获胜',ic:'✨',c:'挑战',ch:function(s){return s.ht1n},ti:3});
  add({id:'ms0w',n:'百发百中',d:'一局内0空枪获胜',ic:'🎯',c:'挑战',ch:function(s){return s.ms0w},ti:3});
  add({id:'cb',n:'绝地翻盘',d:'1HP反杀获胜',ic:'🔥',c:'挑战',ch:function(s){return s.cb},ti:4});
  add({id:'rw',n:'速战速决',d:'3回合内获胜',ic:'⚡',c:'挑战',ch:function(s){return s.rw},ti:4});
  add({id:'lg',n:'持久战',d:'一局超过15回合',ic:'🦥',c:'挑战',ch:function(s){return s.lg},ti:2});
  add({id:'bt3',n:'三角局',d:'一局内双方都只剩1HP',ic:'⚡',c:'挑战',ch:function(s){return s.bt3},ti:5});
  add({id:'nhw',n:'完美胜利',d:'满血获胜',ic:'👑',c:'挑战',ch:function(s){return s.nhw},ti:4});
  // === 生涯 (25) ===
  var care=['pl','wi','lo'];
  var caren={pl:'总局数',wi:'胜场',lo:'负场'};
  var carei={pl:'🎮',wi:'🏆',lo:'💧'};
  var careth={pl:[10,25,50,100,200,500],wi:[5,15,30,60,100,300],lo:[5,15,30,60,100]};
  care.forEach(function(t){
    (careth[t]||[]).forEach(function(n,ti){
      add({id:t+n,n:caren[t]+' '+TIERS[ti],d:'累计'+caren[t]+n,ic:carei[t],c:'生涯',ch:function(s,k){return s[k]>=n},kv:t,thr:n,ti:Math.min(ti+1,5)});
    });
  });
  add({id:'wr60',n:'常胜将军',d:'胜率≥60%且总局数≥20',ic:'🏅',c:'生涯',ch:function(s){return s.pl>=20&&s.wi/s.pl>=0.6},ti:3});
  add({id:'wr75',n:'不败传说',d:'胜率≥75%且总局数≥50',ic:'👑',c:'生涯',ch:function(s){return s.pl>=50&&s.wi/s.pl>=0.75},ti:5});
  add({id:'st3',n:'三连胜',d:'连胜3局',ic:'🔥',c:'生涯',ch:function(s){return s.st3},ti:2});
  add({id:'st5',n:'五连胜',d:'连胜5局',ic:'⚡',c:'生涯',ch:function(s){return s.st5},ti:4});
  add({id:'st10',n:'十连胜不败',d:'连胜10局',ic:'🌟',c:'生涯',ch:function(s){return s.st10},ti:5});
  // === 道具 (25) ===
  var its=['watch','book','check','wash','medkit','armor','rapid','freeze','swap','flag'];
  var itn={watch:'怀表',book:'书',check:'查看',wash:'洗枪',medkit:'急救',armor:'防弹',rapid:'连射',freeze:'冰冻',swap:'交换',flag:'旗帜'};
  var iti={watch:'⏱',book:'📖',check:'🔍',wash:'🔄',medkit:'💉',armor:'🛡',rapid:'🔫',freeze:'❄',swap:'🌪',flag:'🏴'};
  its.forEach(function(t){
    [5,15,30,50,100].forEach(function(n,ti){
      add({id:t+n,n:itn[t]+' '+TIERS[ti],d:'使用'+itn[t]+n+'次',ic:iti[t],c:'道具',ch:function(s,k){return (s[k]||0)>=n},kv:t,thr:n,ti:Math.min(ti+1,4)});
    });
  });
  add({id:'ai',n:'军火库',d:'一局内用遍10种道具',ic:'🧰',c:'挑战',ch:function(s){return s.ai},ti:5});
  // === 联机 (20) ===
  add({id:'p2p1',n:'初次联机',d:'完成一局联机对战',ic:'🌐',c:'联机',ch:function(s){return s.p2p>=1},ti:1});
  add({id:'p2p10',n:'网络常客',d:'完成10局联机',ic:'🌐',c:'联机',ch:function(s){return s.p2p>=10},ti:2});
  add({id:'p2p50',n:'联机达人',d:'完成50局联机',ic:'🌐',c:'联机',ch:function(s){return s.p2p>=50},ti:4});
  add({id:'p2pw5',n:'客场杀手',d:'联机获胜5局',ic:'🏆',c:'联机',ch:function(s){return s.p2pw>=5},ti:2});
  add({id:'p2pw20',n:'全网制霸',d:'联机获胜20局',ic:'👑',c:'联机',ch:function(s){return s.p2pw>=20},ti:4});
  add({id:'fr1',n:'社交达狐',d:'添加1位好友',ic:'👥',c:'联机',ch:function(s){return s.fr>=1},ti:1});
  add({id:'fr5',n:'狐朋满座',d:'添加5位好友',ic:'👥',c:'联机',ch:function(s){return s.fr>=5},ti:3});
  add({id:'chat50',n:'话痨',d:'发送50条聊天消息',ic:'💬',c:'联机',ch:function(s){return s.chat>=50},ti:2});
  add({id:'chat200',n:'灌水大师',d:'发送200条聊天消息',ic:'💬',c:'联机',ch:function(s){return s.chat>=200},ti:4});
  add({id:'match1',n:'天降对手',d:'通过随机匹配完成一局',ic:'🎲',c:'联机',ch:function(s){return s.match>=1},ti:2});
  add({id:'spec1',n:'吃瓜群众',d:'观战一局',ic:'👁️',c:'联机',ch:function(s){return s.spec>=1},ti:1});
  // === 人机 (15) ===
  add({id:'aie1',n:'初识AI',d:'与人机对战一局',ic:'🤖',c:'人机',ch:function(s){return s.aipl>=1},ti:1});
  add({id:'aie20',n:'AI训练师',d:'与人机对战20局',ic:'🤖',c:'人机',ch:function(s){return s.aipl>=20},ti:3});
  add({id:'aiw5',n:'机性恋',d:'人机获胜5局',ic:'🏆',c:'人机',ch:function(s){return s.aiw>=5},ti:2});
  add({id:'aih1',n:'地狱挑战',d:'困难AI获胜一局',ic:'💀',c:'人机',ch:function(s){return s.aih>=1},ti:4});
  add({id:'aih10',n:'AI终结者',d:'困难AI获胜10局',ic:'☠️',c:'人机',ch:function(s){return s.aih>=10},ti:5});
  // === 收集 (15) ===
  [10,25,50,75,100,125,150].forEach(function(n,ti){
    add({id:'ac'+n,n:'收集者 '+TIERS[ti],d:'解锁'+n+'个成就',ic:'📦',c:'收集',ch:function(s){var c=0;for(var k in s)if(s[k]>=1&&k!=='ac10'&&k!=='ac25'&&k!=='ac50'&&k!=='ac75'&&k!=='ac100'&&k!=='ac125'&&k!=='ac150'&&k!=='chk')c++;return c>=n},ti:Math.min(ti+1,5)});
  });
  // === 隐藏 (20) ===
  add({id:'ez1',n:'开发者彩蛋',d:'发现一个隐藏彩蛋',ic:'🥚',c:'隐藏',ch:function(s){return s.ez1},ti:3});
  add({id:'ez2',n:'???',d:'这个成就还不存在',ic:'❓',c:'隐藏',ch:function(s){return s.ez2},ti:1});
  add({id:'ez3',n:'测试员',d:'在调试面板输入口令',ic:'🐛',c:'隐藏',ch:function(s){return s.ez3},ti:2});
  add({id:'cat',n:'潥鸢的猫',d:'查看潥鸢的猫猫ASCII',ic:'🐱',c:'隐藏',ch:function(s){return s.cat},ti:2});
  add({id:'die1',n:'第一次死亡',d:'第一次被击败',ic:'💀',c:'隐藏',ch:function(s){return s.die>=1},ti:1});
  add({id:'die50',n:'死不瞑目',d:'被击败50次',ic:'☠️',c:'隐藏',ch:function(s){return s.die>=50},ti:4});
  add({id:'night',n:'夜行狐',d:'在凌晨0-5点进行一局游戏',ic:'🌙',c:'隐藏',ch:function(s){return s.night},ti:2});
  add({id:'ss',n:'六发全空',d:'一局内连续空枪6次',ic:'💨',c:'隐藏',ch:function(s){return s.ss},ti:4});
  add({id:'cert',n:'持证上岗',d:'生成一张鸣谢证书',ic:'📜',c:'隐藏',ch:function(s){return s.cert},ti:2});
  add({id:'nore',n:'绝不跳过',d:'连续5局不跳过',ic:'🚫',c:'隐藏',ch:function(s){return s.nore},ti:3});
  add({id:'aoyi',n:'嗷伊大话唠',d:'联机对局发送2次"嗷伊大话唠"',ic:'📢',c:'隐藏',ch:function(s){return s.aoyi},ti:3});
  return a;
}
var ACH=genAch();

// ====== STATS ======
var ST={
  // tracked automatically
  fb:0,ms:0,cr:0,sk:0,ht:0,sh:0,pl:0,wi:0,lo:0,du:0,rv:0,
  // item usage
  watch:0,book:0,check:0,wash:0,medkit:0,armor:0,rapid:0,freeze:0,swap:0,flag:0,
  // p2p
  p2p:0,p2pw:0,fr:0,chat:0,match:0,spec:0,
  // ai
  aipl:0,aiw:0,aih:0,
  // hidden
  ez1:0,ez2:0,ez3:0,cat:0,die:0,night:0,ss:0,cert:0,nore:0,aoyi:0,
  // per-game challenge
  ht1n:0,ms0w:0,cb:0,rw:0,lg:0,bt3:0,nhw:0,ai:0,st3:0,st5:0,st10:0
};

function calcChk(){
  var s=0;
  for(var k in ST)if(typeof ST[k]==='number')s+=ST[k]*k.length;
  return s;
}
function validate(){
  var c=calcChk();
  if(_chk!==0&&_chk!==c){
    // Data tampered - reset suspicious values
    for(var k in ST)if(ST[k]!==_S[k])ST[k]=Math.min(ST[k],_S[k]+5);
    _S=JSON.parse(JSON.stringify(ST));
    _chk=c;save();
    return false;
  }
  return true;
}

function load(){
  try{
    var d=JSON.parse(localStorage.getItem(CK));
    if(d&&d.v){
      for(var k in d.s)if(k in ST)ST[k]=d.s[k];
      _chk=d.c||0;
    }
  }catch(e){}
  try{_UT=JSON.parse(localStorage.getItem(TK))||{}}catch(e){_UT={}}
  try{var g=JSON.parse(localStorage.getItem(CK+'_g'));if(g)_GS=g}catch(e){}
}
function save(){
  var s={};
  for(var k in ST)s[k]=ST[k];
  localStorage.setItem(CK,JSON.stringify({v:2,s:s,c:calcChk()}));
}
function saveGS(){try{localStorage.setItem(CK+'_g',JSON.stringify(_GS))}catch(e){}}

load();

var _curMs=0,_curSh=0,_curHit=0,_usedItems={},_streak=0,_noSkipStreak=0,_isP2P=false,_isAI=false,_aiDiff='';
var _detAch=null,_curTab='all';

var _toastTimer=null;
function T(m){
  // Prevent multiple overlapping toasts
  if(_toastTimer){clearTimeout(_toastTimer);var old=document.querySelector('.wa-tst');if(old)old.remove()}
  var e=document.createElement('div');e.className='wa-tst';e.innerHTML=m;document.body.appendChild(e);
  _toastTimer=setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e);_toastTimer=null},2600);
}
function sUT(id){if(!_UT[id]){_UT[id]=Date.now();try{localStorage.setItem(TK,JSON.stringify(_UT))}catch(e){}}}

function checkAll(){
  validate();
  ACH.forEach(function(a){
    if(!ST[a.id]&&a.ch(ST,a.kv||a.id)){
      ST[a.id]=1;
      sUT(a.id);
      save();
      T('<span class="wi">'+a.ic+'</span><span class="wn">成就解锁: '+a.n+'</span><span class="wd">'+a.d+'</span>');
    }
  });
}

function fmtDate(ts){
  var d=new Date(ts);
  return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' '+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();
}

function showDet(a){
  _detAch=a;var p=$('waDet');
  if(!p){p=document.createElement('div');p.className='wa-det';p.id='waDet';
    var b=document.createElement('div');b.className='wa-db';b.id='waDb';
    p.appendChild(b);document.body.appendChild(p);}
  var b=$('waDb'),un=ST[a.id];
  var tc=TC[a.ti]||'#c8943a';
  b.style.borderColor=tc;
  b.innerHTML='<span class="di">'+a.ic+'</span><div class="dn">'+a.n+'</div><div class="dd">'+a.d+'</div>'+
    '<div class="dt">'+a.c+(a.ti?' · '+(['铜','银','金','铂金','钻石','隐藏'][a.ti-1]||'')+'级':'')+'</div>'+
    '<div class="ds'+(un?' on':'')+'">达成: '+(un&&_UT[a.id]?fmtDate(_UT[a.id]):'未解锁')+'</div>'+
    '<button onclick="$(\'waDet\').classList.remove(\'on\')">关闭</button>';
  p.classList.add('on');
}

function $ (id){return document.getElementById(id)}

function showPanel(tab){
  _curTab=tab||'all';
  var p=$('waPanel');
  if(!p){
    p=document.createElement('div');p.className='wa-panel';p.id='waPanel';
    var b=document.createElement('div');b.className='wa-box';b.id='waBox';
    b.innerHTML='<div class="h2">🏆 成就</div><div class="st" id="waSt">加载中...</div>';
    var t=document.createElement('div');t.className='wa-tabs';t.id='waTabs';b.appendChild(t);
    var g=document.createElement('div');g.className='wa-grid';g.id='waGrid';b.appendChild(g);
    var s=document.createElement('div');s.className='wa-stats';s.id='waStats';b.appendChild(s);
    var cl=document.createElement('button');cl.className='wa-btn';cl.textContent='关闭';
    cl.style.cssText='display:block;margin:10px auto 0;font-size:.75em';
    cl.onclick=function(){p.classList.remove('on')};
    b.appendChild(cl);p.appendChild(b);document.body.appendChild(p);
  }
  p.classList.add('on');

  // Tabs
  var tabs=$('waTabs');tabs.innerHTML='';
  ['all','战斗','生涯','挑战','道具','联机','人机','收集','隐藏'].forEach(function(t){
    var tb=document.createElement('button');tb.className='wa-tab'+(t===_curTab?' on':'');tb.textContent=t==='all'?'全部':t;
    tb.onclick=function(){showPanel(t)};tabs.appendChild(tb);
  });

  var grid=$('waGrid');grid.innerHTML='';
  var tot=0,unc=0;
  ACH.forEach(function(a){
    if(_curTab!=='all'&&a.c!==_curTab)return;
    tot++;if(ST[a.id])unc++;
    var d=document.createElement('div');d.className='wa-ac'+(ST[a.id]?' un':'');
    var tc=TC[a.ti]||'#c8943a';
    d.style.setProperty('--ac-clr',tc);
    d.innerHTML='<span class="ai">'+a.ic+'</span><span class="an">'+a.n+'</span>'+
      (ST[a.id]&&_UT[a.id]?'<span class="at">'+fmtDate(_UT[a.id]).slice(5,11)+'</span>':'')+
      '<span class="wa-tier">'+(['铜','银','金','铂','钻','???'][a.ti-1]||'')+'</span>';
    d.onclick=function(){showDet(a)};grid.appendChild(d);
  });

  var lg=_GS.last||{};
  var wr=ST.pl>0?Math.round(ST.wi/ST.pl*100):0;
  var hr=ST.sh>0?Math.round((ST.sh-ST.ms)/ST.sh*100):0;
  $('waStats').innerHTML=
    '<span class="sn">'+ST.wi+'</span>胜/<span class="sn">'+ST.lo+'</span>负 · '+ST.pl+'局 · 胜率<span class="sn">'+wr+'%</span><br>'+
    '开枪<span class="sn">'+ST.sh+'</span> · 命中<span class="sn">'+(ST.sh-ST.ms)+'</span> · 命中率<span class="sn">'+hr+'%</span><br>'+
    '空枪<span class="sn">'+ST.ms+'</span> · 暴击<span class="sn">'+ST.cr+'</span> · 跳过<span class="sn">'+ST.sk+'</span> · 道具<span class="sn">'+
    (ST.watch+ST.book+ST.check+ST.wash+ST.medkit+ST.armor+ST.rapid+ST.freeze+ST.swap+ST.flag)+'</span>'+
    (lg.rd?'<br>📋上局: '+lg.winner+'('+lg.rd+'回合)':'');
  $('waSt').textContent=unc+'/'+tot+' 已解锁 · 总计'+ACH.length+'成就';
}

// ====== HOOK ======
function hook(){
  if(typeof G==='undefined'||!G)return;
  var og=window.addL;
  if(!og||og.__ach)return;
  window.addL=function(m,c){
    og(m,c);
    try{
      if(typeof G==='undefined'||!G.phase||G.phase==='setup')return;
      ST.sh++;
      if(c==='da'&&(m.indexOf('击中')>=0||m.indexOf('砰')>=0)){_curHit++;if(!ST.fb){ST.fb=1;sUT('fb');save()}}
      if(c==='cr'){ST.cr++}
      if(m.indexOf('空枪')>=0||m.indexOf('松了一口气')>=0){ST.ms++;_curMs++}
      if(m.indexOf('跳过')>=0&&m.indexOf('挡')<0){ST.sk++;_noSkipStreak=0}
      if(m.indexOf('击中')>=0&&m.indexOf('回合')<0&&c==='da'){ST.ht++}
      if(c==='du'){ST.du++}
      // Items
      if(m.indexOf('用了反转怀表')>=0){ST.watch++;_usedItems.watch=1}
      if(m.indexOf('激活了我没死之书')>=0){_usedItems.book=1}
      if(m.indexOf('查看子弹')>=0){_usedItems.check=1}
      if(m.indexOf('系统已转枪')>=0){ST.wash++;_usedItems.wash=1}
      if(m.indexOf('使用急救包')>=0){ST.medkit++;_usedItems.medkit=1}
      if(m.indexOf('穿上防弹衣')>=0){ST.armor++;_usedItems.armor=1}
      if(m.indexOf('装填连射')>=0){ST.rapid++;_usedItems.rapid=1}
      if(m.indexOf('冰冻')>=0&&m.indexOf('使用')>=0){ST.freeze++;_usedItems.freeze=1}
      if(m.indexOf('交换了HP')>=0){ST.swap++;_usedItems.swap=1}
      if(m.indexOf('公会旗帜')>=0&&m.indexOf('激活')>=0){ST.flag++;_usedItems.flag=1}

      // Hidden: night game
      var h=new Date().getHours();
      if(h>=0&&h<5&&!ST.night){ST.night=1;sUT('night');save()}
      // Hidden: consecutive blanks
      if(m.indexOf('空枪')>=0)_ssc=(_ssc||0)+1;else _ssc=0;
      if(_ssc>=6&&!ST.ss){ST.ss=1;sUT('ss');save()}

      checkAll();save();
    }catch(e){}
  };
  window.addL.__ach=true;

  // P2P / AI detection
  _isP2P=G.mode==='p2p';
  _isAI=G.mode==='ai';
  _aiDiff=G.aiDiff||'';
  _noSkipStreak=0;

  var gg=window.gameOver;
  if(gg&&!gg.__ach){
    window.gameOver=function(wi){
      gg(wi);
      try{
        ST.pl++;
        if(wi===0||wi===1){
          ST.wi++;_streak++;
          if(_isP2P)ST.p2pw++;
          if(_isAI){ST.aiw++;if(_aiDiff==='hard')ST.aih++}
        }else{ST.lo++;ST.die++;_streak=0}
        // Streaks
        if(_streak>=3&&!ST.st3){ST.st3=1;sUT('st3')}
        if(_streak>=5&&!ST.st5){ST.st5=1;sUT('st5')}
        if(_streak>=10&&!ST.st10){ST.st10=1;sUT('st10')}
        // No skip streak
        if(!G.s.noSk&&_noSkipStreak>=5&&!ST.nore){ST.nore=1;sUT('nore')}
        // P2P stats
        if(_isP2P)ST.p2p++;
        // AI stats
        if(_isAI)ST.aipl++;
        // Match detection
        if(_isP2P&&G.matched)ST.match++;

        // Per-game challenges
        if(G.p[wi]&&G.p[wi].hp===1&&!ST.cb){ST.cb=1;sUT('cb')}
        if(_curMs===0&&!ST.ms0w){ST.ms0w=1;sUT('ms0w')}
        if(_curHit===0&&!ST.ht1n){ST.ht1n=1;sUT('ht1n')}
        if(G.rd<=3&&!ST.rw){ST.rw=1;sUT('rw')}
        if(G.rd>=15&&!ST.lg){ST.lg=1;sUT('lg')}
        // Both 1HP
        if(G.p[0]&&G.p[1]&&G.p[0].hp===1&&G.p[1].hp===1&&!ST.bt3){ST.bt3=1;sUT('bt3')}
        // Full HP win
        if(G.p[wi]&&G.p[wi].hp===G.p[wi].mx&&!ST.nhw){ST.nhw=1;sUT('nhw')}
        // All items
        var its=['watch','book','check','wash','medkit','armor','rapid','freeze','swap','flag'];
        if(its.every(function(it){return _usedItems[it]})&&!ST.ai){ST.ai=1;sUT('ai')}

        _GS.last={winner:G.p[wi]?G.p[wi].n:'?',rd:G.rd};
        saveGS();
        _curMs=0;_curSh=0;_curHit=0;_usedItems={};
        checkAll();save();
      }catch(e){}
    };
    window.gameOver.__ach=true;
  }
}

// Expose for external calls (chat count, friend count, etc)
window.achiev = {
  addChat: function(){ST.chat++;checkAll();save()},
  addFriend: function(){ST.fr++;checkAll();save()},
  addSpec: function(){ST.spec++;checkAll();save()},
  addCert: function(){ST.cert=1;sUT('cert');checkAll();save()},
  addEz: function(id){ST[id]=1;sUT(id);checkAll();save()},
  addCat: function(){ST.cat=1;sUT('cat');checkAll();save()}
};

var hi=setInterval(function(){if(typeof G!=='undefined'&&G){hook();clearInterval(hi)}},500);
setInterval(function(){
  if(typeof G!=='undefined'&&G&&G.phase!=='setup'){checkAll();save()}
  // Check for external triggers (certificate, etc)
  try{
    if(localStorage.getItem('wd_cert_done')==='1'&&!ST.cert){
      ST.cert=1;sUT('cert');save();checkAll();
      localStorage.removeItem('wd_cert_done');
      T('<span class="wi">📜</span><span class="wn">成就解锁: 持证上岗</span><span class="wd">生成一张鸣谢证书</span>');
    }
  }catch(e){}
},5000);

setTimeout(function(){
  var ui=document.createElement('div');ui.className='wa-ui';
  var bt=document.createElement('button');bt.className='wa-btn';bt.textContent='🏆成就';
  bt.onclick=function(){showPanel('all')};ui.appendChild(bt);
  document.body.appendChild(ui);
},800);

})();
