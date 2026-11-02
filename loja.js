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
  // GOLAIAFI está grátis por enquanto. Para vendê-la: {id:'pele:3',cat:'especiais',kind:'pele',skin:3,name:'GOLAIAFI',desc:'Cor de pele especial',price:300}
  // e coloque SKIN_LOCKED=[3] no avatar.js.
];
const gold=()=>{const g=Math.floor(Number(read(GK,{gold:0}).gold));return g>0?g:0};
const setGold=n=>write(GK,{gold:Math.max(0,Math.floor(n))});
const ownedList=()=>{const o=read(OK,{owned:[]}).owned;return Array.isArray(o)?o:[]};
const owned=id=>ownedList().includes(id);
function buy(id){
  const it=CATALOG.find(x=>x.id===id);if(!it)return{ok:false,reason:'item'};
  if(owned(id))return{ok:false,reason:'owned'};
  if(gold()<it.price)return{ok:false,reason:'gold',falta:it.price-gold()};
  if(!setGold(gold()-it.price))return{ok:false,reason:'save'};
  const l=ownedList();l.push(id);write(OK,{owned:l});
  return{ok:true,item:it};
}
window.Loja={CATS,CATALOG,gold,addGold:n=>setGold(gold()+n),owned,buy};
})();
