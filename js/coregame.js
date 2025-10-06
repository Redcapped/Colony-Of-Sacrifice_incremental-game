// ----------------- Game Data -----------------
import {updateBuildingText} from './game.js';
import {gameData} from './gamedata.js';
import { updateSacrificeUI,updateActiveSacrifices  } from "./sacrifice.js";

export function updateGameTick(){
  resetResourceGains();
  consumeSugarAnts();
  breedAnts();
  autoCollect();
  updateActiveSacrifices();
  updateFurnaceUI();
  update_resource();

}
export function update_resource() {
  update_resourcesUI();
  update_antsUI();
  updateSacrificeUI();
}
export function update_resourcesUI() {
  for (let key in gameData.resources) {
    const res = gameData.resources[key];
    const span = document.getElementById(key + "Amount");
    const bar = document.getElementById(key + "Bar");
    const info = document.getElementById(key + "Info");
    const net = document.getElementById(key + "Net");
    const resStoreageMax = maxStorageResource(key)
    if (span) span.innerText = `${Math.floor(res.amount)}/${resStoreageMax}`;
    if (bar) {
      bar.value = res.amount;
      bar.max = resStoreageMax;
    }
    
    if (res.info) {
      const gain = res.info.gain * gameData.gameUpdateRate;
      const loss = (res.info.loss || 0) * gameData.gameUpdateRate;
      var netgain = gain - loss;
      
      // Calculate what ants WANT to produce (ideal production)
      const idealProduction = maxProductionResource(key) * gameData.gameUpdateRate;
      
      let color = "gray";
      let timeText = "";
      let productionInfo = "";

      if (res.amount >= resStoreageMax) {
        // Storage is full
        timeText = "FULL";
        color = "gray";
        
        if (idealProduction > gain) {
          const overproduction = idealProduction - gain;
          productionInfo = ` (wasting ${overproduction.toFixed(2)}/s)`;
          netgain = overproduction
        }
        
      } else if (res.amount <= 0.1) {
        // Storage is empty/very low
        timeText = "EMPTY";
        color = "red";
        
        if (idealProduction < Math.abs(loss)) {
          const underproduction = Math.abs(loss) - idealProduction;
          productionInfo = ` (need +${underproduction.toFixed(2)}/s more)`;
          netgain = -underproduction
        }
        
      } else {
        // Normal operation
        if (netgain > 0) {
          const timeToFull = (resStoreageMax - res.amount) / netgain;
          timeText = `Full in ${Math.ceil(timeToFull)}s`;
          color = "green";
        } else if (netgain < -0.1) {
          const timeToEmpty = res.amount / Math.abs(netgain);
          timeText = `Empty in ${Math.ceil(timeToEmpty)}s`;
          color = "red";
        } else {
          timeText = "Stable";
          color = "gray";
        }
      }

      if (info) {
        info.innerText = `+${gain.toFixed(2)}/s -${loss.toFixed(2)}/s = ${netgain.toFixed(2)}/s | ${timeText}${productionInfo}`;
        info.style.color = color;
      }
      
      if (net) {
        net.innerText = netgain.toFixed(2);
        net.style.color = color;
      }
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

      let displayMax;
      if (typeof max === "number" && max > 0) {
        displayMax = `/${max}`;
      } else {
        displayMax = "";
      }
      span.innerText = `${assigned}${displayMax}`;
          }
  });

  // Free ants
  const container = document.getElementById("freeAntsValue");
  if (container) container.innerText = `Free ants ${gameData.ants.assignedAnts['free']}`;

  // Breeding info
  update_breedingBar();
}
export function collectResource(key, amount) {
  // only for player buttons
  
  const res = gameData.resources[key];
  const resStoreageMax = maxStorageResource(key)
  if (!res) return;

  // Calculate how much can actually be produced (storage limit)
  const spaceLeft = resStoreageMax - res.amount;
  if (key == 'water'){
    amount = amount * 2
  }
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
  updateBuildingText(buildingName)
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
    
    case "storageroom":
      gameData.resources.sugar.max += building.effect;
      gameData.resources.wood.max += building.effect;
      if ('stoneStorage'in gameData.research){
        gameData.resources.stone.max += building.effect;
      }
      break;
    
    case "library":
      gameData.resources.science.max += building.effect;
      break

    case "aquaduct":
      gameData.resources.water.passive += building.effect;
      break

    case "nurserie":
      gameData.ants.nurserieFactor *= building.effect;
      break

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
export function update_breedingBar() {
  const container = document.getElementById("breedingContainer");
  const bar = document.getElementById("breedingBar");
  const percent = document.getElementById("breedingPercent");
  const breeding = gameData.ants.breeding
  if (!breeding.unlocked) {
    if (container) container.style.display = "none";
    return;
  }

  if (container) container.style.display = "block";
  if (bar) bar.value = breeding.partialAnts || 0;
  if (percent) percent.innerText = `breeding progress: ${Math.floor((breeding.partialAnts || 0) * 100)}%`;
}
export function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
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
function maxProductionResource(resource){
  const res = gameData.resources[resource]
  const timeFactor = 1 / gameData.gameUpdateRate;
  const antsAssigned = gameData.ants.assignedAnts[resource] || 0;
  var passive = res.passive
  
  if (resource == 'blood'){
    passive = res.passive * getTotalAnts()
    }  
  const maxProductionValue = ((antsAssigned * (res.prodFactor+ res.bonusProdAdd) * res.bonusProdMul) + passive) * timeFactor
 
  return maxProductionValue
}
function maxStorageResource(resource){
  const res = gameData.resources[resource]
  const maxStorageValue = (res.max + res.bonusMaxAdd)* res.bonusMaxMul
  return maxStorageValue
}
export function autoCollect() {
    const resources = gameData.resources;
    

    // Calculate dependency depth for each resource
    const depths = {};
    
    function calculateDepth(resKey) {
        if (depths[resKey] !== undefined) return depths[resKey];
        
        const res = resources[resKey];
        if (!res || !res.unlocked) {
            depths[resKey] = 0;
            return 0;
        }
        
        let maxDepth = 0;
        if (res.cost && Object.keys(res.cost).length > 0) {
            for (const inputRes in res.cost) {
                maxDepth = Math.max(maxDepth, 1 + calculateDepth(inputRes));
            }
        }
        
        depths[resKey] = maxDepth;
        return maxDepth;
    }
    
    // Calculate depths for all unlocked resources
    for (const resKey in resources) {
        if (resources[resKey] && resources[resKey].unlocked) {
            calculateDepth(resKey);
        }
    }
    
    // Sort by depth (highest depth first - most complex resources first)
    const processOrder = Object.keys(resources)
        .filter(key => resources[key] && resources[key].unlocked)
        .sort((a, b) => depths[b] - depths[a]);
    
    for (const resKey of processOrder) {
        const res = resources[resKey];
        
        
        if (!res || !res.unlocked) continue;

        const antsAssigned = gameData.ants.assignedAnts[res.assigned] || 0;
        if (antsAssigned === 0 && resKey != 'blood') continue;

        let maxProduction = maxProductionResource(resKey);
        
        // If resource needs inputs, check availability
        if (res.cost && Object.keys(res.cost).length > 0) {
            for (const inputRes in res.cost) {
                const needed = res.cost[inputRes];
                const available = resources[inputRes].amount;
                const maxFromInput = available / needed;
                maxProduction = Math.min(maxProduction, maxFromInput);
            }
        }

        // Check storage space
        const resStoreageMax = maxStorageResource(resKey)
        const spaceLeft = resStoreageMax - res.amount;
        const actualProduction = Math.min(maxProduction, spaceLeft);
        
        if (actualProduction > 0) {
            // Consume inputs
            if (res.cost && Object.keys(res.cost).length > 0) {
                for (const inputRes in res.cost) {
                    const consumed = actualProduction * res.cost[inputRes];
                    resources[inputRes].amount -= consumed;
                    
                    // Track for UI
                    if (!resources[inputRes].info) resources[inputRes].info = { gain: 0, loss: 0 };
                    resources[inputRes].info.loss += consumed;
                }
            }

            // Add production
            res.amount += actualProduction;
            
            // Track for UI
            if (!res.info) res.info = { gain: 0, loss: 0 };
            res.info.gain += actualProduction;
        }
    }
}
export function getTotalAnts(){
  return Object.values(gameData.ants.assignedAnts).reduce((a, b) => a + b, 0)
}
export function consumeSugarAnts(){
  const timeFactor = 1/gameData.gameUpdateRate
  let sugarNeedAnt = 1/gameData.ants.antSugarConsumtion
  const breeding = gameData.ants.breeding
  // Calculate total ants
  const totalAnts = getTotalAnts();
  if (totalAnts === 0) return;
  let sugarNeed = totalAnts*timeFactor*sugarNeedAnt
  // minus the breedingcost if there are ant breeding
  if (gameData.ants.maxAnts > totalAnts && breeding .unlocked){
    sugarNeed += Math.floor(gameData.ants.assignedAnts.free/2) * (breeding.cost/breeding.speed) * timeFactor
  }
  
  gameData.resources.sugar.info.loss += sugarNeed
  
  // Normal case: enough sugar
  if (gameData.resources.sugar.amount >= sugarNeed) {
    gameData.resources.sugar.amount -= sugarNeed;
    return;
  }

  // Not enough sugar → starvation
  let deficit = Math.ceil(sugarNeed - gameData.resources.sugar.amount*timeFactor);
  gameData.resources.sugar.amount = 0;

  // Priority order: free ants first, then water, wood, sugar
  const priorityOrder = ['free', 'water', 'wood','stone','science','sugar'];

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
  const breeding = gameData.ants.breeding
  if (!breeding.unlocked) return;
  
  const totalFree = gameData.ants.assignedAnts.free;
  
  if (totalFree < 2) return; // need at least 2 free ants
  const ratePerSecond = (Math.floor(totalFree / 2)) / (breeding.speed*breeding.nurserieFactor);
  const perTick = ratePerSecond / gameData.gameUpdateRate;
    
  if (gameData.ants.maxAnts > getTotalAnts()){
    breeding.partialAnts += perTick;
    const newAnts = Math.floor(breeding.partialAnts);
    if (newAnts > 0){
      const space = gameData.ants.maxAnts - getTotalAnts();
      gameData.ants.assignedAnts.free += Math.min(newAnts, space);
      breeding.partialAnts -= newAnts; // keep remainder
      
    }
  }
}

// Initialize furnace system and generate fixed target times
export function initFurnace() {
  // Generate fixed target times if they haven't been set yet
  generateFixedTargetTimes();
  
  // Add other smelting resources as needed...
  const smeltingResources = ['charcoal', 'iron'];
  smeltingResources.forEach(resource => {
    if (!gameData.resources[resource]) {
      gameData.resources[resource] = {
        amount: 0,
        max: 50,
        unlocked: false,
        cost: {},
        prodFactor: 1,
        passive: 0,
        assigned: resource,
        bonusMaxAdd: 0,
        bonusMaxMul: 1,
        bonusProdAdd: 0,
        bonusProdMul: 1
      };
    }
  });
}

// Generate fixed target times for all recipes (called once at game start)
function generateFixedTargetTimes() {
  for (const [recipeKey, recipe] of Object.entries(gameData.furnaceData.recipes)) {
    if (recipe.targetTime === null) {
      recipe.targetTime = Math.random() * (recipe.maxTime - recipe.minTime) + recipe.minTime;
    }
  }
}

// Check if recipe ingredients are available
function canCraftRecipe(recipeKey) {
  const recipe = gameData.furnaceData.recipes[recipeKey];
  if (!recipe) return false;
  
  for (const [resource, needed] of Object.entries(recipe.inputs)) {
    if (!gameData.resources[resource] || gameData.resources[resource].amount < needed) {
      return false;
    }
  }
  return true;
}

// Start smelting process with player-set time
export function startSmelt(recipeKey) {
  if (gameData.furnaceData.isRunning) return;
  
  const recipe = gameData.furnaceData.recipes[recipeKey];
  if (!recipe || !canCraftRecipe(recipeKey)) return;
  
  // Consume ingredients
  for (const [resource, needed] of Object.entries(recipe.inputs)) {
    gameData.resources[resource].amount -= needed;
  }
  
  // Use the fixed target time for this recipe
  const targetTime = recipe.targetTime;
  
  // Set up smelt with player's chosen duration
  gameData.furnaceData.currentSmelt = {
    recipe: recipeKey,
    targetTime: targetTime,
    tolerance: recipe.tolerance,
    playerDuration: gameData.furnaceData.playerSetTime
  };
  
  gameData.furnaceData.smeltStartTime = Date.now();
  gameData.furnaceData.isRunning = true;
  
  // Set timer to auto-stop after player's set time
  setTimeout(() => {
    if (gameData.furnaceData.isRunning && gameData.furnaceData.currentSmelt) {
      autoStopSmelt();
    }
  }, gameData.furnaceData.playerSetTime);
  
  updateFurnaceUI();
  update_resource();
}

// Automatically stop smelt when timer runs out
function autoStopSmelt() {
  if (!gameData.furnaceData.isRunning || !gameData.furnaceData.currentSmelt) return;
  
  const result = stopSmelt();
  if (result) {
    // Show notification that the smelt completed automatically
    showSmeltResult(`Auto-completed: ${result.result}`, result.success);
  }
}

// Show smelt result (you can customize this notification)
function showSmeltResult(message, success) {
  // For now, just log it - you can integrate with your game's notification system
  console.log(message);
  
  // You could show a popup, add to event log, or use any notification system you have
  // Example: addToEventLog(message, success ? 'success' : 'failure');
}

// Stop smelting and get result
export function stopSmelt() {
  if (!gameData.furnaceData.isRunning || !gameData.furnaceData.currentSmelt) return;
  
  const elapsedTime = Date.now() - gameData.furnaceData.smeltStartTime;
  const smelt = gameData.furnaceData.currentSmelt;
  const recipe = gameData.furnaceData.recipes[smelt.recipe];
  const targetTime = smelt.targetTime; // Use the fixed target time
  const tolerance = smelt.tolerance;
  
  let result;
  let success = false;
  
  // Determine result
  if (elapsedTime < targetTime - tolerance) {
    result = 'Too Short';
  } else if (elapsedTime > targetTime + tolerance) {
    result = 'Burnt';
  } else {
    result = 'Perfect!';
    success = true;
    
    // Give output on perfect smelt
    for (const [resource, amount] of Object.entries(recipe.output)) {
      gameData.resources[resource].amount += amount;
    }
  }
  
  // Record attempt with both elapsed time and player's set time
  const attempt = {
    elapsedTime: Math.round(elapsedTime),
    playerSetTime: Math.round(smelt.playerDuration),
    targetTime: Math.round(targetTime), // For debugging - you might want to hide this
    result: result,
    timestamp: new Date().toLocaleTimeString()
  };
  
  recipe.attempts.push(attempt);
  
  // Keep only last 10 attempts
  if (recipe.attempts.length > 10) {
    recipe.attempts.shift();
  }
  
  // Reset furnace state
  gameData.furnaceData.currentSmelt = null;
  gameData.furnaceData.smeltStartTime = null;
  gameData.furnaceData.isRunning = false;
  
  updateFurnaceUI();
  update_resource();
  
  return { result, attempt, success };
}

// Get current smelting time
export function getCurrentSmeltTime() {
  if (!gameData.furnaceData.isRunning) return 0;
  return Date.now() - gameData.furnaceData.smeltStartTime;
}

// Build furnace UI


// Update timer display
export function updateTimerDisplay() {
  const display = document.getElementById('timerDisplay');
  if (display) {
    display.textContent = `${(gameData.furnaceData.playerSetTime / 1000).toFixed(1)}s`;
  }
}

// Set preset time (called from HTML buttons)
window.setPresetTime = function(time) {
  gameData.furnaceData.playerSetTime = time;
  const slider = document.getElementById('timerSlider');
  if (slider) slider.value = time;
  updateTimerDisplay();
};

// Update furnace UI
export function updateFurnaceUI() {
  const timer = document.getElementById('furnaceTimer');
  const progress = document.getElementById('furnaceProgress');
  const stopBtn = document.getElementById('furnaceStopBtn');
  const furnaceStatus = document.getElementById('furnaceStatus');
  
  if (gameData.furnaceData.isRunning && timer) {
    const elapsed = getCurrentSmeltTime();
    const playerDuration = gameData.furnaceData.currentSmelt.playerDuration;
    const progressPercent = Math.min((elapsed / playerDuration) * 100, 100);
    
    timer.textContent = `Smelting... ${(elapsed / 1000).toFixed(1)}s / ${(playerDuration / 1000).toFixed(1)}s`;
    
    if (progress) {
      progress.innerHTML = `<div class="progress-bar" style="width: ${progressPercent}%"></div>`;
    }
    
    if (stopBtn) stopBtn.style.display = 'block';
    if (furnaceStatus) furnaceStatus.style.display = 'block';
  } else {
    if (timer) timer.textContent = 'Ready';
    if (progress) progress.innerHTML = '';
    if (stopBtn) stopBtn.style.display = 'none';
    if (furnaceStatus) furnaceStatus.style.display = 'none';
    
    // Show recipe selection when not running
    const timerSection = document.getElementById('timerSection');
    if (timerSection && gameData.furnaceData.selectedRecipe) {
      timerSection.style.display = 'block';
    }
  }
}

// Global function for stop button (called from HTML)
window.handleStopSmelt = function() {
  const result = stopSmelt();
  if (result) {
    // Show result notification (you can customize this)
    console.log(`Smelt result: ${result.result} (${result.attempt.elapsedTime}ms)`);
    
    // Update the history for the selected recipe
    if (gameData.furnaceData.selectedRecipe && window.handleRecipeSelection) {
      // Trigger a refresh of the history by calling the selection handler
      const dropdown = document.getElementById('recipeDropdown');
      if (dropdown && dropdown.value === gameData.furnaceData.selectedRecipe) {
        window.handleRecipeSelection();
      }
    }
  }
  updateFurnaceUI();
};

// Reset furnace data for new game (call this from your game reset function)
export function resetFurnace() {
  // Reset all target times to null so they'll be regenerated
  for (const recipe of Object.values(gameData.furnaceData.recipes)) {
    recipe.targetTime = null;
    recipe.attempts = [];
  }
  
  // Reset furnace state
  gameData.furnaceData.currentSmelt = null;
  gameData.furnaceData.smeltStartTime = null;
  gameData.furnaceData.isRunning = false;
  gameData.furnaceData.playerSetTime = 5000; // Reset to default 5 seconds
  
  // Regenerate new fixed target times
  generateFixedTargetTimes();
  
  
}
