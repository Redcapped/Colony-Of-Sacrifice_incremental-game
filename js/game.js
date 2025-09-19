// ----------------- Imports -----------------
import { saveGame, capitalize, collectResource,update_resource, adjustSacLevel,adjustAnt, recruitAnt, buyBuilding, updateGameTick,getTotalAnts} from './coregame.js';
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
function loadGame() {
  const defaultData = getDefaultGameData();
  const saved = localStorage.getItem('Colony_of_sacrifceV2');
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