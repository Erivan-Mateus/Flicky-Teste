/* loja.js: ouro, itens comprados e catálogo da loja (usado por loja, avatar e trilha).
   Salvo no localStorage: 'trilha-ouro' = {gold:n} e 'trilha-loja' = {owned:['pele:3', ...]}.
   Ajuste os preços aqui em CATALOG e o ganho de ouro por missão em index.html (OURO_POR_EXP). */
(function(){
const GK='trilha-ouro',OK='trilha-loja';
const read=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v&&typeof v==='object'?v:d}catch(e){return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
// categorias da loja, na ordem da barra. Categorias sem itens mostram "Em breve".
const CATS=[['rostos','Rostos'],['cabelos','Cabelos'],['calcas','Calças e cintura'],['botas','Botas'],['braceletes','Braceletes'],['capas','Capas'],['camisas','Camisas e camisetas'],['especiais','Especiais'],['sazonais','Sazonais']];
// item: id único, categoria, nome, preço em ouro. kind:'pele' + skin = índice em Avatar.SKIN.
// Peças de roupa/rosto: piece = chave em Avatar.CLOTHES (avatar.js) e kind = onde aparece no avatar (ONDE no loja.html): cabelo, camisa, camiseta, calca, cintura, bota, olhos, boca, maquiagem, tatuagem.
// (os ids 'camisa:kairon_camisa2' e 'calca:kairon_saia' mantêm o nome antigo para não perder quem já comprou)
const CATALOG=[
  // price:0 = grátis (já vem liberado). Para vender a GOLAIAFI, troque o preço (ex.: 300) e coloque SKIN_LOCKED=[3] no avatar.js.
  {id:'pele:3',cat:'especiais',kind:'pele',skin:3,name:'GOLAIAFI 1',desc:'Cor de pele especial',price:0},
  {id:'pele:4',cat:'especiais',kind:'pele',skin:4,name:'GOLAIAFI 2',desc:'Cor de pele especial',price:150},
  // cabelos: kind:'cabelo' + hair = chave em Avatar.CLOTHES (avatar.js). price:0 = grátis, já vem liberado.
  {id:'cabelo:cabelo1',cat:'cabelos',kind:'cabelo',hair:'cabelo1',name:'Cabelo 1',desc:'Cabelo para o seu avatar',price:0},
  {id:'cabelo:cabelo2',cat:'cabelos',kind:'cabelo',hair:'cabelo2',name:'Cabelo 2',desc:'Cabelo para o seu avatar',price:0},
  // Kairon (masculino e feminino)
  {id:'boca:kairon_boca',cat:'rostos',kind:'boca',piece:'kairon_boca',name:'Boca do Kairon',desc:'Boca do Kairon',price:50},
  {id:'olhos:kairon_olhos',cat:'rostos',kind:'olhos',piece:'kairon_olhos',name:'Olhos do Kairon',desc:'Olhos do Kairon',price:100},
  {id:'camisa:kairon_camisa2',cat:'camisas',kind:'camiseta',piece:'kairon_camisa2',name:'Camiseta do Kairon',desc:'Camiseta do Kairon',price:100},
  {id:'bracelete:kairon_braceletes',cat:'braceletes',kind:'bracelete',piece:'kairon_braceletes',name:'Braceletes do Kairon',desc:'Braceletes do Kairon',price:100},
  {id:'bota:kairon_botas',cat:'botas',kind:'bota',piece:'kairon_botas',name:'Botas do Kairon',desc:'Botas do Kairon',price:25},
  {id:'cabelo:kairon_cabelo',cat:'cabelos',kind:'cabelo',piece:'kairon_cabelo',name:'Cabelo do Kairon',desc:'Cabelo do Kairon',price:150},
  {id:'calca:kairon_saia',cat:'calcas',kind:'cintura',piece:'kairon_saia',name:'Saia do Kairon',desc:'Saia do Kairon',price:150},
  {id:'tatuagem:kairon_tatuagens',cat:'especiais',kind:'tatuagem',piece:'kairon_tatuagens',name:'Tatuagens do Kairon',desc:'Tatuagens do Kairon',price:100}
];
const gold=()=>{const g=Math.floor(Number(read(GK,{gold:0}).gold));return g>0?g:0};
const setGold=n=>write(GK,{gold:Math.max(0,Math.floor(n))});
// 'camisa:kairon_camisa' (nome antigo) vira 'bracelete:kairon_braceletes', para não perder quem já comprou
const ownedList=()=>{const o=read(OK,{owned:[]}).owned;return Array.isArray(o)?o.map(i=>i==='camisa:kairon_camisa'?'bracelete:kairon_braceletes':i):[]};
const owned=id=>{const it=CATALOG.find(x=>x.id===id);return (it&&it.price===0)||ownedList().includes(id)};
function buy(id){
  const it=CATALOG.find(x=>x.id===id)||TITLES_SHOP.find(x=>x.id===id);if(!it)return{ok:false,reason:'item'};
  if(owned(id)||titleOwned(id))return{ok:false,reason:'owned'};
  if(gold()<it.price)return{ok:false,reason:'gold',falta:it.price-gold()};
  if(!setGold(gold()-it.price))return{ok:false,reason:'save'};
  const l=ownedList();l.push(id);write(OK,{owned:l});
  return{ok:true,item:it};
}
// títulos da loja (aba Títulos). price:0 = grátis, já vem liberado. O título em uso fica em 'trilha-titulo-extra'.
const TITLES_SHOP=[
  {id:'titulo:flicky',name:'Amigo da Flicky',desc:'Título exclusivo',price:0},
  {id:'titulo:norte-a-sul',name:'De Norte a Sul',desc:'Título exclusivo',price:100},
  {id:'titulo:lenda-da-noite',name:'Lenda da Noite',desc:'Título exclusivo',price:100},
  {id:'titulo:cavaleiro-noturno',name:'Cavaleiro noturno',desc:'Título exclusivo',price:100},
  {id:'titulo:subindo-de-nivel',name:'Subindo de nível',desc:'Título exclusivo',price:100},
  {id:'titulo:guerreiro',name:'Guerreiro',desc:'Título exclusivo',price:100},
  {id:'titulo:mestre-de-batalhas',name:'Mestre de Batalhas',desc:'Título exclusivo',price:100},
  {id:'titulo:barbaro',name:'Bárbaro',desc:'Título exclusivo',price:100},
  {id:'titulo:berserker',name:'Berserker',desc:'Título exclusivo',price:100},
  {id:'titulo:fanatico',name:'Fanático',desc:'Título exclusivo',price:100}
];
const TK='trilha-titulo-extra';
const titleOwned=id=>{const t=TITLES_SHOP.find(x=>x.id===id);return !!t&&(t.price===0||ownedList().includes(id))};
function extraTitleId(){try{const v=localStorage.getItem(TK);return v&&titleOwned(v)?v:null}catch(e){return null}}
const extraTitle=()=>{const id=extraTitleId();return id?TITLES_SHOP.find(x=>x.id===id).name:null};
function setExtraTitle(id){try{if(id&&titleOwned(id))localStorage.setItem(TK,id);else localStorage.removeItem(TK)}catch(e){}}
// pacotes de ouro (aba Recursos). Compra ainda indisponível: só exibição.
const PACKS=[100,500,1000,1500,2000];
// baús da trilha: cada baú só pode ser resgatado uma vez ('trilha-baus' = {claimed:['m1-bau1', ...]})
const BK='trilha-baus';
const claimedList=()=>{const c=read(BK,{claimed:[]}).claimed;return Array.isArray(c)?c:[]};
const chestClaimed=id=>claimedList().includes(id);
function claimChest(id,ouro){
  if(chestClaimed(id))return{ok:false,reason:'claimed'};
  const l=claimedList();l.push(id);
  if(!write(BK,{claimed:l}))return{ok:false,reason:'save'}; // marca ANTES de dar o ouro: sem salvar, não paga
  setGold(gold()+ouro);return{ok:true,ouro};
}
// ---- códigos de resgate (aba Recursos › Códigos) ----
// Cada código só pode ser usado 1 vez ('trilha-codigos' = {used:['EXEMPLO', ...]}).
// Para criar um código, adicione uma linha em CODES:  'MEUCODIGO': {gold:100, items:['pele:4','titulo:flicky'], msg:'texto mostrado ao resgatar'}
//  - gold: ouro dado (opcional)  - items: ids de CATALOG / TITLES_SHOP liberados (opcional)
// Maiúsculas/minúsculas, espaços e traços são ignorados ao digitar.
const CODES={
  'EXEMPLO':{gold:50,items:[],msg:'Você ganhou 50 de ouro!'},
  'KAIRONGOLAIAFI':{items:['boca:kairon_boca','olhos:kairon_olhos','camisa:kairon_camisa2','bracelete:kairon_braceletes','bota:kairon_botas','cabelo:kairon_cabelo','calca:kairon_saia','tatuagem:kairon_tatuagens','pele:4'],msg:'Você ganhou todos os itens do Kairon e a pele GOLAIAFI 2!'}
};
const CDK='trilha-codigos';
const usedCodes=()=>{const u=read(CDK,{used:[]}).used;return Array.isArray(u)?u:[]};
const normCode=s=>String(s||'').toUpperCase().replace(/[^A-Z0-9]/g,'');
function redeem(raw){
  const key=normCode(raw);if(!key)return{ok:false,reason:'empty'};
  const hit=Object.entries(CODES).find(([k])=>normCode(k)===key);
  if(!hit)return{ok:false,reason:'invalid'};
  const c=hit[1],used=usedCodes();
  if(used.includes(key))return{ok:false,reason:'used'};
  used.push(key);
  if(!write(CDK,{used}))return{ok:false,reason:'save'}; // marca ANTES de dar o prêmio: sem salvar, não paga
  const its=Array.isArray(c.items)?c.items:[];
  if(its.length){const o=ownedList();its.forEach(i=>{if(!o.includes(i))o.push(i)});write(OK,{owned:o})}
  if(c.gold>0)setGold(gold()+c.gold);
  return{ok:true,msg:c.msg||'Código resgatado!'};
}
// Quem já usou um código recebe, automaticamente, os itens que forem acrescentados a ele depois (nunca o ouro de novo).
// Roda ao abrir qualquer página que carrega o loja.js.
function syncCodes(){
  const used=usedCodes();if(!used.length)return;
  const o=ownedList();let mudou=false;
  Object.entries(CODES).forEach(([k,c])=>{
    if(!used.includes(normCode(k)))return;
    (Array.isArray(c.items)?c.items:[]).forEach(i=>{if(!o.includes(i)){o.push(i);mudou=true}});
  });
  if(mudou)write(OK,{owned:o});
}
syncCodes();
window.Loja={redeem,chestClaimed,claimChest,TITLES_SHOP,PACKS,titleOwned,extraTitleId,extraTitle,setExtraTitle,CATS,CATALOG,gold,addGold:n=>setGold(gold()+n),owned,buy};
})();
