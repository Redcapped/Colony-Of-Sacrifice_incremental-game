import {gameData} from './gamedata.js'
import { capitalize,getTotalAnts,buyBuilding,updateTimerDisplay} from './coregame.js';
import { updateBuildingText } from './game.js';
import { adjustSacrificeLevel,performSacrifice,buyTotem } from './sacrifice.js';
export function buildUI(){
      buildResourceUI();
      buildAntUI();
      buildStatUI();
      buildBuildingUI();
      buildSacrificeUI();
      buildFurnaceUI();
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
  // Clear existing content to prevent duplicates
  container.innerHTML = ""; 
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

    // Main sacrifice card container
    const sacrificeCard = document.createElement("div");
    sacrificeCard.className = "sacrifice-card";
    sacrificeCard.style.display = sacrifice.unlocked ? "block" : "none";
    sacrificeCard.id = `sacrificeCard${capitalize(key)}`;

    // Level controls container (small)
    const levelControls = document.createElement("div");
    levelControls.className = "sacrifice-level-controls-small";

    // Decrease level button
    const decreaseBtn = document.createElement("button");
    decreaseBtn.className = "sacrifice-level-btn-small";
    decreaseBtn.id = `btnSacrifice${capitalize(key)}Minus`;
    decreaseBtn.textContent = "-";
    decreaseBtn.addEventListener("click", () => adjustSacrificeLevel(key, -1));

    // Current level display
    const levelDisplay = document.createElement("span");
    levelDisplay.className = "sacrifice-level-display-small";
    levelDisplay.id = `sacrifice${capitalize(key)}Level`;
    levelDisplay.textContent = sacrifice.level || 1;

    // Increase level button
    const increaseBtn = document.createElement("button");
    increaseBtn.className = "sacrifice-level-btn-small";
    increaseBtn.id = `btnSacrifice${capitalize(key)}Plus`;
    increaseBtn.textContent = "+";
    increaseBtn.addEventListener("click", () => adjustSacrificeLevel(key, 1));

    // Assemble level controls
    levelControls.appendChild(decreaseBtn);
    levelControls.appendChild(levelDisplay);
    levelControls.appendChild(increaseBtn);
    sacrificeCard.appendChild(levelControls);

    // Main sacrifice button (with tooltip)
    const tooltipWrapper = document.createElement("div");
    tooltipWrapper.className = "tooltip";

    const sacrificeBtn = document.createElement("button");
    sacrificeBtn.className = "sacrifice-btn";
    sacrificeBtn.id = `btnSacrifice${capitalize(key)}`;
    sacrificeBtn.textContent = sacrifice.title || capitalize(key);
    sacrificeBtn.addEventListener("click", () => performSacrifice(key));

    // Tooltip for sacrifice button
    const tooltipText = document.createElement("span");
    tooltipText.className = "tooltiptext";
    tooltipText.id = `sac${capitalize(key)}Tooltip`;
    tooltipText.textContent = sacrifice.tooltipText || "";

    tooltipWrapper.appendChild(sacrificeBtn);
    tooltipWrapper.appendChild(tooltipText);
    sacrificeCard.appendChild(tooltipWrapper);

    // Totem purchase button (hidden until totem is unlocked)
    const totemWrapper = document.createElement("div");
    totemWrapper.className = "tooltip totem-wrapper";
    totemWrapper.id = `totemWrapper${capitalize(key)}`;
    totemWrapper.style.display = (sacrifice.totem && sacrifice.totem.unlocked) ? "block" : "none";

    const totemBtn = document.createElement("button");
    totemBtn.className = "totem-btn";
    totemBtn.id = `btnTotem${capitalize(key)}`;
    totemBtn.textContent = sacrifice.totem ? `Buy ${sacrifice.totem.name || 'Totem'}` : 'Buy Totem';
    totemBtn.addEventListener("click", () => buyTotem(key));

    // Tooltip for totem button
    const totemTooltipText = document.createElement("span");
    totemTooltipText.className = "tooltiptext";
    totemTooltipText.id = `totem${capitalize(key)}Tooltip`;
    totemTooltipText.textContent = sacrifice.totem ? (sacrifice.totem.tooltipText || "") : "";

    totemWrapper.appendChild(totemBtn);
    totemWrapper.appendChild(totemTooltipText);
    sacrificeCard.appendChild(totemWrapper);

    // Cooldown loading bar (replaces info section)
    const cooldownContainer = document.createElement("div");
    cooldownContainer.className = "sacrifice-cooldown-container";
    cooldownContainer.id = `sacrifice${capitalize(key)}Cooldown`;
    
    const cooldownLabel = document.createElement("div");
    cooldownLabel.className = "sacrifice-cooldown-label";
    cooldownLabel.textContent = "Ready";
    cooldownContainer.appendChild(cooldownLabel);

    const cooldownBar = document.createElement("progress");
    cooldownBar.className = "sacrifice-cooldown-bar";
    cooldownBar.id = `sacrifice${capitalize(key)}CooldownBar`;
    cooldownBar.value = 0;
    cooldownBar.max = 100;
    cooldownBar.style.display = "none"; // Hidden when not on cooldown
    cooldownContainer.appendChild(cooldownBar);

    sacrificeCard.appendChild(cooldownContainer);

    container.appendChild(sacrificeCard);
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
    nameCell.className = "resource-name";
    nameCell.textContent = capitalize(key);
    row.appendChild(nameCell);

    // Cost (list of costs or "free")
    const costCell = document.createElement("td");
    costCell.className = "resource-cost";
    costCell.id = `stat${capitalize(key)}Cost`;
    costCell.textContent =
      Object.keys(res.cost).length > 0
        ? Object.entries(res.cost)
            .map(([resName, val]) => `${val} ${capitalize(resName)}`)
            .join(", ")
        : "Free";
    row.appendChild(costCell);

    // Production
    const prodCell = document.createElement("td");
    prodCell.className = "resource-production";
    prodCell.id = `stat${capitalize(key)}Prod`;
    prodCell.textContent = res.prodFactor;
    row.appendChild(prodCell);

    tbody.appendChild(row);
  }

  // ===== Breeding Stats Table =====
  const breedingTbody = document.getElementById("breedingTableBody");
  breedingTbody.innerHTML = "";
  const ants = gameData.ants
  var breedingAnts = 0
  if (getTotalAnts() < ants.maxAnts){
    breedingAnts = Math.floor(gameData.ants.assignedAnts.free/2)
  }
  const breeding = ants.breeding
  const breedingStats = [
    { name: "Ant sugar consumption (S)", single: (1/ants.antSugarConsumtion).toFixed(2), total: (1/(ants.antSugarConsumtion)*getTotalAnts()).toFixed(2)},
    { name: "Breeding speed (S)", single: (breeding.speed*breeding.nurserieFactor).toFixed(2), total: ((breeding.speed*breeding.nurserieFactor)/ breedingAnts).toFixed(2) },
    { name: "Sugar per new ant", single: breeding.cost, total: 'Fixed cost' },
    { name: "Sugar cost for breeding", single: (breeding.cost/breeding.speed).toFixed(3), total: ((breeding.cost/breeding.speed)*breedingAnts).toFixed(3) },
    { name: "Total sugar cost ants (S)", single: '-', total: (((breeding.cost/breeding.speed)*breedingAnts) + (1/(ants.antSugarConsumtion)*getTotalAnts())).toFixed(2)  }
  ];

  for (const stat of breedingStats) {
    if (!breeding.unlocked) continue;
    const row = document.createElement("tr");

    const nameCell = document.createElement("td");
    nameCell.className = "stat-name";
    nameCell.textContent = stat.name;
    row.appendChild(nameCell);

    const singleCell = document.createElement("td");
    singleCell.className = "stat-value";
    singleCell.textContent = stat.single;
    row.appendChild(singleCell);

    const totalCell = document.createElement("td");
    totalCell.className = "stat-value";
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
    nameCell.className = "building-name";
    nameCell.textContent = capitalize(key);
    row.appendChild(nameCell);

    // How many built
    const amountCell = document.createElement("td");
    amountCell.className = "building-count";
    amountCell.textContent = b.level || 0;
    row.appendChild(amountCell);

    // Effect description
    const effectTextCell = document.createElement("td");
    effectTextCell.className = "building-effect";
    effectTextCell.textContent = `${b.effectText} ${(b.effect * b.level).toFixed(2) || "0"}` || "No effect description";
    row.appendChild(effectTextCell);


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
function buildFurnaceUI() {
  const container = document.getElementById('furnaceContainer');
  if (!container) {
    console.warn('Furnace container not found');
    return;
  }
  
  container.innerHTML = `
    <div class="furnace-panel">
      <h3>Furnace</h3>
      
      <div class="timer-setting">
        <h4>Set Timer Duration</h4>
        <div class="timer-controls">
          <input type="range" id="timerSlider" min="1000" max="15000" step="100" value="${gameData.furnaceData.playerSetTime}">
          <span id="timerDisplay">${(gameData.furnaceData.playerSetTime / 1000).toFixed(1)}s</span>
        </div>
        <div class="preset-buttons">
          <button class="preset-btn" onclick="setPresetTime(3000)">3s</button>
          <button class="preset-btn" onclick="setPresetTime(5000)">5s</button>
          <button class="preset-btn" onclick="setPresetTime(7000)">7s</button>
          <button class="preset-btn" onclick="setPresetTime(10000)">10s</button>
        </div>
      </div>
      
      <div class="furnace-status">
        <div id="furnaceTimer">Ready</div>
        <div id="furnaceProgress"></div>
        <button id="furnaceStopBtn" class="main-btn" style="display:none" onclick="handleStopSmelt()">
          Stop Early
        </button>
      </div>
      
      <div class="recipe-selection">
        <h4>Recipes</h4>
        <div id="recipeButtons"></div>
      </div>
      
      <div class="attempt-history">
        <h4>Attempt History</h4>
        <div id="attemptHistory"></div>
      </div>
    </div>
  `;
  
  // Add event listener for timer slider
  const slider = document.getElementById('timerSlider');
  if (slider) {
    slider.addEventListener('input', function() {
      gameData.furnaceData.playerSetTime = parseInt(this.value);
      updateTimerDisplay();
    });
  }
}
