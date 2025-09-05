// ----------------- Game Data -----------------

function getDefaultGameData() {
  return {
    water: 0,waterStorageMax: 25,waterProdFactor:1,
    wood: 0,woodStorageMax: 25,woodUnlocked: false,woodCost: 2,
    sugar: 0,sugarStorageMax: 25,sugarUnlocked: false,sugarCost: 5,
    recruitAntUnlocked:false,maxAnts: 10,assignedAnts: { free: 0, water: 0, wood: 0, sugar: 0 },
    anthutUnlocked: false,anthutLevel: 0,anthutBaseCost: 10,anthutCostMultiplier: 1.25,anthutResidens:2,
    research: {}
  };
}
let gameData = getDefaultGameData()

// ----------------- Tech Tree -----------------
const techTree = [
  {
    id:'waterhole',
    name:'Basic Understanding waterstorage',
    desc:'Increase the waterdrops capacity by 2.',
    cost:{water:20},
    prereq:[],
    effect:()=>{
      gameData.waterStorageMax = gameData.waterStorageMax * 2;
      document.getElementById("waterBar").max = gameData.waterStorageMax; }
  },
  {
    id:'waterhole 2',
    name:'Better Understanding waterstorage',
    desc:'Increase the waterdrops capacity by 2.',
    cost:{water:45},
    prereq:['waterhole'],
    effect:()=>{
      gameData.waterStorageMax = gameData.waterStorageMax * 2;
      document.getElementById("waterBar").max = gameData.waterStorageMax; }
  },
  {
    id:'waterhole 3',
    name:'Great Understanding waterstorage',
    desc:'Increase the waterdrops capacity by 2.',
    cost:{water:90},
    prereq:['waterhole 2'],
    effect:()=>{
      gameData.waterStorageMax = gameData.waterStorageMax * 2;
      document.getElementById("waterBar").max = gameData.waterStorageMax; }
  },
    {
    id:'woodUnlock',
    name:'What are this brown rods?',
    desc:'Unlock wood collection',
    cost:{water:35},
    prereq:['waterhole','pheromones'],
    effect:()=>{
      gameData.woodUnlocked = true;
      update_unlocks()}
  },
    {
    id:'waterProd 1',
    name:'What if we make bowls of wood',
    desc:'double the speed the ants collect water',
    cost:{water:15,wood:25},
    prereq:['woodUnlock'],
    effect:()=>{
      gameData.waterProdFactor = 2;
      update_unlocks()}
  },
  {
    id:'pheromones',
    name:'🐜 Basic Understanding of Pheromones',
    desc:'Unlocks the ability to recruit ants.',
    cost:{sugar:5},
    prereq:[],
    effect:()=>{ gameData.recruitAntUnlockeddocument=true; document.getElementById("recruitAntBtn").style.display="inline-block"; }
  },
  {
    id:'anthutTech',
    name:'Outside anth Expansion Tech',
    desc:'Allows building Anthill to increase max ants.',
    cost:{sugar:20, wood:10},
    prereq:['pheromones','woodUnlock'],
    effect:()=>{ gameData.anthutUnlocked = true,update_unlocks(); }
  }
];

// ----------------- Init & Update Techs -----------------
function initTechTree(){ updateTechs(); }

function updateTechs(){
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
    let costText = Object.entries(tech.cost)
      .map(([res,val])=>`${val} ${res}`)
      .join("\n");
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

// ----------------- Buy Tech -----------------
function buyTech(id){
  const tech = techTree.find(t=>t.id===id);
  if(!tech) return;

  if(tech.prereq.some(p=>!gameData.research[p])) return alert("Prerequisite not met!");

  for(let res in tech.cost){
    if(gameData[res] === undefined || gameData[res] < tech.cost[res]){
      return alert(`Not enough ${res}!`);
    }
  }

  for(let res in tech.cost){ gameData[res] -= tech.cost[res]; }

  gameData.research[tech.id] = true;
  tech.effect();

  update_resource();
  updateTechs();
}

// ----------------- Research sub-tabs -----------------
function openResearchTab(tab){
  document.querySelectorAll(".research-subtab").forEach(t=>t.classList.remove("active"));
  document.getElementById("research-"+tab).classList.add("active");
}

// ----------------- Main Game Functions -----------------
function collectWater(waterAmount) {
  gameData.water = Math.min(gameData.water + waterAmount, gameData.waterStorageMax);
  update();
}
function collectWood(){ if(gameData.wood<gameData.woodStorageMax && gameData.water>=gameData.woodCost){ gameData.water-=gameData.woodCost; gameData.wood++; } update(); }
function collectSugar(){ if(gameData.sugar<gameData.sugarStorageMax && gameData.water>=gameData.sugarCost){ gameData.water-=gameData.sugarCost; gameData.sugar++; } update(); }

function recruitAnt(){
  if(gameData.totalAnts >= gameData.maxAnts) return alert("Ant limit reached!");
  if(gameData.sugar>=5){ gameData.sugar-=5; gameData.assignedAnts.free++; update(); }
}

function buyAnthut(){
  let cost = Math.floor(gameData.anthutBaseCost * Math.pow(gameData.anthutCostMultiplier, gameData.anthutLevel));
  if(gameData.wood<cost) return alert("Not enough wood!");
  gameData.wood -= cost;
  gameData.anthutLevel++;
  gameData.maxAnts += 2;
  document.getElementById("buildAnthutBtn").innerText = `Build Anthut (+5 max ants, Cost: ${Math.floor(gameData.anthutBaseCost * Math.pow(gameData.anthutCostMultiplier, gameData.anthutLevel))} woodspliters)`;
  update();
}
function update(){ update_resource(); }
function update_unlocks(){
  if(gameData.woodUnlocked){document.getElementById("woodBtn").style.display="inline-block"; document.getElementById("woodResource").style.display="flex";  document.getElementById("woodAntLine").style.display = "inline-block"; }
  if(gameData.anthutUnlocked){document.getElementById("buildAntHutBtn").style.display="inline-block"; document.getElementById("buildAnthutBtn").innerText = `Build Anthut (+5 max ants, Cost: ${Math.floor(gameData.anthutBaseCost * Math.pow(gameData.anthutCostMultiplier, gameData.anthutLevel))} woodspliters)`}
  if(gameData.recruitAntUnlocked){document.getElementById("recruitAntBtn").style.display="inline-block";}
  update()

}
// ----------------- Update Resources -----------------
function update_resource(){
  gameData.totalAnts = Object.values(gameData.assignedAnts).reduce((a,b)=>a+b,0);
  document.getElementById("antCount").innerText = gameData.totalAnts + "/" + gameData.maxAnts;
  document.getElementById("antBar").value = gameData.totalAnts;
  document.getElementById("antBar").max = gameData.maxAnts;

  document.getElementById("waterDrops").innerText = gameData.water;
  document.getElementById("woodSpliters").innerText = gameData.wood;
  document.getElementById("sugarCrystals").innerText = gameData.sugar;
  document.getElementById("waterBar").value = gameData.water;
  document.getElementById("woodBar").value = gameData.wood;
  document.getElementById("sugarBar").value = gameData.sugar;

  document.getElementById("antsWater").innerText = gameData.assignedAnts.water;
  document.getElementById("antsWood").innerText = gameData.assignedAnts.wood;
  document.getElementById("antsSugar").innerText = gameData.assignedAnts.sugar;

  let waterGain=gameData.assignedAnts.water;
  let waterLoss=gameData.assignedAnts.wood*gameData.woodCost + gameData.assignedAnts.sugar*gameData.sugarCost;
  let waterNet=waterGain-waterLoss;
  let waterTime=waterNet>0 ? (gameData.waterStorageMax-gameData.water)/waterNet : Infinity;
  document.getElementById("waterInfo").innerText = `+${waterGain}/s -${waterLoss}/s = ${waterNet}/s | Fill in ${Math.ceil(waterTime)}s`;

  let woodGain=gameData.assignedAnts.wood;
  let woodTime = woodGain>0 ? (gameData.woodStorageMax-gameData.wood)/woodGain : Infinity;
  document.getElementById("woodInfo").innerText = `+${woodGain}/s -0/s = ${woodGain}/s | Fill in ${Math.ceil(woodTime)}s`;

  let sugarGain=gameData.assignedAnts.sugar;
  let sugarLoss=gameData.totalAnts/10;
  let sugarNet=sugarGain-sugarLoss;
  let sugarTime=sugarNet>0 ? (gameData.sugarStorageMax-gameData.sugar)/sugarNet : Infinity;
  document.getElementById("sugarInfo").innerText = `+${sugarGain}/s -${sugarLoss.toFixed(1)}/s = ${sugarNet.toFixed(1)}/s | Fill in ${Math.ceil(sugarTime)}s`;
  if(gameData.water>10 || gameData.sugarUnlocked){ gameData.sugarUnlocked=true; document.getElementById("sugarBtn").style.display="inline-block"; document.getElementById("sugarResource").style.display="flex"; }
 
  document.getElementById("woodBtn").disabled=gameData.water<gameData.woodCost;
  document.getElementById("sugarBtn").disabled=gameData.water<gameData.sugarCost;
  saveGame()
}

// ----------------- Assign Ants -----------------
function adjustAnt(resource, delta){
  if(delta>0 && gameData.assignedAnts.free>0){ gameData.assignedAnts.free--; gameData.assignedAnts[resource]++; }
  else if(delta<0 && gameData.assignedAnts[resource]>0){ gameData.assignedAnts.free++; gameData.assignedAnts[resource]--; }
  update_resource();
}

// ----------------- Auto Collect -----------------
function autoCollect(){
  if(gameData.assignedAnts.water>0 && gameData.water < gameData.waterStorageMax) collectWater(gameData.assignedAnts.water*gameData.waterProdFactor);
  if(gameData.assignedAnts.wood>0 && gameData.wood < gameData.woodStorageMax){ let waterNeeded=gameData.assignedAnts.wood*gameData.woodCost; if(gameData.water>=waterNeeded){ gameData.water-=waterNeeded; gameData.wood+=gameData.assignedAnts.wood; } }
  if(gameData.assignedAnts.sugar>0 && gameData.sugar < gameData.sugarStorageMax){ let waterNeeded=gameData.assignedAnts.sugar*gameData.sugarCost; if(gameData.water>=waterNeeded){ gameData.water-=waterNeeded; gameData.sugar+=gameData.assignedAnts.sugar; } }
  if(gameData.water>gameData.waterStorageMax) gameData.water=gameData.waterStorageMax;
  if(gameData.wood>gameData.woodStorageMax) gameData.wood=gameData.woodStorageMax;
  if(gameData.sugar>gameData.sugarStorageMax) gameData.sugar=gameData.sugarStorageMax;
  update_resource();
}

// ----------------- Consume Sugar -----------------
function consumeSugar(){
  // Calculate total ants
  
  if (gameData.totalAnts === 0) return;

  // Normal case: enough sugar
  if (gameData.sugar >= gameData.totalAnts) {
    gameData.sugar -= gameData.totalAnts;
    update_resource();
    return;
  }

  // Not enough sugar → starvation
  let deficit = gameData.totalAnts - gameData.sugar;
  gameData.sugar = 0;

  // Priority order: free ants first, then water, wood, sugar
  const priorityOrder = ['free', 'water', 'wood', 'sugar'];

  for (let key of priorityOrder) {
    if (deficit <= 0) break;
    let antsInGroup = gameData.assignedAnts[key];
    if (antsInGroup > 0) {
      let removed = Math.min(deficit, antsInGroup);
      gameData.assignedAnts[key] -= removed;
      deficit -= removed;
    }
  }

  update_resource();
}



// ----------------- Tabs -----------------
function openTab(tabName){ document.querySelectorAll(".tab").forEach(t=>t.classList.remove("active")); document.getElementById(tabName).classList.add("active"); }

// ----------------- Save / Load -----------------
function saveGame() {
  localStorage.setItem('myfirstincrementalgame', JSON.stringify(gameData));
}

function loadGame() {
  const defaultData = getDefaultGameData();
  const saved = localStorage.getItem('myfirstincrementalgame');
  if (saved) {
    const loadedData = JSON.parse(saved);
    // Merge saved data with defaults (future-proof)
    for (let key in defaultData) {
      gameData[key] = loadedData[key] !== undefined ? loadedData[key] : defaultData[key];
    }
  }
  update_resource();
  initTechTree(); // redraw tech tree correctly
}

function resetGame() {
  if (!confirm("Are you sure you want to reset your game?")) return;

  const defaultData = getDefaultGameData();
  // Reset gameData properties without replacing the object
  for (let key in defaultData) {
    gameData[key] = defaultData[key];
  }

  // Hide unlockable resources and buttons
  document.getElementById("woodResource").style.display = "none";
  document.getElementById("sugarResource").style.display = "none";

  document.getElementById("woodBtn").style.display = "none";
  document.getElementById("sugarBtn").style.display = "none";
  document.getElementById("recruitAntBtn").style.display = "none";
  document.getElementById("buildAnthutBtn").style.display = "none";

  document.getElementById("woodAntLine").style.display = "none";
  document.getElementById("sugarAntLine").style.display = "none";

  // Reset tech tree
  gameData.research = {};
  initTechTree();

  // Clear old save
  localStorage.removeItem('myfirstincrementalgame');

  // Update UI
  update_resource();

  alert("Game has been reset!");
}


// ----------------- On Load -----------------
window.onload = function(){
  loadGame();
  initTechTree();
  update_resource();
  update_unlocks();
  setInterval(autoCollect,1000);
  setInterval(consumeSugar,10000);
}
