// techTree.js
import { gameData, update_resource, update_resourcesUI } from './coregame.js';
import { update_unlocks,buildResourceUI,buildAntUI } from './game.js';
// ----------------- Tech Tree -----------------
export const techTree = [
  {
    id:'sugar',
    name:'start searching for sugar',
    desc:'unlock the abilty to search for sugar',
    cost:{water:20},
    prereq:[],
    effect:()=>{
      gameData.resources.sugar.unlocked = true;
      update_unlocks();
      update_resourcesUI(); }
  },
  {
    id:'waterhole',
    name:'Basic Understanding waterstorage',
    desc:'Increase the water capacity by 25.',
    cost:{water:20},
    prereq:['sugar'],
    effect:()=>{
      gameData.resources.water.max += 25;
      update_resourcesUI(); }
  },
  {
    id:'waterhole 2',
    name:'Better Understanding waterstorage',
    desc:'Increase the water capacity by 50.',
    cost:{water:45},
    prereq:['waterhole'],
    effect:()=>{
      gameData.resources.water.max += 50;
      update_resourcesUI(); }
  },
  {
    id:'waterhole 3',
    name:'Great Understanding waterstorage',
    desc:'Increase the water capacity by 100.',
    cost:{water:90},
    prereq:['waterhole 2'],
    effect:()=>{
      gameData.resources.water.max += 100;
      update_resourcesUI(); }
  },
  {
    id:'waterhole 4',
    name:'wait an other waterhole',
    desc:'Why is this needed? \n Increase the waterdrops capacity by 100.',
    cost:{water:190},
    prereq:['waterhole 3'],
    effect:()=>{
      gameData.resources.water.max += 100;
      update_resourcesUI(); }
  },
    {
    id:'woodUnlock',
    name:'What are these brown rods?',
    desc:'Unlock wood collection',
    cost:{water:35},
    prereq:['waterhole','pheromones'],
    effect:()=>{
      gameData.resources.wood.unlocked = true;
      update_unlocks();
      update_resourcesUI();
      }
  },
    {
    id:'waterProd 1',
    name:'What if we make bowls of wood',
    desc:'inceases the speed the ants collect water by 20%',
    cost:{water:15,wood:25},
    prereq:['woodUnlock'],
    effect:()=>{
      gameData.resources.water.prodFactor *= 1.2;
      update_resourcesUI()}
  },
  {
    id:'pheromones',
    name:'🐜 Basic Understanding of Pheromones',
    desc:'Unlocks the ability to recruit ants.',
    cost:{sugar:5},
    prereq:['sugar'],
    effect:()=>{ gameData.ants.recruitAntUnlocked=true; document.getElementById("recruitAntBtn").style.display="inline-block"; }
  },
  {
    id:'breeding',
    name:'🐜 Better Understanding of Pheromones',
    desc:'Unlocks the ability let the ants breed. Only ants with free time breed. the breeding ants cost 1.25 times as much sugar and every pair gains a new ant every 10 seconds',
    cost:{sugar:20},
    prereq:['anthutTech'],
    effect:()=>{ gameData.ants.breedingUnlocked = true;
      buildAntUI();
      update_resourcesUI(); }
  },
  
  {
    id:'anthutTech',
    name:'Outside home for ants',
    desc:'Allows building Anthill to increase max ants.',
    cost:{sugar:20, wood:10},
    prereq:['pheromones','woodUnlock'],
    effect:()=>{ gameData.buildings.anthut.unlocked = true;
      update_unlocks();
      update_resourcesUI();
     }
  },
  {
  id: 'lumberjackUnlock',
  name: 'the termite life',
  desc: 'Unlock the ability to create lumber. Only ants assigned as Lumberjacks ants can produce this resource.',
  cost: { wood: 25 },
  prereq: ['woodUnlock'],
  effect: () => {
    gameData.resources.lumber.unlocked = true;
    gameData.buildings.lumbermill.unlocked = true;
    buildResourceUI()
    update_unlocks();}
  },
  {
    id:'cheaperSugar',
    name:'building a bridge to a closer sugar source',
    desc:'decreases the cost of sugar by 1 water',
    cost:{lumber:10},
    prereq:['lumberjackUnlock'],
    effect:()=>{ gameData.resources.sugar.cost = {water:gameData.resources.sugar.cost['water']-1},update_unlocks(); }
  },
  {
    id:'scienceAnt',
    name:'Its time to think',
    desc:'unlock scolar ant and desks. assinged scolar ants produces 1 science every 10 seconds for 3 sugar',
    cost:{water:120},
    prereq:['waterProd 1','lumberjackUnlock','waterhole 2'],
    effect:()=>{ 
      gameData.resources.science.unlocked = true,
      gameData.buildings.desk.unlocked = true,
      update_unlocks(); }
  },
  {
  id: 'storageroomUnlock',
  name: 'Storageroom',
  desc: 'Unlock the ability to build a storageroom',
  cost: { science: 50 },
  prereq: ['scienceAnt'],
  effect: () => {
    gameData.buildings.storageroom.unlocked = true;
    buildResourceUI();
    update_unlocks();}
  },
  {
  id: 'sacrificeAltar 1',
  name: 'Ritual sacrifice',
  desc: 'Unlock the ability to sacrifice to gain a bit of blood',
  cost: { science: 50 },
  prereq: ['scienceAnt','breeding'], 
  effect: () => {
    gameData.sacrifice.unlocked = true;
    gameData.resources.blood.unlocked = true;
    buildResourceUI();
    update_unlocks();}
  },
  {
  id: 'sacrificeFish 1',
  name: 'sacrifice to the Fish',
  desc: 'Unlock the sacrifice to the fish',
  cost: { science: 50 },
  prereq: ['sacrificeAltar 1'], 
  effect: () => {
    gameData.sacrifice.fish.unlocked = true;
    buildResourceUI();
    update_unlocks();}
  },

  {
  id: 'bloodpit 1',
  name: 'What to do with all the blood',
  desc: 'convert 100 waterStorage to 15 blood Storage',
  cost: { science: 50 },
  prereq: ['sacrificeAltar 1'], 
  effect: () => {
    gameData.resources.water.max = gameData.resources.water.max - 100;
    gameData.resources.water.amount = Math.min(gameData.resources.water.amount, gameData.resources.water.max);
    gameData.resources.blood.max += 15
    buildResourceUI();
    update_unlocks();}
  },
  
];
export function initTechTree(){ updateTechs(); }

export function updateTechs() {
  const availableDiv = document.getElementById("availableTechs");
  const purchasedDiv = document.getElementById("purchasedTechs");
  availableDiv.innerHTML = "";
  purchasedDiv.innerHTML = "";

  techTree.forEach(tech => {
    const prereqMet = tech.prereq.every(p => gameData.research[p]);
    const purchased = !!gameData.research[tech.id];

    // Create tooltip container
    const tooltipWrapper = document.createElement("div");
    tooltipWrapper.className = "tooltip";

    // Create the button
    const btn = document.createElement("button");
    btn.className = "tech-btn";
    btn.innerText = tech.name;

    // Tooltip span
    const tooltip = document.createElement("span");
    tooltip.className = "tooltiptext";
    let costText = Object.entries(tech.cost)
      .map(([res, val]) => `${val} ${res}`)
      .join("\n");
    tooltip.innerText = `${tech.desc}\nCost:\n${costText}`;

    // Append button and tooltip to wrapper
    tooltipWrapper.appendChild(btn);
    tooltipWrapper.appendChild(tooltip);

    // Append to the right container
    if (purchased) {
      btn.disabled = true;
      btn.style.background = "#cfc";
      purchasedDiv.appendChild(tooltipWrapper);
    } else if (prereqMet) {
      btn.onclick = () => buyTech(tech.id);
      availableDiv.appendChild(tooltipWrapper);
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