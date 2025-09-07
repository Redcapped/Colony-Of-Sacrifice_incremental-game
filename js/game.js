// ----------------- Imports -----------------
import {getDefaultGameData, gameData, saveGame, collectResource,update_resource, autoCollect, consumeSugar, adjustAnt, recruitAnt, buyAnthut, breedAnts } from './coregame.js';
import { initTechTree } from './techTree.js';

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
  if (gameData.resources.wood.unlocked) {
    const woodBtn = document.getElementById("collectWoodBtn");
    const woodRes = document.getElementById("woodResource");
    if (woodBtn) woodBtn.style.display = "inline-block";
    if (woodRes) woodRes.style.display = "flex";
    const woodAntLine = document.getElementById("woodAntLine");
  if (woodAntLine) {woodAntLine.style.display = "inline-block"; // show when research done
  }  // hide otherwise
  }

  

  if (gameData.buildings.anthutUnlocked) {
    const anthutBtn = document.getElementById("buildAnthutBtn");
    if (anthutBtn) {
      anthutBtn.innerText = `Build Anthut (+${gameData.buildings.anthutResidens} max ants, Cost: ${Math.floor(gameData.buildings.anthutBaseCost * Math.pow(gameData.buildings.anthutCostMultiplier, gameData.buildings.anthutLevel))} woodspliters)`;
      anthutBtn.style.display = "inline-block";
    }
  }
  if (gameData.resources.sugar.unlocked){
    const collectSugarBtn = document.getElementById("collectSugarBtn");
    if (collectSugarBtn) collectSugarBtn.style.display = "inline-block";

  }
  if (gameData.ants.recruitAntUnlocked) {
    const recruitBtn = document.getElementById("recruitAntBtn");
    if (recruitBtn) recruitBtn.style.display = "inline-block";
  }
    if (gameData.ants.breedingUnlocked) {
    const breedingRate = document.getElementById("breedingRate");
    if (breedingRate) breedingRate.style.display = "inline-block";
  }

  update_resource();
}

// ----------------- Game Initialization -----------------
export function initGame() {
  loadGame();
  initTechTree();
  update_resource();
  update_unlocks();

  // ----------------- Intervals -----------------
  setInterval(autoCollect, 1000 / gameData.gameUpdateRate);
  setInterval(consumeSugar, 1000 / gameData.gameUpdateRate);
  setInterval(breedAnts, 1000 / gameData.gameUpdateRate);

  // ----------------- Button Listeners -----------------
    // Main buttons
  document.getElementById('collectWaterBtn')?.addEventListener('click', () => collectResource('water', 1));
  document.getElementById('collectWoodBtn')?.addEventListener('click', () => collectResource('wood', 1));
  document.getElementById('collectSugarBtn')?.addEventListener('click', () => collectResource('sugar', 1));

  document.getElementById('recruitAntBtn')?.addEventListener('click', recruitAnt);
  document.getElementById('buildAnthutBtn')?.addEventListener('click', buyAnthut);

  // Ant assignment
  document.getElementById('btnAntWaterMinus')?.addEventListener('click', () => adjustAnt('water', -1));
  document.getElementById('btnAntWaterPlus')?.addEventListener('click', () => adjustAnt('water', 1));
  document.getElementById('btnAntSugarMinus')?.addEventListener('click', () => adjustAnt('sugar', -1));
  document.getElementById('btnAntSugarPlus')?.addEventListener('click', () => adjustAnt('sugar', 1));
  document.getElementById('btnAntWoodMinus')?.addEventListener('click', () => adjustAnt('wood', -1));
  document.getElementById('btnAntWoodPlus')?.addEventListener('click', () => adjustAnt('wood', 1));

  // Tabs
  document.getElementById('tabMainBtn')?.addEventListener('click', () => openTab('main'));
  document.getElementById('tabResearchBtn')?.addEventListener('click', () => openTab('research'));
  document.getElementById('tabAntsBtn')?.addEventListener('click', () => openTab('ants'));
  document.getElementById('tabSettingsBtn')?.addEventListener('click', () => openTab('settings'));

  // Research subtabs
  document.getElementById('researchAvailableBtn')?.addEventListener('click', () => openResearchTab('available'));
  document.getElementById('researchPurchasedBtn')?.addEventListener('click', () => openResearchTab('purchased'));

  // Reset button
  document.getElementById('resetGameBtn')?.addEventListener('click', resetGame);
}
// ----------------- Load on Window -----------------
window.addEventListener("DOMContentLoaded", () => {
  initGame();
});

function loadGame() {
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

  const defaults = getDefaultGameData();
  for (let key in defaults) {
    gameData[key] = defaults[key];
  }
  saveGame();
  update_resource();
  update_unlocks();
  initTechTree();


  window.location.reload();
}

