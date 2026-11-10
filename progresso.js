/* progresso.js: progresso do jogador, compartilhado por trilha (index), perfil e comunidade.
   Este arquivo só tem o CÓDIGO. Os dados ficam no localStorage do navegador:
     'trilha-progresso' = {done, xp, pats, played}   missões concluídas, XP total, patentes e missões jogadas
     'trilha-vidas'     = {lives, next}              vidas atuais e quando volta a próxima
     'trilha-sequencia' = {count, last}              dias seguidos e último dia com atividade
     'trilha-titulo'    = índice do título de patente em uso
   Ajuste aqui: XP por nível (XP_AT), títulos de patente (TITLES), máximo de vidas e tempo de recarga.
   Toda leitura do progresso é feita direto do armazenamento, então abas abertas ao mesmo tempo não sobrescrevem o XP umas das outras.
   Carregue DEPOIS do loja.js (os títulos da loja são opcionais). Uso:  Progresso.get(), Progresso.addXp(200), Progresso.level(p) ... */
(function(){
const PK='trilha-progresso',LK='trilha-vidas',SK='trilha-sequencia',TK='trilha-titulo';
const read=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v&&typeof v==='object'?v:d}catch(e){return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
const num=v=>{v=Number(v);return isFinite(v)&&v>0?Math.floor(v):0};

// ---- XP, nível e títulos de patente ----
// XP total para ALCANÇAR cada nível (índice 0 = nível 1): 0, 300, depois x3 a cada nível até o 20.
// O nível só sobe depois de passar na patente do trecho (nível máximo = patentes + 1).
const XP_AT=[0,300];for(let i=2;i<20;i++)XP_AT.push(XP_AT[i-1]*3);
// Títulos de patente: o 1º vem desde o começo; cada patente conquistada libera o próximo.
const TITLES=['Iniciante I','Iniciante II','Iniciante III'];
const get=()=>{const p=read(PK,{});return{done:num(p.done),xp:num(p.xp),pats:num(p.pats),played:num(p.played)}};
const save=p=>write(PK,{done:num(p.done),xp:num(p.xp),pats:num(p.pats),played:num(p.played)});
function addXp(n){const p=get();p.xp+=num(n);save(p);return p}
// {raw: nível só pelo XP, lv: nível real, capped: XP já passou do nível liberado, max, pct: barra (0-100), a/b: XP do nível atual/próximo, toNext}
function level(p){
  let raw=1;XP_AT.forEach((v,i)=>{if(p.xp>=v)raw=i+1});
  const lv=Math.min(raw,(p.pats||0)+1),capped=lv<raw,max=lv>=XP_AT.length;
  const a=XP_AT[lv-1];let b=null,pct=100;
  if(!max){b=XP_AT[lv];pct=Math.max(0,Math.min(100,Math.round((p.xp-a)/(b-a)*100)))}
  return{raw,lv,capped,max,pct,a,b,toNext:max?0:Math.max(0,b-p.xp)};
}
const titleCount=pats=>Math.min(TITLES.length,num(pats)+1);
function titleIndex(pats){
  const n=titleCount(pats);let c=NaN;
  try{c=parseInt(localStorage.getItem(TK),10)}catch(e){}
  return(c>=0&&c<n)?c:n-1;
}
// título mostrado: o da loja em uso (se houver) ou o de patente escolhido
const titleName=pats=>(window.Loja&&window.Loja.extraTitle&&window.Loja.extraTitle())||TITLES[titleIndex(pats)];

// ---- Vidas: 7 no máximo, 1 vida volta a cada hora ----
// "lives" é um objeto vivo ({lives,next}): as funções abaixo alteram o próprio objeto, a página só desenha na tela.
const MAX_LIVES=7,HOUR=3600000;
const lives={lives:MAX_LIVES,next:null};
let lastSaved='';
function loadLives(){const s=read(LK,null);if(s&&typeof s.lives==='number'){lives.lives=s.lives;lives.next=s.next||null}}
function tickLives(){
  const now=Date.now();
  while(lives.lives<MAX_LIVES&&lives.next&&now>=lives.next){lives.lives++;lives.next+=HOUR}
  if(lives.lives>=MAX_LIVES){lives.lives=MAX_LIVES;lives.next=null}
  else if(!lives.next)lives.next=now+HOUR;
  const js=JSON.stringify(lives);if(js!==lastSaved){lastSaved=js;try{localStorage.setItem(LK,js)}catch(e){}}
}
// tira 1 vida (false se já não tinha nenhuma). Depois chame tickLives() para salvar.
function loseLife(){if(lives.lives<=0)return false;lives.lives--;if(!lives.next)lives.next=Date.now()+HOUR;return true}

// ---- Sequência de dias: acende ao concluir algo hoje; apaga se passar um dia sem atividade ----
const streak={count:0,last:null};
const dayOff=n=>{const d=new Date();d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function loadStreak(){const x=read(SK,null);if(x&&typeof x.count==='number'){streak.count=x.count;streak.last=x.last||null}}
const streakAlive=()=>streak.last===dayOff(0)||streak.last===dayOff(-1);
// zera a contagem se a sequência quebrou; devolve true se a chama deve ficar acesa
function streakCheck(){loadStreak();const alive=streakAlive();if(!alive)streak.count=0;write(SK,streak);return alive&&streak.count>0}
// registra atividade de hoje; devolve true se for a primeira do dia
function streakRegister(){
  loadStreak();const t=dayOff(0);
  if(streak.last===t)return false;
  streak.count=streak.last===dayOff(-1)?streak.count+1:1;streak.last=t;write(SK,streak);return true;
}
// só leitura (perfil): dias seguidos válidos agora
function streakDays(){loadStreak();return streakAlive()?streak.count:0}

// ---- Jogo "Sua Cidade" no menu: bloqueado até o nível NIVEL_JOGO ----
const NIVEL_JOGO=2;
let navTT;
function navAviso(m){
  let t=document.querySelector('.toast');
  if(!t){t=document.createElement('div');t.className='toast';t.setAttribute('role','status');document.body.appendChild(t)}
  t.textContent=m;t.classList.add('show');clearTimeout(navTT);navTT=setTimeout(()=>t.classList.remove('show'),2400);
}
function navJogo(){
  const a=document.querySelector('nav a[href="sua-cidade.html"]');if(!a)return;
  const ok=level(get()).lv>=NIVEL_JOGO;
  a.classList.toggle('lock',!ok);
  if(ok){a.removeAttribute('aria-disabled');a.setAttribute('aria-label','Sua Cidade')}
  else{a.setAttribute('aria-disabled','true');a.setAttribute('aria-label','Sua Cidade (bloqueado: chegue ao nível '+NIVEL_JOGO+')')}
  if(!a.dataset.nav){a.dataset.nav='1';a.addEventListener('click',e=>{if(a.classList.contains('lock')){e.preventDefault();navAviso('🔒 Chegue ao nível '+NIVEL_JOGO+' para liberar o jogo Sua Cidade.')}})}
}
navJogo();window.addEventListener('pageshow',navJogo);

loadLives();loadStreak();
window.Progresso={NIVEL_JOGO,XP_AT,TITLES,MAX_LIVES,HOUR,get,save,addXp,level,titleCount,titleIndex,titleName,
  lives,loadLives,tickLives,loseLife,streak,loadStreak,streakCheck,streakRegister,streakDays};
})();
