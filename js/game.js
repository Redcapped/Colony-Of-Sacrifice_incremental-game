// ----------------- Imports -----------------
import { capitalize, collectResource,update_resource, adjustSacLevel,adjustAnt, recruitAnt, buyBuilding, updateGameTick,getTotalAnts} from './coregame.js';
import { initTechTree } from './techTree.js';
import {getDefaultGameData,gameData} from './gamedata.js'
import { buildUI } from './buildUI.js';
import { buildStatUI } from './buildUI.js';
// ----------------- Tabs -----------------
export function openTab(tabName) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  const tab = document.getElementById(tabName);
  if (tab) tab.classList.add("active");
}
export function openResearchTab(tab){
  document.querySelectorAll(".research-subtab").forEach(t=>t.classList.remove("active"));
  document.getElementById("research-"+tab).classList.add("active");
}
// ----------------- Unlocks & UI -----------------
export function update_unlocks() {
  
  buildStatUI();
  // update resources click buttons and resources sidebar
  for (let key in gameData.resources) {

    const resUnlocked = gameData.resources[key]?.unlocked;
    // find tooltip and unlock or keep them hidden
    const restooltip = document.getElementById(`collect${capitalize(key)}Tooltip`);
    if(restooltip){
    const wrapper = restooltip.parentElement;
    if (wrapper) wrapper.style.display = resUnlocked ? "flex" : "none";
    }
  
    const btn = document.getElementById(`collect${capitalize(key)}Btn`);
    if (btn) btn.style.display = resUnlocked ? "inline-block" : "none";
  
    const antLineSpan = document.getElementById(`${capitalize(key)}AntLine`);
    if (antLineSpan) antLineSpan.style.display = resUnlocked ? "grid" : "none";
    
    const resourRow = document.getElementById(`${capitalize(key)}Row`);
    console.log(resourRow,`${capitalize(key)}Row`)
    if (resourRow) resourRow.style.display = resUnlocked ? "flex" : "none";
  }

  // ---------------- Buildings ----------------
  for (const key in gameData.buildings) {
    const building = gameData.buildings[key];

    if (!building.unlocked) continue; // skip locked buildings

    const span = document.getElementById(`build${capitalize(key)}Tooltip`);
    if (!span) continue;
    const wrapper = span.parentElement;
    if (wrapper){wrapper.style.display = "block";}
    
    updateBuildingText(key)    
  }

  // ---------------- Ants ----------------
  const recruitBtn = document.getElementById("recruitAntBtn");
  if (recruitBtn) recruitBtn.style.display = gameData.ants.recruitAntUnlocked ? "inline-block" : "none";

  const breedingRate = document.getElementById("breedingRate");
  const breedingProgressContainer = document.getElementById("breedingProgressContainer");
  const nextAntProgress = document.getElementById("nextAntProgress");
  const nextAntPercent = document.getElementById("nextAntPercent");

  if (gameData.ants.breedingUnlocked) {
    if (breedingRate) breedingRate.style.display = "inline-block";
    if (breedingProgressContainer) breedingProgressContainer.style.display = "block";

    // Just read the partial value, no increment
    const partial = gameData.ants.partial || 0;

    if (nextAntProgress) nextAntProgress.style.width = `${partial * 100}%`;
    if (nextAntPercent) nextAntPercent.innerText = `${Math.floor(partial * 100)}%`;
  } else {
    if (breedingRate) breedingRate.style.display = "none";
    if (breedingProgressContainer) breedingProgressContainer.style.display = "none";
  }

  // ---------------- Total & Free Ants ----------------
  const antCount = document.getElementById("antCount");
  if (antCount) {
    const totalAssigned = Object.values(gameData.ants.assignedAnts).reduce((a, b) => a + b, 0);
    antCount.innerText = `${totalAssigned}/${gameData.ants.maxAnts}`;
  }

  const freeAnts = document.getElementById("freeAntsValue");
  if (freeAnts) freeAnts.innerText = gameData.ants.assignedAnts.free;
  // ---------------- Sacrifice Panel ----------------
  const sacrificePanel = document.getElementById("sacrificePanel");
  if (sacrificePanel) {
    sacrificePanel.style.display = gameData.sacrifice.unlocked ? "block" : "none";
  }
  for (const sacName in gameData.sacrifice.types) {
  const sacrifice = gameData.sacrifice.types[sacName];
  const sacEl = document.getElementById(`sac${capitalize(sacName)}Tooltip`);

  if (sacEl) {
    const wrapper = sacEl.parentElement;
    if (wrapper){wrapper.style.display = sacrifice.unlocked ? "block" : "none";}
  }
}

  // ---------------- Resource UI ----------------
  update_resource();
}
// ----------------- Game Initialization -----------------
export function initGame() {
  initGameWithDebug();
  loadGame();
  initTechTree();
  buildUI();
  update_resource();
  update_unlocks();
  
  // ----------------- Intervals -----------------
  setInterval(updateGameTick, 1000 / gameData.gameUpdateRate);

  // ----------------- Button Listeners -----------------
    // Main buttons
  document.getElementById('collectWaterBtn')?.addEventListener('click', () => collectResource('water', 1));
  document.getElementById('collectWoodBtn')?.addEventListener('click', () => collectResource('wood', 1));
  document.getElementById('collectSugarBtn')?.addEventListener('click', () => collectResource('sugar', 1));

  document.getElementById('recruitAntBtn')?.addEventListener('click', recruitAnt);

  // Ant assignment
  document.getElementById('btnAntWaterMinus')?.addEventListener('click', () => adjustAnt('water', -1));
  document.getElementById('btnAntWaterPlus')?.addEventListener('click', () => adjustAnt('water', 1));
  document.getElementById('btnAntSugarMinus')?.addEventListener('click', () => adjustAnt('sugar', -1));
  document.getElementById('btnAntSugarPlus')?.addEventListener('click', () => adjustAnt('sugar', 1));
  document.getElementById('btnAntWoodMinus')?.addEventListener('click', () => adjustAnt('wood', -1));
  document.getElementById('btnAntWoodPlus')?.addEventListener('click', () => adjustAnt('wood', 1));
  document.getElementById('btnAntLumberMinus')?.addEventListener('click', () => adjustAnt('lumber', -1));
  document.getElementById('btnAntLumberPlus')?.addEventListener('click', () => adjustAnt('lumber', 1));
  document.getElementById('btnAntScienceMinus')?.addEventListener('click', () => adjustAnt('science', -1));
  document.getElementById('btnAntSciencePlus')?.addEventListener('click', () => adjustAnt('science', 1));
  // Ant sacrifice
  document.getElementById('btnSacMinus')?.addEventListener('click', () => adjustSacLevel(-1));
  document.getElementById('btnSacPlus')?.addEventListener('click', () => adjustSacLevel(1));


  // Tabs
  document.getElementById('tabMainBtn')?.addEventListener('click', () => openTab('main'));
  document.getElementById('tabResearchBtn')?.addEventListener('click', () => openTab('research'));
  document.getElementById('tabAntsBtn')?.addEventListener('click', () => openTab('ants'));
  document.getElementById('tabStatsBtn')?.addEventListener('click', () => {buildStatUI();openTab('stats');});
  document.getElementById('tabSettingsBtn')?.addEventListener('click', () => openTab('settings'));

  // Research subtabs
  document.getElementById('researchAvailableBtn')?.addEventListener('click', () => openResearchTab('available'));
  document.getElementById('researchPurchasedBtn')?.addEventListener('click', () => openResearchTab('purchased'));

  // Reset button
  document.getElementById('resetGameBtn')?.addEventListener('click', resetGame);
}
export function updateBuildingText(buildingName){
const building = gameData.buildings[buildingName]
const tooltip = document.getElementById(`build${capitalize(buildingName)}Tooltip`);
const btn = document.getElementById(`build${capitalize(buildingName)}Btn`);


if (!tooltip |!btn){return}

const costStrings = [];
  for (const resName in building.baseCost) {
    const base = building.baseCost[resName];
    const cost = Math.floor(base * Math.pow(building.costMultiplier, building.level));
    costStrings.push(`${cost} ${capitalize(resName)}`);
  }
tooltip.innerHTML = `${building.tooltipText} <br><hr> ${building.effectText} ${building.effect} <br> Cost: ${costStrings.join(", ")}`
btn.innerText = `${capitalize(buildingName)}  (${building.level})`


}

export function resetGame() {

  if (!confirm("Are you sure you want to reset your game?")) return;

  const defaults = getDefaultGameData();
  for (let key in defaults) {
    gameData[key] = defaults[key];
  }
  
  saveGame()
  window.location.reload();
  initGame();
}
window.addEventListener('load', () => {
  loadGame();
});
// ----------------- Load on Window -----------------
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});
//window.reset = resetGame()
export function saveGame() {
  try {
    // Check if localStorage is available
    if (typeof Storage === "undefined" || !window.localStorage) {
      console.warn("localStorage not supported");
      return false;
    }
    
    // Test localStorage accessibility
    localStorage.setItem('test', 'test');
    localStorage.removeItem('test');
    
    const gameDataString = JSON.stringify(gameData);
    localStorage.setItem('Colony_of_sacrifceV2', gameDataString);
    
    // Verify save worked
    const saved = localStorage.getItem('Colony_of_sacrifceV2');
    if (saved === gameDataString) {
      console.log("Game saved successfully");
      return true;
    } else {
      console.error("Save verification failed");
      return false;
    }
  } catch (error) {
    console.error("Failed to save game:", error);
    
    // Fallback: try to save with a shorter key or compressed data
    try {
      localStorage.setItem('ColonySave', JSON.stringify(gameData));
      return true;
    } catch (fallbackError) {
      console.error("Fallback save also failed:", fallbackError);
      return false;
    }
  }
}

// Enhanced load with better error handling
export function loadGame() {
  const defaultData = getDefaultGameData();
  
  try {
    // Check if localStorage is available
    if (typeof Storage === "undefined" || !window.localStorage) {
      console.warn("localStorage not supported, using default data");
      Object.assign(gameData, defaultData);
      return;
    }
    
    let saved = localStorage.getItem('Colony_of_sacrifceV2');
    
    // Try fallback key if main key fails
    if (!saved) {
      saved = localStorage.getItem('ColonySave');
    }
    
    if (saved) {
      try {
        const loadedData = JSON.parse(saved);
        
        // Validate loaded data has expected structure
        if (loadedData && typeof loadedData === 'object') {
          // Merge saved data with defaults (preserves new features)
          for (let key in defaultData) {
            if (loadedData[key] !== undefined) {
              // Deep merge for nested objects
              if (typeof defaultData[key] === 'object' && !Array.isArray(defaultData[key])) {
                gameData[key] = { ...defaultData[key], ...loadedData[key] };
              } else {
                gameData[key] = loadedData[key];
              }
            } else {
              gameData[key] = defaultData[key];
            }
          }
          console.log("Game loaded successfully");
        } else {
          throw new Error("Invalid save data structure");
        }
      } catch (parseError) {
        console.error("Failed to parse saved game:", parseError);
        Object.assign(gameData, defaultData);
      }
    } else {
      console.log("No saved game found, using defaults");
      Object.assign(gameData, defaultData);
    }
  } catch (error) {
    console.error("Failed to load game:", error);
    Object.assign(gameData, defaultData);
  }
  
  update_resource();
  initTechTree();
}

// Add periodic save verification
export function verifySaveSystem() {
  try {
    const testData = { test: Date.now() };
    localStorage.setItem('saveTest', JSON.stringify(testData));
    const retrieved = JSON.parse(localStorage.getItem('saveTest'));
    localStorage.removeItem('saveTest');
    
    if (retrieved.test === testData.test) {
      console.log("Save system working correctly");
      return true;
    } else {
      console.error("Save system verification failed");
      return false;
    }
  } catch (error) {
    console.error("Save system error:", error);
    return false;
  }
}

// Debug function to check localStorage status
export function debugLocalStorage() {
  console.log("=== LocalStorage Debug Info ===");
  console.log("localStorage supported:", typeof Storage !== "undefined" && !!window.localStorage);
  console.log("Current origin:", window.location.origin);
  console.log("Current pathname:", window.location.pathname);
  console.log("Protocol:", window.location.protocol);
  
  try {
    console.log("localStorage.length:", localStorage.length);
    console.log("Available space test:", localStorage.setItem('test', 'test'));
    localStorage.removeItem('test');
    console.log("Save game exists:", !!localStorage.getItem('Colony_of_sacrifceV2'));
  } catch (error) {
    console.error("localStorage access error:", error);
  }
}

// Add this to your initGame function
export function initGameWithDebug() {
  console.log("Initializing game...");
  debugLocalStorage();
  verifySaveSystem();
  
  loadGame();
  initTechTree();
  buildUI();
  update_resource();
  update_unlocks();
  
  // Test save immediately
  console.log("Testing initial save...");
  const saveSuccess = saveGame();
  console.log("Initial save result:", saveSuccess);
  
  // Continue with rest of initialization...
}
