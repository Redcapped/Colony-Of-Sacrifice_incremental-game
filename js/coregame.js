// ----------------- Game Data -----------------
import { initTechTree } from './techTree.js';
import { update_unlocks } from './game.js';
export function getDefaultGameData() {
  return {
    gameUpdateRate:5,
    resources:{
      water: { amount: 0, max: 25, prodFactor: 1, assigned: 'water',info:{gain:0,loss:0}},
      wood:  { amount: 0, max: 25, prodFactor: 1, assigned: 'wood', cost: { water: 2 }, unlocked:false,info:{gain:0,loss:0}},
      sugar: { amount: 0, max: 25, prodFactor: 1, assigned: 'sugar', cost: { water: 5 },unlocked:false,info:{gain:0,loss:0}}},
    ants:{
      recruitAntUnlocked:false,maxAnts: 10,
      assignedAnts: { free: 0, water: 0, wood: 0, sugar: 0 },
      antSugarConsumtion:10,
      breedingUnlocked:false , partialAnts: 0, antsBreedingSpeed:30, antsBreedingCost:1.5},
    buildings:{
      anthutUnlocked: false,anthutLevel: 0,anthutBaseCost: 10,anthutCostMultiplier: 1.25,anthutResidens:2,
    },
    research: {}
  };
}
export let gameData = getDefaultGameData()
window.gameData = gameData;


// ----------------- Main Game Functions -----------------
export function collectResource(key, amount) {
  const res = gameData.resources[key];
  if (!res) return;

  // Calculate how much can actually be produced (storage limit)
  const spaceLeft = res.max - res.amount;
  let producible = Math.min(amount, spaceLeft);
  if (producible <= 0) return; // Storage full

  // If resource has a cost, scale production by available cost resources
  if (res.cost) {
    let maxAmountByCost = producible; // start with space-limited amount

    for (let costRes in res.cost) {
      const available = gameData.resources[costRes].amount;
      const requiredPerUnit = res.cost[costRes];
      maxAmountByCost = Math.min(maxAmountByCost, available / requiredPerUnit);
    }

    producible = maxAmountByCost;

    // Deduct costs
    for (let costRes in res.cost) {
      gameData.resources[costRes].amount -= res.cost[costRes] * producible;
    }
  }

  // Add resource
  res.amount += producible;

  // Update UI dynamically
  const spanId = key === 'water' ? 'waterDrops' :
                 key === 'wood' ? 'woodSpliters' :
                 key === 'sugar' ? 'sugarCrystals' : key + 'Amount';
  const barId = key + 'Bar';

  const span = document.getElementById(spanId);
  const bar = document.getElementById(barId);

  if (span) span.innerText = Math.floor(res.amount);
  if (bar) bar.value = res.amount;

  update_resource();
}


export function recruitAnt(){
  if(gameData.totalAnts >= gameData.maxAnts) return alert("Ant limit reached!");
  if(gameData.resources.sugar.amount>=5){ gameData.resources.sugar.amount-=5; gameData.ants.assignedAnts.free++; update_resource(); }
}

export function buyAnthut(){
  let cost = Math.floor(gameData.buildings.anthutBaseCost * Math.pow(gameData.buildings.anthutCostMultiplier, gameData.buildings.anthutLevel));
  if(gameData.resources.wood.amount<cost) return alert("Not enough wood!");
  gameData.resources.wood.amount -= cost;
  gameData.buildings.anthutLevel++;
  gameData.ants.maxAnts += 2;
  document.getElementById("buildAnthutBtn").innerText = `Build Anthut (+${gameData.buildings.anthutResidens} max ants, Cost: ${Math.floor(gameData.buildings.anthutBaseCost * Math.pow(gameData.buildings.anthutCostMultiplier, gameData.buildings.anthutLevel))} woodspliters)`;
  update_resource();
}


// ----------------- Update Resources -----------------
export function update_resource() {
  // ---------------- Ants ----------------
  const totalAnts = Object.values(gameData.ants.assignedAnts).reduce((a, b) => a + b, 0);
  const antCount = document.getElementById("antCount");
  if (antCount) antCount.innerText = totalAnts + "/" + gameData.ants.maxAnts;

  // ---------------- Resources ----------------
  const resMap = {
    water: ["waterDrops", "waterBar"],
    wood: ["woodSpliters", "woodBar"],
    sugar: ["sugarCrystals", "sugarBar"]
  };

  for (let key in resMap) {
    const [spanId, barId] = resMap[key];
    const span = document.getElementById(spanId);
    const bar = document.getElementById(barId);
    const res = gameData.resources[key];

    if (span) span.innerText = Math.floor(res.amount);
    if (bar) bar.value = res.amount;
    if (bar) bar.max = res.max
  }

  // ---------------- Assigned Ants ----------------
  const antsWater = document.getElementById("antsWater");
  if (antsWater) antsWater.innerText = gameData.ants.assignedAnts.water;
  const antsWood = document.getElementById("antsWood");
  if (antsWood) antsWood.innerText = gameData.ants.assignedAnts.wood;
  const antsSugar = document.getElementById("antsSugar");
  if (antsSugar) antsSugar.innerText = gameData.ants.assignedAnts.sugar;

  // ---------------- Resource Info ----------------
  const waterGain = gameData.resources.water.info.gain * gameData.gameUpdateRate;
  const waterLoss = gameData.resources.water.info.loss * gameData.gameUpdateRate;
  const waterNet = waterGain + waterLoss;
  const waterTime = waterNet > 0 ? (gameData.resources.water.max - gameData.resources.water.amount) / waterNet : Infinity;
  const waterInfo = document.getElementById("waterInfo");
  if (waterInfo) waterInfo.innerText = `+${waterGain.toFixed(2)}/s ${waterLoss.toFixed(2)}/s = ${waterNet.toFixed(2)}/s | Fill in ${Math.ceil(waterTime)}s`;

  const woodGain = gameData.resources.wood.info.gain * gameData.gameUpdateRate;
  const woodTime = woodGain > 0 ? (gameData.resources.wood.max - gameData.resources.wood.amount) / woodGain : Infinity;
  const woodInfo = document.getElementById("woodInfo");
  if (woodInfo) woodInfo.innerText = `+${woodGain.toFixed(2)}/s -0/s = ${woodGain.toFixed(2)}/s | Fill in ${Math.ceil(woodTime)}s`;

  const sugarGain = gameData.resources.sugar.info.gain * gameData.gameUpdateRate;
  const sugarLoss = gameData.resources.sugar.info.loss * gameData.gameUpdateRate;
  const sugarNet = sugarGain - sugarLoss;
  const sugarTime = sugarNet > 0 ? (gameData.resources.sugar.max - gameData.resources.sugar.amount) / sugarNet : Infinity;
  const sugarInfo = document.getElementById("sugarInfo");
  if (sugarInfo) sugarInfo.innerText = `+${sugarGain.toFixed(2)}/s -${sugarLoss.toFixed(2)}/s = ${sugarNet.toFixed(2)}/s | Fill in ${Math.ceil(sugarTime)}s`;
  // ---------------- Breeding Info ----------------
  const breedingContainer = document.getElementById("breedingRate");
  const breedingValue = document.getElementById("breedingRateValue");
  
  if (gameData.ants.breedingUnlocked) {
    if (breedingContainer) breedingContainer.style.display = "inline-block";
    
    if (breedingValue) {
      
      const totalFree = gameData.ants.assignedAnts.free;
      // breeding rate = pairs of free ants * (1 ant per 10s) * speed
      if (gameData.ants.maxAnts > getTotalAnts()){
      const ratePerSecond = Math.floor(totalFree / 2) / gameData.ants.antsBreedingSpeed/gameData.gameUpdateRate;
      breedingValue.innerText = ratePerSecond.toFixed(2);
      }
      else {breedingValue.innerText =0;}
    }
  } 

  // ---------------- Unlocks ----------------
  if (gameData.resources.water.amount > 10 || gameData.resources.sugar.unlocked) {
    gameData.resources.sugar.unlocked = true;
    const sugarBtn = document.getElementById("collectSugarBtn");
    const sugarRes = document.getElementById("sugarResource");
    if (sugarBtn) sugarBtn.style.display = "inline-block";
    if (sugarRes) sugarRes.style.display = "flex";
    
  }

  // ---------------- Save Game ----------------
  saveGame();
}

// ----------------- Assign Ants -----------------
export function adjustAnt(resource, delta){
  if(delta>0 && gameData.ants.assignedAnts.free>0){ gameData.ants.assignedAnts.free--; gameData.ants.assignedAnts[resource]++; }
  else if(delta<0 && gameData.ants.assignedAnts[resource]>0){ gameData.ants.assignedAnts.free++; gameData.ants.assignedAnts[resource]--; }
  update_resource();
  saveGame();
}

// ----------------- Auto Collect -----------------
export function autoCollect() {
  const timeFactor = 1 / gameData.gameUpdateRate;

  // Step 1: Gather production requests
  let productionRequests = [];
  for (let key in gameData.resources) {
    const res = gameData.resources[key];
    const antsAssigned = gameData.ants.assignedAnts[res.assigned] || 0;

    if (antsAssigned > 0) {
      const potentialProduction = antsAssigned * (res.prodFactor || 1) * timeFactor;
      productionRequests.push({
        key,
        res,
        requested: potentialProduction
      });
    }
  }

  // Step 2: Calculate net changes without applying
  const netChange = {}; // key -> net change
  productionRequests.forEach(req => {
    const res = req.res;
    let produceAmount = req.requested;

    // Scaling by cost and space
    let scalingFactor = 1;
    if (res.cost) {
      for (let costRes in res.cost) {
        const available = gameData.resources[costRes]?.amount || 0;
        const spaceLeft = res.max - res.amount;
        scalingFactor = Math.min(scalingFactor, available / (res.cost[costRes] * produceAmount),spaceLeft / produceAmount);
      }
    }

    produceAmount *= scalingFactor;
    if (produceAmount <= 0) return;

    // Add net change for produced resource
    netChange[req.key] = (netChange[req.key] || 0) + produceAmount;
    res.info.gain =netChange[req.key]
    // Subtract net change for cost resources
    if (res.cost) {
      for (let costRes in res.cost) {
        const costAmount = res.cost[costRes] * produceAmount;
        netChange[costRes] = (netChange[costRes] || 0) - costAmount;
        gameData.resources[costRes].info.loss = netChange[costRes] - gameData.resources[costRes].info.gain
      }
    }
  });

  // Step 3: Apply net changes
  for (let key in netChange) {
    const res = gameData.resources[key];
    if (!res) continue;
    
    res.amount = Math.min(res.max, Math.max(0, res.amount + netChange[key]));
  }

  // Step 4: Update UI
  update_resource();
}

function getTotalAnts(){
  return Object.values(gameData.ants.assignedAnts).reduce((a, b) => a + b, 0)
}





// ----------------- Consume Sugar -----------------
export function consumeSugar(){
  let timeFactor = 0.1/gameData.gameUpdateRate
  // Calculate total ants
  const totalAnts = getTotalAnts();
  if (totalAnts === 0) return;
  let sugarNeed = totalAnts*timeFactor
  // minus the breedingcost if there are ant breeding
  if (gameData.ants.maxAnts > totalAnts && gameData.ants.breedingUnlocked){
    sugarNeed += gameData.ants.assignedAnts.free * (gameData.ants.antsBreedingCost-1) * timeFactor
  }
  gameData.resources.sugar.info.loss = sugarNeed
  // Normal case: enough sugar
  if (gameData.resources.sugar.amount >= sugarNeed) {
    gameData.resources.sugar.amount -= sugarNeed;
    update_resource();
    return;
  }

  // Not enough sugar → starvation
  let deficit = Math.ceil(sugarNeed - gameData.resources.sugar.amount*timeFactor);
  gameData.resources.sugar.amount = 0;

  // Priority order: free ants first, then water, wood, sugar
  const priorityOrder = ['free', 'water', 'wood', 'sugar'];

  for (let key of priorityOrder) {
    if (deficit <= 0) break;
    let antsInGroup = gameData.ants.assignedAnts[key];
    if (antsInGroup > 0) {
      let removed = Math.min(deficit, antsInGroup);
      gameData.ants.assignedAnts[key] -= removed;
      deficit -= removed;
    }
  }

  update_resource();
}

export function breedAnts() {
  // Only allow breeding if research is unlocked
  
  if (!gameData.ants.breedingUnlocked) return;
  
  const totalFree = gameData.ants.assignedAnts.free;
  
  if (totalFree < 2) return; // need at least 2 free ants
    
  // breeding rate = (pairs of free ants) * (1 ant per 10s) * breeding speed
  const ratePerSecond = (Math.floor(totalFree / 2)) / gameData.ants.antsBreedingSpeed;
  const perTick = ratePerSecond / gameData.gameUpdateRate;
    
  if (gameData.ants.maxAnts > getTotalAnts()){
    
    const upkeepPerTick = (getTotalAnts()* gameData.ants.antSugarConsumtion*0.1 + (gameData.ants.assignedAnts.free * (1-gameData.ants.antsBreedingCost)*0.1)) / gameData.gameUpdateRate;
    const safetyReserve = upkeepPerTick * 2;
  if (gameData.resources.sugar.amount > safetyReserve) {
      gameData.ants.partialAnts += perTick;
      const newAnts = Math.floor(gameData.ants.partialAnts);
      if (newAnts > 0){
        const space = gameData.ants.maxAnts - getTotalAnts();
        gameData.ants.assignedAnts.free += Math.min(newAnts, space);
        gameData.ants.partialAnts -= newAnts; // keep remainder
      }
    }
  }
  

  update_resource();
}


// ----------------- Save / Load -----------------
export function saveGame() {
  localStorage.setItem('Colony_of_sacrifce', JSON.stringify(gameData));
}

export function loadGame() {
  const defaultData = getDefaultGameData();
  const saved = localStorage.getItem('Colony_of_sacrifce');
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

export function resetGame() {

  if (!confirm("Are you sure you want to reset your game?")) return;

  gameData = getDefaultGameData();
  saveGame();
  update_resource();
  update_unlocks();
  initTechTree();


  window.location.reload();
}




