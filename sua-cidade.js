/* sua-cidade.js: motor do minigame "Sua Cidade" (sem tela). Usado por sua-cidade.html.
   O tempo é o tempo REAL: as horas e os dias seguem o relógio do aparelho, mesmo com a página fechada.
   Salvo no localStorage em 3 slots: 'sua-cidade:save:1', ':2' e ':3'. Ajuste os números nas constantes abaixo. */
(function(){
const CLI_DIA=50,ESPERA_MIN=240,ABRE=6,FECHA=22,GOLD0=500,LIM=-500,IMPOSTO=50,TAXA=10,TAXA_CHUVA=12,KEY='sua-cidade:save',MAXD=14,KAIRON=.2,HORAS=23,DAY=864e5,NSLOT=3,sk=n=>KEY+':'+n;
const SH=[
{id:'roupas',i:'🧵',n:'Loja de Roupas',t:'Capas, vestidos e tecidos finos.',h:[16.8,21.3,14.5,12.5]},
{id:'armadura',i:'🛡️',n:'Loja de Armaduras',t:'Elmos e escudos forjados sob medida.',h:[34.3,16.7,19.8,15.8]},
{id:'armas',i:'⚔️',n:'Loja de Armas',t:'Espadas, arcos e lanças.',h:[57.5,20,20.6,15]},
{id:'magia',i:'🔮',n:'Loja de Itens Mágicos',t:'Poções, amuletos e pergaminhos.',h:[69.7,35.9,16,15.8]},
{id:'comida',i:'🍞',n:'Loja de Comida',t:'Pães, queijos e carnes.',h:[70.9,55.5,16.8,15]}];
// b = preço base (referência); w = peso na escolha dos clientes; lo/hi = faixa do preço de venda, sorteado de novo todo dia; c = custo de fabricar (chega amanhã); pc = custo de comprar pronto (na hora).
// Itens sem lo/hi/c/pc usam: venda de 90% a 110% de b, fabricar 45% de b e comprar pronto 75% de b.
const P={espada:{s:'armas',n:'Espada Curta',i:'🗡️',b:13,w:1,lo:10,hi:16,c:11,pc:15},
adaga:{s:'armas',n:'Adaga',i:'🔪',b:13,w:1,lo:9,hi:17,c:10,pc:13},machado:{s:'armas',n:'Machado',i:'🪓',b:16,w:1,lo:11,hi:20,c:12,pc:16},
martelo:{s:'armas',n:'Martelo',i:'🔨',b:18,w:1,lo:13,hi:22,c:14,pc:19},foice:{s:'armas',n:'Foice',i:'🌾',b:12,w:1,lo:8,hi:15,c:9,pc:12},
machadog:{s:'armas',n:'Machado de Guerra',i:'⚔️',b:19,w:1,lo:14,hi:24,c:15,pc:20},
cura:{s:'magia',n:'Poção de Cura',i:'🧪',b:12,w:2,lo:8,hi:15,c:9,pc:12},forca:{s:'magia',n:'Poção de Força',i:'💪',b:16,w:1,lo:11,hi:20,c:12,pc:16},plantas:{s:'magia',n:'Poção de Crescer Plantas',i:'🌱',b:13,w:1,lo:9,hi:17,c:10,pc:13},paes:{s:'comida',n:'Cesta de Pães',i:'🍞',b:12,w:2,lo:8,hi:15,c:9,pc:12},
velocidade:{s:'magia',n:'Poção de Velocidade',i:'⚡',b:13,w:1,lo:10,hi:16,c:11,pc:15},resistencia:{s:'magia',n:'Poção de Resistência',i:'🛡️',b:18,w:1,lo:13,hi:22,c:14,pc:19},invisibilidade:{s:'magia',n:'Poção de Invisibilidade',i:'🥷',b:19,w:1,lo:14,hi:24,c:15,pc:20},
// Loja de Comida: mesma lógica da loja mágica (preços de referência: peixão > vinho > carne > queijo > maçãs > pães). Os Pães já vêm liberados; o vinho é o primeiro a ser comprado.
carne:{s:'comida',n:'Coxa de Carne',i:'🍖',b:16,w:1,lo:11,hi:20,c:12,pc:16},queijo:{s:'comida',n:'Pedaço de Queijo',i:'🧀',b:13,w:1,lo:9,hi:17,c:10,pc:13},
vinho:{s:'comida',n:'Garrafa de Vinho',i:'🍷',b:18,w:1,lo:13,hi:22,c:14,pc:19},macas:{s:'comida',n:'Cesta de Maçãs',i:'🍎',b:13,w:1,lo:10,hi:16,c:11,pc:15},
peixao:{s:'comida',n:'Peixão',i:'🐟',b:19,w:1,lo:14,hi:24,c:15,pc:20},
// Loja de Armaduras: mesma lógica. Mais barato: Luvas (já vêm liberadas), depois Botas; o Peitoral é o mais caro.
escudor:{s:'armadura',n:'Escudo Redondo',i:'🛡️',b:13,w:1,lo:10,hi:16,c:11,pc:15},escudoq:{s:'armadura',n:'Escudo Quadrado',i:'🔰',b:16,w:1,lo:11,hi:20,c:12,pc:16},
capacete:{s:'armadura',n:'Capacete',i:'🪖',b:18,w:1,lo:13,hi:22,c:14,pc:19},luvas:{s:'armadura',n:'Luvas',i:'🧤',b:12,w:2,lo:8,hi:15,c:9,pc:12},
peitoral:{s:'armadura',n:'Peitoral',i:'🦺',b:19,w:1,lo:14,hi:24,c:15,pc:20},botas:{s:'armadura',n:'Botas',i:'🥾',b:13,w:1,lo:9,hi:17,c:10,pc:13},
// Loja de Roupas: mesma lógica. Mais barato: Luvas (já vêm liberadas); Manto e Colete de Terno são os mais caros.
calcas:{s:'roupas',n:'Calças',i:'👖',b:13,w:1,lo:10,hi:16,c:11,pc:15},manto:{s:'roupas',n:'Manto',i:'🧥',b:18,w:1,lo:13,hi:22,c:14,pc:19},
camisa:{s:'roupas',n:'Camisa',i:'👕',b:13,w:1,lo:9,hi:17,c:10,pc:13},luvasc:{s:'roupas',n:'Luvas',i:'🧤',b:12,w:2,lo:8,hi:15,c:9,pc:12},
colete:{s:'roupas',n:'Colete de Terno',i:'🦺',b:19,w:1,lo:14,hi:24,c:15,pc:20},sapato:{s:'roupas',n:'Sapato',i:'👞',b:16,w:1,lo:11,hi:20,c:12,pc:16}};
Object.keys(P).forEach(k=>{const p=P[k];if(p.lo==null){p.lo=Math.round(p.b*.9);p.hi=Math.round(p.b*1.1);p.c=Math.round(p.b*.45);p.pc=Math.round(p.b*.75)}});
// itens extras da loja mágica (preço para comprar o item) e limites de estoque: [limite atual, novo limite, custo]
const UNL={forca:25,plantas:20,velocidade:30,resistencia:40,invisibilidade:50,adaga:20,machado:25,foice:15,martelo:40,machadog:50,vinho:20,queijo:25,carne:30,macas:40,peixao:50,botas:20,escudor:25,escudoq:30,capacete:40,peitoral:50,camisa:20,calcas:25,sapato:30,manto:40,colete:50},CAPS=[[15,25,100],[25,50,500],[50,100,1000]],CAP0=15;
const NM=['Joana, a padeira','Tomás, o pescador','Beatriz','Rui, o lenhador','Cecília','Duarte, o ferreiro','Helena','Otávio, o viajante','Lúcia','Bento','Irene, a tecelã','Caio','Dona Marta','Capitão da Guarda','Mestre de Obras','Barão Ricardo','Mercador do Porto'];
const MISH=[['Goteira no telhado',150,450],['Balança quebrada',100,300],['Cano estourado na rua',200,500],['Fiscal pediu uma taxa de visita',150,400],['Carroça de entrega quebrou',200,600],['Ratos no depósito',100,350]];
const PRECO_LOJA3=15000,NIVEL_LOJA3=60; // terceira loja: aparece quando a SOMA dos níveis das duas lojas chega a NIVEL_LOJA3
const PRECO_LOJA2=5000,NIVEL_LOJA2=20,LOJA2=1; // segunda loja: preço em ouro; LOJA2=0 desliga a compra
// semana de chuva: CHUVA_CHANCE de cada semana ter chuva nos dias CHUVA_DIAS (0=segunda ... 6=domingo). Multiplicador do preço de venda por item.
const CHUVA_CHANCE=.14,CHUVA_DIAS=[2,3,4],CHUVA_MULT={forca:1.2,cura:1.2,resistencia:1.2,plantas:.8,invisibilidade:.8,velocidade:.8};
const IMPREV=0; // imprevistos (goteira, carroça quebrada...) desligados por enquanto: troque para 1 para ativar
const ROUBO_CLI=0; // roubo por clientes de honra baixa desligado por enquanto: troque para 1 para ativar
const rnd=(a,b)=>Math.floor(a+Math.random()*(b-a+1));
let S=null,cb=()=>{};
const PL=s=>Object.keys(P).filter(k=>P[k].s===s),fab=k=>P[k].c,buy=k=>P[k].pc;
const shops=()=>S?[S.shop,S.shop2,S.shop3].filter(Boolean):[],itens=()=>shops().reduce((a,s)=>a.concat(PL(s)),[]);
function initShop(o,id){PL(id).forEach(k=>{if(o.cap[k]==null){o.cap[k]=CAP0;if(!UNL[k]){o.unl[k]=1;add(o.st,k,CAP0,fab(k))}}})}
const rainWeek=w=>{if(!S.rw)S.rw={};if(S.rw[w]==null){S.rw[w]=Math.random()<CHUVA_CHANCE?1:0;Object.keys(S.rw).forEach(x=>{if(x<w-3)delete S.rw[x]})}return S.rw[w]};
const chuva=()=>!!S&&(!!S.rf||CHUVA_DIAS.includes(S.cd%7)&&rainWeek(Math.floor(S.cd/7))===1),cm=k=>chuva()?(CHUVA_MULT[k]||1):1;
const taxaDe=w=>S&&((w===cw()?rainWeek(w):(S.rw&&S.rw[w]))===1)?TAXA_CHUVA:TAXA; // semana com chuva: imposto sobre vendas sobe de TAXA para TAXA_CHUVA
const faixa=k=>[Math.round(P[k].lo*cm(k)),Math.round(P[k].hi*cm(k))];
const mkt=k=>{if(!S.pr)S.pr={};if(S.pr[k]==null)S.pr[k]=Math.round(rnd(P[k].lo,P[k].hi)*cm(k));return S.pr[k]},have=k=>S.st[k]?S.st[k].q:0;
const W=i=>S.w[i]||(S.w[i]={r:0,i:0,t:0,l:0,m:0}),cw=()=>Math.floor(S.cd/7);
const pf=w=>w.r-w.i-w.t-w.l-w.m,cs=w=>w.i+w.t+w.l+w.m;
const dstart=n=>{const d=new Date(S.start);d.setDate(d.getDate()+n);return d.getTime()};
const dnum=t=>{const d=new Date(t);d.setHours(0,0,0,0);return Math.round((d.getTime()-S.start)/DAY)};
const log=m=>{S.log.unshift(new Date().toLocaleDateString('pt-BR',{day:'2-digit',month:'2-digit'})+': '+m);S.log=S.log.slice(0,12)};
function add(o,k,q,a){const c=o[k]||(o[k]={q:0,a:a});c.a=(c.q*c.a+q*a)/(c.q+q);c.q+=q}
function take(k,n){const c=S.st[k];c.q-=n;return n*c.a}
function patr(){return S.gold+invTotal()+Object.keys(S.st).reduce((a,k)=>a+S.st[k].q*S.st[k].a,0)}
function save(){try{if(S&&!S.over){const p=Math.round(patr());if(p>(S.pk||0))S.pk=p}if(S&&S.slot)localStorage.setItem(sk(S.slot),JSON.stringify(S))}catch(e){}}
function load(n){try{const d=JSON.parse(localStorage.getItem(sk(n)));if(d&&d.shop&&d.cap){d.slot=n;
    const RN={elmo:'capacete',capa:'manto'}; // itens que mudaram de nome
    Object.keys(RN).forEach(a=>{const b=RN[a];['cap','unl','st','inc','pr'].forEach(o=>{if(d[o]&&d[o][a]!=null){d[o][b]=d[o][a];delete d[o][a]}});(d.q||[]).forEach(g=>g.m.forEach(m=>{if(m.k===a)m.k=b}));(d.feed||[]).forEach(x=>{if(x.k===a)x.k=b})});
    PL(d.shop).forEach(k=>{if(d.cap[k]==null)d.cap[k]=CAP0});[d.shop2,d.shop3].forEach(s=>{if(s)initShop(d,s)});[d.shop,d.shop2,d.shop3].forEach(s=>{if(s)PL(s).forEach(k=>{if(!UNL[k]&&!d.unl[k]){d.unl[k]=1;add(d.st,k,CAP0,fab(k))}})});return d}return null}catch(e){return null}}
function slots(){return Array.from({length:NSLOT},(_,i)=>load(i+1))}
function del(n){try{localStorage.removeItem(sk(n))}catch(e){}}
function migrate(){try{const o=localStorage.getItem(KEY);if(o)for(let i=1;i<=NSLOT;i++)if(!localStorage.getItem(sk(i))){localStorage.setItem(sk(i),o);localStorage.removeItem(KEY);break}}catch(e){}} // traz o save antigo (slot único) para o primeiro slot livre
migrate();
// investimentos (aba Investir): lo/hi = variação por dia em % (sorteada a cada dia que passa); fee = taxa cobrada no saque; cap = máximo aplicado; nauf = chance diária de naufrágio (perde 50%).
// x.v = valor atual, x.g = rendimento acumulado, x.h = valor nos últimos dias. O Cofre da Guilda fica fora do alcance de ladrões e pode cobrir ouro negativo.
const INV={poup:{n:'Cofre da Guilda',i:'🏦',r:'nenhum',cap:3000,fee:0,lo:.8,hi:.8,t:'Poupança segura: rende todo dia, sem risco, e você saca quando quiser sem taxa. Ladrões não chegam aqui.'},
tit:{n:'Títulos da Coroa',i:'🏛️',r:'baixo',cap:2000,fee:1,lo:.3,hi:1.5,t:'Empréstimos à coroa: nunca dão prejuízo, mas o rendimento varia de dia para dia.'},
acoes:{n:'Ações da Guilda',i:'📈',r:'médio',cap:2000,fee:2,lo:-4,hi:7,t:'Participação nos lucros dos mercadores. Pode render bem, mas também pode ter dias de queda.'},
mar:{n:'Expedição Marítima',i:'⛵',r:'alto',cap:2000,fee:3,lo:-8,hi:16,nauf:.04,t:'Navios rumo a terras distantes. Retorno alto, e se o navio afundar você perde metade do que aplicou.'}};
const LOCKED=1; // 1 = investimentos com cadeado por enquanto (troque para 0 para liberar)
const iv=k=>{if(!S.inv)S.inv={auto:1};return S.inv[k]||(S.inv[k]={v:0,g:0,h:[]})};
const invTotal=()=>S?Object.keys(INV).reduce((a,k)=>a+iv(k).v,0):0;
function tickInv(){let g=0;
  Object.keys(INV).forEach(k=>{const x=iv(k),d=INV[k];if(x.v<=0){x.h=[];return}
    let p=d.lo+Math.random()*(d.hi-d.lo);if(d.nauf&&Math.random()<d.nauf){p=-50;log('🌊 Naufrágio! A Expedição Marítima perdeu metade do valor aplicado.')}
    const n=Math.max(0,x.v*(1+p/100)),dv=n-x.v;x.v=n;x.g+=dv;g+=dv;x.h.push(Math.round(n));x.h=x.h.slice(-14)});
  if(Math.abs(g)>=1)log((g>0?'📈 Seus investimentos renderam +':'📉 Seus investimentos perderam ')+Math.abs(Math.round(g))+' de ouro hoje.')}
function cover(){const x=iv('poup');if(S.gold<0&&S.inv.auto&&x.v>=1){const n=Math.min(Math.floor(x.v),-S.gold);x.v-=n;S.gold+=n;log('🏦 O Cofre da Guilda cobriu '+n+' de ouro das suas contas.')}}
function deposit(k,q){if(LOCKED)return 'Investimentos bloqueados por enquanto.';q=Math.floor(q);if(!(q>0))return 'Digite um valor.';const x=iv(k),room=Math.floor(INV[k].cap-x.v);
  if(q>S.gold)return 'Faltam '+(q-S.gold)+' de ouro.';if(q>room)return room>0?'Só cabem mais '+room+' (limite '+INV[k].cap+').':'Limite atingido ('+INV[k].cap+').';
  S.gold-=q;x.v+=q;if(!x.h.length)x.h=[Math.round(x.v)];log(INV[k].i+' Depositou '+q+' em '+INV[k].n+'.');save();cb();return ''}
function withdraw(k,q,all){const x=iv(k),d=INV[k];q=all?x.v:Math.floor(q);if(!(q>0))return 'Digite um valor.';if(q>x.v+1e-6)return 'Você só tem '+Math.floor(x.v)+' aqui.';
  const fee=Math.round(q*d.fee/100);S.gold+=Math.round(q)-fee;x.g-=fee;x.v=all||x.v-q<.5?0:x.v-q;if(x.v<=0)x.h=[];
  log(d.i+' Sacou '+Math.round(q)+' de '+d.n+(fee?' (taxa '+fee+')':'')+'.');save();cb();return ''}
function autoCover(v){iv('poup');S.inv.auto=v?1:0;save();cb()}
function genSched(n){
  const hw=[0,1,1,1,1,2,3,4,5,6,7,7,8,8,7,7,7,7,6,5,4,3,2,1],hs=[];for(let h=ABRE;h<FECHA;h++)hs.push(h);
  const tot=hs.reduce((a,h)=>a+hw[h],0),base=dstart(n),s=[];
  for(let l=CLI_DIA;l>0;){const q=Math.min(rnd(1,8),l);l-=q;let r=Math.random()*tot,i=0;while(i<hs.length-1&&(r-=hw[hs[i]])>=0)i++;const h=hs[i];s.push({t:base+(h*60+rnd(0,59))*6e4,n:q})}
  s.sort((a,b)=>a.t-b.t);S.sched=s;S.si=0}
function start(id,n){
  const d=new Date();d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));
  S={shop:id,gold:GOLD0,start:d.getTime(),cd:0,nz:1,st:{},inc:{},w:[],log:[],q:[],feed:[],td:{a:0,s:0,d:0},sched:[],si:0,gid:0,cid:0,over:0,unl:{},cap:{},inv:{auto:1},slot:n};
  S.cd=dnum(Date.now());S.cd0=S.cd;S.pk=GOLD0;PL(id).forEach(k=>{S.cap[k]=CAP0;if(!UNL[k]){S.unl[k]=1;add(S.st,k,CAP0,fab(k))}});genSched(S.cd);
  while(S.si<S.sched.length&&S.sched[S.si].t<=Date.now())S.si++; // clientes de antes de começar não contam
  log('Flicky te deu a '+SH.find(s=>s.id===id).n+' com o estoque cheio para você começar!');save();cb()}
function newDay(){
  S.nz=1;S.pr={};S.rf=0;tickInv();
  if(S.cd%7===CHUVA_DIAS[0]&&chuva())log('🌧️ Semana de chuva! Até sexta, alguns preços sobem e outros caem.');
  if(S.cd%7===CHUVA_DIAS[CHUVA_DIAS.length-1]+1&&rainWeek(Math.floor(S.cd/7))===1)log('☀️ A chuva passou. Os preços voltam ao normal.');
  Object.keys(S.inc).forEach(k=>add(S.st,k,S.inc[k].q,S.inc[k].a));S.inc={};
  if(S.cd%7===0&&S.cd>0){ // imposto único: IMPOSTO por item à venda + TAXA% das vendas da semana anterior
    const n=itens().filter(k=>S.unl[k]).length,r=W(cw()-1).r,fx=IMPOSTO*n,tx=taxaDe(cw()-1),pc=Math.round(r*tx/100),t=fx+pc;S.gold-=t;W(cw()).t+=t;
    log('🏛️ Imposto da semana: '+fx+' ('+n+' item'+(n>1?'s':'')+' à venda) + '+pc+' ('+tx+'% das vendas'+(tx>TAXA?', semana de chuva':'')+') = '+t+' de ouro.')}
  if(Math.random()<.12){
    const ks=itens().filter(k=>have(k)>0);
    if(Math.random()<.5&&S.gold>=200||!ks.length){const v=Math.max(50,Math.min(Math.round(S.gold*rnd(5,12)/100),3000));S.gold-=v;W(cw()).l+=v;log('🗡️ Ladrões levaram '+v+' de ouro.')}
    else{const k=ks[rnd(0,ks.length-1)],n=Math.max(1,Math.floor(have(k)*rnd(10,25)/100)),c=take(k,n);W(cw()).l+=c;log('🗡️ Furtaram '+n+' × '+P[k].n+' do estoque.')}}
  if(IMPREV&&Math.random()<.18){const m=MISH[rnd(0,MISH.length-1)],v=rnd(m[1],m[2]);S.gold-=v;W(cw()).m+=v;log('⚠️ '+m[0]+': '+v+' de ouro.')}
  cover();genSched(S.cd);S.feed=[];S.td={a:0,s:0,d:0}}
function mkGroup(g){
  const lj=shops(),m=[]; // cada cliente escolhe uma das suas lojas e depois um item dela
  for(let i=0;i<g.n;i++){const ks=PL(lj[rnd(0,lj.length-1)]).filter(k=>S.unl[k]),tw=ks.reduce((a,k)=>a+P[k].w,0);let r=Math.random()*tw,k=ks[0];for(const x of ks){if((r-=P[x].w)<0){k=x;break}}
    const kai=Math.random()<KAIRON; // Kairon: 20% de chance de aparecer, honra sempre 100%. Os outros: honra de 80% a 98% (honra = chance de pagar; a chance de roubo é o inverso: 100 - honra)
    m.push({id:++S.cid,w:kai?'Kairon':NM[rnd(0,NM.length-1)],c:kai?6:rnd(0,5),h:kai?100:rnd(80,98),k,q:rnd(1,12),done:0})}
  return{id:++S.gid,t:g.t,exp:g.t+ESPERA_MIN*6e4,m}}
function flush(now){
  while(S.si<S.sched.length&&S.sched[S.si].t<=now){const g=S.sched[S.si++];if(g.t+ESPERA_MIN*6e4<=now)S.td.s+=g.n;else S.q.push(mkGroup(g))}
  S.q=S.q.filter(g=>{if(g.exp<=now){S.td.s+=g.m.filter(m=>!m.done).length;return false}return g.m.some(m=>!m.done)})}
// sincroniza com o relógio real; devolve true se algo mudou na fila/dia
function sync(){
  if(!S||S.over)return false;
  const sig=()=>S.cd+'|'+S.si+'|'+S.q.map(g=>g.id+':'+g.m.filter(m=>!m.done).length)+'|'+S.td.s;
  const a=sig(),now=Date.now(),nd=dnum(now);
  if(nd-S.cd>MAXD)S.cd=nd-MAXD;
  while(S.cd<nd){flush(dstart(S.cd+1));S.cd++;newDay()}
  flush(now);
  if(S.gold<=LIM)S.over=1;
  save();const ch=a!==sig()||S.over;if(ch)cb();return ch}
function sell(g,m){ // vende ao cliente m do grupo g
  const h=have(m.k);if(h<1||m.done)return null;
  const got=Math.min(m.q,h),p=mkt(m.k),c=take(m.k,got),v=got*p,st=ROUBO_CLI&&m.h<100&&Math.random()*100>=m.h;
  m.done=1;S.td.a++;
  if(st){W(cw()).l+=c;log('🗡️ '+m.w+' levou '+got+' × '+P[m.k].n+' sem pagar!')}else{S.gold+=v;W(cw()).r+=v;W(cw()).i+=c}
  S.feed.push({w:m.w,c:m.c,k:m.k,q:m.q,got,p,st,t:Date.now()});S.feed=S.feed.slice(-20);return{got,v,st}}
const find=(gid,cid)=>{const g=S.q.find(x=>x.id===gid);return[g,g&&g.m.find(x=>x.id===cid)]};
function serve(gid,cid){const[g,m]=find(gid,cid);if(!m)return null;const r=sell(g,m);flush(Date.now());save();cb();return r}
function serveGroup(gid){const g=S.q.find(x=>x.id===gid);if(!g)return;g.m.forEach(m=>sell(g,m));flush(Date.now());save();cb()}
function serveAll(){if(!S)return;S.q.slice().forEach(g=>g.m.forEach(m=>sell(g,m)));flush(Date.now());save();cb()}
function refuse(gid,cid){const[g,m]=find(gid,cid);if(!m)return;m.done=1;S.td.d++;flush(Date.now());save();cb()}
function order(k,q,now){ // now=true: comprar pronto; false: fabricar (chega amanhã)
  q=Math.floor(q);if(!(q>0))return 'Digite uma quantidade.';
  if(!S.unl[k])return 'Item ainda não comprado.';
  const room=S.cap[k]-have(k)-(S.inc[k]?S.inc[k].q:0);if(q>room)return room>0?'Só cabem mais '+room+' (limite '+S.cap[k]+').':'Estoque cheio (limite '+S.cap[k]+').';
  const c=q*(now?buy(k):fab(k));if(c>S.gold)return 'Faltam '+(c-S.gold)+' de ouro.';
  S.gold-=c;if(now){add(S.st,k,q,buy(k));log('Comprou '+q+' × '+P[k].n+'.')}else{add(S.inc,k,q,fab(k));log('Mandou fabricar '+q+' × '+P[k].n+' (chegam amanhã).')}
  save();cb();return ''}
function upCap(k){const t=CAPS.find(x=>x[0]===S.cap[k]);if(!t)return 'Limite máximo.';if(S.gold<t[2])return 'Faltam '+(t[2]-S.gold)+' de ouro.';S.gold-=t[2];S.cap[k]=t[1];log('Estoque de '+P[k].n+' subiu para '+t[1]+'.');save();cb();return ''}
function unlock(k){if(S.unl[k]||!UNL[k])return '';if(S.gold<UNL[k])return 'Faltam '+(UNL[k]-S.gold)+' de ouro.';S.gold-=UNL[k];S.unl[k]=1;log('Comprou o item '+P[k].n+'!');save();cb();return ''}
const stp=q=>q>=100?3:q>=50?2:q>=25?1:0;
const nivel=id=>S?PL(id||S.shop).reduce((a,k)=>a+(S.unl[k]?1+stp(S.cap[k]):0),0):0,nivelMax=id=>S?PL(id||S.shop).length*4:0,nivelTotal=()=>shops().reduce((a,s)=>a+nivel(s),0); // nível da loja = 1 por item à venda + 1 por aumento de estoque
function buyShop2(id){if(!S||!LOJA2)return 'Indisponível por enquanto.';if(S.shop2)return 'Você já tem uma segunda loja.';if(!SH.find(s=>s.id===id)||id===S.shop)return 'Escolha uma loja diferente da sua.';if(nivel()<NIVEL_LOJA2)return 'Sua primeira loja precisa ser nível '+NIVEL_LOJA2+' (agora: '+nivel()+').';if(S.gold<PRECO_LOJA2)return 'Faltam '+(PRECO_LOJA2-S.gold)+' de ouro.';S.gold-=PRECO_LOJA2;S.shop2=id;initShop(S,id);log('🏪 Comprou a segunda loja: '+SH.find(s=>s.id===id).n+'!');save();cb();return ''}
function buyShop3(id){if(!S)return 'Indisponível.';if(!S.shop2)return 'Compre a segunda loja primeiro.';if(S.shop3)return 'Você já tem três lojas.';if(!SH.find(s=>s.id===id)||shops().includes(id))return 'Escolha uma loja que ainda não é sua.';if(nivelTotal()<NIVEL_LOJA3)return 'A soma dos níveis das suas lojas precisa ser '+NIVEL_LOJA3+' (agora: '+nivelTotal()+').';if(S.gold<PRECO_LOJA3)return 'Faltam '+(PRECO_LOJA3-S.gold)+' de ouro.';S.gold-=PRECO_LOJA3;S.shop3=id;initShop(S,id);log('🏪 Comprou a terceira loja: '+SH.find(s=>s.id===id).n+'!');save();cb();return ''}
// botões de teste (dev), usados na aba Dúvidas
function devChuva(){if(!S)return;const w=cw(),on=!S.rf;S.rf=on?1:0;rainWeek(w);S.rw[w]=on?1:0;S.pr={};log(on?'🧪 Teste: chuva ligada até o fim do dia.':'🧪 Teste: chuva desligada.');save();cb()}
function devFalir(){if(!S)return;S.gold=LIM;S.over=1;save();cb()}
function devOuro(){if(!S)return;S.gold+=4000;log('🧪 Teste: +4000 de ouro.');save();cb()}
function call(){if(!S)return;S.q.push(mkGroup({t:Date.now(),n:rnd(1,8)}));save();cb()} // botão de teste
window.Cidade={shops,itens,nivelTotal,buyShop3,PRECO_LOJA3,NIVEL_LOJA3,taxaDe,TAXA_CHUVA,devChuva,devFalir,devOuro,chuva,faixa,CHUVA_CHANCE,CHUVA_MULT,NIVEL_LOJA2,nivel,nivelMax,PRECO_LOJA2,LOJA2,buyShop2,ROUBO_CLI,LOCKED,INV,iv,invTotal,deposit,withdraw,autoCover,NSLOT,slots,del,serveAll,CAPS,UNL,upCap,unlock,call,SH,P,PL,fab,buy,mkt,have,W,cw,pf,cs,load,start,sync,serve,serveGroup,refuse,order,
  CLI_DIA,IMPOSTO,TAXA,LIM,ESPERA_MIN,ABRE,FECHA,
  get S(){return S},set S(v){S=v},onChange(f){cb=f},
  patrimonio:()=>patr()};
})();
