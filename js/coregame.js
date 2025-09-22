// ----------------- Game Data -----------------
import {updateBuildingText} from './game.js';
import {gameData} from './gamedata.js'

export function updateGameTick(){
  resetResourceGains();
  consumeSugarAnts();
  breedAnts();
  autoCollect();
  updateActiveSacrifices();
  update_resource();

}
export function updateSacrificeUI() {
  // Check all active cooldowns and update buttons if needed
  for (const sacName in gameData.sacrifice.types) {
    const isActive = isSacrificeActive(sacName);
    const effectTimeRemaining = getActiveSacrificeTimeRemaining(sacName);
    
    const btn = document.getElementById(`btnSacrifice${capitalize(sacName)}`);
    const tooltip = document.getElementById(`sac${capitalize(sacName)}Tooltip`);    
    const freeAntsSpan = document.getElementById(`freeAntsSac`);

    if (freeAntsSpan) {
      freeAntsSpan.innerHTML = `Amount of free ants: ${gameData.ants.assignedAnts.free}`;
    }

    if (!btn || !tooltip) continue; // Use continue instead of return to process other sacrifices

    const sacrifice = gameData.sacrifice.types[sacName];
    const currentTime = Date.now();
    const totalCooldown = (sacrifice.cooldown + gameData.sacrifice.cooldownAdd) * gameData.sacrifice.cooldownMult * 1000;
    
    // Calculate cooldown time remaining
    const cooldownTimeRemaining = sacrifice.isOnCooldown 
      ? Math.max(0, Math.ceil((sacrifice.lastUse + totalCooldown - currentTime) / 1000))
      : 0;

    // Update button state based on cooldown
    if (sacrifice.isOnCooldown && cooldownTimeRemaining > 0) {
      btn.disabled = true;
      btn.textContent = `${sacName} (${cooldownTimeRemaining}s)`;
      
      // Show cooldown info, and effect info if active
      let tooltipContent = `Not useable for ${cooldownTimeRemaining} seconds<br><hr>`;
      
      if (isActive && effectTimeRemaining > 0) {
        tooltipContent += `Effect lasts for ${effectTimeRemaining} more seconds<br><hr>`;
      }
      
      tooltipContent += `${sacrifice.tooltipText}<br>`;
      tooltipContent += `Sacrifice ${sacrifice.baseAntcost * gameData.sacrifice.globalLevel} ant(s) and ${sacrifice.baseBloodcost * gameData.sacrifice.globalLevel} blood to gain ${sacrifice.baseEffect * gameData.sacrifice.globalLevel} ${sacrifice.effectText}`;
      
      tooltip.innerHTML = tooltipContent;
      
    } else {
      // Sacrifice is available
      btn.disabled = false;
      btn.textContent = capitalize(sacName);
      
      let tooltipContent = `${sacrifice.tooltipText}<br><hr>`;
      
      if (isActive && effectTimeRemaining > 0) {
        tooltipContent += `Currently active - ${effectTimeRemaining}s remaining<br><hr>`;
      }
      
      tooltipContent += `Sacrifice ${sacrifice.baseAntcost * gameData.sacrifice.globalLevel} ant(s) and ${sacrifice.baseBloodcost * gameData.sacrifice.globalLevel} blood to gain ${sacrifice.baseEffect * gameData.sacrifice.globalLevel} ${sacrifice.effectText}`;
      
      tooltip.innerHTML = tooltipContent;
    }
  }
}

// You'll also need to update the cooldown checking logic since the new system 
// handles effect removal automatically. Here's a simplified cooldown update:
export function updateSacrificeCooldowns() {
  const currentTime = Date.now();
  
  for (const sacName in gameData.sacrifice.types) {
    const sacrifice = gameData.sacrifice.types[sacName];
    
    if (sacrifice.isOnCooldown) {
      const totalCooldown = (sacrifice.cooldown + gameData.sacrifice.cooldownAdd) * gameData.sacrifice.cooldownMult * 1000;
      
      if (currentTime >= sacrifice.lastUse + totalCooldown) {
        sacrifice.isOnCooldown = false;
      }
    }
  }
}

// Updated sacrifice functions
export function performSacrifice(sacrificeType) {
  const sacrifice = gameData.sacrifice.types[sacrificeType];
  if (!sacrifice || !sacrifice.unlocked) {
    alert(`${capitalize(sacrificeType)} is not available!`);
    return false;
  }
  
  // Check costs
  if (sacrifice.baseAntcost * gameData.sacrifice.globalLevel > gameData.ants.assignedAnts.free) {
    alert(`Not enough ants`);
    return false;
  }
  
  if (sacrifice.baseBloodcost * gameData.sacrifice.globalLevel > gameData.resources.blood.amount) {
    alert(`Not enough blood`);
    return false;
  }

  // Remove costs
  gameData.ants.assignedAnts.free -= sacrifice.baseAntcost;
  gameData.resources.blood.amount -= sacrifice.baseBloodcost;
  
  // Start cooldown
  const currentTime = Date.now();
  sacrifice.lastUse = currentTime;
  sacrifice.isOnCooldown = true;
  
  // Apply effect
  applySacrificeEffect(sacrificeType);
  
  update_resource();
  updateSacrificeUI();
  return true;
}

function applySacrificeEffect(sacrificeType) {
  const sacrifice = gameData.sacrifice.types[sacrificeType];
  const currentTime = Date.now();
  const effectValue = sacrifice.baseEffect * gameData.sacrifice.globalLevel;
  const duration = (sacrifice.duration + gameData.sacrifice.durationAdd) * gameData.sacrifice.durationMult * 1000;
  
  if (sacrifice.effectType === 'instant') {
    // Handle instant effects (like ant sacrifice)
    switch (sacrificeType) {
      case 'ant':
        gameData.resources.blood.amount = Math.min(
          gameData.resources.blood.amount + effectValue,
          gameData.resources.blood.max
        );
        gameData.resources.sugar.amount = Math.min(
          gameData.resources.sugar.amount + effectValue,
          gameData.resources.sugar.max
        );
        break;
    }
  } else {
    // Handle duration-based effects
    const activeSacrifice = {
      type: sacrificeType,
      startTime: currentTime,
      duration: duration,
      effectType: sacrifice.effectType,
      targetResource: sacrifice.targetResource,
      effectValue: effectValue,
      level: gameData.sacrifice.globalLevel
    };
    
    // Add to active sacrifices
    gameData.sacrifice.activeSacrifices.push(activeSacrifice);
    
    // Apply the effect immediately
    applyActiveEffect(activeSacrifice, 1); // 1 = apply, -1 = remove
  }
}

function applyActiveEffect(activeSacrifice, direction) {
  const { effectType, targetResource, effectValue } = activeSacrifice;
  
  switch (effectType) {
    case 'bonusProdMul':
      if (targetResource && gameData.resources[targetResource]) {
        const multiplierChange = (effectValue - 1) * direction;
        gameData.resources[targetResource].bonusProdMul += multiplierChange;
      }
      break;
      
    case 'bonusMaxMul':
      if (targetResource && gameData.resources[targetResource]) {
        const multiplierChange = (effectValue - 1) * direction;
        gameData.resources[targetResource].bonusMaxMul += multiplierChange;
      }
      break;
      
    case 'bonusProdAdd':
      if (targetResource && gameData.resources[targetResource]) {
        gameData.resources[targetResource].bonusProdAdd += effectValue * direction;
      }
      break;
      
    case 'bonusMaxAdd':
      if (targetResource && gameData.resources[targetResource]) {
        gameData.resources[targetResource].bonusMaxAdd += effectValue * direction;
      }
      break;
      
    case 'breedingSpeed':
      if (direction === 1) {
        gameData.ants.breeding.sacrificeFactor *= effectValue;
      } else {
        gameData.ants.breeding.sacrificeFactor /= effectValue;
      }
      break;
  }
}

// Function to update active sacrifices (call this in your main game loop)
export function updateActiveSacrifices() {
  const currentTime = Date.now();
  const activeSacrifices = gameData.sacrifice.activeSacrifices;
  
  // Check for expired sacrifices
  for (let i = activeSacrifices.length - 1; i >= 0; i--) {
    const activeSacrifice = activeSacrifices[i];
    
    if (currentTime >= activeSacrifice.startTime + activeSacrifice.duration) {
      // Remove the effect
      applyActiveEffect(activeSacrifice, -1);
      
      // Remove from active sacrifices array
      activeSacrifices.splice(i, 1);
      
      console.log(`${activeSacrifice.type} sacrifice effect expired`);
    }
  }
  
  // Update cooldowns
  for (const sacName in gameData.sacrifice.types) {
    const sacrifice = gameData.sacrifice.types[sacName];
    if (sacrifice.isOnCooldown) {
      const totalCooldown = (sacrifice.cooldown + gameData.sacrifice.cooldownAdd) * gameData.sacrifice.cooldownMult * 1000;
      
      if (currentTime >= sacrifice.lastUse + totalCooldown) {
        sacrifice.isOnCooldown = false;
      }
    }
  }
}

// Helper function to get remaining time for active sacrifices
export function getActiveSacrificeTimeRemaining(sacrificeType) {
  const currentTime = Date.now();
  const activeSacrifice = gameData.sacrifice.activeSacrifices.find(s => s.type === sacrificeType);
  
  if (activeSacrifice) {
    const timeRemaining = (activeSacrifice.startTime + activeSacrifice.duration) - currentTime;
    return Math.max(0, Math.ceil(timeRemaining / 1000));
  }
  
  return 0;
}

// Helper function to check if a sacrifice is currently active
export function isSacrificeActive(sacrificeType) {
  return gameData.sacrifice.activeSacrifices.some(s => s.type === sacrificeType);
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
export function update_resource() {
  update_resourcesUI();
  update_antsUI();
  updateSacrificeUI();
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
export function adjustSacLevel(delta){
if (delta > 0 && gameData.sacrifice.globalLevel < gameData.sacrifice.globalMaxLevel){gameData.sacrifice.globalLevel += delta}
if (delta < 0 && gameData.sacrifice.globalLevel > 0){gameData.sacrifice.globalLevel += delta}

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
