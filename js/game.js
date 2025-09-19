// Game Functions
function claimDaily() {
  const today = new Date().toDateString();
  if (gameState.lastDaily === today) {
    showNotification("Already claimed today!");
    return;
  }
  
  gameState.coins += 50;
  gameState.dust += 5;
  gameState.lastDaily = today;
  
  spawnOrb(coinCountEl, 2);
  showNotification("Daily bonus claimed! +50 coins, +5 dust");
  updateUI();
  saveGame();
}

function buyItem(itemId) {
  const item = shopItems.find(i => i.id === itemId);
  const cost = item.price;
  const currency = item.currency;

  if (gameState[currency] < cost) {
    showNotification(`Not enough ${currency}!`);
    return;
  }

  const confirmation = confirm(`Are you sure you want to buy ${item.name} for ${cost} ${currency}?`);

  if (confirmation) {
    gameState[currency] -= cost;

    if (item.type === 'pet') {
      const newPet = createPetFromItem(item, gameState.pets.length + 1);
      gameState.pets.push(newPet);
      renderPets();
      showNotification(`You bought a new pet: ${item.name}!`);
      celebrate();
    } else {
      // Add to inventory
      const existingItem = gameState.inventory.find(i => i.name === item.name);
      if (existingItem) {
        existingItem.quantity++;
      } else {
        gameState.inventory.push({
          id: item.id,
          name: item.name,
          emoji: item.emoji,
          quantity: 1,
          type: item.type
        });
      }
      renderInventory();
      showNotification(`Purchased ${item.name}!`);
    }

    spawnOrb(currency === 'coins' ? coinCountEl : dustCountEl);
    updateUI();
    saveGame();
  }
}

function hatchEgg(itemId) {
  const egg = gameState.inventory.find(i => i.id === itemId);
  if (!egg || egg.type !== 'egg') return;

  showHatchingAnimation(() => {
    const newPetInfo = hatchablePets[Math.floor(Math.random() * hatchablePets.length)];
    const newPet = createPetFromItem(newPetInfo, gameState.pets.length + 1);
    gameState.pets.push(newPet);
    
    egg.quantity--;
    if (egg.quantity <= 0) {
      gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);
    }

    renderPets();
    renderInventory();
    showNotification(`You hatched a ${newPet.name}!`);
    celebrate();
    saveGame();
  });
}

// Helper to create pet objects with sane defaults
function createPetFromItem(item, newId) {
  return {
    id: newId,
    name: item.name || 'New Pet',
    species: item.species || item.name || 'Pet',
    level: 1,
    xp: 0,
    image: item.image || `img/${(item.name || 'pet').toLowerCase()}.jpg`,
    hunger: 100,
    thirst: 100,
    happiness: 100,
    hp: Number(item.hp) || 50,
    attack: Number(item.attack) || 10,
    defense: Number(item.defense) || 5,
    speed: Number(item.speed) || 10
  };
}

function levelUp() {
  if (gameState.xp >= 100) {
    gameState.level++;
    gameState.xp -= 100;
    gameState.coins += gameState.level * 10;
    
  spawnOrb(playerLevelEl, 3);
  showNotification(`Level up! You're now level ${gameState.level}!`);
  celebrate();
    updateUI();
    saveGame();
  }
}

function levelUpPet(pet) {
  if (pet.xp >= 100) {
    pet.level++;
    pet.xp -= 100;
    pet.hp += 10;
    pet.attack += 2;
    pet.defense += 2;
    pet.speed += 1;
    showNotification(`${pet.name} leveled up to level ${pet.level}!`);
    celebrate();
    renderPets();
    saveGame();
  }
}

function gainXP(amount) {
  gameState.xp += amount;
  if (gameState.xp >= 100) {
    levelUp();
  }
  updateUI();
}

// Activity Functions
function startActivity(activityName) {
  // Accept 'catch' alias for 'catching'
  if (activityName === 'catch') activityName = 'catching';
  if (!gameState.activities[activityName]) {
    showNotification(`Invalid activity: ${activityName}`);
    return;
  }
  const activity = gameState.activities[activityName];
  if (activity.active) return;
  
  activity.active = true;
  activity.progress = 0;
  
  const btn = document.getElementById(`${activityName}Btn`);
  const progressBar = document.getElementById(`${activityName}Progress`);
  
  if (btn) {
    btn.disabled = true;
    btn.textContent = `${activityName.charAt(0).toUpperCase() + activityName.slice(1)}...`;
  }
  
  const interval = setInterval(() => {
  activity.progress += 10;
  if (progressBar) progressBar.style.width = activity.progress + '%';
    
    if (activity.progress >= 100) {
      clearInterval(interval);
      completeActivity(activityName);
    }
  }, 300);
}

function startForaging() { startActivity('foraging'); }
function startMining() { startActivity('mining'); }
function startFishing() { startActivity('fishing'); }
function startCatching() { startActivity('catching'); }

function completeActivity(activityName) {
  const activity = gameState.activities[activityName];
  activity.active = false;
  activity.progress = 0;

  const btn = document.getElementById(`${activityName}Btn`);
  const progressBar = document.getElementById(`${activityName}Progress`);

  btn.disabled = false;
  btn.textContent = `Start ${activityName.charAt(0).toUpperCase() + activityName.slice(1)}`;
  progressBar.style.width = '0%';

  // Random rewards
  const rewards = {
    foraging: { coins: 15, dust: 2, xp: 10 },
    mining: { coins: 25, dust: 1, xp: 15 },
    fishing: { coins: 20, dust: 3, xp: 12 },
    catching: { xp: 20 }
  };

  const reward = rewards[activityName];
  gainXP(reward.xp);

  if (activityName === 'catching') {
    // 50% chance to catch a new pet
    if (Math.random() < 0.5) {
        const randomItem = {
          name: `Wildling ${gameState.pets.length + 1}`,
          species: 'Wildling',
          image: 'img/monster.jpg',
          hp: 40,
          attack: 8,
          defense: 4,
          speed: 12
        };
        const randomPet = createPetFromItem(randomItem, gameState.pets.length + 1);
        gameState.pets.push(randomPet);
      renderPets();
  showNotification(`You caught a new pet!`);
  celebrate();
    } else {
      showNotification(`The pet got away...`);
    }
  } else {
    gameState.coins += reward.coins;
    gameState.dust += reward.dust;
    spawnOrb(coinCountEl);
    showNotification(`${activityName.charAt(0).toUpperCase() + activityName.slice(1)} complete! +${reward.coins} coins, +${reward.dust} dust, +${reward.xp} XP`);
  }

  saveGame();
}

function interactPet(petId, interactionType) {
  const pet = gameState.pets.find(p => p.id === petId);

  switch (interactionType) {
    case 'play':
      pet.happiness = Math.min(100, pet.happiness + 10);
      pet.hunger = Math.max(0, pet.hunger - 5);
      gainXP(5);
      showNotification(`${pet.name} is happy! +5 XP`);
      petAnimation(petId);
      break;
    case 'feed':
      pet.hunger = Math.min(100, pet.hunger + 20);
      pet.thirst = Math.max(0, pet.thirst - 10);
      gainXP(2);
      showNotification(`${pet.name} is full! +2 XP`);
      break;
    case 'water':
      pet.thirst = Math.min(100, pet.thirst + 20);
      gainXP(2);
      showNotification(`${pet.name} is hydrated! +2 XP`);
      break;
  }

  renderPets();
  saveGame();
}

function useItem(itemId) {
  const item = gameState.inventory.find(i => i.id === itemId);
  if (!item) return;

  if (item.type === 'egg') {
    hatchEgg(itemId);
    return;
  }
  
  // Simple item effects
  if (item.name.includes('Potion')) {
    // Heal all pets
    gameState.pets.forEach(pet => {
      pet.happiness = Math.min(100, pet.happiness + 20);
    });
    showNotification('All pets feel refreshed!');
  } else if (item.name.includes('Crystal')) {
    // Gain XP
    gainXP(25);
    showNotification('The crystal grants you wisdom! +25 XP');
  }
  
  item.quantity--;
  if (item.quantity <= 0) {
    gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);
  }
  
  renderInventory();
  renderPets();
  saveGame();
}
