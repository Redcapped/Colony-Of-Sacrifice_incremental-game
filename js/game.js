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
  const resourceElements = {
    wood:      { btn: "collectWoodBtn", res: "woodResource", antLine: "woodAntLine" },
    lumber:    { btn: null, res: "lumberResource", antLine: "lumberAntLine" },
    stone:     { btn: null, res: "stoneResource", antLine: null },
    science:   { btn: null, res: "scienceResource", antLine: "scienceAntLine"},
    blood:     { btn: null, res: "bloodResource", antLine: null },
    sugar:     { btn: "collectSugarBtn", res: "sugarResource", antLine: "sugarAntLine" }
  };

  // ---------------- Resources ----------------
  for (let key in resourceElements) {
    const resData = resourceElements[key];
    const resUnlocked = gameData.resources[key]?.unlocked;

    const resEl = document.getElementById(resData.res);
    if (resEl) resEl.style.display = resUnlocked ? "flex" : "none";

    if (resData.btn) {
      const btnEl = document.getElementById(resData.btn);
      if (btnEl) btnEl.style.display = resUnlocked ? "inline-block" : "none";
    }

    if (resData.antLine) {
      const antLineEl = document.getElementById(resData.antLine);
      if (antLineEl) antLineEl.style.display = resUnlocked ? "inline-block" : "none";
    }
  }

  // ---------------- Buildings ----------------
  if (gameData.buildings.anthutUnlocked) {
    const anthutBtn = document.getElementById("buildAnthutBtn");
    if (anthutBtn) {
      anthutBtn.innerText = `Build Anthut (+${gameData.buildings.anthutResidens} max ants, Cost: ${Math.floor(gameData.buildings.anthutBaseCost * Math.pow(gameData.buildings.anthutCostMultiplier, gameData.buildings.anthutLevel))} woodspliters)`;
      anthutBtn.style.display = "inline-block";
    }
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

  // ---------------- Resource UI ----------------
  update_resource();
}




// ----------------- Game Initialization -----------------
export function initGame() {
  loadGame();
  initTechTree();
  update_resource();
  update_unlocks();
  buildResourceUI();
  buildAntUI()

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
  document.getElementById('btnAntLumberMinus')?.addEventListener('click', () => adjustAnt('lumber', -1));
  document.getElementById('btnAntLumberPlus')?.addEventListener('click', () => adjustAnt('lumber', 1));
  document.getElementById('btnAntScienceMinus')?.addEventListener('click', () => adjustAnt('science', -1));
  document.getElementById('btnAntSciencePlus')?.addEventListener('click', () => adjustAnt('science', 1));

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
export function buildResourceUI() {
  const section = document.getElementById("resourcesSection");
  section.innerHTML = ""; // clear any old content

  // Loop through all resources in gameData
  for (let resName in gameData.resources) {
    const res = gameData.resources[resName];

    // Only show if unlocked or alwaysVisible (optional)
    if (!res.unlocked && !res.alwaysVisible) continue;

    const row = document.createElement("div");
    row.className = "resourceRow";
    row.id = resName + "Row";

    // Resource name
    const nameSpan = document.createElement("span");
    nameSpan.className = "resName";
    nameSpan.innerText = resName.charAt(0).toUpperCase() + resName.slice(1);
    row.appendChild(nameSpan);

    // Progress bar
    const bar = document.createElement("progress");
    bar.id = resName + "Bar";
    bar.value = 0;
    bar.max = res.max || 100;
    bar.classList.add("bar-medium");
    bar.className = "bar";
    row.appendChild(bar);

    // Amount text
    const amountSpan = document.createElement("span");
    amountSpan.id = resName + "Amount";
    amountSpan.className = "amount";
    amountSpan.innerText = `0/${res.max || 0}`;
    row.appendChild(amountSpan);

    // Net gain
    const netSpan = document.createElement("span");
    netSpan.id = resName + "Net";
    netSpan.className = "netGain";
    netSpan.innerText = "+0/s";
    row.appendChild(netSpan);

    section.appendChild(row);
  }
}
export function buildAntUI() {
  const section = document.getElementById("antSection");
  section.innerHTML = ""; // clear old content

  const row = document.createElement("div");
  row.className = "resourceRow"; // reuse same styling

  // Label
  const nameSpan = document.createElement("span");
  nameSpan.className = "resName";
  nameSpan.innerText = "Ants";
  row.appendChild(nameSpan);

  // Breeding bar
  const bar = document.createElement("progress");
  bar.id = "breedingBar";
  bar.value = 0;
  bar.max = 1; // breeding progress is fraction of an ant
  bar.classList.add("bar-medium");
  row.appendChild(bar);

  // Ant count text
  const countSpan = document.createElement("span");
  countSpan.id = "antCount";
  countSpan.innerText = `0/${gameData.ants.maxAnts}`;
  row.appendChild(countSpan);

  section.appendChild(row);
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