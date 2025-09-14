// ----------------- Game Data -----------------
import { initTechTree } from './techTree.js';
import { update_unlocks } from './game.js';
export function getDefaultGameData() {
  return {
    gameUpdateRate:5,
    resources:{
      water:  { amount: 0,  max: 25,   prodFactor: 1,     assigned: 'water',    cost: {},           unlocked:true,  info:{gain:0,loss:0}},
      wood:   { amount: 0,  max: 25,   prodFactor: 1,     assigned: 'wood',     cost: {water: 2 }, unlocked:false, info:{gain:0,loss:0}},
      sugar:  { amount: 0,  max: 25,   prodFactor: 1,     assigned: 'sugar',    cost: {water: 5 }, unlocked:false, info:{gain:0,loss:0}},
      lumber: { amount: 0,  max: 20,   prodFactor: 0.1,   assigned: 'lumber',   cost: {wood:  50},    unlocked:false, info:{gain:0,loss:0}},
      stone:  { amount: 0,  max: 25,   prodFactor: 1,     assigned: 'stone',    cost: {},           unlocked:false, info:{gain:0,loss:0}},
      science:{ amount: 0,  max: 100,  prodFactor: 0.1,   assigned: 'science',  cost: {sugar: 3 },    unlocked:false, info:{gain:0,loss:0}},
      blood:  { amount: 0,  max: 100,  prodFactor: 0.01,  assigned: 'blood',    cost: {},           unlocked:false, info:{gain:0,loss:0}}},
    ants:{
      recruitAntUnlocked:false,maxAnts: 10,
      assignedAnts:   { free: 0, water: 0, wood: 0, sugar: 0 ,lumber:0,stone:0,science:0},
      assignedLimits: { lumber:1 , science:1},
      antSugarConsumtion:10,
      breedingUnlocked:false , partialAnts: 0, antsBreedingSpeed:30, antsBreedingCost:1.25},
    buildings:{
      anthut:     {unlocked: false, level: 0 , costMultiplier: 1.25,  effect:2, baseCost:{'wood':   10}, effectText:'adds max ants:'},
      lumbermill: {unlocked: false, level: 0 , costMultiplier: 2,     effect:1, baseCost:{'wood':   10}, effectText:'adds max lumber ants:'},
      desk:       {unlocked: false, level: 0 , costMultiplier: 2.5,   effect:1, baseCost:{'lumber': 2 }, effectText:'adds max science ants:'}
      },
    research: {}
  };
}
export let gameData = getDefaultGameData()
window.gameData = gameData;

export function updateGameTick(){
  resetResourceGains();
  consumeSugarAnts();
  breedAnts();
  autoCollect();
  update_resource();

}
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

  const spanId = key; 
  const barId = key.replace(/s$/, "") + "Bar"; 

  const span = document.getElementById(spanId);
  const bar = document.getElementById(barId);

  if (span) span.innerText = Math.floor(res.amount);
  if (bar) bar.value = res.amount;

  update_resource();
}


export function recruitAnt(){
  if(getTotalAnts() >= gameData.ants.maxAnts) return alert("Ant limit reached!");
  if(gameData.resources.sugar.amount>=10){ gameData.resources.sugar.amount-=10; gameData.ants.assignedAnts.free++; update_resource(); }
}

export function buyBuilding(buildingName) {
  const building = gameData.buildings[buildingName];
  if (!building) return alert(`Building "${buildingName}" does not exist!`);

  const cost = {};

  // calculate current cost for each resource
  for (const resName in building.baseCost) {
    const base = building.baseCost[resName];
    cost[resName] = Math.floor(base * Math.pow(building.costMultiplier, building.level));
  }

  // check if enough resources
  for (const resName in cost) {
    if (gameData.resources[resName].amount < cost[resName]) {
      return alert(`Not enough ${resName}!`);
    }
  }

  // subtract resources
  for (const resName in cost) {
    gameData.resources[resName].amount -= cost[resName];
  }

  // increase building level
  building.level++;

  // apply building effects dynamically
  if (building.effect) {
    applyBuildingEffect(buildingName);
  }

  // update button text
  const btn = document.getElementById(`build${capitalize(buildingName)}Btn`);
  if (btn) {
    const costStrings = [];
    for (const resName in building.baseCost) {
      const base = building.baseCost[resName];
      const c = Math.floor(base * Math.pow(building.costMultiplier, building.level));
      costStrings.push(`${c} ${resName}`);
    }
    btn.innerText = `Build ${capitalize(buildingName)} (+${building.effect || 0} max ants, Cost: ${costStrings.join(', ')})`;
  }

  update_resource();
}
function applyBuildingEffect(buildingKey) {
  const building = gameData.buildings[buildingKey];

  if (!building || !building.effect) return;

  switch (buildingKey) {
    case "anthut":
      // Anthut increases max ants
      gameData.ants.maxAnts += building.effect;
      break;

    case "lumbermill":
      // Lumbermill increases max lumber ants
      gameData.ants.assignedLimits.lumber += building.effect;
      break;

    case "desk":
      // Desk increases max science ants
      gameData.ants.assignedLimits.science += building.effect;
      break;

    default:
      console.warn("Unknown building effect:", buildingKey);
  }
}
export function resetResourceGains() {
  for (let resName in gameData.resources) {
    const res = gameData.resources[resName];
    if (!res.info) continue;

    // Reset gain and loss for this tick
    res.info.gain = 0;
    res.info.loss = 0;
  }
}


export function update_resourcesUI() {
  for (let key in gameData.resources) {
    const res = gameData.resources[key];
    const span = document.getElementById(key + "Amount");
    const bar = document.getElementById(key + "Bar");
    const info = document.getElementById(key + "Info");
    const net = document.getElementById(key + "Net");

    if (span) span.innerText = `${Math.floor(res.amount)}/${res.max}`;
    if (bar) {
      bar.value = res.amount;
      bar.max = res.max;
    }
    if (res.info){
      const gain = res.info.gain * gameData.gameUpdateRate;
      const loss = (res.info.loss || 0) * gameData.gameUpdateRate;
      var netgain = gain + loss;
      var color = "gray";
      var timeText = "∞";
      if (res.amount >= res.max) {
        timeText = "full";
        color = "gray";
      } else if (res.amount <= 0.5){

        color = "gray";
        netgain = loss
      }
      else if (netgain > 0) {
        const time = (res.max - res.amount) / netgain;
        timeText = `Fill in ${Math.ceil(time)}s`;
        color = "green";
      } else if (netgain < 0) {
        const time = res.amount / Math.abs(netgain);
        timeText = `Empty in ${Math.ceil(time)}s`;
        color = "red";
      }
    }
    if (info) {

      info.innerText = `+${gain.toFixed(2)}/s ${loss.toFixed(2)}/s = ${netgain.toFixed(2)}/s | ${timeText}`;
      
      info.style.color = color;
      
    }
    if (net){
      net.innerText = netgain.toFixed(2);
      net.style.color = color;
    }

  }
}
export function update_antsUI() {
  // Total assigned ants
  const totalAnts = Object.values(gameData.ants.assignedAnts).reduce((a, b) => a + b, 0);
  const antCount = document.getElementById("antCount");
  if (antCount) antCount.innerText = `${totalAnts}/${gameData.ants.maxAnts}`;

  // Assigned ant types
  const antTypes = ["water", "wood", "sugar", "lumber", "stone", "science"];
  antTypes.forEach(type => {
    const span = document.getElementById(`ants${capitalize(type)}`);
    if (span) {
      const assigned = gameData.ants.assignedAnts[type];
      const max = gameData.ants.assignedLimits[type];

      // Always show assigned/max (∞ if no limit)
      const displayMax = (typeof max === "number" && max > 0) ? max : "∞";
      span.innerText = `${assigned}/${displayMax}`;
    }
  });

  // Free ants
  const container = document.getElementById("freeAntsValue");
  if (container) container.innerText = `Free ants ${gameData.ants.assignedAnts['free']}`;

  // Breeding info
  update_breedingBar();
}

export function update_breedingBar() {
  const container = document.getElementById("breedingContainer");
  const bar = document.getElementById("breedingBar");
  const percent = document.getElementById("breedingPercent");

  if (!gameData.ants.breedingUnlocked) {
    if (container) container.style.display = "none";
    return;
  }

  if (container) container.style.display = "block";
  if (bar) bar.value = gameData.ants.partialAnts || 0;
  if (percent) percent.innerText = `${Math.floor((gameData.ants.partialAnts || 0) * 100)}%`;
}

export function update_resource() {
  update_resourcesUI();
  update_antsUI();
  saveGame();
}

export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


// ----------------- Assign Ants -----------------
export function adjustAnt(resource, delta){
  if (
  delta > 0 &&
  gameData.ants.assignedAnts.free > 0 &&
  gameData.ants.assignedAnts[resource] < (gameData.ants.assignedLimits[resource] ?? Infinity)
) {
  gameData.ants.assignedAnts.free--;
  gameData.ants.assignedAnts[resource]++;
}

  else if(delta<0 && gameData.ants.assignedAnts[resource]>0){ gameData.ants.assignedAnts.free++; gameData.ants.assignedAnts[resource]--; }
  update_resource();
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
}

export function getTotalAnts(){
  return Object.values(gameData.ants.assignedAnts).reduce((a, b) => a + b, 0)
}

// ----------------- Consume Sugar -----------------
export function consumeSugarAnts(){
  let timeFactor = 0.1/gameData.gameUpdateRate
  // Calculate total ants
  const totalAnts = getTotalAnts();
  if (totalAnts === 0) return;
  let sugarNeed = totalAnts*timeFactor
  // minus the breedingcost if there are ant breeding
  if (gameData.ants.maxAnts > totalAnts && gameData.ants.breedingUnlocked){
    sugarNeed += Math.floor(gameData.ants.assignedAnts.free/2) * (gameData.ants.antsBreedingCost-1) * timeFactor
  }
  gameData.resources.sugar.info.loss = -sugarNeed
  // Normal case: enough sugar
  if (gameData.resources.sugar.amount >= sugarNeed) {
    gameData.resources.sugar.amount -= sugarNeed;
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

}

export function breedAnts() {
  // Only allow breeding if research is unlocked
  
  if (!gameData.ants.breedingUnlocked) return;
  
  const totalFree = gameData.ants.assignedAnts.free;
  
  if (totalFree < 2) return; // need at least 2 free ants
    
  // breeding rate = (pairs of free ants) * (1 ant per 30s) * breeding speed
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
}

export function saveGame() {
  localStorage.setItem('Colony_of_sacrifce', JSON.stringify(gameData));
}
