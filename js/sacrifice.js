import { gameData } from "./gamedata.js";
import { capitalize } from "./coregame.js";

export function updateSacrificeUI() {
  // Check all active cooldowns and update buttons if needed
  for (const sacName in gameData.sacrifice.types) {
    const isActive = isSacrificeActive(sacName);
    const effectTimeRemaining = getActiveSacrificeTimeRemaining(sacName);
    
  
    
    const freeAntsSpan = document.getElementById(`freeAntsSac`);
    if (freeAntsSpan) {
      freeAntsSpan.innerHTML = `Amount of free ants: ${gameData.ants.assignedAnts.free}`;
    }
    const sacrifice = gameData.sacrifice.types[sacName];
    const levelDisplay = document.getElementById(`sacrifice${capitalize(sacName)}Level`);
    if (levelDisplay){
    levelDisplay.innerHTML = `${sacrifice.level}`}
    const btn = document.getElementById(`btnSacrifice${capitalize(sacName)}`);
    const tooltip = document.getElementById(`sac${capitalize(sacName)}Tooltip`);  
    if (!btn || !tooltip) continue; 

    

    // Calculate cooldown time remaining
    const cooldownTimeRemaining = getActiveSacrificeTimeRemaining(sacName)

    // Update button state based on cooldown
    if (sacrifice.isOnCooldown && cooldownTimeRemaining > 0) {
      const sacrificedata = getSacrificeData(sacName)
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
function isSacrificeActive(sacrificeType) {
  return gameData.sacrifice.activeSacrifices.some(s => s.type === sacrificeType);
}
function getSacrificeData(sacrificeType){
  const activeSacrifice = gameData.sacrifice.activeSacrifices.find(s => s.type === sacrificeType);
   if (activeSacrifice) {
    return activeSacrifice}
  return null
}
// mogelijk nog iets aanpassen zodat het voor alle dingen geld
export function getActiveSacrificeTimeRemaining(sacrificeType) {
  const currentTime = Date.now();
  const activeSacrifice = gameData.sacrifice.activeSacrifices.find(s => s.type === sacrificeType);
  
  if (activeSacrifice) {
    const timeRemaining = (activeSacrifice.startTime + activeSacrifice.duration) - currentTime;
    return Math.max(0, Math.ceil(timeRemaining / 1000));
  }
  
  return 0;
}
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
function applySacrificeEffect(sacrificeType) {
  const sacrifice = gameData.sacrifice.types[sacrificeType];
  const currentTime = Date.now();
  const effectValue = sacrifice.baseEffect * gameData.sacrifice.globalLevel;
  const duration = (Math.floor(sacrifice.duration * 0.5 * sacrifice.level) + gameData.sacrifice.durationAdd) * gameData.sacrifice.durationMult * 1000;
  
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
      level: sacrifice.level
    };
    
    // Add to active sacrifices
    gameData.sacrifice.activeSacrifices.push(activeSacrifice);
    
    // Apply the effect immediately
    applyActiveEffect(activeSacrifice, 1); // 1 = apply, -1 = remove
  }
}
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

export function performSacrifice(sacrificeType) {
  const sacrifice = gameData.sacrifice.types[sacrificeType];
  console.log()
  if (!sacrifice || !sacrifice.unlocked) {
    alert(`${capitalize(sacrificeType)} is not available!`);
    return false;
  }
  const antCost = Math.floor(sacrifice.baseAntcost * (Math.pow(3,(sacrifice.level-1))))
  const bloodCost = Math.floor(sacrifice.baseBloodcost * (Math.pow(2.5,(sacrifice.level-1))))
  // Check costs
  console.log(antCost,bloodCost)
  if (antCost > gameData.ants.assignedAnts.free) {
    alert(`Not enough ants`);
    return false;
  }
  
  if (bloodCost > gameData.resources.blood.amount) {
    alert(`Not enough blood`);
    return false;
  }

  // Remove costs
  gameData.ants.assignedAnts.free -= antCost;
  gameData.resources.blood.amount -= bloodCost;
  
  // Start cooldown
  const currentTime = Date.now();
  sacrifice.lastUse = currentTime;
  sacrifice.isOnCooldown = true;
  
  // Apply effect
  applySacrificeEffect(sacrificeType);
  updateSacrificeUI();
  return true;
}
export function adjustSacrificeLevel(sacrificeType,delta){
  console.log(sacrificeType,delta);
  
  const sacrifice = gameData.sacrifice.types[sacrificeType]
  console.log(sacrificeType,delta,sacrifice);
  if (delta > 0 && sacrifice.level+delta < sacrifice.levelMax){ sacrifice.level += delta}
  if (delta < 0 && sacrifice.level-delta >= 1){ sacrifice.level += delta}
  updateSacrificeUI()
}

export function buyTotem(name){
  window.log(name)

}
