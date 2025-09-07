// techTree.js
import { gameData, update_resource } from './coregame.js';
import { update_unlocks } from './game.js';
// ----------------- Tech Tree -----------------
export const techTree = [
  {
    id:'waterhole',
    name:'Basic Understanding waterstorage',
    desc:'Increase the waterdrops capacity by 25.',
    cost:{water:20},
    prereq:[],
    effect:()=>{
      gameData.resources.water.max += 25;
      document.getElementById("waterBar").max = gameData.resources.water.max; }
  },
  {
    id:'waterhole 2',
    name:'Better Understanding waterstorage',
    desc:'Increase the waterdrops capacity by 50.',
    cost:{water:45},
    prereq:['waterhole'],
    effect:()=>{
      gameData.resources.water.max += 50;
      document.getElementById("waterBar").max = gameData.resources.water.max; }
  },
  {
    id:'waterhole 3',
    name:'Great Understanding waterstorage',
    desc:'Increase the waterdrops capacity by 100.',
    cost:{water:90},
    prereq:['waterhole 2'],
    effect:()=>{
      gameData.resources.water.max += 100;
      document.getElementById("waterBar").max = gameData.resources.water.max; }
  },
  {
    id:'waterhole 4',
    name:'wait an other waterhole',
    desc:'Why is this needed? Increase the waterdrops capacity by 100.',
    cost:{water:190},
    prereq:['waterhole 3'],
    effect:()=>{
      gameData.resources.water.max += 100;
      document.getElementById("waterBar").max = gameData.resources.water.max; }
  },
    {
    id:'woodUnlock',
    name:'What are these brown rods?',
    desc:'Unlock wood collection',
    cost:{water:35},
    prereq:['waterhole','pheromones'],
    effect:()=>{
      gameData.resources.wood.unlocked = true;
      update_unlocks()}
  },
    {
    id:'waterProd 1',
    name:'What if we make bowls of wood',
    desc:'double the speed the ants collect water',
    cost:{water:15,wood:25},
    prereq:['woodUnlock'],
    effect:()=>{
      gameData.resources.water.prodFactor *= 2;
      update_unlocks()}
  },
  {
    id:'pheromones',
    name:'🐜 Basic Understanding of Pheromones',
    desc:'Unlocks the ability to recruit ants.',
    cost:{sugar:5},
    prereq:[],
    effect:()=>{ gameData.ants.recruitAntUnlocked=true; document.getElementById("recruitAntBtn").style.display="inline-block"; }
  },
  {
    id:'breeding',
    name:'🐜 Better Understanding of Pheromones',
    desc:'Unlocks the ability let the ants breed. Only ants with free time breed. the breeding ants cost 1.25 times as much sugar and every pair gains a new ant every 10 seconds',
    cost:{sugar:20},
    prereq:['anthutTech'],
    effect:()=>{ gameData.ants.breedingUnlocked = true;update_unlocks(); }
  },
  
  {
    id:'anthutTech',
    name:'Outside anth Expansion Tech',
    desc:'Allows building Anthill to increase max ants.',
    cost:{sugar:20, wood:10},
    prereq:['pheromones','woodUnlock'],
    effect:()=>{ gameData.buildings.anthutUnlocked = true,update_unlocks(); }
  }
];
export function initTechTree(){ updateTechs(); }

export function updateTechs(){
  const availableDiv = document.getElementById("availableTechs");
  const purchasedDiv = document.getElementById("purchasedTechs");
  availableDiv.innerHTML = "";
  purchasedDiv.innerHTML = "";

  techTree.forEach(tech=>{
    const prereqMet = tech.prereq.every(p=>gameData.research[p]);
    const purchased = !!gameData.research[tech.id];

    const btn = document.createElement("button");
    btn.className = "tech-btn";
    btn.innerText = tech.name;

    const tooltip = document.createElement("div");
    tooltip.className = "tooltip";
    let costText = Object.entries(tech.cost).map(([res,val])=>`${val} ${res}`).join("\n");
    tooltip.innerText = `${tech.desc}\nCost:\n${costText}`;
    btn.appendChild(tooltip);

    if (purchased) {
      btn.disabled = true;
      btn.style.background = "#cfc";
      purchasedDiv.appendChild(btn);
    } else if (prereqMet) {
      btn.onclick = () => buyTech(tech.id);
      availableDiv.appendChild(btn);
    }
  });
}

export function buyTech(id){
  const tech = techTree.find(t=>t.id===id);
  if(!tech) return;

  if(tech.prereq.some(p=>!gameData.research[p])) return alert("Prerequisite not met!");

  for(let res in tech.cost){
    if(gameData.resources[res].amount < tech.cost[res]){
      return alert(`Not enough ${res}!`);
    }
  }

  for(let res in tech.cost){ gameData.resources[res].amount -= tech.cost[res]; }

  gameData.research[tech.id] = true;
  tech.effect();
  updateTechs()
  update_resource();
}