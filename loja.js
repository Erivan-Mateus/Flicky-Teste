/* loja.js: ouro, itens comprados e catálogo da loja (usado por loja, avatar e trilha).
   Salvo no localStorage: 'trilha-ouro' = {gold:n} e 'trilha-loja' = {owned:['pele:3', ...]}.
   Ajuste os preços aqui em CATALOG e o ganho de ouro por missão em index.html (OURO_POR_EXP). */
(function(){
const GK='trilha-ouro',OK='trilha-loja';
const read=(k,d)=>{try{const v=JSON.parse(localStorage.getItem(k));return v&&typeof v==='object'?v:d}catch(e){return d}};
const write=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){return false}};
// categorias da loja, na ordem da barra. Categorias sem itens mostram "Em breve".
const CATS=[['rostos','Rostos'],['cabelos','Cabelos'],['calcas','Calças'],['camisas','Camisas'],['especiais','Especiais'],['sazonais','Sazonais']];
// item: id único, categoria, nome, preço em ouro. kind:'pele' + skin = índice em Avatar.SKIN.
const CATALOG=[
  // price:0 = grátis (já vem liberado). Para vender a GOLAIAFI, troque o preço (ex.: 300) e coloque SKIN_LOCKED=[3] no avatar.js.
  {id:'pele:3',cat:'especiais',kind:'pele',skin:3,name:'GOLAIAFI 1',desc:'Cor de pele especial',price:0},
  {id:'pele:4',cat:'especiais',kind:'pele',skin:4,name:'GOLAIAFI 2',desc:'Cor de pele especial',price:150}
];
const gold=()=>{const g=Math.floor(Number(read(GK,{gold:0}).gold));return g>0?g:0};
const setGold=n=>write(GK,{gold:Math.max(0,Math.floor(n))});
const ownedList=()=>{const o=read(OK,{owned:[]}).owned;return Array.isArray(o)?o:[]};
const owned=id=>{const it=CATALOG.find(x=>x.id===id);return (it&&it.price===0)||ownedList().includes(id)};
function buy(id){
  const it=CATALOG.find(x=>x.id===id);if(!it)return{ok:false,reason:'item'};
  if(owned(id))return{ok:false,reason:'owned'};
  if(gold()<it.price)return{ok:false,reason:'gold',falta:it.price-gold()};
  if(!setGold(gold()-it.price))return{ok:false,reason:'save'};
  const l=ownedList();l.push(id);write(OK,{owned:l});
  return{ok:true,item:it};
}
// títulos da loja (aba Títulos). price:0 = grátis, já vem liberado. O título em uso fica em 'trilha-titulo-extra'.
const TITLES_SHOP=[{id:'titulo:flicky',name:'Amigo da Flicky',desc:'Título exclusivo',price:0}];
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
  'EXEMPLO':{gold:50,items:[],msg:'Você ganhou 50 de ouro!'}
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
window.Loja={redeem,chestClaimed,claimChest,TITLES_SHOP,PACKS,titleOwned,extraTitleId,extraTitle,setExtraTitle,CATS,CATALOG,gold,addGold:n=>setGold(gold()+n),owned,buy};
})();
