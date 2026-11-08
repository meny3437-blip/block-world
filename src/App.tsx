import { useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { addItemToBag, consumeItemFromBag, craftItemInBag } from './inventory.js';
import { breakChestContents, depositBagIntoChest, withdrawChestToBag } from './chests.js';
import { getAttackDamage, getIncomingDamage, selectWeapon } from './combat.js';

type Kind = string;
type BlockInfo = [id:string, label:string, color:number];
const extraBlockCatalog:BlockInfo[] = [
  ['oak_planks','Дубові дошки',0xb98550],
  ['birch_planks','Березові дошки',0xd8c99a],
  ['spruce_planks','Ялинові дошки',0x76513b],
  ['jungle_planks','Тропічні дошки',0xb77a4a],
  ['acacia_planks','Акацієві дошки',0xb95b36],
  ['dark_oak_planks','Темний дуб',0x493126],
  ['mangrove_planks','Мангрові дошки',0x743c37],
  ['cherry_planks','Вишневі дошки',0xe5a2ae],
  ['bamboo_planks','Бамбукові дошки',0xc4b64b],
  ['oak_log','Дубова колода',0x76502f],
  ['birch_log','Березова колода',0xe1d8b9],
  ['spruce_log','Ялинова колода',0x59402f],
  ['jungle_log','Тропічна колода',0x8c603c],
  ['acacia_log','Акацієва колода',0x9d4b31],
  ['dark_oak_log','Колода темного дуба',0x38291f],
  ['mangrove_log','Мангрова колода',0x59302d],
  ['cherry_log','Вишнева колода',0x5d393d],
  ['oak_leaves','Дубове листя',0x477d32],
  ['birch_leaves','Березове листя',0x7cae45],
  ['spruce_leaves','Ялинова хвоя',0x315b43],
  ['jungle_leaves','Тропічне листя',0x2d8b48],
  ['azalea_leaves','Листя азалії',0x568c47],
  ['cobblestone','Бруківка',0x777b7c],
  ['mossy_cobblestone','Мохова бруківка',0x60785a],
  ['stone_bricks',"Кам'яна цегла",0x85898b],
  ['cracked_stone_bricks','Тріщинувата цегла',0x777b7d],
  ['mossy_stone_bricks',"Мохова кам'яна цегла",0x687a60],
  ['granite','Граніт',0xa77d70],
  ['diorite','Діорит',0xc7c6c0],
  ['andesite','Андезит',0x898d8d],
  ['deepslate','Глибинний сланець',0x41464c],
  ['cobbled_deepslate','Бита глибинна порода',0x4d535a],
  ['tuff','Туф',0x777e6b],
  ['calcite','Кальцит',0xdedbd0],
  ['dripstone','Натічний камінь',0x987a61],
  ['amethyst','Аметист',0x9366c4],
  ['clay','Глина',0x9baeb8],
  ['mud','Багнюка',0x574536],
  ['packed_mud','Утрамбована багнюка',0x765b43],
  ['terracotta','Теракота',0x9b6048],
  ['white_terracotta','Біла теракота',0xd1b2a0],
  ['red_sand','Червоний пісок',0xb96c35],
  ['gravel','Гравій',0x85827c],
  ['moss','Мох',0x547b3d],
  ['podzol','Підзол',0x62462d],
  ['mycelium','Міцелій',0x796c78],
  ['glass','Скло',0xb7d9dc],
  ['glass_tinted','Тоноване скло',0x454c59],
  ['bricks','Цегла',0x985447],
  ['stone_bricks_slab',"Кам'яна плита",0x929697],
  ['bookshelf','Книжкова шафа',0x94653b],
  ['crafting_table','Верстак',0x94613a],
  ['furnace','Піч',0x666b70],
  ['chest','Скриня',0xb17a3e],
  ['barrel','Бочка',0x93643c],
  ['lantern','Ліхтар',0xe8a94a],
  ['glowstone','Світлокамінь',0xe6c77a],
  ['sea_lantern','Морський ліхтар',0x9bd8ce],
  ['white_wool','Біла вовна',0xe8e8e2],
  ['orange_wool','Помаранчева вовна',0xe58a35],
  ['magenta_wool','Пурпурова вовна',0xb64c9d],
  ['light_blue_wool','Блакитна вовна',0x6da9d2],
  ['yellow_wool','Жовта вовна',0xe8cf45],
  ['lime_wool','Лаймова вовна',0x82c83e],
  ['pink_wool','Рожева вовна',0xe69bad],
  ['gray_wool','Сіра вовна',0x62676b],
  ['light_gray_wool','Світло-сіра вовна',0xb5b5ad],
  ['cyan_wool','Бірюзова вовна',0x328e91],
  ['purple_wool','Фіолетова вовна',0x7747a8],
  ['blue_wool','Синя вовна',0x4059a8],
  ['brown_wool','Коричнева вовна',0x765039],
  ['green_wool','Зелена вовна',0x527b38],
  ['red_wool','Червона вовна',0xb43b32],
  ['black_wool','Чорна вовна',0x292b2d],
  ['white_concrete','Білий бетон',0xd8d8d2],
  ['orange_concrete','Помаранчевий бетон',0xd9782d],
  ['magenta_concrete','Пурпуровий бетон',0xa83e8b],
  ['light_blue_concrete','Блакитний бетон',0x4d9bc5],
  ['yellow_concrete','Жовтий бетон',0xe1c52d],
  ['lime_concrete','Лаймовий бетон',0x6fae2e],
  ['pink_concrete','Рожевий бетон',0xd77e91],
  ['gray_concrete','Сірий бетон',0x55595c],
  ['cyan_concrete','Бірюзовий бетон',0x25838a],
  ['purple_concrete','Фіолетовий бетон',0x68349a],
  ['blue_concrete','Синій бетон',0x354b91],
  ['brown_concrete','Коричневий бетон',0x65412d],
  ['green_concrete','Зелений бетон',0x496c30],
  ['red_concrete','Червоний бетон',0xa8322c],
  ['black_concrete','Чорний бетон',0x202225],
  ['obsidian','Обсидіан',0x211936],
  ['crying_obsidian','Плакучий обсидіан',0x3b1c54],
  ['netherrack','Пекельний камінь',0x713b38],
  ['soul_sand','Пісок душ',0x514033],
  ['soul_soil','Ґрунт душ',0x493b34],
  ['nether_bricks','Пекельна цегла',0x45252a],
  ['basalt','Базальт',0x45464b],
  ['blackstone','Чорнокамінь',0x302d35],
  ['end_stone','Камінь Краю',0xd7d49a],
  ['purpur_block','Пурпуровий блок',0x9a6c9b],
  ['prismarine','Призмарин',0x5b9b8a],
  ['dark_prismarine','Темний призмарин',0x376b63],
  ['sponge','Губка',0xc5b94b],
  ['hay_bale','Тюк сіна',0xbba33e],
  ['pumpkin','Гарбуз',0xd77b27],
  ['melon','Кавун',0x5e9c3d],
  ['copper_block','Мідний блок',0xb56d48],
  ['iron_block','Залізний блок',0xb8bdc2],
  ['gold_block','Золотий блок',0xe8c34b],
  ['diamond_block','Алмазний блок',0x51d9c4],
  ['emerald_block','Смарагдовий блок',0x27b86b],
  ['lapis_block','Лазуритовий блок',0x315da8],
  ['redstone_block','Редстоуновий блок',0xb73532],
  ['coal_block','Вугільний блок',0x34373a]
];
const allBlockKinds:Kind[]=['grass','dirt','stone','wood','leaf','sand','snow','water','cactus','ore','copper','iron','gold','crystal','coal',...extraBlockCatalog.map(b=>b[0])];
type Block = { x:number; y:number; z:number; kind:Kind };
type Stats = { health:number; hunger:number; thirst:number; stamina:number; day:number; hour:number; weather:string };
type Bag = Record<string,number>;
const STORE = 'block-world-survival-v2';
const PLAYER_STORE = `${STORE}:player`;
const names: Record<string,string> = {wood:'Деревина',stone:'Камінь',dirt:'Земля',grass:'Трава',leaf:'Листя',sand:'Пісок',snow:'Сніг',ore:'Залізна руда',copper:'Мідь',iron:'Залізо',gold:'Золото',crystal:'Кристал',coal:'Вугілля',berry:'Ягоди',meat:'Сире м’ясо',cooked_meat:'Смажене м’ясо',plank:'Дошки',stick:'Палиці',torch:'Смолоскип',pickaxe:'Кам’яна кирка',axe:'Кам’яна сокира',wood_sword:'Дерев’яний меч',stone_sword:'Кам’яний меч',iron_sword:'Залізний меч',leather:'Шкіра',bone:'Кістка',dragon_scale:'Луска дракона',dragon_armor:'Драконяча броня',arrow:'Стріла',leather_armor:'Шкіряна броня',shelter:'Укриття',campfire:'Багаття',fishingrod:'Вудка',bow:'Лук',ingot:'Мідний злиток',iron_ingot:'Залізний злиток',gold_ingot:'Золотий злиток',
  oak_planks:'Дубові дошки',
  birch_planks:'Березові дошки',
  spruce_planks:'Ялинові дошки',
  jungle_planks:'Тропічні дошки',
  acacia_planks:'Акацієві дошки',
  dark_oak_planks:'Темний дуб',
  mangrove_planks:'Мангрові дошки',
  cherry_planks:'Вишневі дошки',
  bamboo_planks:'Бамбукові дошки',
  oak_log:'Дубова колода',
  birch_log:'Березова колода',
  spruce_log:'Ялинова колода',
  jungle_log:'Тропічна колода',
  acacia_log:'Акацієва колода',
  dark_oak_log:'Колода темного дуба',
  mangrove_log:'Мангрова колода',
  cherry_log:'Вишнева колода',
  oak_leaves:'Дубове листя',
  birch_leaves:'Березове листя',
  spruce_leaves:'Ялинова хвоя',
  jungle_leaves:'Тропічне листя',
  azalea_leaves:'Листя азалії',
  cobblestone:'Бруківка',
  mossy_cobblestone:'Мохова бруківка',
  stone_bricks:"Кам'яна цегла",
  cracked_stone_bricks:'Тріщинувата цегла',
  mossy_stone_bricks:"Мохова кам'яна цегла",
  granite:'Граніт',
  diorite:'Діорит',
  andesite:'Андезит',
  deepslate:'Глибинний сланець',
  cobbled_deepslate:'Бита глибинна порода',
  tuff:'Туф',
  calcite:'Кальцит',
  dripstone:'Натічний камінь',
  amethyst:'Аметист',
  clay:'Глина',
  mud:'Багнюка',
  packed_mud:'Утрамбована багнюка',
  terracotta:'Теракота',
  white_terracotta:'Біла теракота',
  red_sand:'Червоний пісок',
  gravel:'Гравій',
  moss:'Мох',
  podzol:'Підзол',
  mycelium:'Міцелій',
  glass:'Скло',
  glass_tinted:'Тоноване скло',
  bricks:'Цегла',
  stone_bricks_slab:"Кам'яна плита",
  bookshelf:'Книжкова шафа',
  crafting_table:'Верстак',
  furnace:'Піч',
  chest:'Скриня',
  barrel:'Бочка',
  lantern:'Ліхтар',
  glowstone:'Світлокамінь',
  sea_lantern:'Морський ліхтар',
  white_wool:'Біла вовна',
  orange_wool:'Помаранчева вовна',
  magenta_wool:'Пурпурова вовна',
  light_blue_wool:'Блакитна вовна',
  yellow_wool:'Жовта вовна',
  lime_wool:'Лаймова вовна',
  pink_wool:'Рожева вовна',
  gray_wool:'Сіра вовна',
  light_gray_wool:'Світло-сіра вовна',
  cyan_wool:'Бірюзова вовна',
  purple_wool:'Фіолетова вовна',
  blue_wool:'Синя вовна',
  brown_wool:'Коричнева вовна',
  green_wool:'Зелена вовна',
  red_wool:'Червона вовна',
  black_wool:'Чорна вовна',  white_concrete:'Білий бетон',
  orange_concrete:'Помаранчевий бетон',
  magenta_concrete:'Пурпуровий бетон',
  light_blue_concrete:'Блакитний бетон',
  yellow_concrete:'Жовтий бетон',
  lime_concrete:'Лаймовий бетон',
  pink_concrete:'Рожевий бетон',
  gray_concrete:'Сірий бетон',
  cyan_concrete:'Бірюзовий бетон',
  purple_concrete:'Фіолетовий бетон',
  blue_concrete:'Синій бетон',
  brown_concrete:'Коричневий бетон',
  green_concrete:'Зелений бетон',
  red_concrete:'Червоний бетон',
  black_concrete:'Чорний бетон',
  obsidian:'Обсидіан',
  crying_obsidian:'Плакучий обсидіан',
  netherrack:'Пекельний камінь',
  soul_sand:'Пісок душ',
  soul_soil:'Ґрунт душ',
  nether_bricks:'Пекельна цегла',
  basalt:'Базальт',
  blackstone:'Чорнокамінь',
  end_stone:'Камінь Краю',
  purpur_block:'Пурпуровий блок',
  prismarine:'Призмарин',
  dark_prismarine:'Темний призмарин',
  sponge:'Губка',
  hay_bale:'Тюк сіна',
  pumpkin:'Гарбуз',
  melon:'Кавун',
  copper_block:'Мідний блок',
  iron_block:'Залізний блок',
  gold_block:'Золотий блок',
  diamond_block:'Алмазний блок',
  emerald_block:'Смарагдовий блок',
  lapis_block:'Лазуритовий блок',
  redstone_block:'Редстоуновий блок',
  coal_block:'Вугільний блок'
};
const recipes = [
  {id:'plank',label:'Дошки ×4',cost:{wood:1},give:4},
  {id:'stick',label:'Палиці ×4',cost:{plank:2},give:4},
  {id:'torch',label:'Смолоскип ×2',cost:{stick:1,ore:1},give:2},
  {id:'pickaxe',label:'Кам’яна кирка',cost:{stick:2,stone:3},give:1},
  {id:'axe',label:'Кам’яна сокира',cost:{stick:2,stone:2},give:1},
  {id:'wood_sword',label:'Дерев’яний меч',cost:{stick:1,plank:2},give:1},
  {id:'stone_sword',label:'Кам’яний меч',cost:{stick:1,stone:2},give:1},
  {id:'iron_sword',label:'Залізний меч',cost:{stick:1,iron_ingot:2},give:1},
  {id:'chest',label:'Скриня',cost:{plank:8},give:1},
  {id:'leather_armor',label:'Шкіряна броня',cost:{leather:4,iron_ingot:1},give:1},
  {id:'dragon_armor',label:'Драконяча броня',cost:{dragon_scale:4,iron_ingot:4},give:1},
  {id:'shelter',label:'Похідне укриття',cost:{wood:5,plank:4},give:1},
  {id:'campfire',label:'Багаття',cost:{wood:3,stone:2},give:1},
  {id:'cooked_meat',label:'Смажене м’ясо',cost:{meat:1,coal:1},give:1},
  {id:'fishingrod',label:'Вудка',cost:{stick:3,plank:2},give:1},
  {id:'bow',label:'Лук',cost:{stick:3,plank:2},give:1},
  {id:'arrow',label:'Стріли ×4',cost:{stick:1,bone:1},give:4},
  {id:'ingot',label:'Мідний злиток',cost:{copper:2,coal:1},give:1},
  {id:'iron_ingot',label:'Залізний злиток',cost:{iron:2,coal:1},give:1},
  {id:'gold_ingot',label:'Золотий злиток',cost:{gold:2,coal:1},give:1}
];
const clamp=(n:number)=>Math.max(0,Math.min(100,n));
const key=(x:number,y:number,z:number)=>`${x},${y},${z}`;
const hash=(x:number,z:number)=>{const v=Math.sin(x*127.1+z*311.7)*43758.5453;return v-Math.floor(v);};

function App(){
  const mount=useRef<HTMLDivElement>(null);
  const worldRef=useRef<{breakBlock:()=>void;placeBlock:()=>void;attack:()=>void;jump:()=>void;drink:()=>void;eat:()=>void;save:()=>void;usePortal:()=>void;openChest:()=>boolean}|null>(null);
  const selectedRef=useRef<Kind>('grass');
  const controls=useRef({forward:0,side:0,lookX:0,lookY:0});
  const lookPointer=useRef({x:0,y:0});
  const [selected,setSelected]=useState<Kind>('grass');
  const hotbarItems:Kind[]=['grass','dirt','stone','wood','sand','snow','copper','iron','gold'];
  const [bag,setBag]=useState<Bag>({wood:3,stone:2,berry:5,meat:0,plank:0,stick:0,torch:0,ore:0});
  const [stats,setStats]=useState<Stats>({health:100,hunger:86,thirst:90,stamina:100,day:1,hour:8,weather:'Ясно'});
  const [notice,setNotice]=useState('Збери ресурси та побудуй укриття до ночі');
  const [portalNearby,setPortalNearby]=useState(false);
  const [bossHealth,setBossHealth]=useState<number|null>(null);
  const [panel,setPanel]=useState<'none'|'bag'|'craft'|'map'|'chest'>('none');
  const [chestStorage,setChestStorage]=useState<Record<string,Bag>>({});
  const chestRef=useRef(chestStorage);chestRef.current=chestStorage;
  const [activeChest,setActiveChest]=useState<string|null>(null);
  const [mode,setMode]=useState<'survival'|'creative'>('survival');
  const [broken,setBroken]=useState(0);
  const [dimension,setDimension]=useState<'overworld'|'nether'|'end'|'sky'|'ocean'>('overworld');
  const dimensionNames={overworld:'Звичайний світ',nether:'Незер',end:'Край',sky:'Небесні острови',ocean:'Глибокий океан'} as const;
  const storageKey=dimension==='overworld'?STORE:`${STORE}:${dimension}`;
  const [worldSeed,setWorldSeed]=useState(()=>{try{const saved=JSON.parse(localStorage.getItem(STORE)||'null');return Number.isFinite(saved?.worldSeed)?saved.worldSeed:Math.floor(Math.random()*999999);}catch{return Math.floor(Math.random()*999999);}});
  const [worldRevision,setWorldRevision]=useState(0);
  const worldBlocksRef=useRef<Block[]>([]);
  const savedBlocksRef=useRef<Block[]|null>(null);
  const playerPositionRef=useRef({x:0,y:2.1,z:8});
  const bagRef=useRef(bag); bagRef.current=bag;
  const statsRef=useRef(stats); statsRef.current=stats;
  const addItem=useCallback((item:string,n:number)=>{const next=addItemToBag(bagRef.current,item,n);bagRef.current=next;setBag(next);},[]);
  const consume=useCallback((item:string,n:number)=>{const result=consumeItemFromBag(bagRef.current,item,n);if(!result.consumed)return false;bagRef.current=result.bag;setBag(result.bag);return true;},[]);
  const craft=useCallback((r:typeof recipes[number])=>{
    const result=craftItemInBag(bagRef.current,r.cost,r.id,r.give);
    if(!result.crafted){setNotice('Не вистачає матеріалів для крафту');return;}
    bagRef.current=result.bag;setBag(result.bag);setNotice('Створено: '+r.label);
  },[]);
  const eat=useCallback(()=>{
    const food=consume('cooked_meat',1)?'cooked_meat':consume('meat',1)?'meat':consume('berry',1)?'berry':null;
    if(!food){setNotice('Немає їжі в рюкзаку');return;}
    const nutrition=food==='cooked_meat'?48:food==='meat'?30:22;
    const healing=food==='cooked_meat'?9:food==='meat'?4:2;
    setStats(s=>({...s,hunger:clamp(s.hunger+nutrition),health:clamp(s.health+healing)}));
    setNotice(food==='cooked_meat'?'Смажене м’ясо відновило сили!':food==='meat'?'Ти з’їв сире м’ясо':'Ти з’їв ягоди');
  },[consume]);
  const drink=useCallback(()=>{setStats(s=>({...s,thirst:clamp(s.thirst+35)}));setNotice('Ти напився води');},[]);
  const save=useCallback(()=>{try{const data={bag:bagRef.current,stats:statsRef.current,worldSeed,mode,broken,blocks:worldBlocksRef.current,playerPosition:playerPositionRef.current,chestStorage:chestRef.current};localStorage.setItem(storageKey,JSON.stringify(data));localStorage.setItem(PLAYER_STORE,JSON.stringify({bag:bagRef.current,stats:statsRef.current,mode}));setNotice('Світ та всі зміни збережено на цьому пристрої');}catch{setNotice('Не вдалося зберегти світ');}},[worldSeed,mode,broken,storageKey]);
  const load=useCallback(()=>{try{const raw=localStorage.getItem(storageKey);if(!raw){setNotice('Збереження ще немає');return;}const d=JSON.parse(raw);const profile=JSON.parse(localStorage.getItem(PLAYER_STORE)||'null');if(profile?.bag)setBag(profile.bag);else if(d.bag)setBag(d.bag);if(profile?.stats)setStats(profile.stats);else if(d.stats)setStats(d.stats);if(profile?.mode)setMode(profile.mode);else if(d.mode)setMode(d.mode);if(Array.isArray(d.blocks))savedBlocksRef.current=d.blocks;chestRef.current=d.chestStorage&&typeof d.chestStorage==='object'?d.chestStorage:{};setChestStorage(chestRef.current);if(d.playerPosition&&[d.playerPosition.x,d.playerPosition.y,d.playerPosition.z].every(Number.isFinite))playerPositionRef.current={x:d.playerPosition.x,y:d.playerPosition.y,z:d.playerPosition.z};setBroken(d.broken||0);setWorldRevision(v=>v+1);setNotice('Світ, побудовані блоки та інвентар відновлено');}catch{setNotice('Помилка читання збереження');}},[storageKey]);
  const switchDimension=useCallback((next:'overworld'|'nether'|'end'|'sky'|'ocean')=>{
    if(next===dimension)return;
    try{localStorage.setItem(storageKey,JSON.stringify({bag:bagRef.current,stats:statsRef.current,worldSeed,mode,broken,blocks:worldBlocksRef.current,playerPosition:playerPositionRef.current,chestStorage:chestRef.current}));}catch{}
    const nextKey=next==='overworld'?STORE:`${STORE}:${next}`;let saved:any=null;try{saved=JSON.parse(localStorage.getItem(nextKey)||'null');}catch{}
    if(saved){chestRef.current=saved.chestStorage&&typeof saved.chestStorage==='object'?saved.chestStorage:{};setChestStorage(chestRef.current);savedBlocksRef.current=Array.isArray(saved.blocks)?saved.blocks:null;if(saved.playerPosition&&[saved.playerPosition.x,saved.playerPosition.y,saved.playerPosition.z].every(Number.isFinite))playerPositionRef.current=saved.playerPosition;setBroken(saved.broken||0);setWorldSeed(Number.isFinite(saved.worldSeed)?saved.worldSeed:Math.floor(Math.random()*999999));}
    else{chestRef.current={};setChestStorage({});savedBlocksRef.current=null;worldBlocksRef.current=[];playerPositionRef.current={x:0,y:2.1,z:8};setBroken(0);setWorldSeed(Math.floor(Math.random()*999999));}
    setPanel('none');setActiveChest(null);setDimension(next);setWorldRevision(v=>v+1);setNotice('Вимір: '+dimensionNames[next]);
  },[dimension,storageKey,worldSeed,mode,broken]);
  useEffect(()=>{const timer=window.setInterval(()=>setStats(s=>{const h=(s.hour+0.035)%24;const day=s.day+(h<s.hour?1:0);const hungry=mode==='creative'?s.hunger:clamp(s.hunger-0.11);const thirsty=mode==='creative'?s.thirst:clamp(s.thirst-0.16);let health=s.health;if(mode==='survival'&&(hungry===0||thirsty===0))health=clamp(health-0.6);return {...s,hour:h,day,hunger:hungry,thirst:thirsty,health,stamina:clamp(s.stamina+0.5),weather:Math.floor(h*10)%37===0?'Дощ':(Math.floor(h*10)%37===1?'Хмарно':s.weather)};}),1000);return()=>clearInterval(timer);},[mode]);
  useEffect(()=>{const persist=()=>{try{localStorage.setItem(storageKey,JSON.stringify({bag:bagRef.current,stats:statsRef.current,worldSeed,mode,broken,blocks:worldBlocksRef.current,playerPosition:playerPositionRef.current,chestStorage:chestRef.current}));localStorage.setItem(PLAYER_STORE,JSON.stringify({bag:bagRef.current,stats:statsRef.current,mode}));}catch{}};const timer=window.setInterval(persist,5000);window.addEventListener('pagehide',persist);return()=>{clearInterval(timer);window.removeEventListener('pagehide',persist);};},[worldSeed,mode,broken,storageKey]);

  useEffect(()=>{
    const host=mount.current;if(!host)return;
    setBossHealth(dimension==='end'?240:null);
    const scene=new THREE.Scene();const skyColor=dimension==='nether'?0x542522:dimension==='end'?0x171323:dimension==='sky'?0x9bd8f2:dimension==='ocean'?0x367fa8:0x8cc9f1;scene.background=new THREE.Color(skyColor);scene.fog=new THREE.Fog(skyColor,25,76);
    const camera=new THREE.PerspectiveCamera(72,host.clientWidth/host.clientHeight,.1,150);camera.position.set(playerPositionRef.current.x,playerPositionRef.current.y,playerPositionRef.current.z);
    const renderer=new THREE.WebGLRenderer({antialias:false,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.4));renderer.setSize(host.clientWidth,host.clientHeight);host.appendChild(renderer.domElement);
    const hemi=new THREE.HemisphereLight(0xffffff,0x66734b,1.7);scene.add(hemi);
    const sun=new THREE.DirectionalLight(0xfff0d2,1.8);sun.position.set(-15,28,12);scene.add(sun);
    const mats:Record<Kind,THREE.MeshStandardMaterial>={
      grass:new THREE.MeshStandardMaterial({color:0x68a944}),dirt:new THREE.MeshStandardMaterial({color:0x805331}),
      stone:new THREE.MeshStandardMaterial({color:0x858b91}),wood:new THREE.MeshStandardMaterial({color:0x986235}),
      leaf:new THREE.MeshStandardMaterial({color:0x347b37}),sand:new THREE.MeshStandardMaterial({color:0xd7c17b}),
      snow:new THREE.MeshStandardMaterial({color:0xe8f4f5}),water:new THREE.MeshStandardMaterial({color:0x329bd1,transparent:true,opacity:.78}),
      cactus:new THREE.MeshStandardMaterial({color:0x2e8b57}),ore:new THREE.MeshStandardMaterial({color:0x8b9aa7}),copper:new THREE.MeshStandardMaterial({color:0xb87333}),iron:new THREE.MeshStandardMaterial({color:0xaab2bd}),gold:new THREE.MeshStandardMaterial({color:0xf5c542}),crystal:new THREE.MeshStandardMaterial({color:0x65e5ee,emissive:0x164f5a}),coal:new THREE.MeshStandardMaterial({color:0x292d33})
    };
    extraBlockCatalog.forEach(info=>{mats[info[0]]=new THREE.MeshStandardMaterial({color:info[2]});});
    const cube=new THREE.BoxGeometry(1,1,1);const blocks=new Map<string,{mesh:THREE.Mesh;block:Block}>();
    const add=(b:Block)=>{const m=new THREE.Mesh(cube,mats[b.kind]);m.position.set(b.x,b.y,b.z);m.castShadow=false;m.receiveShadow=false;scene.add(m);blocks.set(key(b.x,b.y,b.z),{mesh:m,block:b});};
    const terrain=(x:number,z:number)=>{
      const d=Math.sqrt(x*x+z*z), wave=Math.sin(x*.22)*1.7+Math.cos(z*.19)*1.4+Math.sin((x+z)*.12)*1.2;
      const h=Math.floor(wave+(d>14?Math.sin(x*.43)*Math.cos(z*.37)*3:0));
      const desert=(hash(x+worldSeed,z)>.5&&x>8&&z>5), snowy=(x<-10&&z<-6), beach=d>15&&h<=-1;
      if(dimension==='nether')return {h:h-1,top:'netherrack',biome:'nether'};
      if(dimension==='end')return {h:Math.floor(wave*.55),top:'end_stone',biome:'end'};
      if(dimension==='ocean')return {h:Math.min(-2,h-3),top:'sand',biome:'ocean'};
      return {h:dimension==='sky'?h+8:h,top:desert||beach?'sand':snowy?'snow':'grass',biome:dimension==='sky'?'sky':desert?'desert':snowy?'tundra':d>14?'highland':'forest'};
    };
    for(let x=-23;x<=23;x++)for(let z=-23;z<=23;z++){
      if(dimension==='sky'&&Math.sqrt(x*x+z*z)>5&&hash(x+worldSeed,z-worldSeed)<.28)continue;
      const t=terrain(x,z);
      if(t.h < -1){const w=new THREE.Mesh(new THREE.BoxGeometry(1,.18,1),mats.water);w.position.set(x,-.42,z);scene.add(w);}
      add({x,y:t.h,z,kind:t.top as Kind});
      if(t.h>=-1){add({x,y:t.h-1,z,kind:'dirt'});add({x,y:t.h-2,z,kind:'stone'});}
      if(hash(x+worldSeed,z+99)>.985&&Math.abs(x)+Math.abs(z)>5&&t.top==='grass'){
        for(let y=1;y<=3;y++)add({x,y:t.h+y,z,kind:'wood'});
        for(let dx=-2;dx<=2;dx++)for(let dz=-2;dz<=2;dz++)for(let dy=2;dy<=4;dy++)if(Math.abs(dx)+Math.abs(dz)+Math.abs(dy-3)<5)add({x:x+dx,y:t.h+dy,z:z+dz,kind:'leaf'});
      }
      if(t.biome==='desert'&&hash(x+42,z+12)>.94){for(let y=1;y<=2;y++)add({x,y:t.h+y,z,kind:'cactus'});}
      if(hash(x+5,z+worldSeed)>.992&&t.h<2)add({x,y:t.h+1,z,kind:'ore'});
      const mineral=hash(x+worldSeed*2,z-77);
      if(mineral>.997&&t.h<1)add({x,y:t.h-2,z,kind:'gold'});
      else if(mineral>.989&&t.h<1)add({x,y:t.h-2,z,kind:'crystal'});
      else if(mineral>.974&&t.h<1)add({x,y:t.h-2,z,kind:'iron'});
      else if(mineral>.956&&t.h<1)add({x,y:t.h-2,z,kind:'copper'});
      else if(mineral>.935&&t.h<1)add({x,y:t.h-2,z,kind:'coal'});
    }
    // A rocky cave mouth and a small starting camp.
    for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){const p=terrain(x+15,z-13);if(x===-2||x===2||z===-2||z===2)add({x:x+15,y:p.h+1,z:z-13,kind:'stone'});}
    const camp=new THREE.Group();const tentMat=new THREE.MeshStandardMaterial({color:0xb98a54});const tent=new THREE.Mesh(new THREE.ConeGeometry(2,2.6,4),tentMat);tent.position.set(2,1.2,2);camp.add(tent);camp.position.set(0,0,0);scene.add(camp);
    if(savedBlocksRef.current){blocks.forEach(v=>scene.remove(v.mesh));blocks.clear();savedBlocksRef.current.forEach(add);savedBlocksRef.current=null;}
    worldBlocksRef.current=Array.from(blocks.values()).map(v=>v.block);
    const portalBase=terrain(0,-12).h+1;
    const portal=new THREE.Group();portal.position.set(0,portalBase,-12);scene.add(portal);
    const obsidian=new THREE.MeshStandardMaterial({color:0x211936,roughness:.72});
    const frameParts=[[-1.12,1.55,0,.42,3.35,.5],[1.12,1.55,0,.42,3.35,.5],[0,3.02,0,2.65,.42,.5],[0,.08,0,2.65,.42,.5]];
    frameParts.forEach(([x,y,z,w,h,d])=>{const part=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),obsidian);part.position.set(x,y,z);portal.add(part);});
    const portalSurface=new THREE.Mesh(new THREE.PlaneGeometry(1.85,2.75),new THREE.MeshBasicMaterial({color:dimension==='overworld'?0x8b42d6:0x5b37c8,transparent:true,opacity:.72,side:THREE.DoubleSide}));portalSurface.position.set(0,1.58,.03);portal.add(portalSurface);
    const portalLight=new THREE.PointLight(dimension==='overworld'?0x9d58ff:0x5b8cff,1.5,7);portalLight.position.set(0,1.5,1);portal.add(portalLight);
    const ray=new THREE.Raycaster();const center=new THREE.Vector2(0,0);
    const target=()=>{ray.setFromCamera(center,camera);const hit=ray.intersectObjects([...blocks.values()].map(v=>v.mesh));return hit.find(h=>h.distance<7);};
    const breakBlock=()=>{const h=target();if(!h){setNotice('Підійди ближче до ресурсу');return;}const m=h.object as THREE.Mesh;const p=m.position;const k=key(Math.round(p.x),Math.round(p.y),Math.round(p.z));const b=blocks.get(k)?.block;if(!b)return;if(b.kind==='chest'){const result=breakChestContents(bagRef.current,chestRef.current,k);bagRef.current=result.bag;setBag(result.bag);chestRef.current=result.chestStorage;setChestStorage(result.chestStorage);setActiveChest(null);setPanel('none');}if(mode==='survival'&&(b.kind==='wood'||b.kind.endsWith('_log'))&&!bagRef.current.axe){setNotice('Для швидкого добування колод потрібна сокира');return;}if(mode==='survival'&&['ore','copper','iron','gold','crystal','coal'].includes(b.kind)&&!bagRef.current.pickaxe){setNotice('Для добування руди потрібна кирка');return;}scene.remove(m);blocks.delete(k);const loot=b.kind==='leaf'||b.kind.endsWith('_leaves')?(Math.random()>.55?'berry':'wood'):b.kind==='grass'?'dirt':b.kind==='ore'?'ore':b.kind==='cactus'?'wood':b.kind.endsWith('_log')?'wood':b.kind;addItem(loot,1);worldBlocksRef.current=Array.from(blocks.values()).map(v=>v.block);setBroken(v=>v+1);setNotice('Здобуто: '+(names[loot]||loot));};
    const placeBlock=()=>{const h=target();if(!h){setNotice('Наведи приціл на блок');return;}const m=h.object as THREE.Mesh;const n=h.face?.normal.clone().transformDirection(m.matrixWorld)||new THREE.Vector3(0,1,0);const p=m.position.clone().add(n).round();if(blocks.has(key(p.x,p.y,p.z)))return;const kind=selectedRef.current;if(mode==='survival'&&!consume(kind,1)){setNotice('Немає цього блока в рюкзаку');return;}add({x:p.x,y:p.y,z:p.z,kind});worldBlocksRef.current=Array.from(blocks.values()).map(v=>v.block);setNotice('Блок встановлено');};
    const openChest=()=>{const h=target();if(!h){setNotice('Наведи приціл на скриню та натисни E');return false;}const m=h.object as THREE.Mesh;const p=m.position;const k=key(Math.round(p.x),Math.round(p.y),Math.round(p.z));const block=blocks.get(k)?.block;if(block?.kind!=='chest'){setNotice('Дивись прямо на встановлену скриню');return false;}setActiveChest(k);setPanel('chest');setNotice('Скриню відкрито');return true;};
    const attack=()=>{
      if(mode==='survival'&&statsRef.current.stamina<8){setNotice('Замало витривалості для атаки');return;}
      const forward=new THREE.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));
      const ranged=!!bagRef.current.bow&&(bagRef.current.arrow||0)>0;
      let target:MobActor|undefined,best=ranged?12:3.25;
      for(const actor of mobActors){
        if(!actor.mesh.visible)continue;
        const delta=actor.mesh.position.clone().sub(camera.position);delta.y=0;
        const distance=delta.length();if(distance>best||distance<.01)continue;
        if(delta.normalize().dot(forward)<.35)continue;
        target=actor;best=distance;
      }
      if(!target){setNotice('Поруч немає істоти — наведися на моба та атакуй');return;}
      if(ranged&&!consume('arrow',1)){setNotice('Закінчилися стріли');return;}
      setStats(s=>({...s,stamina:clamp(s.stamina-8)}));
      const weapon=selectWeapon(bagRef.current,ranged);
      const damage=getAttackDamage(bagRef.current,ranged);
      target.hp-=damage;
      if(target.boss)setBossHealth(Math.max(0,target.hp));
      if(!ranged){target.mesh.position.x+=forward.x*.28;target.mesh.position.z+=forward.z*.28;}
      if(target.hp<=0){
        target.mesh.visible=false;target.respawnAt=elapsed+(target.boss?90:18);
        const food=target.boss?3:target.hostile?1:2;
        addItem('meat',food);
        if(target.boss){addItem('dragon_scale',2);addItem('crystal',3);}
        else if(Math.random()>.45)addItem(target.hostile?'bone':'leather',1);
        setNotice(`Перемога над істотою «${target.name}»! Здобуто м'ясо ×${food}${target.boss?' та луску дракона ×2':''}`);
      }else setNotice(`Влучання по «${target.name}» (${names[weapon]||'рукою'})! Здоров'я: ${target.hp}/${target.maxHp}`);
    };
    const jump=()=>{camera.position.y=Math.min(5,camera.position.y+.65);};
    const portalTarget=dimension==='overworld'?'nether':'overworld';
    const usePortal=()=>{if(camera.position.distanceTo(portal.position)>2.8){setNotice('Підійди до порталу та натисни G');return;}switchDimension(portalTarget);};
    worldRef.current={breakBlock,placeBlock,attack,jump,drink,eat,save,usePortal,openChest};
    // Distinct low-poly animals and monsters. Passive creatures provide food; hostile ones hunt at night.
    type MobActor={mesh:THREE.Group;name:string;hp:number;maxHp:number;hostile:boolean;boss:boolean;cooldown:number;respawnAt:number;phase:number};
    const mobBodyGeometry=new THREE.BoxGeometry(.78,.52,.48);
    const mobHeadGeometry=new THREE.BoxGeometry(.42,.42,.42);
    const mobLegGeometry=new THREE.BoxGeometry(.17,.38,.17);
    const mobEyeGeometry=new THREE.BoxGeometry(.09,.09,.05);
    const mobWingGeometry=new THREE.BoxGeometry(.16,.12,1.15);
    const mobGeometries=[mobBodyGeometry,mobHeadGeometry,mobLegGeometry,mobEyeGeometry,mobWingGeometry];
    const mobActors:MobActor[]=[];
    const mobMaterials:THREE.Material[]=[];
    const mobNames=['Корова','Вівця','Свиня','Зомбі','Скелет','Павук','Дракон Краю'];
    const mobColors=[0x79543a,0xe1d8c7,0xd58d9b,0x4b8b55,0x9ca4a8,0x4c3934,0x42205e];
    const hostileEyes=new THREE.MeshStandardMaterial({color:0xff3028,emissive:0x6b0808});
    const passiveEyes=new THREE.MeshStandardMaterial({color:0x181818});
    mobMaterials.push(hostileEyes,passiveEyes);
    for(let i=0;i<(dimension==='end'?7:6);i++){
      const material=new THREE.MeshStandardMaterial({color:mobColors[i],roughness:.86});mobMaterials.push(material);
      const mesh=new THREE.Group();
      const body=new THREE.Mesh(mobBodyGeometry,material);body.position.y=.55;mesh.add(body);
      const head=new THREE.Mesh(mobHeadGeometry,material);head.position.set(0,.91,-.34);mesh.add(head);
      const eyeMaterial=i>=3?hostileEyes:passiveEyes;
      for(const side of [-1,1]){const eye=new THREE.Mesh(mobEyeGeometry,eyeMaterial);eye.position.set(side*.105,.96,-.56);mesh.add(eye);}
      for(const x of [-.23,.23])for(const z of [-.14,.14]){const leg=new THREE.Mesh(mobLegGeometry,material);leg.position.set(x,.2,z);mesh.add(leg);}
      if(i===1)mesh.scale.set(1.12,1.08,1.12);
      if(i===2)mesh.scale.set(.92,.88,.92);
      if(i===5)mesh.scale.set(1.22,.7,1.3);
      if(i===6){mesh.scale.set(2.7,1.8,2.7);for(const side of [-1,1]){const wing=new THREE.Mesh(mobWingGeometry,material);wing.position.set(side*.58,.92,.05);wing.rotation.z=side*.18;mesh.add(wing);}}
      mesh.position.set(i===6?0:(i-2.5)*4,i===6?1.2:.05,i===6?-20:-8-(i%3)*3);
      mesh.traverse(part=>{if(part instanceof THREE.Mesh)part.castShadow=true;});
      scene.add(mesh);
      const maxHp=i===6?240:[50,45,40,70,55,60][i];
      mobActors.push({mesh,name:mobNames[i],hp:maxHp,maxHp,hostile:i>=3,boss:i===6,cooldown:0,respawnAt:0,phase:i*1.7});
    }
    let yaw=0,pitch=0,frame=0,elapsed=0,last=performance.now(),portalNearbyLocal=false,respawning=false;
    const padActionHeld={jump:false,break:false,place:false};
    const onKey=(e:KeyboardEvent,down:boolean)=>{if(down&&e.repeat)return;const v=down?1:0;if(e.code==='KeyW'||e.code==='ArrowUp')controls.current.forward=v;if(e.code==='KeyS'||e.code==='ArrowDown')controls.current.forward=-v;if(e.code==='KeyA'||e.code==='ArrowLeft')controls.current.side=-v;if(e.code==='KeyD'||e.code==='ArrowRight')controls.current.side=v;if(down&&e.code==='Space'){jump();e.preventDefault();}if(down&&e.code==='KeyE'&&!openChest())setPanel(p=>p==='bag'?'none':'bag');if(down&&e.code==='KeyF')attack();if(down&&e.code==='KeyG')usePortal();if(down&&e.code.startsWith('Digit')){const n=Number(e.code.slice(5))-1;if(hotbarItems[n]){selectedRef.current=hotbarItems[n];setSelected(hotbarItems[n]);}}};
    const kd=(e:KeyboardEvent)=>onKey(e,true),ku=(e:KeyboardEvent)=>onKey(e,false);window.addEventListener('keydown',kd);window.addEventListener('keyup',ku);
    const pointer=(e:PointerEvent)=>{if(e.pointerType==='mouse'&&document.pointerLockElement===renderer.domElement){yaw-=e.movementX*.002;pitch-=e.movementY*.002;}};
    const mouseAction=(e:MouseEvent)=>{if(e.button===0)breakBlock();if(e.button===2)placeBlock();};
    const noMenu=(e:Event)=>e.preventDefault();
    renderer.domElement.addEventListener('mousedown',mouseAction);renderer.domElement.addEventListener('contextmenu',noMenu);
    renderer.domElement.addEventListener('click',()=>{if(matchMedia('(pointer:fine)').matches&&document.pointerLockElement!==renderer.domElement)renderer.domElement.requestPointerLock?.();});document.addEventListener('pointermove',pointer);
    const resize=()=>{camera.aspect=host.clientWidth/host.clientHeight;camera.updateProjectionMatrix();renderer.setSize(host.clientWidth,host.clientHeight);};window.addEventListener('resize',resize);
    const animate=()=>{frame=requestAnimationFrame(animate);const now=performance.now();const dt=Math.min(.05,(now-last)/1000);last=now;elapsed+=dt;
      yaw-=controls.current.lookX*.035;pitch-=controls.current.lookY*.035;controls.current.lookX=0;controls.current.lookY=0;
      const pads=navigator.getGamepads?.()||[];const pad=pads[0];if(pad){const dz=.16;const px=Math.abs(pad.axes[0]||0)>dz?pad.axes[0]:0;const py=Math.abs(pad.axes[1]||0)>dz?pad.axes[1]:0;controls.current.side=px;controls.current.forward=-py;yaw-=(pad.axes[2]||0)*dt*2.4;pitch+=(pad.axes[3]||0)*dt*2.1;const jumpHeld=!!pad.buttons[0]?.pressed;const breakHeld=!!pad.buttons[2]?.pressed;const placeHeld=!!pad.buttons[1]?.pressed;if(jumpHeld&&!padActionHeld.jump)worldRef.current?.jump();if(breakHeld&&!padActionHeld.break)worldRef.current?.breakBlock();if(placeHeld&&!padActionHeld.place)worldRef.current?.placeBlock();padActionHeld.jump=jumpHeld;padActionHeld.break=breakHeld;padActionHeld.place=placeHeld;}else{padActionHeld.jump=false;padActionHeld.break=false;padActionHeld.place=false;}pitch=Math.max(-1.2,Math.min(1.2,pitch));camera.rotation.order='YXZ';camera.rotation.y=yaw;camera.rotation.x=pitch;
      const f=new THREE.Vector3(Math.sin(yaw),0,Math.cos(yaw)),r=new THREE.Vector3(f.z,0,-f.x);camera.position.addScaledVector(f,-controls.current.forward*dt*5);camera.position.addScaledVector(r,controls.current.side*dt*5);camera.position.y=Math.max(.7,Math.min(7,camera.position.y));playerPositionRef.current={x:camera.position.x,y:camera.position.y,z:camera.position.z};
      if(mode==='survival'&&statsRef.current.health<=0&&!respawning){respawning=true;camera.position.set(0,2.1,8);playerPositionRef.current={x:0,y:2.1,z:8};setStats(s=>({...s,health:100,hunger:Math.max(30,s.hunger),thirst:Math.max(30,s.thirst),stamina:100}));setNotice('Ти відродився на точці появи. Інвентар збережено');}
      else if(statsRef.current.health>0)respawning=false;
      const nearPortal=camera.position.distanceTo(portal.position)<2.8;if(nearPortal!==portalNearbyLocal){portalNearbyLocal=nearPortal;setPortalNearby(nearPortal);setNotice(nearPortal?'Портал поруч — натисни кнопку порталу або G':'Досліджуй світ та шукай портал');}portalSurface.rotation.y=Math.sin(elapsed*1.8)*.08;portalSurface.material.opacity=.58+Math.sin(elapsed*2.5)*.14;
      const hour=statsRef.current.hour;const night=hour<6||hour>19;const light=night?.28:Math.max(.55,Math.sin((hour-6)/13*Math.PI)*1.4);sun.intensity=light;hemi.intensity=night?.48:1.7;const daySky=dimension==='nether'?0x542522:dimension==='end'?0x171323:dimension==='sky'?0x9bd8f2:dimension==='ocean'?0x367fa8:0x8cc9f1;scene.background!.set(night&&dimension==='overworld'?0x172743:daySky);scene.fog!.color.set(night&&dimension==='overworld'?0x172743:daySky);
      mobActors.forEach((actor)=>{
        const m=actor.mesh;actor.cooldown=Math.max(0,actor.cooldown-dt);
        if(!m.visible){if(elapsed>=actor.respawnAt){m.visible=true;actor.hp=actor.maxHp;if(actor.boss)setBossHealth(actor.maxHp);m.position.set(actor.boss?0:(Math.random()-.5)*18,actor.boss?1.2:.05,actor.boss?-20:-10-Math.random()*12);}return;}
        const dx=camera.position.x-m.position.x,dz=camera.position.z-m.position.z;
        const distance=Math.hypot(dx,dz);
        if(actor.hostile&&(actor.boss||night)&&mode!=='creative'&&distance<(actor.boss?30:15)&&distance>.001){
          const speed=actor.boss?1.05:.72;m.position.x+=(dx/distance)*dt*speed;m.position.z+=(dz/distance)*dt*speed;
          if(distance<(actor.boss?2.5:1.55)&&actor.cooldown<=0){actor.cooldown=actor.boss?2.1:1.35;const damage=getIncomingDamage(bagRef.current,actor.boss);setStats(s=>({...s,health:clamp(s.health-damage)}));setNotice(actor.boss?'Дракон Краю атакує! Ухиляйся та бий мечем ⚔':bagRef.current.dragon_armor?'Драконяча броня поглинула частину шкоди!':bagRef.current.leather_armor?'Броня послабила удар ворога! Відбийся кнопкою ⚔':'На тебе напав ворог! Відбийся кнопкою ⚔');}
        }else{
          m.position.x+=Math.sin(elapsed*.35+actor.phase)*dt*.28;
          m.position.z+=Math.cos(elapsed*.3+actor.phase)*dt*.2;
        }
        m.rotation.y=Math.atan2(dx,dz);
      });
      renderer.render(scene,camera);};
    animate();
    return()=>{cancelAnimationFrame(frame);window.removeEventListener('keydown',kd);window.removeEventListener('keyup',ku);window.removeEventListener('resize',resize);document.removeEventListener('pointermove',pointer);renderer.domElement.removeEventListener('mousedown',mouseAction);renderer.domElement.removeEventListener('contextmenu',noMenu);renderer.dispose();cube.dispose();mobGeometries.forEach(geometry=>geometry.dispose());mobMaterials.forEach(material=>material.dispose());Object.values(mats).forEach(m=>m.dispose());if(host.contains(renderer.domElement))host.removeChild(renderer.domElement);};
  },[worldSeed,dimension,mode,worldRevision,addItem,consume,drink,eat,switchDimension]);

  const move=(axis:'forward'|'side',v:number)=>{controls.current[axis]=v;};
  const joystickStart=(e:React.PointerEvent<HTMLDivElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);joystickMove(e);};
  const joystickMove=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.buttons===0&&e.type==='pointermove')return;const r=e.currentTarget.getBoundingClientRect();const dx=(e.clientX-(r.left+r.width/2))/(r.width*.34);const dy=(e.clientY-(r.top+r.height/2))/(r.height*.34);controls.current.side=Math.max(-1,Math.min(1,dx));controls.current.forward=-Math.max(-1,Math.min(1,dy));};
  const joystickEnd=()=>{controls.current.forward=0;controls.current.side=0;};
  const dragStart=(e:React.PointerEvent<HTMLDivElement>)=>{e.currentTarget.setPointerCapture(e.pointerId);lookPointer.current={x:e.clientX,y:e.clientY};};
  const dragMove=(e:React.PointerEvent<HTMLDivElement>)=>{if(e.buttons===0)return;const dx=e.clientX-lookPointer.current.x;const dy=e.clientY-lookPointer.current.y;lookPointer.current={x:e.clientX,y:e.clientY};controls.current.lookX=dx*.12;controls.current.lookY=dy*.12;};
  const hourLabel=Math.floor(stats.hour).toString().padStart(2,'0')+':'+Math.floor((stats.hour%1)*60).toString().padStart(2,'0');
  return <main className="game-shell survival-game">
    <header className="topbar"><div className="brand"><span className="cube-mark">▦</span><b>BLOCK WORLD</b><small>WILDERNESS SURVIVAL</small></div><div className="top-actions"><span className="day-chip">☀ День {stats.day} · {hourLabel}</span><button className="small-btn" onClick={save}>Зберегти</button><button className="small-btn" onClick={load}>Завантажити</button></div></header>
    <section className="world" ref={mount}>
      <div className="crosshair">+</div><div className="world-tip">{notice}</div><div className="look-zone" onPointerDown={dragStart} onPointerMove={dragMove} onPointerUp={e=>e.currentTarget.releasePointerCapture(e.pointerId)} onPointerCancel={e=>e.currentTarget.releasePointerCapture(e.pointerId)} aria-label="Огляд світу: проведи пальцем" />
      <div className="status-panel"><div>❤ <span>{Math.round(stats.health)}</span><i><em style={{width:stats.health+'%'}}/></i></div><div>🍖 <span>{Math.round(stats.hunger)}</span><i><em style={{width:stats.hunger+'%'}}/></i></div><div>💧 <span>{Math.round(stats.thirst)}</span><i><em style={{width:stats.thirst+'%'}}/></i></div><div>⚡ <span>{Math.round(stats.stamina)}</span><i><em style={{width:stats.stamina+'%'}}/></i></div></div>
      {dimension==='end'&&bossHealth!==null&&<div className="boss-health"><strong>🐉 Дракон Краю</strong><i><em style={{width:Math.max(0,bossHealth/240*100)+'%'}}/></i><small>{bossHealth>0?bossHealth+'/240':'Переможений'}</small></div>}
      {portalNearby&&<button className="portal-touch" aria-label="Перейти через портал" onClick={()=>worldRef.current?.usePortal()}>🌀 Перейти через портал</button>}<div className="mobile-controls"><div className="joystick" onPointerDown={joystickStart} onPointerMove={joystickMove} onPointerUp={joystickEnd} onPointerCancel={joystickEnd}><span className="joystick-knob">●</span></div><div className="action-pad"><button aria-label="Стрибок" onClick={()=>worldRef.current?.jump()}>⬆</button><button aria-label="Зламати блок" onClick={()=>worldRef.current?.breakBlock()}>⛏</button><button aria-label="Поставити блок" onClick={()=>worldRef.current?.placeBlock()}>▣</button><button aria-label="Атака" onClick={()=>worldRef.current?.attack()}>⚔</button><button aria-label="Інвентар або скриня" onClick={()=>{if(!worldRef.current?.openChest())setPanel(p=>p==='bag'?'none':'bag');}}>🎒</button></div></div>
    </section>
    <div className="survival-dock"><div className="dock-actions"><button onClick={()=>setPanel(panel==='bag'?'none':'bag')}>🎒 Рюкзак</button><button onClick={()=>setPanel(panel==='craft'?'none':'craft')}>🛠 Крафт</button><button onClick={()=>setPanel(panel==='map'?'none':'map')}>🧭 Світ</button><button onClick={()=>setMode(m=>m==='survival'?'creative':'survival')}>{mode==='survival'?'Режим: виживання':'Режим: творчий'}</button></div>
      <div className="hotbar">{hotbarItems.map((v,i)=><button key={v} className={selected===v?'active':''} onClick={()=>{selectedRef.current=v;setSelected(v);}}><span className={'swatch '+v}></span><small>{i+1}</small><b>{bag[v]||0}</b></button>)}</div>
    </div>
    {panel!=='none'&&<div className="panel-card"><button className="close-panel" onClick={()=>setPanel('none')}>✕</button>{panel==='chest'?<><h3>📦 Скриня</h3><p>Вміст зберігається окремо для кожної скрині та виміру.</p><div className="inventory-grid">{Object.entries(activeChest?chestStorage[activeChest]||{}:{}).filter(([,v])=>v>0).map(([item,count])=><div className="inventory-slot" key={item}><span>{names[item]||item}</span><b>×{count}</b></div>)}</div><div className="panel-buttons"><button onClick={()=>{if(!activeChest)return;const result=depositBagIntoChest(bagRef.current,chestRef.current[activeChest]||{});const next={...chestRef.current,[activeChest]:result.chest};chestRef.current=next;setChestStorage(next);bagRef.current=result.bag;setBag(result.bag);setNotice('Усі предмети покладено до скрині');}}>Покласти все</button><button onClick={()=>{if(!activeChest)return;const result=withdrawChestToBag(bagRef.current,chestRef.current[activeChest]||{});bagRef.current=result.bag;setBag(result.bag);const next={...chestRef.current,[activeChest]:result.chest};chestRef.current=next;setChestStorage(next);setNotice('Усі предмети забрано зі скрині');}}>Забрати все</button></div></>:panel==='bag'?<><h3>🎒 Інвентар</h3><p className="inventory-hint">27 слотів · вибери предмет або блок із каталогу. У творчому режимі доступні всі блоки без обмежень.</p><div className="inventory-grid">{Array.from({length:27},(_,i)=>Object.entries(bag).filter(([,v])=>v>0)[i]||null).map((entry,i)=><button className="inventory-slot" key={i} onClick={()=>{if(!entry)return;const [item]=entry;if(allBlockKinds.includes(item)){if(mode==='survival'&&!(bag[item]||0)){setNotice('Спочатку здобудь цей блок у світі');return;}selectedRef.current=item;setSelected(item);setNotice('Вибрано: '+(names[item]||item));setPanel('none');}else setNotice((names[item]||item)+' ×'+entry[1]);}}><span>{entry?names[entry[0]]||entry[0]:''}</span><b>{entry?'×'+entry[1]:''}</b></button>)}</div><h4 className="catalog-title">Каталог блоків · {allBlockKinds.length} видів</h4><div className="block-catalog">{allBlockKinds.map(id=><button key={id} className={selected===id?'chosen':''} onClick={()=>{if(mode==='survival'&&!(bag[id]||0)){setNotice('Здобудь '+(names[id]||id)+' перед встановленням');return;}selectedRef.current=id;setSelected(id);setPanel('none');}}><i style={{backgroundColor:`#${(extraBlockCatalog.find(v=>v[0]===id)?.[2]||({grass:0x68a944,dirt:0x805331,stone:0x858b91,wood:0x986235,leaf:0x347b37,sand:0xd7c17b,snow:0xe8f4f5,water:0x329bd1,cactus:0x2e8b57,ore:0x8b9aa7,copper:0xb87333,iron:0xaab2bd,gold:0xf5c542,crystal:0x65e5ee,coal:0x292d33}[id]||0x68a944)).toString(16).padStart(6,'0')}`}}/><span>{names[id]||id}</span><b>{bag[id]||0}</b></button>)}</div><div className="inventory-equipment"><span>Активний слот: {names[selected]||selected}</span><b>×{bag[selected]||0}</b></div><div className="inventory-equipment"><span>Зброя: {bag.iron_sword?'Залізний меч':bag.stone_sword?'Кам’яний меч':bag.wood_sword?'Дерев’яний меч':'Без зброї'}</span><b>Броня: {bag.dragon_armor?'Драконяча':bag.leather_armor?'Шкіряна':'Немає'}</b></div><div className="panel-buttons"><button onClick={()=>worldRef.current?.eat()}>З’їсти їжу</button><button onClick={()=>worldRef.current?.drink()}>Випити води</button></div></>:panel==='craft'?<><h3>🛠 Майстерня</h3><div className="recipe-list">{recipes.map(r=><div key={r.id}><span>{r.label}<small>{Object.entries(r.cost).map(([k,v])=>`${names[k]} ×${v}`).join(' · ')}</small></span><button onClick={()=>craft(r)}>Створити</button></div>)}</div></>:<><h3>🧭 Дослідження світу</h3><p>Досліджуй біоми, добувай ресурси, будуй базу та переживай ніч. Кожен вимір має власну карту, seed, блоки й позицію гравця.</p><div className="dimension-list">{(Object.keys(dimensionNames) as Array<keyof typeof dimensionNames>).map(id=><button key={id} className={dimension===id?'chosen':''} onClick={()=>switchDimension(id)}>{dimensionNames[id]}</button>)}</div><p>Поточний вимір: {dimensionNames[dimension]} · Погода: {stats.weather} · День {stats.day}</p><p>Незер — пекельний камінь; Край — камінь Краю; Небесні острови — розірвані острови; Океан — глибоке морське дно.</p><button className="wide-action" onClick={save}>Зберегти прогрес</button></>}</div>}
    <div className="footnote">ПК: WASD · миша огляд · ЛКМ ламати · ПКМ ставити · E інвентар · 1–9 слоти · Space стрибок · Телефон: лівий джойстик + права зона огляду</div>
  </main>;
}
export default App;