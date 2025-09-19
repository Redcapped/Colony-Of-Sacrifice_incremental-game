import {gameData} from './gamedata.js'
import { performSacrifice,capitalize,getTotalAnts} from './coregame.js';
import { updateBuildingText } from './game.js';
export function buildUI(){
      buildResourceUI();
      buildAntUI();
      buildStatUI();
      buildBuildingUI();
      buildSacrificeUI();
}
function buildAntUI() {
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
export function buildResourceUI() {
  enableTooltips();
  const section = document.getElementById("resourcesSection");
  section.innerHTML = ""; // clear any old content

  // Loop through all resources in gameData
  for (let resName in gameData.resources) {
    
    const res = gameData.resources[resName];
    const resUnlocked = gameData.resources[resName]?.unlocked;

    const row = document.createElement("div");
    row.className = "resourceRow";
    row.id = capitalize(resName) + "Row";
    row.style.display = resUnlocked ? "flex" : "none";

    // Resource name
    const nameSpan = document.createElement("span");
    nameSpan.className = "resName";
    nameSpan.innerText = capitalize(resName);
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
function buildSacrificeUI() {
  const container = document.getElementById("sacrificeContainer");
  if (!container) return; // safety check
  const sacrifices = gameData.sacrifice.types;

  for (const key in sacrifices) {
    const sacrifice = sacrifices[key];
    if (!sacrifice) continue;

    // Tooltip wrapper
    const tooltipWrapper = document.createElement("div");
    tooltipWrapper.className = "tooltip";
    tooltipWrapper.style.display = sacrifice.unlocked ? "block" : "none";

    // Button
    const btn = document.createElement("button");
    btn.className = "sacrifice-btn";
    btn.id = `btnSacrifice${capitalize(key)}`;
    btn.textContent = sacrifice.title || capitalize(key);

    // Click listener for performing sacrifice
    btn.addEventListener("click", () => performSacrifice(key));

    // Tooltip span
    const tooltipText = document.createElement("span");
    tooltipText.className = "tooltiptext";
    tooltipText.id = `sac${capitalize(key)}Tooltip`;
    tooltipText.textContent = sacrifice.tooltipText || "";

    // Assemble button + tooltip
    tooltipWrapper.appendChild(btn);
    tooltipWrapper.appendChild(tooltipText);
    container.appendChild(tooltipWrapper);

    // Info (always visible, like your HTML mockup)
    const infoDiv = document.createElement("div");
    infoDiv.id = `sacrifice${capitalize(key)}Info`;
    infoDiv.innerHTML = ``;
    infoDiv.style.display = sacrifice.unlocked ? "block" : "none";
    container.appendChild(infoDiv);
  }
}
export function buildStatUI() {
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
    { name: "breedspeed (S)",              single: (gameData.ants.antsBreedingSpeed*gameData.ants.nurserieFactor)    , total: ((gameData.ants.antsBreedingSpeed*gameData.ants.nurserieFactor  )/ Math.floor(gameData.ants.assignedAnts.free/2)).toFixed(0) },
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

