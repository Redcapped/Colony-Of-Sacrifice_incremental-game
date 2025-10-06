import {gameData} from './gamedata.js'
import { capitalize,getTotalAnts,buyBuilding,updateTimerDisplay,startSmelt} from './coregame.js';
import { updateBuildingText } from './game.js';
import { adjustSacrificeLevel,performSacrifice,buyTotem } from './sacrifice.js';
export function buildUI(){
  buildResourceUI();
  buildAntUI();
  buildStatUI();
  buildBuildingUI();
  buildSacrificeUI();
  buildFurnaceUI();
  // After furnace UI is built, refresh its dynamic parts (have/need and Start button)
  refreshSelectedRecipeUI();
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
      <h3>🔥 Furnace</h3>
      
      <!-- Section 1: Recipe Selection -->
      <div class="furnace-section">
        <h4>Select Recipe</h4>
        <select id="recipeDropdown" class="recipe-dropdown">
          <option value="">-- Select a Recipe --</option>
        </select>
      </div>
      
      <!-- Section 2: Timer Duration -->
      <div class="furnace-section" id="timerSection" style="display:none;">
        <h4>Set Timer Duration</h4>
        <div class="timer-controls">
          <input type="range" id="timerSlider" min="1000" max="30000" step="100" value="${gameData.furnaceData.playerSetTime}">
          <span id="timerDisplay">${(gameData.furnaceData.playerSetTime / 1000).toFixed(1)}s</span>
        </div>
        <div class="preset-buttons">
          <button class="preset-btn" onclick="setPresetTime(5000)">5s</button>
          <button class="preset-btn" onclick="setPresetTime(10000)">10s</button>
          <button class="preset-btn" onclick="setPresetTime(15000)">15s</button>
          <button class="preset-btn" onclick="setPresetTime(20000)">20s</button>
          <button class="preset-btn" onclick="setPresetTime(25000)">25s</button>
        </div>
        
        <div class="recipe-info" id="recipeInfo">
          <p><strong>Selected:</strong> <span id="selectedRecipeName">None</span></p>
          <p><strong>Ingredients:</strong> <span id="selectedRecipeInputs">-</span></p>
          <p><strong>Output:</strong> <span id="selectedRecipeOutput">-</span></p>
          <p><strong>Target Range:</strong> <span id="selectedRecipeRange">-</span></p>
        </div>
        
        <button id="startSmeltBtn" class="main-btn" onclick="handleStartSmelt()">
          Start Smelting
        </button>
      </div>
      
      <!-- Furnace Status (shown during smelting) -->
      <div class="furnace-status" id="furnaceStatus" style="display:none;">
        <div id="furnaceTimer">Ready</div>
        <div id="furnaceProgress"></div>
        <button id="furnaceStopBtn" class="main-btn" onclick="handleStopSmelt()">
          Stop Early
        </button>
      </div>
      
      <!-- Section 3: Attempt History -->
      <div class="furnace-section" id="historySection" style="display:none;">
        <h4>Attempt History</h4>
        <div id="attemptHistory"></div>
      </div>
    </div>
  `;
  
  // Add event listener for recipe dropdown
  const dropdown = document.getElementById('recipeDropdown');
  if (dropdown) {
    dropdown.addEventListener('change', handleRecipeSelection);
  }
  
  // Add event listener for timer slider
  const slider = document.getElementById('timerSlider');
  if (slider) {
    slider.addEventListener('input', function() {
      gameData.furnaceData.playerSetTime = parseInt(this.value);
      updateTimerDisplay();
    });
  }
  
  // Populate recipe dropdown
  updateRecipeDropdown();
}

// Helper function to update recipe dropdown
function updateRecipeDropdown() {
  const dropdown = document.getElementById('recipeDropdown');
  if (!dropdown) return;
  
  // Keep the default option
  dropdown.innerHTML = '<option value="">-- Select a Recipe --</option>';

  // Add each recipe as an option (always selectable)
  for (const [recipeKey, recipe] of Object.entries(gameData.furnaceData.recipes)) {
    const option = document.createElement('option');
    option.value = recipeKey;
    option.textContent = recipe.name;
    dropdown.appendChild(option);
  }
}

// Handle recipe selection from dropdown
window.handleRecipeSelection = function() {
  const dropdown = document.getElementById('recipeDropdown');
  const selectedRecipe = dropdown.value;
  
  const timerSection = document.getElementById('timerSection');
  const historySection = document.getElementById('historySection');
  
  if (selectedRecipe) {
    // Show timer section and history
    timerSection.style.display = 'block';
    historySection.style.display = 'block';
    
    // Update recipe info
    const recipe = gameData.furnaceData.recipes[selectedRecipe];
    document.getElementById('selectedRecipeName').textContent = recipe.name;
    
    // Show inputs with availability (have / need)
    const inputsEl = document.getElementById('selectedRecipeInputs');
    inputsEl.innerHTML = '';
    for (const [res, amt] of Object.entries(recipe.inputs)) {
      const have = (gameData.resources[res]?.amount) || 0;
      const span = document.createElement('span');
      span.textContent = `${res}: ${have} / ${amt}`;
      span.style.marginRight = '12px';
      if (have >= amt) {
        span.style.color = '#28a745'; // green
      } else {
        span.style.color = '#dc3545'; // red
      }
      inputsEl.appendChild(span);
    }
    
    // Show output
    const output = Object.entries(recipe.output)
      .map(([res, amt]) => `${amt} ${res}`)
      .join(', ');
    document.getElementById('selectedRecipeOutput').textContent = output;
    
    // Show target range
    const minS = (recipe.minTime / 1000).toFixed(1);
    const maxS = (recipe.maxTime / 1000).toFixed(1);
    // The exact target is hidden from the player; display only min/max and a hint
    document.getElementById('selectedRecipeRange').textContent = 
      `${minS}s - ${maxS}s — (Hidden target; guess within tolerance to succeed)`;
    
    // Update history for this recipe
    updateAttemptHistoryForRecipe(selectedRecipe);

    // Store selected recipe in gameData
    gameData.furnaceData.selectedRecipe = selectedRecipe;

    // Enable/disable start button depending on resources and running state
    refreshSelectedRecipeUI();
  } else {
    // Hide sections if no recipe selected
    timerSection.style.display = 'none';
    historySection.style.display = 'none';
  }
};

// Handle start smelting
window.handleStartSmelt = function() {
  const selectedRecipe = gameData.furnaceData.selectedRecipe;
  if (!selectedRecipe) {
    alert('Please select a recipe first!');
    return;
  }
  // Check resources one more time before starting
  const recipe = gameData.furnaceData.recipes[selectedRecipe];
  for (const [res, amt] of Object.entries(recipe.inputs)) {
    if ((gameData.resources[res]?.amount || 0) < amt) {
      alert('Not enough resources to start this smelt.');
      return;
    }
  }

  startSmelt(selectedRecipe);
  
  // Hide recipe selection and timer section, show furnace status
  document.getElementById('timerSection').style.display = 'none';
  document.getElementById('furnaceStatus').style.display = 'block';
};

// Update attempt history for selected recipe
function updateAttemptHistoryForRecipe(recipeKey) {
  const historyDiv = document.getElementById('attemptHistory');
  if (!historyDiv) return;
  
  const recipe = gameData.furnaceData.recipes[recipeKey];
  if (!recipe || !recipe.attempts || recipe.attempts.length === 0) {
    historyDiv.innerHTML = '<p style="color:#888;">No attempts yet for this recipe.</p>';
    return;
  }
  
  // Show last 10 attempts
  const recentAttempts = recipe.attempts.slice(-10).reverse();
  
  let html = '<div class="history-list">';
  recentAttempts.forEach((attempt, index) => {
    const successClass = attempt.success ? 'success' : 'failure';
    const icon = attempt.success ? '✓' : '✗';
    html += `
      <div class="history-item ${successClass}">
        <span class="history-icon">${icon}</span>
        <span class="history-time">${(attempt.actualTime / 1000).toFixed(2)}s</span>
        <span class="history-result">${attempt.message}</span>
      </div>
    `;
  });
  html += '</div>';
  
  historyDiv.innerHTML = html;
}

// Periodic refresh for currently selected recipe UI (keeps counts up to date)
export function refreshSelectedRecipeUI() {
  const selected = gameData.furnaceData.selectedRecipe;
  const startBtn = document.getElementById('startSmeltBtn');
  const timerSection = document.getElementById('timerSection');
  if (!selected) {
    if (startBtn) startBtn.disabled = true;
    return;
  }
  const recipe = gameData.furnaceData.recipes[selected];
  let canCraft = true;
  for (const [res, amt] of Object.entries(recipe.inputs)) {
    if ((gameData.resources[res]?.amount || 0) < amt) {
      canCraft = false;
      break;
    }
  }

  // Update displayed inputs (have / need) so counts/colors refresh live
  const inputsEl = document.getElementById('selectedRecipeInputs');
  if (inputsEl) {
    inputsEl.innerHTML = '';
    for (const [res, amt] of Object.entries(recipe.inputs)) {
      const have = (gameData.resources[res]?.amount) || 0;
      const span = document.createElement('span');
      span.textContent = `${res}: ${have} / ${amt}`;
      span.style.marginRight = '12px';
      if (have >= amt) {
        span.style.color = '#28a745'; // green
      } else {
        span.style.color = '#dc3545'; // red
      }
      inputsEl.appendChild(span);
    }
  }

  // Disable start if furnace is running or not enough resources
  if (startBtn) startBtn.disabled = gameData.furnaceData.isRunning || !canCraft;

  // ensure timer section visible when selected
  if (timerSection) timerSection.style.display = 'block';
}
// No polling here: refreshSelectedRecipeUI() is called from update_resource() to keep counts live
