/**
 * 西部对决 · Plus扩展包
 * 用法：在 roulette.html 的 </body> 前加 <script src="plus.js"></script>
 * 纯外挂，不动原HTML。
 * 功能：对局分享 / 每日挑战 / 录像回放 / 彩蛋系统 / 本地排行 / 更多设置
 */
(function(){

var css=document.createElement('style');
css.textContent=[
'.pp-ui{position:fixed;top:48px;right:12px;z-index:9999;display:flex;gap:6px;opacity:0.4;transition:opacity .3s}',
'.pp-ui:hover{opacity:1}',
'.pp-btn{background:rgba(30,15,10,.85);border:1px solid #6b3a2a;border-radius:8px;padding:4px 10px;color:#c0a090;cursor:pointer;font-family:inherit;font-size:.65em;white-space:nowrap}',
'.pp-btn:hover{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#f0e6d3}',
'.pp-panel{display:none;position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.82);z-index:99998;align-items:center;justify-content:center}',
'.pp-panel.on{display:flex}',
'.pp-box{background:linear-gradient(135deg,#1e0e0a,#2a1510);border:2px solid #8b4513;border-radius:18px;padding:20px 24px;max-width:480px;width:92%;max-height:85vh;overflow-y:auto}',
'.pp-box h2{font-size:1.2em;color:#ff6b35;text-align:center;margin:0 0 2px 0}',
'.pp-box .sub{font-size:.68em;color:#6a5540;text-align:center;margin-bottom:12px}',
'.pp-tabs{display:flex;gap:4px;justify-content:center;margin-bottom:12px;flex-wrap:wrap}',
'.pp-tab{padding:3px 12px;border-radius:10px;border:1px solid rgba(139,69,19,.4);background:rgba(30,15,10,.5);color:#a08070;cursor:pointer;font-size:.7em;font-family:inherit}',
'.pp-tab.on{background:rgba(255,107,53,.15);border-color:#ff6b35;color:#ff6b35}',
'.pp-close{display:block;margin:10px auto 0;background:rgba(255,107,53,.1);border:1px solid #6b3a2a;border-radius:8px;padding:6px 20px;color:#a08070;cursor:pointer;font-family:inherit;font-size:.75em}',
'.pp-close:hover{background:rgba(255,107,53,.15)}',
'.pp-st{font-size:.75em;color:#c0a090;line-height:1.7;text-align:center}',
'.pp-st .sn{color:#ff6b35;font-weight:bold}',
'.pp-day{background:rgba(200,160,100,.08);border:1px solid rgba(200,160,100,.2);border-radius:10px;padding:10px;text-align:center;margin-bottom:8px}',
'.pp-day .dt{font-size:1.5em;color:#fc3}.pp-day .dd{font-size:.7em;color:#c0a090}.pp-day .dr{font-size:.85em;color:#4c6;margin-top:4px}',
'.pp-egg{display:inline-block;margin:4px;padding:4px 8px;border-radius:6px;background:rgba(60,30,20,.4);border:1px solid rgba(139,69,19,.3);font-size:.65em;color:#a08070}',
'.pp-egg.unlocked{border-color:#fc3;color:#fc3;background:rgba(255,200,50,.08)}',
'.pp-egg .ei{font-size:1.2em}',
'.pp-playback{text-align:center;margin:8px 0}',
'.pp-playback input[type=range]{width:100%;accent-color:#ff6b35;height:4px}',
'.pp-playback .pb-info{font-size:.65em;color:#a08070;display:flex;justify-content:space-between}',
'.pp-prev{font-size:.65em;color:#6a5540;max-height:80px;overflow-y:auto;text-align:left;padding:4px 8px;background:rgba(0,0,0,.3);border-radius:6px;margin:4px 0}',
'.pp-prev .pl{font-size:.6em;color:#5a4030;padding:1px 0}.pp-prev .pl.cur{color:#fc3}',
'.pp-set-row{display:flex;align-items:center;gap:8px;margin-bottom:6px}',
'.pp-set-row label{font-size:.72em;color:#c0a090;min-width:70px}',
'.pp-set-row select{flex:1;background:rgba(60,30,20,.6);border:1px solid #6b3a2a;border-radius:6px;padding:4px 6px;color:#f0e6d3;font-size:.75em;font-family:inherit}',
'.pp-set-row .pp-val{font-size:.7em;color:#ff6b35;min-width:30px;text-align:right}',
'.pp-share-img{width:100%;border-radius:8px;margin:6px 0;display:none}'
].join('\n');
document.head.appendChild(css);

var P={tab:'share'};
var E={daySeed:null,dayBest:null,dayActive:null,replays:[],eggs:{},scores:[]};
var rec=[],playing=false,playIdx=0,eggCheck={};
var themes={};

function $(id){return document.getElementById(id)}

// ====== 每日挑战种子随机 ======
function seedRand(s){return function(){s=(s*9301+49297)%233280;return s/233280}}
function todaySeed(){var d=new Date();return d.getFullYear()*10000+(d.getMonth()+1)*100+d.getDate()}
function isSameDay(ts){var d1=new Date(ts),d2=new Date();return d1.getFullYear()===d2.getFullYear()&&d1.getMonth()===d2.getMonth()&&d1.getDate()===d2.getDate()}

// ====== 数据持久化 ======
function loadD(){
  try{var d=JSON.parse(localStorage.getItem('wd_plus'));if(d){
    E.dayBest=d.dayBest||null;E.eggs=d.eggs||{};E.scores=d.scores||[];E.replays=d.replays||[];E.dayActive=d.dayActive||null
  }}catch(e){}
  // 检查每日种子
  var ts=todaySeed();
  if(!E.daySeed||E.daySeed!==ts){E.daySeed=ts;E.dayBest=E.dayBest&&isSameDay(E.dayBest.t)?E.dayBest:null}
}
function saveD(){try{localStorage.setItem('wd_plus',JSON.stringify(E))}catch(e){}}

// ====== 主题系统 ======
var currentTheme='default';
var themeCSS={};
function applyTheme(t){
  currentTheme=t||'default';
  var el=$('ppThemeCSS');
  if(!el){el=document.createElement('style');el.id='ppThemeCSS';document.head.appendChild(el)}
  if(t==='default'||!themes[t]){el.textContent='';return}
  el.textContent=themes[t];
  try{localStorage.setItem('wd_plus_theme',t)}catch(e){}
}

function initThemes(){
  themes['default']='/* 默认主题 */';
  // 日夜模式
  themes['day']=[
    'body{background:linear-gradient(135deg,#8b7355,#a08060,#8b7355)!important}',
    '.gc{background:rgba(245,235,220,.92)!important;border-color:#a08060!important}',
    '.gc,.pn,.hearts,.abtn,.ibtn,.pp-btn,.p2p-scan-btn,.cd-close{color:#3a2a1a!important}',
    '.ban{background:rgba(180,150,110,.2)!important;border-color:#a08060!important;color:#3a2a1a!important}',
    '.pp{background:rgba(220,200,170,.5)!important;border-color:#a08060!important}',
    '.pp.on{border-color:#c8943a!important;box-shadow:0 0 20px rgba(200,148,58,.3)!important}',
    '.gun-label,.hpt,.rdi,.round-info{color:#5a4a30!important}',
    '.itip{background:rgba(245,235,220,.95)!important;color:#3a2a1a!important}',
    '.obox{background:linear-gradient(135deg,#e8dcc8,#d0c0a0)!important;color:#3a2a1a!important}',
    '.obox h2,.obox .wn{color:#8b4513!important}',
    '.cd-box,.pp-box,.wa-box,.wd-cb{background:linear-gradient(135deg,#e8dcc8,#d0c0a0)!important;color:#3a2a1a!important}',
    '.pp-btn,.wd-btn,.wa-btn{color:#5a4a30!important;border-color:#a08060!important}',
    '.abtn{color:#3a2a1a!important;border-color:#a08060!important}',
    '.abtn:hover:not(:disabled){background:rgba(200,148,58,.15)!important;border-color:#c8943a!important}',
    '.le{color:#5a4a30!important}',
    '.ch{background:rgba(200,180,150,.6)!important;border-color:#a08060!important;color:#5a4a30!important}',
    '.ch.cur{border-color:#c8943a!important;color:#c8943a!important}',
    '.bch{background:rgba(200,180,150,.6)!important;border-color:#a08060!important;color:#3a2a1a!important}',
    '.itip .itn{color:#8b4513!important}'
  ].join('\n');
  
  themes['night']=[
    'body{background:linear-gradient(135deg,#0a0a1a,#1a1a2e,#0a0a1a)!important}',
    '.gc{background:rgba(10,10,30,.92)!important;border-color:#3333aa!important}',
    '.ban{background:rgba(50,50,150,.15)!important;border-color:#4444bb!important;color:#aab!important}',
    '.pp.on{border-color:#6666ff!important;box-shadow:0 0 20px rgba(100,100,255,.2)!important}',
    '.abtn{background:linear-gradient(135deg,#1a1a3a,#0a0a2a)!important;border-color:#4444aa!important}',
    '.abtn:hover:not(:disabled){background:linear-gradient(135deg,#2a2a5a,#1a1a4a)!important;border-color:#6666ff!important}',
    '.abtn.shoot{background:linear-gradient(135deg,#4a1a1a,#2a0a0a)!important;border-color:#aa3333!important}',
    '.cd-box,.pp-box,.wa-box,.wd-cb{background:linear-gradient(135deg,#1a1a3e,#0e0e2a)!important;border-color:#4444bb!important}',
    '.ch{background:rgba(30,30,70,.6)!important;border-color:#4444aa!important}',
    '.ch.cur{border-color:#6666ff!important;color:#6666ff!important}',
    '.bch{background:rgba(30,30,70,.6)!important;border-color:#4444aa!important;color:#aab!important}'
  ].join('\n');

  // 森林绿
  themes['forest']=[
    'body{background:linear-gradient(135deg,#1a2a1a,#2a4a2a,#1a2a1a)!important}',
    '.gc{background:rgba(20,40,20,.92)!important;border-color:#4a8a4a!important}',
    '.ban{background:rgba(50,130,50,.12)!important;border-color:#5a9a5a!important;color:#8ab8a0!important}',
    '.pp.on{border-color:#5aca5a!important;box-shadow:0 0 20px rgba(80,200,80,.2)!important}',
    '.abtn{background:linear-gradient(135deg,#1a3a1a,#0a2a0a)!important;border-color:#4a8a4a!important}',
    '.abtn:hover:not(:disabled){background:linear-gradient(135deg,#2a5a2a,#1a4a1a)!important;border-color:#5aca5a!important}',
    '.cd-box,.pp-box,.wa-box,.wd-cb{background:linear-gradient(135deg,#1e3e1e,#0e2e0e)!important;border-color:#4a8a4a!important}',
    '.ch{background:rgba(30,70,30,.6)!important;border-color:#4a8a4a!important}',
    '.ch.cur{border-color:#5aca5a!important;color:#5aca5a!important}',
    '.bch{background:rgba(30,70,30,.6)!important;border-color:#4a8a4a!important;color:#8ab8a0!important}',
    '.cct,.ccb{color:#5aca5a!important}',
    '.gtit .gt,.form-title{color:#5aca5a!important}',
    '.hl,.hl-gold{color:#5aca5a!important}',
    '.abtn.shoot{background:linear-gradient(135deg,#4a2a1a,#2a1a0a)!important;border-color:#aa5a3a!important}'
  ].join('\n');

  // 日落橙
  themes['sunset']=[
    'body{background:linear-gradient(135deg,#2a1a1a,#4a2a1a,#2a1a1a)!important}',
    '.gc{background:rgba(40,20,15,.92)!important;border-color:#cc6633!important}',
    '.ban{background:rgba(200,100,50,.12)!important;border-color:#dd7744!important;color:#dda080!important}',
    '.pp.on{border-color:#ff8844!important;box-shadow:0 0 20px rgba(255,136,68,.2)!important}',
    '.abtn{background:linear-gradient(135deg,#3a1a0a,#2a0a00)!important;border-color:#cc6633!important}',
    '.abtn:hover:not(:disabled){background:linear-gradient(135deg,#5a2a1a,#3a1a0a)!important;border-color:#ff8844!important}',
    '.cd-box,.pp-box,.wa-box,.wd-cb{background:linear-gradient(135deg,#3e1e0e,#2e0e00)!important;border-color:#cc6633!important}',
    '.ch{background:rgba(70,30,10,.6)!important;border-color:#cc6633!important}',
    '.ch.cur{border-color:#ff8844!important;color:#ff8844!important}',
    '.bch{background:rgba(70,30,10,.6)!important;border-color:#cc6633!important;color:#dda080!important}'
  ].join('\n');

  // 更新设置界面的主题选择器
  themes['day']=themes['day']||'';
  themes['night']=themes['night']||'';

  // 加载上次主题
  try{var saved=localStorage.getItem('wd_plus_theme');if(saved&&themes[saved])applyTheme(saved)}catch(e){}
}

// ====== 录像系统 ======
function startRec(){rec=[]}
function addSnapshot(){
  if(typeof G==='undefined')return;
  rec.push(JSON.parse(JSON.stringify({
    phase:G.phase,cp:G.cp,cc:G.cc,bp:G.bp,bf:G.bf,br:G.br,rs:G.rs,
    hp0:G.p[0].hp,hp1:G.p[1].hp,
    al0:G.p[0].al,al1:G.p[1].al,
    st:G.st,ps:G.ps,rd:G.rd,mult:G.mult
  })));
}
function playback(idx){
  if(idx<0||idx>=rec.length||typeof G==='undefined')return;
  var s=rec[idx];
  G.phase=s.phase;G.cp=s.cp;G.cc=s.cc;G.bp=s.bp;G.bf=s.bf;G.br=s.br;G.rs=s.rs;
  G.p[0].hp=s.hp0;G.p[1].hp=s.hp1;G.p[0].al=s.al0;G.p[1].al=s.al1;
  G.st=s.st;G.ps=s.ps;
  if(typeof rdAll==='function')rdAll();
  if(typeof upBan==='function')upBan();
}

// ====== 彩蛋检测 ======
var eggDefs=[
  {id:'e_badshot',name:'夕阳红枪法',desc:'连续空枪10次',ico:'💩',check:function(){
    return (E._ec&&E._ec.ms>=10)||false;
  }},
  {id:'e_1hp',name:'锁血挂',desc:'以1HP完成一局',ico:'🩸',check:function(){
    return G.p[0]&&G.p[0].hp===1||G.p[1]&&G.p[1].hp===1
  }},
  {id:'e_rapid3',name:'三连射',desc:'一局内用3次连射',ico:'💨',check:function(){return E._ec&&E._ec.rp>=3}},
  {id:'e_nosk',name:'铁头娃',desc:'整局一次都没跳过',ico:'🤕',check:function(){
    for(var i=0;i<G.log.length;i++)if(G.log[i].m&&G.log[i].m.indexOf('跳过')>=0&&G.log[i].m.indexOf('挡')<0)return false
    return true
  }},
  {id:'e_swap',name:'等价交换',desc:'一局内交换HP3次',ico:'♻️',check:function(){return E._ec&&E._ec.sw>=3}}
];

function checkEggs(){
  if(typeof G==='undefined')return;
  eggDefs.forEach(function(eg){
    if(!E.eggs[eg.id]&&eg.check()){
      E.eggs[eg.id]=1;
      saveD();
      if(typeof T==='function')T('🎪 彩蛋: '+eg.name+' '+eg.desc)
    }
  });
}

// ====== 钩子 ======
function hook(){
  if(typeof G==='undefined'||!G)return;
  var og=window.addL;
  if(!og||og.__pp)return;
  window.addL=function(m,c){
    og(m,c);
    try{
      if(typeof G==='undefined')return;
      // 录像
      addSnapshot();
      // 彩蛋追踪 (使用局内计数器)
      if(m.indexOf('连射')>=0&&m.indexOf('装填')<0){E._ec=E._ec||{rp:0,sw:0,ms:0};E._ec.rp=(E._ec.rp||0)+1}
      if(m.indexOf('交换了HP')>=0){E._ec=E._ec||{rp:0,sw:0,ms:0};E._ec.sw=(E._ec.sw||0)+1}
      if(m.indexOf('空枪')>=0||m.indexOf('松了一口气')>=0){E._ec=E._ec||{rp:0,sw:0,ms:0};E._ec.ms=(E._ec.ms||0)+1}
      checkEggs();
    }catch(e){}
  };
  window.addL.__pp=true;

  var gg=window.gameOver;
  if(gg&&!gg.__pp){
    window.gameOver=function(wi){
      gg(wi);
      try{
        // 彩蛋
        checkEggs();
        // 保存录像
        if(rec.length>5){E.replays.unshift({t:Date.now(),rd:G.rd||0,frames:rec.slice(),p1:G.p[0]?.n,p2:G.p[1]?.n});if(E.replays.length>5)E.replays.length=5}
        // 每日挑战
        if(G.rd&&(!E.dayBest||G.rd<E.dayBest.r)){E.dayBest={t:Date.now(),r:G.rd||0,p:G.p[0]?.n};saveD()}
        // 记录成绩
        E.scores.push({t:Date.now(),rd:G.rd||0,w:G.p[wi]?.n||'?',p1:G.p[0]?.n,p2:G.p[1]?.n});
        if(E.scores.length>100)E.scores=E.scores.slice(-100);
        saveD();

      }catch(e){}
    };
    window.gameOver.__pp=true;
  }
}

// ====== 分享 ======
function genShareImg(){
  var c=document.createElement('canvas');c.width=520;c.height=360;
  var cx=c.getContext('2d');
  // 背景 + 边框
  cx.fillStyle='#2a1510';cx.fillRect(0,0,520,360);
  cx.strokeStyle='#c8943a';cx.lineWidth=4;cx.strokeRect(12,12,496,336);
  
  // 标题
  cx.fillStyle='#ffcc33';cx.font='bold 32px serif';cx.textAlign='center';
  cx.fillText('🏆 西部对决',260,55);
  cx.fillStyle='#8a7a50';cx.font='12px sans-serif';
  cx.fillText('CERTIFICATE OF DUEL',260,75);
  
  // 分隔线
  cx.strokeStyle='#c8943a';cx.lineWidth=1;
  cx.beginPath();cx.moveTo(80,85);cx.lineTo(440,85);cx.stroke();
  
  if(typeof G!=='undefined'&&G.p){
    // 玩家名
    cx.fillStyle='#d0c0a0';cx.font='18px sans-serif';
    cx.fillText(G.p[0].n+' vs '+G.p[1].n,260,120);
    
    // 回合数
    cx.fillStyle='#ff6b35';cx.font='bold 36px serif';
    var rText=G.rd+' 回合';
    cx.fillText(rText,260,170);
    
    // 血量
    cx.fillStyle='#f55';cx.font='16px sans-serif';
    cx.fillText('❤️ '+G.p[0].hp+'/'+G.p[0].mx+'  —  ❤️ '+G.p[1].hp+'/'+G.p[1].mx,260,205);
    
    // 结果
    var winner=G.p[0].hp<=0?G.p[1].n:(G.p[1].hp<=0?G.p[0].n:'?');
    cx.fillStyle='#fc3';cx.font='bold 22px sans-serif';
    cx.fillText('🏆 胜者: '+winner,260,245);
  }
  
  // 底部信息
  cx.fillStyle='#6a5540';cx.font='11px sans-serif';
  var d=new Date();cx.fillText(d.toLocaleDateString()+' '+d.toLocaleTimeString(),260,285);
  cx.fillStyle='#5a4030';cx.font='9px sans-serif';
  cx.fillText('第六届绒兽汇图一乐小游戏',260,305);
  cx.fillText('基于 Fox-Codebase 开发 (GPL-3.0)',260,320);
  
  return c;
}

function shareGame(){
  var c=genShareImg();
  c.toBlob(function(b){
    var a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='western_duel_cert.png';a.click();
    T('✅ 证书已下载');
  });
}

function T(m){
  var e=document.createElement('div');
  e.style.cssText='position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);background:rgba(0,0,0,.88);color:#ff6b35;padding:14px 28px;border-radius:12px;z-index:99999;border:1px solid #8b4513;pointer-events:none;animation:tf 1.5s forwards';
  e.textContent=m;document.body.appendChild(e);
  setTimeout(function(){if(e.parentNode)e.parentNode.removeChild(e)},1600);
}

// ====== UI ======
var panelOpen=false;

function showPanel(tab){
  panelOpen=true;P.tab=tab||'share';
  var p=$('ppPanel');
  if(!p){
    p=document.createElement('div');p.className='pp-panel';p.id='ppPanel';
    var b=document.createElement('div');b.className='pp-box';b.id='ppBox';
    b.innerHTML='<h2>🎮 更多</h2><div class="sub">分享 · 好友 · 录像 · 彩蛋 · 设置</div>';
    var tabs=document.createElement('div');tabs.className='pp-tabs';tabs.id='ppTabs';
    b.appendChild(tabs);
    var cnt=document.createElement('div');cnt.id='ppContent';cnt.style.cssText='min-height:120px';
    b.appendChild(cnt);
    var cl=document.createElement('button');cl.className='pp-close';cl.textContent='关闭';
    cl.onclick=function(){p.classList.remove('on');panelOpen=false};
    b.appendChild(cl);
    p.appendChild(b);document.body.appendChild(p);
  }
  p.classList.add('on');
  renderTabs();
  renderContent();
}

function renderTabs(){
  var tabs=$('ppTabs');tabs.innerHTML='';
  ['share','friends','replay','egg','setting'].forEach(function(t){
    var names={share:'📤分享',friends:'👥好友',replay:'📹录像',egg:'🎪彩蛋',setting:'⚙️设置'};
    var tb=document.createElement('button');tb.className='pp-tab'+(t===P.tab?' on':'');tb.textContent=names[t]||t;
    tb.onclick=function(){showPanel(t)};tabs.appendChild(tb);
  });
}

function renderContent(){
  var cnt=$('ppContent');
  if(!cnt)return;
  switch(P.tab){
    case 'share':renderShare(cnt);break;
    case 'friends':renderFriends(cnt);break;
    case 'replay':renderReplay(cnt);break;
    case 'egg':renderEgg(cnt);break;
    case 'setting':renderSetting(cnt);break;
  }
}

function renderShare(c){
  c.innerHTML='<div class="pp-st">📸 打完一局后生成对局证书<br>下载保存或分享给朋友</div>'+
    '<div style="text-align:center;margin:10px 0"><button class="pp-btn" onclick="shareGame()">📥 下载证书图片</button></div>'+
    '<div id="ppSharePreview" style="text-align:center"></div>';
  try{
    var c2=genShareImg();
    var img=document.createElement('img');img.src=c2.toDataURL();img.style.cssText='width:100%;max-width:280px;border-radius:8px;margin-top:6px';
    document.getElementById('ppSharePreview').appendChild(img);
  }catch(e){}
}

function renderDaily(c){
  var ts=todaySeed();
  var active=(E.dayActive===ts);
  c.innerHTML='<div class="pp-day"><div class="dt">🎯 '+ts+'</div><div class="dd">今日种子 · '+(active?'✅ 已启用':'点击启用')+'</div>'+
    (E.dayBest&&E.dayBest.t&&isSameDay(E.dayBest.t)?
      '<div class="dr">🏆 最少 <span class="sn">'+E.dayBest.r+'</span> 回合</div>':
      '<div class="dr" style="color:#a08070">今日尚未完成</div>')+'</div>'+
    '<div style="text-align:center;margin:6px 0">'+
    '<button class="pp-btn" onclick="toggleDaily()">'+(active?'⏹️ 关闭每日模式':'🎯 启用每日模式')+'</button></div>'+
    '<div class="pp-st" style="font-size:.7em;color:#6a5540;line-height:1.5">启用后游戏内的随机数将由日期种子决定<br>同一天所有人遇到完全相同的弹巢布局<br>💡 先启用每日模式 → 再开始新游戏 → 挑战最少回合！</div>';
}

window.toggleDaily=function(){
  var ts=todaySeed();
  if(E.dayActive===ts){E.dayActive=null;E._oldRandom=null;saveD();renderDaily($('ppContent'));T('⏹️ 每日模式已关闭');return}
  E._oldRandom=Math.random;
  var rng=seedRand(ts);
  Math.random=function(){return rng()};
  E.dayActive=ts;
  saveD();
  renderDaily($('ppContent'));
  T('🎯 每日模式已启用 (种子:'+ts+')');
};

// 重置每局彩蛋计数器
function resetEggCounters(){
  E._ec=E._ec||{};
  E._ec.rp=0;E._ec.sw=0;E._ec.ms=0;
}

function renderReplay(c){
  var html='<div class="pp-st">📹 最近 '+(E.replays.length)+' 场录像</div><div style="max-height:120px;overflow-y:auto">';
  if(E.replays.length===0)html+='<div class="pp-st" style="color:#6a5540">暂无录像</div>';
  E.replays.forEach(function(r,i){
    html+='<div style="background:rgba(30,15,10,.4);border-radius:6px;padding:4px 8px;margin:3px 0;font-size:.65em;color:#a08070;cursor:pointer;display:flex;justify-content:space-between" onclick="playReplay('+i+')">'+
      '<span>📹 R'+r.rd+' · '+r.p1+' vs '+r.p2+'</span><span>'+r.frames.length+'帧 ▶️</span></div>';
  });
  html+='</div>';
  // 当前录制状态
  if(rec.length>10)html+='<div class="pp-st" style="font-size:.6em;color:#4c6;margin-top:4px">⏺️ 本局已录 '+rec.length+' 帧</div>';
  // 回放控制器
  if(_rpFrames&&_rpFrames.length>0){
    var pi=Math.round((_rpPos||0)/(_rpFrames.length-1)*100);
    html+='<div class="pp-playback"><input type="range" min="0" max="'+(Math.max(1,_rpFrames.length-1))+'" value="'+(_rpPos||0)+'" oninput="seekReplay(this.value)" style="width:100%">'+
      '<div class="pb-info"><span>'+(_rpPlaying?'⏸️':'▶️')+'</span><span>'+(Math.min(_rpPos+1,_rpFrames.length))+'/'+_rpFrames.length+'</span></div>'+
      '<button class="pp-btn" onclick="togglePlay()">'+(_rpPlaying?'⏸️ 暂停':'▶️ 播放')+'</button></div>';
  }
  c.innerHTML=html;
}
window._rpFrames=null;window._rpPos=0;window._rpPlaying=false;window._rpTimer=null;

window.playReplay=function(idx){
  if(idx<0||idx>=E.replays.length)return;
  var r=E.replays[idx];
  if(!r.frames||r.frames.length<2)return;
  if(_rpTimer){clearInterval(_rpTimer);_rpTimer=null}
  _rpFrames=r.frames;_rpPos=0;_rpPlaying=false;
  // 恢复到开始
  if(typeof initGame==='function'){initGame()}
  setTimeout(function(){_rpPos=0;playback(0);renderReplay($('ppContent'))},200);
};

window.seekReplay=function(v){
  _rpPos=parseInt(v)||0;if(_rpPos>=_rpFrames.length)_rpPos=_rpFrames.length-1;
  playback(_rpPos);renderReplay($('ppContent'));
};

window.togglePlay=function(){
  if(!_rpFrames||_rpFrames.length<2)return;
  _rpPlaying=!_rpPlaying;
  if(_rpPlaying){
    if(_rpPos>=_rpFrames.length-1){_rpPos=0;playback(0)}
    _rpTimer=setInterval(function(){
      _rpPos++;if(_rpPos>=_rpFrames.length){_rpPos=_rpFrames.length-1;_rpPlaying=false;clearInterval(_rpTimer);_rpTimer=null;T('⏹️ 回放结束')}
      playback(_rpPos);renderReplay($('ppContent'))
    },200);
  } else {
    if(_rpTimer){clearInterval(_rpTimer);_rpTimer=null}
  }
  renderReplay($('ppContent'));
};

function renderEgg(c){
  var html='<div class="pp-st">🎪 彩蛋 · 隐藏成就</div><div style="text-align:center;margin:6px 0">';
  eggDefs.forEach(function(eg){
    var u=E.eggs[eg.id];
    html+='<span class="pp-egg'+(u?' unlocked':'')+'"><span class="ei">'+eg.ico+'</span> '+eg.name+(u?' ✅':' 🔒')+'</span>';
  });
  html+='</div>';
  c.innerHTML=html;
}

function renderRank(c){
  var scores=E.scores||[];
  var html='<div style="font-size:.7em;color:#a08070;margin-bottom:4px">📋 战绩 · '+scores.length+' 局</div>';
  if(scores.length>0){
    html+='<div style="max-height:160px;overflow-y:auto">';
    scores.slice().sort(function(a,b){return a.rd-b.rd}).slice(0,15).forEach(function(s,i){
      var m=i===0?'🥇':(i===1?'🥈':(i===2?'🥉':''));
      html+='<div style="display:flex;justify-content:space-between;padding:2px 8px;font-size:.68em;color:#a08070;border-bottom:1px solid rgba(139,69,19,.08)">'+
        '<span>'+m+' '+s.w+'</span><span>R'+s.rd+'</span></div>';
    });
    html+='</div>';
  } else {
    html+='<div style="font-size:.68em;color:#6a5540">暂无战绩</div>';
  }
  if(c) c.innerHTML = html;
}

function renderSetting(c){
  var themeNames={'default':'🌙 默认暗色','day':'☀️ 沙漠白昼','night':'🌃 赛博之夜','forest':'🌲 森林绿野','sunset':'🌅 日落余晖'};
  c.innerHTML='<div class="pp-st">⚙️ 更多设置</div>'+
    '<div class="pp-set-row"><label>界面主题</label><select id="ppThemeSel" onchange="applyTheme(this.value)">'+
    Object.keys(themeNames).map(function(k){return '<option value="'+k+'"'+(currentTheme===k?' selected':'')+'>'+themeNames[k]+'</option>'}).join('')+
    '</select></div>'+
    '<div class="pp-set-row"><label>录像帧率</label><select id="ppFpsSel"><option value="4">慢速 (4fps)</option><option value="7" selected>标准 (7fps)</option><option value="15">高速 (15fps)</option></select></div>'+
    '<div class="pp-st" style="font-size:.6em;color:#5a4030;margin-top:10px">主题实时切换，不需要刷新页面</div>';
}



// ====== DeepSeek API ======
var dsApiKey = '';
try { dsApiKey = localStorage.getItem('wd_ds_key') || ''; } catch(e) {}

// Hook into AI decision making
function dsAIOverride() {
  if (!dsApiKey || typeof G === 'undefined' || !G || G.mode !== 'ai') return false;
  var p = G.p[1];
  if (!p || !p.al || G.cp !== 1 || G.phase !== 'play' || G.bf) return false;

  // Build game state prompt
  var chamberState = '';
  for (var i = 0; i < G.s.ch; i++) {
    if (i === G.cc) chamberState += '【当前位置】';
    if (i === G.bp && G.br) chamberState += '💥';
    else if (i === G.bp) chamberState += '?';
    else chamberState += '○';
    chamberState += ' ';
  }

  var prompt = '你正在玩一个西部主题的轮盘赌游戏"西部对决"。\n\n' +
    '## 当前状态\n' +
    '- 你的名字: ' + p.n + '\n' +
    '- 你的HP: ' + p.hp + '/' + p.mx + '\n' +
    '- 对手HP: ' + G.p[0].hp + '/' + G.p[0].mx + '\n' +
    '- 弹巢大小: ' + G.s.ch + ', 子弹数量: ' + G.s.bu + '\n' +
    '- 当前弹巢位置: 第' + (G.cc + 1) + '发\n' +
    '- 弹巢状态: ' + chamberState + '\n' +
    '- 跳过扣血: ' + G.s.sk + 'HP\n' +
    '- 是否禁止跳过: ' + (G.s.noSk ? '是' : '否') + '\n';

  // Add item info
  var items = ['watch','book','check','wash','medkit','armor','rapid','freeze','swap','flag'];
  var itemNames = {watch:'反转怀表(调转枪口)',book:'我没死之书(免死)',check:'查看子弹',wash:'洗枪(重置子弹)',medkit:'急救包(+2HP)',armor:'防弹衣(挡一次)',rapid:'连射(空枪可再开)',freeze:'冰冻(击中强制跳过)',swap:'交换HP',flag:'公会旗帜(护盾)'};
  var hasItems = [];
  items.forEach(function(it) {
    if (p.it[it] && p.it[it] > 0) hasItems.push(itemNames[it] || it);
  });
  prompt += '- 你的道具: ' + (hasItems.length > 0 ? hasItems.join(', ') : '无') + '\n\n';

  prompt += '## 可用操作\n' +
    '1. 开枪 - 扣动扳机，可能击中对手或空枪\n' +
    '2. 跳过 - 放弃本回合，扣除' + G.s.sk + 'HP，随机获得一个已用道具\n' +
    (hasItems.length > 0 ? '3. 使用道具 - 从你的道具中选择一个使用\n' : '') +
    '\n请只回复一个JSON，格式如：{"action":"shoot"} 或 {"action":"skip"} 或 {"action":"item","item":"medkit"}，不要有其他文字。';

  // Call DeepSeek API
  fetch('https://api.deepseek.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + dsApiKey
    },
    body: JSON.stringify({
      model: 'deepseek-chat',
      messages: [
        {role: 'system', content: '你是西部对决AI玩家，请根据游戏状态做出最佳决策。只回复JSON。'},
        {role: 'user', content: prompt}
      ],
      max_tokens: 100,
      temperature: 0.7
    })
  })
  .then(function(r) { return r.json(); })
  .then(function(data) {
    try {
      var text = data.choices && data.choices[0] && data.choices[0].message ? data.choices[0].message.content : '';
      var decision = JSON.parse(text);
      executeDSDecision(decision);
    } catch(e) {
      // Fallback: shoot
      if (typeof pull === 'function' && G.phase === 'play' && G.cp === 1 && !G.bf) pull();
    }
  })
  .catch(function() {
    // Fallback on error
    if (typeof pull === 'function' && G.phase === 'play' && G.cp === 1 && !G.bf) pull();
  });

  return true;
}

function executeDSDecision(decision) {
  if (!decision || !decision.action) {
    if (typeof pull === 'function' && G.phase === 'play' && G.cp === 1 && !G.bf) pull();
    return;
  }
  if (decision.action === 'shoot') {
    if (typeof pull === 'function' && G.phase === 'play' && G.cp === 1 && !G.bf) pull();
  } else if (decision.action === 'skip') {
    if (typeof doSkip === 'function' && !G.s.noSk) doSkip();
  } else if (decision.action === 'item' && decision.item) {
    // Use the item via the existing system
    var itemMap = {watch:'watch',book:'book',check:'check',wash:'wash',medkit:'medkit',armor:'armor',rapid:'rapid',freeze:'freeze',swap:'swap',flag:'flag'};
    var itemId = itemMap[decision.item] || decision.item;
    if (typeof useI === 'function') {
      useI(1, itemId);
      // After using item, the AI might need to decide again
      setTimeout(function() {
        if (G.phase === 'play' && G.cp === 1 && !G.bf && G.p[1] && G.p[1].al) {
          // If still AI's turn, call original aiGo as fallback
          if (typeof aiGo === 'function') aiGo();
        }
      }, 500);
    } else {
      if (typeof pull === 'function' && G.phase === 'play' && G.cp === 1 && !G.bf) pull();
    }
  } else {
    if (typeof pull === 'function' && G.phase === 'play' && G.cp === 1 && !G.bf) pull();
  }
}

// Hook into aiGo - replace it when API key is set
function hookAI() {
  if (typeof G === 'undefined' || !G || typeof window.aiGo === 'undefined') return;
  if (window.__dsHooked) return;
  var origAiGo = window.aiGo;
  window.aiGo = function() {
    if (!dsApiKey || G.mode !== 'ai' || G.cp !== 1 || G.phase !== 'play' || G.bf || !G.p[1] || !G.p[1].al) {
      origAiGo();
      return;
    }
    // Use API
    dsAIAct();
  };
  window.__dsHooked = true;
}

// Simpler API call with CORS proxy fallback
function dsAIAct() {
  var p = G.p[1];
  if (!p || !p.al || G.cp !== 1 || G.phase !== 'play' || G.bf) return;

  var prompt = '西部对决轮盘赌，当前状态:\n';
  prompt += '我HP:' + p.hp + '/' + p.mx + ', 对手HP:' + G.p[0].hp + '/' + G.p[0].mx + '\n';
  prompt += '弹巢:' + G.s.ch + '发, 第' + (G.cc+1) + '发, 子弹:' + G.s.bu + '发\n';
  prompt += '跳过扣' + G.s.sk + 'HP' + (G.s.noSk ? '(禁止跳过)' : '') + '\n';

  var itemNames = {watch:'怀表(枪口反转)',book:'免死书',check:'查弹',wash:'洗枪',medkit:'急救+2HP',armor:'防弹衣',rapid:'连射',freeze:'冰冻',swap:'换HP',flag:'旗帜盾'};
  var its = [];
  for (var k in p.it) { if (p.it[k] > 0 && itemNames[k]) its.push(itemNames[k]); }
  prompt += '道具:' + (its.join(',') || '无') + '\n';
  prompt += '请用JSON回复: {"a":"shoot"} 或 {"a":"skip"} 或 {"a":"item","i":"medkit"}';

  // Try direct fetch first, then proxy
  var url = 'https://api.deepseek.com/v1/chat/completions';
  var body = JSON.stringify({
    model: 'deepseek-chat',
    messages: [
      {role: 'system', content: '你玩西部对决，只输出JSON。'},
      {role: 'user', content: prompt}
    ],
    max_tokens: 60,
    temperature: 0.5
  });

  // Use our own server as proxy (no CORS issues)
  var wsUrl = typeof WS_URL !== 'undefined' ? WS_URL : 'wss://fox-codebase-production.up.railway.app';
  var apiUrl = wsUrl.replace('wss://', 'https://').replace('ws://', 'http://') + '/api/chat';
  fetch(apiUrl, {
    method: 'POST', headers: {'Content-Type':'application/json','Authorization':'Bearer '+dsApiKey},
    body: body
  })
  .then(function(r){return r.json()})
  .then(function(data){
    try {
      var text = data.choices[0].message.content;
      var dec = JSON.parse(text);
      if (dec.a === 'shoot' && typeof pull === 'function') pull();
      else if (dec.a === 'skip' && typeof doSkip === 'function' && !G.s.noSk) doSkip();
      else if (dec.a === 'item' && dec.i && typeof useI === 'function') {
        var imap = {watch:'watch',book:'book',check:'check',wash:'wash',medkit:'medkit',armor:'armor',rapid:'rapid',freeze:'freeze',swap:'swap',flag:'flag'};
        useI(1, imap[dec.i] || dec.i);
        setTimeout(function(){if(G.phase==='play'&&G.cp===1&&!G.bf&&typeof pull==='function')pull()},400);
      }
      else if (typeof pull === 'function') pull();
    } catch(e) { if(typeof pull==='function') pull(); }
  })
  .catch(function(){
    // fetch failed - fallback to original AI
    if (typeof window.__origAiGo === 'function') window.__origAiGo();
    else if (typeof pull === 'function') pull();
  });
}

var aiHookTimer = setInterval(function() {
  if (typeof G !== 'undefined' && G && typeof window.aiGo !== 'undefined') {
    // Store original
    if (!window.__origAiGo) window.__origAiGo = window.aiGo;
    hookAI();
    clearInterval(aiHookTimer);
  }
}, 500);

// ====== 初始化 ======
loadD();initThemes();
var hi=setInterval(function(){if(typeof G!=='undefined'&&G){hook();clearInterval(hi)}},500);

// ====== 好友系统 ======
var friends = [];
try { var f = localStorage.getItem('wd_friends'); if (f) friends = JSON.parse(f); } catch(e) {}

css.textContent += '.pp-fr{font-size:.78em;color:#c0a090;margin:4px 0;padding:6px 8px;background:rgba(60,30,20,.3);border-radius:8px;display:flex;justify-content:space-between;align-items:center}';
css.textContent += '.pp-fr .st{font-size:.65em}.pp-fr .st.on{color:#4c6}.pp-fr .st.off{color:#644}';
css.textContent += '.pp-fr-add{display:flex;gap:6px;margin:8px 0}.pp-fr-add input{flex:1;background:rgba(60,30,20,.5);border:1px solid #6b3a2a;border-radius:6px;padding:5px 8px;color:#f0e6d3;font-size:.8em;outline:none;font-family:inherit}';
css.textContent += '.pp-fr-add input:focus{border-color:#c8943a}';

function renderFriends(cnt) {
  var connected = (typeof wsConn !== 'undefined' && wsConn && wsConn.readyState === 1);
  if (!connected) {
    if (typeof wsConnect === 'function') {
      wsConnect(function() {
        wsConn.send(JSON.stringify({ type: 'register_online', name: G && G.p[0] ? G.p[0].n : '旅者' }));
        var c = document.getElementById('ppContent');
        if (c) renderFriends(c);
      });
    }
    var h = '<div style="font-size:.8em;color:#a08070;text-align:center;margin:10px 0">🔌 正在连接服务器...</div>';
    if (cnt) cnt.innerHTML = h; return;
  }

  // Combine friends and online users
  var html = '<div style="font-size:.8em;color:#a08070;margin-bottom:6px">🌐 在线玩家</div>';
  var onlineOthers = (onlineList || []).filter(function(u) {
    return !friends.find(function(f) { return f.id === u.id; });
  });
  if (onlineOthers.length === 0) html += '<div style="font-size:.7em;color:#6a5540;margin-bottom:10px">暂无其他在线玩家</div>';
  onlineOthers.forEach(function(u) {
    html += '<div class="pp-fr"><span>' + u.name + '</span><span class="st on">● 在线</span>' +
      '<button class="pp-btn" onclick="quickAddFriend(\'' + u.id + '\',\'' + u.name.replace(/'/g,"\\'") + '\')" style="font-size:.7em;padding:2px 8px">＋添加</button></div>';
  });

  html += '<div style="font-size:.8em;color:#a08070;margin:10px 0 6px">👥 我的好友 (' + friends.length + ')</div>';
  if (friends.length === 0) html += '<div style="font-size:.7em;color:#6a5540;margin-bottom:8px">还没有好友，从上方在线列表添加吧</div>';
  friends.forEach(function(f) {
    var online = onlineList && onlineList.find(function(u) { return u.id === f.id; });
    html += '<div class="pp-fr"><span>' + f.name + '</span>' +
      '<span class="st ' + (online ? 'on' : 'off') + '">' + (online ? '● 在线' : '○ 离线') + '</span>' +
      (online ? '<button class="pp-btn" onclick="inviteFriend(\'' + f.id + '\',\'' + f.name.replace(/'/g,"\\'") + '\')" style="font-size:.7em;padding:2px 8px">邀请</button>' : '') +
      '<button class="pp-btn" onclick="removeFriend(\'' + f.id + '\')" style="font-size:.7em;padding:2px 6px;color:#866">✕</button></div>';
  });
  if (cnt) cnt.innerHTML = html;
  wsConn.send(JSON.stringify({ type: 'get_online' }));
}

function quickAddFriend(id, name) {
  if (friends.find(function(f) { return f.id === id; })) { alert('已经是好友了'); return; }
  friends.push({ id: id, name: name });
  localStorage.setItem('wd_friends', JSON.stringify(friends));
  if (window.achiev) window.achiev.addFriend();
  var cnt = document.getElementById('ppContent');
  if (cnt) renderFriends(cnt);
}
var onlineList = [];
function addFriend() {
  var inp = document.getElementById('frInput');
  if (!inp || !inp.value.trim()) return;
  var id = inp.value.trim().toUpperCase();
  if (friends.find(function(f) { return f.id === id; })) { alert('已经是好友了'); return; }
  var name = prompt('给这个好友起个名字', id) || id;
  friends.push({ id: id, name: name });
  localStorage.setItem('wd_friends', JSON.stringify(friends));
  inp.value = '';
  var cnt = document.getElementById('ppContent');
  if (cnt) renderFriends(cnt);
}
function removeFriend(id) {
  friends = friends.filter(function(f) { return f.id !== id; });
  localStorage.setItem('wd_friends', JSON.stringify(friends));
  var cnt = document.getElementById('ppContent');
  if (cnt) renderFriends(cnt);
}
function inviteFriend(id, name) {
  if (typeof wsConn === 'undefined' || !wsConn || wsConn.readyState !== 1) {
    T('请先连接到服务器'); return;
  }
  var code = '';
  if (typeof G !== 'undefined' && G && G.roomCode) code = G.roomCode;
  wsConn.send(JSON.stringify({ type: 'friend_invite', toId: id, fromName: G ? (G.p[0] ? G.p[0].n : '旅者') : '旅者', roomCode: code }));
  T('已向 ' + name + ' 发送邀请');
}
// Listen for WebSocket messages via event bus
if (typeof window.wsEventBus === 'undefined') window.wsEventBus = [];
window.wsEventBus.push(function(msg) {
  if (msg.type === 'online_list') {
    onlineList = msg.users || [];
    // Update friend display if visible
    var cnt = document.getElementById('ppContent');
    if (cnt && document.getElementById('ppTabs')) {
      var active = document.querySelector('#ppTabs .pp-tab.on');
      if (active && active.textContent.includes('好友')) renderFriends(cnt);
    }
  }
  if (msg.type === 'registered' && msg.id) {
    if (typeof wsConn !== 'undefined' && wsConn) wsConn.myId = msg.id;
    var cnt = document.getElementById('ppContent');
    if (cnt && document.querySelector('#ppTabs .pp-tab.on')?.textContent.includes('好友')) renderFriends(cnt);
  }
  if (msg.type === 'leaderboard' && msg.entries) {
    var el = document.getElementById('ppLbContent');
    if (el) {
      if (msg.entries.length === 0) {
        el.innerHTML = '<div style="color:#6a5540;padding:6px">无</div>';
      } else {
        var h = '';
        msg.entries.slice(0, 15).forEach(function(e, i) {
          var medal = i===0?'🥇':(i===1?'🥈':(i===2?'🥉':''));
          h += '<div style="display:flex;justify-content:space-between;align-items:center;padding:4px 8px;font-size:.7em;color:#a08070;border-bottom:1px solid rgba(139,69,19,.08)">' +
            '<span>' + medal + ' <b style="color:#c8943a">' + e.name + '</b></span>' +
            '<span style="color:#dd8844">' + e.rank + '</span>' +
            '<span>' + e.wins + '胜/' + e.games + '局 · <b style="color:#ff6b35">' + e.score + '</b>分</span></div>';
        });
        el.innerHTML = h;
      }
    }
  }
  if (msg.type === 'friend_invite' && msg.fromName) {
    if (confirm(msg.fromName + ' 邀请你一起玩西部对决！\n是否接受？')) {
      T('尝试连接 ' + msg.fromName + '...');
    }
  }
});

setTimeout(function(){
  var ui=document.createElement('div');ui.className='pp-ui';
  var bt=document.createElement('button');bt.className='pp-btn';bt.textContent='🎮 更多';
  bt.onclick=function(){showPanel('share')};
  ui.appendChild(bt);
  document.body.appendChild(ui);
  // Add friend button
  var frBt = document.createElement('button'); frBt.className = 'pp-btn'; frBt.textContent = '👥 好友';
  frBt.onclick = function() { showPanel('friends'); };
  ui.appendChild(frBt);
  // 左上角自定义服务/AI
  var tlUi=document.createElement('div');tlUi.style.cssText='position:fixed;top:50px;left:12px;z-index:9999;display:flex;gap:4px;opacity:0.4;transition:opacity .3s';
  tlUi.onmouseenter=function(){tlUi.style.opacity='1'};
  tlUi.onmouseleave=function(){tlUi.style.opacity='0.4'};
  var cfgBtn=document.createElement('button');cfgBtn.className='pp-btn';cfgBtn.textContent='🧠 AI接入';
  cfgBtn.onclick=function(){
    var choice = prompt('DeepSeek API Key 设置:\n1. 设置 Key\n2. 清除 Key\n3. 查看当前状态', '1');
    if (choice === '1') {
      var key=prompt('输入你的DeepSeek API Key', dsApiKey || 'sk-');
      if(key&&key.trim()){try{localStorage.setItem('wd_ds_key',key.trim());dsApiKey=key.trim();T('✅ DeepSeek API Key已设置，AI将用API决策')}catch(e){}}
    } else if (choice === '2') {
      try{localStorage.removeItem('wd_ds_key');dsApiKey='';T('🗑️ API Key已清除')}catch(e){}
    } else if (choice === '3') {
      T(dsApiKey ? '✅ API Key 已设置 (' + dsApiKey.slice(0,8) + '...)' : '❌ 未设置API Key');
    }
  };
  tlUi.appendChild(cfgBtn);
  document.body.appendChild(tlUi);
  // 如果游戏已开始，开始录像
  if(typeof G!=='undefined'&&G&&G.phase!=='setup')startRec();
  // 每日检查
  if(!E.dayBest||!isSameDay(E.dayBest.t)){
    // 新的一天
  }
  saveD();
},800);

// 响应主题切换
window.applyTheme=applyTheme;

})();
