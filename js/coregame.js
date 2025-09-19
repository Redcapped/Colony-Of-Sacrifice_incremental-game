// ----------------- Game Data -----------------
import {updateBuildingText,saveGame } from './game.js';
import {gameData,getDefaultGameData} from './gamedata.js'

//again

export function updateGameTick(){
  resetResourceGains();
  consumeSugarAnts();
  breedAnts();
  autoCollect();
  update_resource();

}
export function updateSacrificeUI() {
  // Check all active cooldowns and update buttons if needed
  for (const sacName in gameData.sacrifice.types) {
    const btn = document.getElementById(`btnSacrifice${capitalize(sacName)}`);
    const tooltip = document.getElementById(`sac${capitalize(sacName)}Tooltip`);    

    if (!btn | !tooltip) return;
    const sacrifice = gameData.sacrifice.types[sacName]
    const currentTime = Date.now();
    const totalCooldown =  (sacrifice.cooldown + gameData.sacrifice.cooldownAdd) * gameData.sacrifice.cooldownMult*1000;
    const total_duration = (sacrifice.duration + gameData.sacrifice.durationAdd) * gameData.sacrifice.durationMult*1000;
    
    // neem het minste tussen de cooldown en de effect duration
    const timeLefteffect = Math.ceil((sacrifice.lastUsed + total_duration - currentTime) / 1000);
    const timeLeftCooldown = Math.max(Math.ceil((sacrifice.lastUsed + totalCooldown - currentTime) / 1000),timeLefteffect);
    //cheak of sacrifice van cooldown kan. als de effect dan nog bezig is zet het effect ook uit. effect mag niet langer dan cooldown
    if (timeLeftCooldown <= 0 && sacrifice.isOnCooldown){
      sacrifice.isOnCooldown = false
      btn.disabled = false;
      if (sacrifice.isActive){
        sacrifice.isActive = false
        updateSacrificeEffect(sacName)
      }
    }
    //anders is de knop nog disabeld
    else if(sacrifice.isOnCooldown){
      btn.disabled = true;
      btn.textContent = `${sacName} (${timeLeftCooldown}s)`;
      tooltip.innerHTML = `not useable for ${timeLeftCooldown} seconds  <br><hr> ${sacrifice.tooltipText} sac ${sacrifice.baseAntcost * gameData.sacrifice.globalLevel} ant(s) to gain ${sacrifice.baseEffect} ${sacrifice.effectText}`;
    }
    //effect is voorbij
    if (timeLefteffect <= 0 && sacrifice.isActive){
      sacrifice.isActive = false
      updateSacrificeEffect(sacName)
    }
      
    if(sacrifice.isActive){
      tooltip.innerHTML = `not useable for ${timeLeftCooldown} seconds  <br><hr> effect last for ${timeLefteffect}  <br><hr> ${sacrifice.tooltipText} sac ${sacrifice.baseAntcost * gameData.sacrifice.globalLevel} ant(s) to gain ${sacrifice.baseEffect} ${sacrifice.effectText}`;
    }
    if (!sacrifice.isOnCooldown){
      btn.textContent = sacName;
      tooltip.innerHTML = `${sacrifice.tooltipText} <br><hr> sac ${sacrifice.baseAntcost * gameData.sacrifice.globalLevel} ant(s) and ${sacrifice.baseBloodcost * gameData.sacrifice.globalLevel} blood \n to gain ${sacrifice.baseEffect * gameData.sacrifice.globalLevel} ${sacrifice.effectText}`;
    }      
    }
}
export function performSacrifice(sacrificeType) {
  const sacrifice = gameData.sacrifice.types[sacrificeType];
  if (!sacrifice || !sacrifice.unlocked) {
    alert(`${capitalize(sacrificeType)} is not available!`);
    return false;
  }
  // Check ants
  if (sacrifice.baseAntcost * gameData.sacrifice.globalLevel > gameData.ants.assignedAnts.free) {
      alert(`not the needed amount of ants`);
      return false;
    }
  // cheak blood
  if (sacrifice.baseBloodcost * gameData.sacrifice.globalLevel > gameData.resources.blood.amount) {
      alert(`not the needed amount of blood`);
      return false;
    }

  // remove costs
  gameData.ants.assignedAnts.free -= sacrifice.baseAntcost * gameData.sacrifice.globalLevel
  gameData.resources.blood.amount -= sacrifice.baseBloodcost * gameData.sacrifice.globalLevel
  // Start cooldown
  const currentTime = Date.now();
  sacrifice.lastUsed = currentTime;
  sacrifice.isActive = true;
  sacrifice.isOnCooldown = true;
  updateSacrificeEffect(sacrificeType)
  const btn = document.getElementById(`btnSacrifice${capitalize(sacrificeType)}`);
  btn.disabled = true;
  // Update resources/effects
  update_resource();
  updateSacrificeUI();
  return true;
}
function updateSacrificeEffect(sacrificeType) {
  const sacrifice = gameData.sacrifice.types[sacrificeType]
  const factor = sacrifice.isActive ? 1 : -1
  switch (sacrificeType) {
    case "ant":
      if (factor == 1){
      gameData.resources.blood.amount = Math.min(gameData.resources.blood.amount+2,gameData.resources.blood.max);
      gameData.resources.sugar.amount = Math.min(gameData.resources.sugar.amount+2,gameData.resources.sugar .max)}
      break;

    case "owl":
      var added_value = gameData.resources.science.max * sacrifice.baseEffect - gameData.resources.science.max;
      gameData.resources.science.bonusMaxAdd += added_value * factor;
      break;

    case "fish":
      var added_value = gameData.resources.water.prodFactor * sacrifice.baseEffect - gameData.resources.water.prodFactor;
      gameData.resources.water.bonusProdAdd += added_value * factor
      break;

    default:
      console.warn(`No effect defined for sacrifice type: ${sacrificeType}`);
      break;
  }
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
      //storageroom increases max sugar and wood
      gameData.resources.sugar.max += building.effect;
      gameData.resources.wood.max += building.effect;
      break;
    
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
      
      // Debug logging
      //console.log(`${key}:  ideal=${idealProduction}, gain=${gain}, loss=${loss}, amount=${res.amount}, max=${res.max}`);
      
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

  if (!gameData.ants.breedingUnlocked) {
    if (container) container.style.display = "none";
    return;
  }

  if (container) container.style.display = "block";
  if (bar) bar.value = gameData.ants.partialAnts || 0;
  if (percent) percent.innerText = `breeding progress: ${Math.floor((gameData.ants.partialAnts || 0) * 100)}%`;
}
export function update_resource() {
  update_resourcesUI();
  update_antsUI();
  updateSacrificeUI();
  saveGame();
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
  const maxProductionValue = ((antsAssigned * (res.prodFactor+ res.bonusProdAdd) * res.bonusProdMul) + res.passive) * timeFactor 
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
        if (antsAssigned === 0) continue;

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
  let timeFactor = 1/gameData.gameUpdateRate
  let sugarNeedAnt = 1/gameData.ants.antSugarConsumtion
  // Calculate total ants
  const totalAnts = getTotalAnts();
  if (totalAnts === 0) return;
  let sugarNeed = totalAnts*timeFactor*sugarNeedAnt
  // minus the breedingcost if there are ant breeding
  if (gameData.ants.maxAnts > totalAnts && gameData.ants.breedingUnlocked){
    sugarNeed += Math.floor(gameData.ants.assignedAnts.free/2) * (gameData.ants.antsBreedingCost/gameData.ants.antsBreedingSpeed) * timeFactor
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
  const ratePerSecond = (Math.floor(totalFree / 2)) / (gameData.ants.antsBreedingSpeed*gameData.ants.nurserieFactor);
  const perTick = ratePerSecond / gameData.gameUpdateRate;
    
  if (gameData.ants.maxAnts > getTotalAnts()){
    gameData.ants.partialAnts += perTick;
    const newAnts = Math.floor(gameData.ants.partialAnts);
    if (newAnts > 0){
      const space = gameData.ants.maxAnts - getTotalAnts();
      gameData.ants.assignedAnts.free += Math.min(newAnts, space);
      gameData.ants.partialAnts -= newAnts; // keep remainder
      
    }
  }
}
