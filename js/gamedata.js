export function getDefaultGameData() {
  return {
    gameUpdateRate:5,
    resources:{
      water:  { amount: 0,  max: 25,   prodFactor: 1,     passive:0, assigned: 'water',    cost: {},           unlocked:true,  info:{gain:0,loss:0}, bonusProdAdd:0, bonusProdMul:1, bonusMaxAdd:0,bonusMaxMul:1},
      wood:   { amount: 0,  max: 25,   prodFactor: 1,     passive:0, assigned: 'wood',     cost: {water: 2 },  unlocked:false, info:{gain:0,loss:0}, bonusProdAdd:0, bonusProdMul:1, bonusMaxAdd:0,bonusMaxMul:1},
      sugar:  { amount: 0,  max: 25,   prodFactor: 0.5,   passive:0, assigned: 'sugar',    cost: {water: 10},  unlocked:false, info:{gain:0,loss:0}, bonusProdAdd:0, bonusProdMul:1, bonusMaxAdd:0,bonusMaxMul:1},
      lumber: { amount: 0,  max: 20,   prodFactor: 0.05,  passive:0, assigned: 'lumber',   cost: {wood:  25},  unlocked:false, info:{gain:0,loss:0}, bonusProdAdd:0, bonusProdMul:1, bonusMaxAdd:0,bonusMaxMul:1},
      stone:  { amount: 0,  max: 25,   prodFactor: 1,     passive:0, assigned: 'stone',    cost: {},           unlocked:false, info:{gain:0,loss:0}, bonusProdAdd:0, bonusProdMul:1, bonusMaxAdd:0,bonusMaxMul:1},
      science:{ amount: 0,  max: 50,   prodFactor: 0.2,   passive:0, assigned: 'science',  cost: {sugar: 2 },  unlocked:false, info:{gain:0,loss:0}, bonusProdAdd:0, bonusProdMul:1, bonusMaxAdd:0,bonusMaxMul:1},
      blood:  { amount: 0,  max: 5,    prodFactor: 0.01,  passive:0, assigned: 'blood',    cost: {},           unlocked:false, info:{gain:0,loss:0}, bonusProdAdd:0, bonusProdMul:1, bonusMaxAdd:0,bonusMaxMul:1}},
    ants:{
      recruitAntUnlocked:false,maxAnts: 10,
      assignedAnts:   { free: 0, water: 0, wood: 0, sugar: 0 ,lumber:0,stone:0,science:0},
      assignedLimits: { lumber:1 , science:1},
      antSugarConsumtion:20,
      breedingUnlocked:false , partialAnts: 0, antsBreedingSpeed:64, antsBreedingCost:8 ,nurserieFactor:1},
    buildings:{
      anthut:     {unlocked: false, level: 0 , costMultiplier: 1.25,  effect:2,   baseCost:{'wood':   10}, effectText:'Increases max ants by', tooltipText:'Basic place for an ant to live'},
      lumbermill: {unlocked: false, level: 0 , costMultiplier: 2,     effect:1,   baseCost:{'wood':   10}, effectText:'Increases max lumber ants by:',tooltipText:'More places for lumber ants to work'},
      desk:       {unlocked: false, level: 0 , costMultiplier: 2.5,   effect:1,   baseCost:{'lumber': 2 }, effectText:'Increases max science ants by',tooltipText:'More places for science ants to work'},
      storageroom:{unlocked: false, level: 0 , costMultiplier: 1.5,   effect:10,  baseCost:{'lumber': 5 }, effectText:'Increases max storage of wood and suger by',tooltipText:'Basic place for ants to put stuff'},
      temple:     {unlocked: false, level: 0 , costMultiplier: 2.5,   effect:1,   baseCost:{'lumber': 2 }, effectText:'Increases max science ants by',tooltipText:'More places for science ants to work'},
      lybarie:    {unlocked: false, level: 0 , costMultiplier: 2.5,   effect:1,   baseCost:{'lumber': 2 }, effectText:'Increases max science ants by',tooltipText:'More places for science ants to work'},
      nurserie:   {unlocked: false, level: 0 , costMultiplier: 1.1,   effect:0.98,   baseCost:{'lumber': 5 , "sugar":2 }, effectText:'decrease the breeding time by %',tooltipText:'better support for breeding ants'},
      aquaduct:   {unlocked: false, level: 0 , costMultiplier: 1.25,  effect:0.25,   baseCost:{'lumber': 10,'stone':5}, effectText:'Adds passiv waterproduction',tooltipText:'Why do work when gravity can do it for use'},
    },
    sacrifice:{unlocked:false, cooldownMult:1, cooldownAdd:0 ,durationMult:1, durationAdd:0, globalLevel:1,globalMaxLevel:1,
      types:{
        ant:    {unlocked:false, cooldown:5 ,  duration:5,  baseAntcost:1,  baseBloodcost:0,  baseEffect:2,   effectText:'blood and sugar',                             lastUse:0,isActive: false,isOnCooldown:false,tooltipText:'Sacrifce ant to gain blood'},
        fish:   {unlocked:false, cooldown:60 , duration:60, baseAntcost:1,  baseBloodcost:5,  baseEffect:1.2, effectText:'times increase to water production',lastUse:0,isActive: false,isOnCooldown:false,tooltipText:'Sacrifice ant to gain water production'},
        owl:    {unlocked:false, cooldown:120 , duration:120, baseAntcost:2,  baseBloodcost:15, baseEffect:2,   effectText:'times increase to max knowlage',   lastUse:0,isActive: false,isOnCooldown:false,tooltipText:'Sacrifce ant to gain max science'},
        rabbit: {unlocked:false, cooldown:120 , duration:120, baseAntcost:2,  baseBloodcost:15, baseEffect:2,   effectText:'times increase to breeding speed',   lastUse:0,isActive: false,isOnCooldown:false,tooltipText:'Sacrifce ant to gain breeding speed'},
        beaver: {unlocked:false, cooldown:120 , duration:120, baseAntcost:2,  baseBloodcost:15, baseEffect:2,   effectText:'times increase to wood production',   lastUse:0,isActive: false,isOnCooldown:false,tooltipText:'Sacrifce ant to gain wood production'}
      }

    },
    research: {}
  };
}
export let gameData = getDefaultGameData()
window.gameData = gameData;