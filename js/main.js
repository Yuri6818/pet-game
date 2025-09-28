// Initialize Game
function init() {
  document.body.className = 'home'; // Set initial background
  loadGame();
  updateUI();
  updateServerTime();
  setInterval(updateServerTime, 1000);
  renderAllSections();
}

// Save/Load Game
function saveGame() {
  localStorage.setItem("familiarGameSave", JSON.stringify(gameState));
}

function loadGame() {
  let saved = localStorage.getItem("familiarGameSave");
  let isNewSave = true;

  if (!saved) {
    saved = localStorage.getItem("petGameSave");
    isNewSave = false;
  }

  if (saved) {
    let savedGameState = JSON.parse(saved);

    // One-time migration from old save
    if (!isNewSave) {
      if (savedGameState.pets) {
        savedGameState.familiars = savedGameState.pets;
        delete savedGameState.pets;
      }
      if (savedGameState.activities && savedGameState.activities.catching) {
        savedGameState.activities.enchanting = savedGameState.activities.catching;
        delete savedGameState.activities.catching;
      }
    }

    if (savedGameState.familiars) {
      const migratedFamiliars = savedGameState.familiars.map(savedFamiliar => {
        const initialFamiliarData = gameState.familiars.find(f => f.id === savedFamiliar.id) || {};
        const migratedFamiliar = {
          ...initialFamiliarData,
          ...savedFamiliar
        };
        // Ensure essential stats are present
        migratedFamiliar.hp = migratedFamiliar.hp || 50;
        migratedFamiliar.attack = migratedFamiliar.attack || 10;
        migratedFamiliar.defense = migratedFamiliar.defense || 5;
        migratedFamiliar.speed = migratedFamiliar.speed || 10;
        migratedFamiliar.hunger = (migratedFamiliar.hunger === null || migratedFamiliar.hunger === undefined) ? 100 : migratedFamiliar.hunger;
        migratedFamiliar.thirst = (migratedFamiliar.thirst === null || migratedFamiliar.thirst === undefined) ? 100 : migratedFamiliar.thirst;
        migratedFamiliar.happiness = migratedFamiliar.happiness || 100;
        return migratedFamiliar;
      });
      savedGameState.familiars = migratedFamiliars;
    }
    
    // Ensure activities keys exist
    const requiredActivities = ['foraging','mining','fishing','catching','enchanting'];
    if (!savedGameState.activities) savedGameState.activities = {};
    requiredActivities.forEach(a => {
      if (!Object.prototype.hasOwnProperty.call(savedGameState.activities, a)) {
        savedGameState.activities[a] = { active: false, progress: 0 };
      }
    });

    gameState = { ...gameState, ...savedGameState };
  }
}

// Initialize game when page loads
init();