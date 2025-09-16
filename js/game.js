// ----------------- Imports -----------------
import {getDefaultGameData, gameData, saveGame, capitalize, collectResource,update_resource, adjustSacLevel,adjustAnt, recruitAnt, buyBuilding, updateGameTick,getTotalAnts} from './coregame.js';
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
  buildResourceUI();
  buildStatUI();
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
      if (antLineEl) antLineEl.style.display = resUnlocked ? "grid" : "none";
    }
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
  const sacrificeBloodContainer = document.getElementById("sacrificeBloodContainer");
  if (sacrificeBloodContainer) {
  sacrificeBloodContainer.style.display =gameData.sacrifice.unlocked ? "block" : "none";

  const btnSacrificeAnt = document.getElementById("btnSacrificeAnt");
  if (btnSacrificeAnt) {
    btnSacrificeAnt.disabled = gameData.ants.assignedAnts.free <= 0;
  }
}
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
  buildAntUI();
  buildStatUI();
  buildBuildingUI();

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
  enableTooltips();
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
function buildStatUI() {
  // ===== Resources Table =====
  const tbody = document.getElementById("statsTableBody");
  tbody.innerHTML = ""; // clear old rows
  const resources = gameData.resources;

  for (const key in resources) {
    const res = resources[key];

    // Only show unlocked resources (optional)
    if (!res.unlocked) continue;

    const row = document.createElement("tr");

    // Resource name (capitalized)
    const nameCell = document.createElement("td");
    nameCell.textContent = capitalize(key);
    row.appendChild(nameCell);

    // Cost (list of costs or "free")
    const costCell = document.createElement("td");
    costCell.id = `stat${capitalize(key)}Cost`;
    costCell.textContent =
      Object.keys(res.cost).length > 0
        ? Object.entries(res.cost)
            .map(([resName, val]) => `${val} ${capitalize(resName)}`)
            .join(", ")
        : "free";
    row.appendChild(costCell);

    // Production
    const prodCell = document.createElement("td");
    prodCell.id = `stat${capitalize(key)}Prod`;
    prodCell.textContent = res.prodFactor;
    row.appendChild(prodCell);

    tbody.appendChild(row);
  }

  // ===== Breeding Stats Table =====
  const breedingTbody = document.getElementById("breedingTableBody");
  breedingTbody.innerHTML = "";

  const breedingStats = [
    { name: "Ant sugar need (S)",         single: 1/gameData.ants.antSugarConsumtion   , total:(1/(gameData.ants.antSugarConsumtion)*getTotalAnts()).toFixed(2)},
    { name: "breedspeed (S)",              single: (gameData.ants.antsBreedingSpeed)    , total: ((gameData.ants.antsBreedingSpeed  )/ Math.floor(gameData.ants.assignedAnts.free/2)).toFixed(0) },
    { name: "sugar / new ant",             single: (gameData.ants.antsBreedingCost), total:'-'   },
    { name: "sugarcost breeding",          single: (gameData.ants.antsBreedingCost/gameData.ants.antsBreedingSpeed).toFixed(3), total:(gameData.ants.antsBreedingCost/gameData.ants.antsBreedingSpeed)*Math.floor(gameData.ants.assignedAnts.free/2).toFixed(3)  }
  ];

  for (const stat of breedingStats) {
    if (!gameData.ants.breedingUnlocked) continue;
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.textContent = stat.name;
    row.appendChild(nameCell);

    const singleCell = document.createElement("td");
    singleCell.textContent = stat.single;
    row.appendChild(singleCell);

    const totalCell = document.createElement("td");
    totalCell.textContent = stat.total;
    row.appendChild(totalCell);

    breedingTbody.appendChild(row);
  }

  // ===== Buildings Table =====
  const buildingTbody = document.getElementById("buildingsTableBody");
  buildingTbody.innerHTML = "";

  const buildings = gameData.buildings;
  for (const key in buildings) {
    
    const b = buildings[key];
    if (!b.unlocked) continue;
    const row = document.createElement("tr");

    // Building name
    const nameCell = document.createElement("td");
    nameCell.textContent = capitalize(key);
    row.appendChild(nameCell);

    // How many built
    const amountCell = document.createElement("td");
    amountCell.textContent = b.level || 0;
    row.appendChild(amountCell);

    // Effect text
    const effectTextCell = document.createElement("td");
    effectTextCell.textContent = b.effectText || "-";
    row.appendChild(effectTextCell);

    // Effect text
    const effectCell = document.createElement("td");
    effectCell.textContent = b.effect*b.level || "-";
    row.appendChild(effectCell);

    buildingTbody.appendChild(row);
  }
}
function buildBuildingUI() {
  const container = document.getElementById("buildingsContainer");
  if (!container) return; // safety check
  const buildings = gameData.buildings;

  for (const key in buildings) {
    const building = buildings[key];

    if (!building) continue;

    // Tooltip wrapper
    const tooltipWrapper = document.createElement("div");
    tooltipWrapper.className = "tooltip";
    tooltipWrapper.style.display = building.unlocked ? "block" : "none";

    // Button
    const btn = document.createElement("button");
    btn.className = "build-btn";
    btn.id = `build${capitalize(key)}Btn`;

    // Click listener
    btn.addEventListener('click', () => buyBuilding(`${key}`));

    // Tooltip
    const tooltipText = document.createElement("span");
    tooltipText.className = "tooltiptext";
    tooltipText.id = `build${capitalize(key)}Tooltip`;

    

    // Assemble
    tooltipWrapper.appendChild(btn);
    tooltipWrapper.appendChild(tooltipText);
    container.appendChild(tooltipWrapper);

    // Add text to button
    updateBuildingText(key)
  }
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
tooltip.innerText = `${building.tooltipText} (+${building.effect} ${building.effectText}, Cost: ${costStrings.join(", ")})`
btn.innerText = `${capitalize(buildingName)}  (${building.level})`


}
function enableTooltips() {
  // Find all elements with class "tooltip" that contain a ".tooltiptext" span
  const tooltips = document.querySelectorAll(".tooltip");

  tooltips.forEach(wrapper => {
    const tooltip = wrapper.querySelector(".tooltiptext");
    if (!tooltip) return;

    // On hover, auto-flip if tooltip would go offscreen
    wrapper.addEventListener("mouseenter", () => {
      tooltip.classList.remove("top"); // reset
      const rect = tooltip.getBoundingClientRect();
      if (rect.bottom > window.innerHeight) {
        tooltip.classList.add("top"); // flip above button
      }
    });
  });
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