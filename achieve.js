/**
 * 西部对决 · 成就+战绩+挑战系统
 * 用法：在 roulette.html 的 </body> 前加 <script src="achieve.js"></script>
 */
(function(){

var css=document.createElement('style');
css.textContent=[
'.wa-ui{position:fixed;bottom:12px;right:12px;z-index:9999;display:flex;gap:6px;opacity:0.5;transition:opacity .3s}',
'.wa-ui:hover{opacity:1}',
'.wa-btn{background:rgba(30,15,10,.85);border:1px solid #6b3a2a;border-radius:8px;padding:5px 10px;color:#c0a090;font-size:.7em;cursor:pointer;font-family:inherit}',
'.wa-btn:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}',
'.wa-tst{position:fixed;top:40%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.92);color:#fc3;padding:16px 28px;border-radius:14px;z-index:99999;border:2px solid #fc3;text-align:center;pointer-events:none;animation:waF 2.5s forwards;font-size:.9em;min-width:200px}',
'.wa-tst .wi{font-size:2em;display:block;margin-bottom:4px}.wa-tst .wn{font-weight:bold;color:#fff;font-size:1em}.wa-tst .wd{color:#c0a090;font-size:.75em;margin-top:2px}',
'@keyframes waF{0%{opacity:0;transform:translate(-50%,-50%) scale(.8)}15%{opacity:1}75%{opacity:1}100%{opacity:0}}',
'.wa-panel{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.82);z-index:99998;align-items:center;justify-content:center}',
'.wa-panel.on{display:flex}',
'.wa-box{background:linear-gradient(135deg,#1e0e0a,#2a1510);border:2px solid #8b4513;border-radius:20px;padding:24px 28px;max-width:500px;width:92%;max-height:85vh;overflow-y:auto}',
'.wa-box h2{font-size:1.3em;color:#ff6b35;text-align:center;margin:0 0 2px 0}.wa-box .st{font-size:.7em;color:#6a5540;text-align:center;margin-bottom:12px}',
'.wa-tabs{display:flex;gap:6px;justify-content:center;margin-bottom:14px}',
'.wa-tab{padding:4px 16px;border-radius:12px;border:1px solid rgba(139,69,19,.4);background:rgba(30,15,10,.5);color:#a08070;cursor:pointer;font-size:.75em;font-family:inherit}',
'.wa-tab.on{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#ff6b35}',
'.wa-acg{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px}',
'.wa-ac{background:rgba(30,15,10,.5);border:1px solid rgba(139,69,19,.3);border-radius:10px;padding:8px 10px;text-align:center;opacity:.35;filter:grayscale(1);cursor:pointer;transition:.2s;position:relative}',
'.wa-ac:hover{border-color:#fc3}',
'.wa-ac.unlocked{opacity:1;filter:none;border-color:#fc3}',
'.wa-ac .ai{font-size:1.3em;display:block}.wa-ac .an{font-size:.72em;color:#f0e6d3;font-weight:bold;margin-top:2px}.wa-ac .ad{font-size:.58em;color:#8a7a60;margin-top:1px}',
'.wa-ac .at{font-size:.5em;color:#5a4a30;position:absolute;bottom:3px;right:5px}',
'.wa-ac.unlocked .at{color:#8a7a50}',
'.wa-stats{font-size:.78em;color:#c0a090;line-height:1.8;text-align:center}',
'.wa-stats .sn{color:#ff6b35;font-weight:bold}',
'.wa-det{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.85);z-index:99999;align-items:center;justify-content:center}',
'.wa-det.on{display:flex}',
'.wa-db{background:linear-gradient(135deg,#2a1510,#1a0a08);border:2px solid #c8943a;border-radius:16px;padding:24px 28px;max-width:360px;width:85%;text-align:center}',
'.wa-db .di{font-size:2.5em;display:block;margin-bottom:4px}.wa-db .dn{font-size:1.2em;color:#ff6b35;font-weight:bold}.wa-db .dd{font-size:.82em;color:#c0a090;margin:6px 0;line-height:1.5}.wa-db .dt{font-size:.7em;color:#6a5540}.wa-db .ds{font-size:.7em;color:#4c6;margin-top:6px;display:none}.wa-db .ds.on{display:block}.wa-db button{background:rgba(255,107,53,.1);border:1px solid #6b3a2a;border-radius:8px;padding:6px 20px;color:#a08070;cursor:pointer;margin-top:12px;font-family:inherit;font-size:.8em}',
'.wa-db button:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}',
'.wa-close{display:block;margin:12px auto 0;background:rgba(255,107,53,.1);border:1px solid #6b3a2a;border-radius:8px;padding:7px 24px;color:#a08070;cursor:pointer;font-family:inherit;font-size:.8em}',
'.wa-close:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}'
].join('\n');
document.head.appendChild(css);

var AK='wd_ach3',SK='wd_ach3_st';

// Achievement list
var ACH=[
  {id:'first',name:'第一滴血',desc:'第一次击中对手',ico:'💧',cat:'战斗',check:function(s){return s.fb}},
  {id:'miss5',name:'空枪王',desc:'累计空枪5次',ico:'💨',cat:'战斗',check:function(s){return s.ms>=5}},
  {id:'miss15',name:'人体描边大师',desc:'累计空枪15次',ico:'🌪',cat:'战斗',check:function(s){return s.ms>=15}},
  {id:'crit3',name:'暴击大师',desc:'打出3次暴击',ico:'💥',cat:'战斗',check:function(s){return s.cr>=3}},
  {id:'crit10',name:'毁灭 Ripley',desc:'打出10次暴击',ico:'☄️',cat:'战斗',check:function(s){return s.cr>=10}},
  {id:'skip5',name:'跳过达人',desc:'跳过5次',ico:'🏃',cat:'战斗',check:function(s){return s.sk>=5}},
  {id:'skip15',name:'跑路冠军',desc:'跳过15次',ico:'🚀',cat:'战斗',check:function(s){return s.sk>=15}},
  {id:'hit10',name:'命硬',desc:'累计被击中10次',ico:'💪',cat:'战斗',check:function(s){return s.ht>=10}},
  {id:'hit30',name:'铁打的',desc:'累计被击中30次',ico:'🛡',cat:'战斗',check:function(s){return s.ht>=30}},
  {id:'shoot50',name:'西部快枪手',desc:'累计开枪50次',ico:'🔫',cat:'战斗',check:function(s){return s.sh>=50}},
  {id:'shoot200',name:'人形加特林',desc:'累计开枪200次',ico:'🖨',cat:'战斗',check:function(s){return s.sh>=200}},
  {id:'noMiss1',name:'百发百中',desc:'一局内0空枪获胜',ico:'🎯',cat:'挑战',check:function(s){return s.nm1}},
  {id:'noHit1',name:'无伤通关',desc:'一局内没被击中获胜',ico:'✨',cat:'挑战',check:function(s){return s.nh1}},
  {id:'cb1',name:'绝地翻盘',desc:'1HP反杀获胜',ico:'🔥',cat:'挑战',check:function(s){return s.cb}},
  {id:'flag5',name:'旗手',desc:'使用公会旗帜5次',ico:'🏴',cat:'道具',check:function(s){return s.fl>=5}},
  {id:'wash3',name:'赌徒',desc:'使用洗枪3次',ico:'🎲',cat:'道具',check:function(s){return s.wa>=3}},
  {id:'freeze3',name:'冰人',desc:'使用冰冻3次',ico:'❄️',cat:'道具',check:function(s){return s.fz>=3}},
  {id:'swap3',name:'等价交换',desc:'使用交换3次',ico:'🌪',cat:'道具',check:function(s){return s.sw>=3}},
  {id:'medkit5',name:'战地医生',desc:'使用急救包5次',ico:'💉',cat:'道具',check:function(s){return s.me>=5}},
  {id:'allItems',name:'军火库',desc:'一局内使用过全部10种道具',ico:'🧰',cat:'挑战',check:function(s){return s.ai}},
  {id:'watch5',name:'时间操纵者',desc:'使用反转怀表5次',ico:'⏱',cat:'道具',check:function(s){return s.wt>=5}},
  {id:'armor5',name:'堡垒',desc:'使用防弹衣5次',ico:'🛡️',cat:'道具',check:function(s){return s.ar>=5}},
  {id:'rapid5',name:'速射',desc:'使用连射5次',ico:'🔫',cat:'道具',check:function(s){return s.rp>=5}},
  {id:'duel3',name:'决斗者',desc:'发起3次生死决斗',ico:'⚔️',cat:'战斗',check:function(s){return s.du>=3}},
  {id:'win5',name:'常胜将军',desc:'赢得5局',ico:'🏆',cat:'生涯',check:function(s){return s.wi>=5}},
  {id:'win15',name:'西部传奇',desc:'赢得15局',ico:'👑',cat:'生涯',check:function(s){return s.wi>=15}},
  {id:'game20',name:'百战老兵',desc:'完成20局游戏',ico:'🎖',cat:'生涯',check:function(s){return s.pl>=20}},
  {id:'game50',name:'西部活化石',desc:'完成50局游戏',ico:'🗿',cat:'生涯',check:function(s){return s.pl>=50}},
  {id:'rapidWin',name:'速战速决',desc:'3回合内获胜',ico:'⚡',cat:'挑战',check:function(s){return s.rw}},
  {id:'longGame',name:'持久战',desc:'一局超过15回合',ico:'🦥',cat:'挑战',check:function(s){return s.lg}},
  {id:'allAch',name:'全成就',desc:'解锁所有其他成就',ico:'🌟',cat:'隐藏',check:function(s){
    var total=ACH.length-1,c=0;
    for(var i=0;i<total;i++)if(s[ACH[i].id])c++;
    return c>=total;
  }}
];
var S={fb:0,ms:0,cr:0,sk:0,ht:0,sh:0,pl:0,wi:0,cb:0,fl:0,wa:0,fz:0,sw:0,me:0,ai:0,wt:0,ar:0,rp:0,du:0,nm1:0,nh1:0,rw:0,lg:0};

// Unlock times
var UT={};
var curMs=0,curSh=0,curHit=0,usedItems={},detailAch=null;

function load(){try{var d=JSON.parse(localStorage.getItem(AK));for(var k in d)S[k]=d[k]}catch(e){}}
function save(){try{localStorage.setItem(AK,JSON.stringify(S))}catch(e){}}
function loadUT(){try{UT=JSON.parse(localStorage.getItem(AK+'_ut'))||{}}catch(e){UT={}}}
function saveUT(){try{localStorage.setItem(AK+'_ut',JSON.stringify(UT))}catch(e){}}
function loadGS(){try{var d=JSON.parse(localStorage.getItem(SK));for(var k in d)G2[k]=d[k]}catch(e){}}
function saveGS(){try{localStorage.setItem(SK,JSON.stringify(G2))}catch(e){}}

var G2={};
load();loadUT();loadGS();

var curTab='all',detOpen=false;

function T(m){var e=document.createElement('div');e.className='wa-tst';e.innerHTML=m;document.body.appendChild(e);setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e)},2600)}

function setUT(id){if(!UT[id]){UT[id]=Date.now();saveUT()}}

function checkAll(){
  ACH.forEach(function(a){
    if(!S[a.id]&&a.check(S)){
      S[a.id]=1;setUT(a.id);save();
      T('<span class="wi">'+a.ico+'</span><span class="wn">成就解锁: '+a.name+'</span><span class="wd">'+a.desc+'</span>');
    }
  });
}

function fmtDate(ts){
  var d=new Date(ts);
  return d.getFullYear()+'/'+(d.getMonth()+1)+'/'+d.getDate()+' '+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();
}

function showDet(aid){
  var a=null;for(var i=0;i<ACH.length;i++)if(ACH[i].id===aid){a=ACH[i];break}
  if(!a)return;
  detailAcl=a;detOpen=true;
  var p=$('waDet');
  if(!p){
    p=document.createElement('div');p.className='wa-det';p.id='waDet';
    var b=document.createElement('div');b.className='wa-db';b.id='waDb';
    p.appendChild(b);document.body.appendChild(p);
  }
  var b=$('waDb');
  b.innerHTML='<span class="di">'+a.ico+'</span><div class="dn">'+a.name+'</div><div class="dd">'+a.desc+'</div><div class="dt">分类: '+a.cat+'</div><div class="ds'+(S[a.id]?' on':'')+'" id="waDt">达成时间: '+(UT[a.id]?fmtDate(UT[a.id]):'未知')+'</div><button onclick="document.getElementById(\'waDet\').classList.remove(\'on\');detOpen=false">关闭</button>';
  p.classList.add('on');
}

function showPanel(tab){
  curTab=tab||'all';
  var p=$('waPanel');
  if(!p){
    p=document.createElement('div');p.className='wa-panel';p.id='waPanel';
    var b=document.createElement('div');b.className='wa-box';b.id='waBox';
    b.innerHTML='<h2>🏆 成就</h2><div class="st">'+S.aii+'/'+ACH.length+' 已解锁 · 点击查看详情</div>';
    var tabs=document.createElement('div');tabs.className='wa-tabs';tabs.id='waTabs';
    b.appendChild(tabs);
    var cg=document.createElement('div');cg.className='wa-acg';cg.id='waAch';
    b.appendChild(cg);
    var sd=document.createElement('div');sd.className='wa-stats';sd.id='waStats';
    b.appendChild(sd);
    var cl=document.createElement('button');cl.className='wa-close';cl.textContent='关闭';
    cl.onclick=function(){p.classList.remove('on')};
    b.appendChild(cl);
    p.appendChild(b);document.body.appendChild(p);
  }
  p.classList.add('on');

  // Tabs
  var tabs=$('waTabs');
  tabs.innerHTML='';
  ['all','战斗','挑战','道具','生涯','隐藏'].forEach(function(t){
    var tb=document.createElement('button');tb.className='wa-tab'+(t===curTab?' on':'');tb.textContent=t==='all'?'全部':t;
    tb.onclick=function(){showPanel(t)};
    tabs.appendChild(tb);
  });

  // Achievements
  var cg=$('waAch');cg.innerHTML='';
  var cnt=0,ucnt=0;
  ACH.forEach(function(a){
    if(curTab!=='all'&&a.cat!==curTab)return;
    cnt++;
    if(S[a.id])ucnt++;
    var d=document.createElement('div');d.className='wa-ac'+(S[a.id]?' unlocked':'');
    d.innerHTML='<span class="ai">'+a.ico+'</span><span class="an">'+a.name+'</span><span class="ad">'+a.desc+'</span>'+ (UT[a.id]?'<span class="at">'+fmtDate(UT[a.id]).slice(5,11)+'</span>':'');
    d.onclick=function(){showDet(a.id)};
    cg.appendChild(d);
  });

  // Stats
  var sd=$('waStats');
  var lastG=G2.last||{};
  sd.innerHTML=
    '<span class="sn">'+S.wi+'</span> 胜 / <span class="sn">'+(S.pl-S.wi)+'</span> 负 · '+S.pl+' 局<br>'+
    '开枪: <span class="sn">'+S.sh+'</span> · 命中: ??? · 空枪: <span class="sn">'+S.ms+'</span> · 暴击: <span class="sn">'+S.cr+'</span><br>'+
    '跳过: <span class="sn">'+S.sk+'</span> · 被击中: <span class="sn">'+S.ht+'</span>'+
    (lastG.rd?'<br><br>上局: '+lastG.winner+' ('+lastG.rd+'回合)':'');
  
  S.aii=ucnt;save();
  $('waBox').querySelector('.st').textContent=ucnt+'/'+cnt+' 已解锁 · 点击查看详情';
}

function hook(){
  if(typeof G==='undefined'||!G)return;
  var og=window.addL;
  if(!og||og.__ach)return;
  window.addL=function(m,c){
    og(m,c);
    try{
      if(typeof G==='undefined'||!G.phase||G.phase==='setup')return;
      // Track shots
      S.sh++;
      // Track per-game
      curSh++;
      // Hit detection
      if(c==='da'&&(m.indexOf('砰!')>=0||m.indexOf('击中')>=0)){
        curHit++;
        if(!S.fb){S.fb=1;setUT('first');save()}
        checkAll();save();
      }
      if(c==='cr'){S.cr++;save();checkAll()}
      if(m.indexOf('空枪')>=0||m.indexOf('松了一口气')>=0){
        S.ms++;curMs++;save();checkAll()
      }
      if(m.indexOf('跳过')>=0&&m.indexOf('挡')<0){S.sk++;save();checkAll()}
      if(c==='da'&&(m.indexOf('HP')>=0||m.indexOf('失去')>=0)){S.ht++;save();checkAll()}
      // Item usage tracking
      if(m.indexOf('用了反转怀表')>=0){S.wt++;usedItems.watch=1;save();checkAll()}
      if(m.indexOf('激活了我没死之书')>=0){usedItems.book=1}
      if(m.indexOf('查看子弹')>=0){usedItems.check=1}
      if(m.indexOf('系统已转枪')>=0){S.wa++;usedItems.wash=1;save();checkAll()}
      if(m.indexOf('使用急救包')>=0){S.me++;usedItems.medkit=1;save();checkAll()}
      if(m.indexOf('穿上防弹衣')>=0){S.ar++;usedItems.armor=1;save();checkAll()}
      if(m.indexOf('装填连射')>=0){S.rp++;usedItems.rapid=1;save();checkAll()}
      if(m.indexOf('冰冻')>=0){S.fz++;usedItems.freeze=1;save();checkAll()}
      if(m.indexOf('交换了HP')>=0){S.sw++;usedItems.swap=1;save();checkAll()}
      if(m.indexOf('公会旗帜')>=0&&m.indexOf('激活')>=0){S.fl++;usedItems.flag=1;save();checkAll()}
      if(c==='du'){S.du++;save();checkAll()}
    }catch(e){}
  };
  window.addL.__ach=true;

  var gg=window.gameOver;
  if(gg&&!gg.__ach){
    window.gameOver=function(wi){
      gg(wi);
      try{
        S.pl++;
        if(wi===0||wi===1){S.wi++;save()}
        G2.last={winner:G.p[wi]?G.p[wi].n:'?',rd:G.rd};
        saveGS();
        // Comeback
        if(G.p[wi]&&G.p[wi].hp===1&&!S.cb){S.cb=1;setUT('cb');save();checkAll()}
        // No miss win
        if(curMs===0&&!S.nm1){S.nm1=1;setUT('noMiss1');save();checkAll()}
        // No hit win
        if(curHit===0&&!S.nh1){S.nh1=1;setUT('noHit1');save();checkAll()}
        // Rapid win
        if(G.rd<=3&&!S.rw){S.rw=1;setUT('rapidWin');save();checkAll()}
        // Long game
        if(G.rd>=15&&!S.lg){S.lg=1;setUT('longGame');save();checkAll()}
        // All items
        var items=['watch','book','check','wash','medkit','armor','rapid','freeze','swap','flag'];
        var all=items.every(function(it){return usedItems[it]});
        if(all&&!S.ai){S.ai=1;setUT('allItems');save();checkAll()}
        checkAll();save();
        // Reset per-game
        curMs=0;curSh=0;curHit=0;usedItems={};
      }catch(e){}
    };
    window.gameOver.__ach=true;
  }
}

var hi=setInterval(function(){if(typeof G!=='undefined'&&G){hook();clearInterval(hi)}},500);
setInterval(function(){if(typeof G!=='undefined'&&G&&G.phase!=='setup'){checkAll();save()}},5000);

setTimeout(function(){
  var ui=document.createElement('div');ui.className='wa-ui';
  var bt=document.createElement('button');bt.className='wa-btn';bt.textContent='🏆成就';
  bt.onclick=function(){showPanel('all')};ui.appendChild(bt);
  document.body.appendChild(ui);
},800);

})();
