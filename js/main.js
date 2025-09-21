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
  localStorage.setItem("petGameSave", JSON.stringify(gameState));
}

function loadGame() {
  const saved = localStorage.getItem("petGameSave");
  if (saved) {
    const savedGameState = JSON.parse(saved);

    if (savedGameState.pets) {
      const migratedPets = savedGameState.pets.map(savedPet => {
        const initialPetData = gameState.pets.find(p => p.id === savedPet.id) || {};
        const migratedPet = {
          ...initialPetData,
          ...savedPet
        };
        // Ensure essential stats are present, falling back to defaults if necessary
        migratedPet.hp = migratedPet.hp || 50;
        migratedPet.attack = migratedPet.attack || 10;
        migratedPet.defense = migratedPet.defense || 5;
        migratedPet.speed = migratedPet.speed || 10;
        migratedPet.hunger = (migratedPet.hunger === null || migratedPet.hunger === undefined) ? 100 : migratedPet.hunger;
        migratedPet.thirst = (migratedPet.thirst === null || migratedPet.thirst === undefined) ? 100 : migratedPet.thirst;
        migratedPet.happiness = migratedPet.happiness || 100;
        return migratedPet;
      });
      savedGameState.pets = migratedPets;
    }
    
    // Now merge the rest of the game state
    // Ensure activities keys exist
    const requiredActivities = ['foraging','mining','fishing','catching'];
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