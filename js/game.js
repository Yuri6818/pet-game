function playSound(soundFile) {
  const audio = new Audio(soundFile);
  audio.play().catch(error => {
    // Autoplay was prevented.
    console.log("Playback prevented for " + soundFile);
  });
}

console.log("game.js loaded");

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

    if (item.name === 'Mystery Box') {
      buyMysteryBox();
    } else if (item.type === 'familiar') {
      const newFamiliar = createFamiliarFromItem(item, gameState.familiars.length + 1);
      gameState.familiars.push(newFamiliar);
      renderPets();
      showNotification(`You bought a new familiar: ${item.name}!`);
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

function buyMysteryBox() {
  // Create a deterministic non-empty pool that excludes Mystery Box itself
  const pool = shopItems.filter(i => i.id && i.id !== 205);
  if (!pool.length) {
    // fallback to hatchableFamiliars
    pool.push(...hatchableFamiliars);
  }

  // choose item/familiar
  const randomIndex = Math.floor(Math.random() * pool.length);
  const randomItem = pool[randomIndex];
  if (!randomItem) {
    showNotification('The box was empty... try again later.');
    return;
  }

  // Defer UI-heavy effects so click handlers finish quickly
  if (randomItem.type === 'familiar' || randomItem.type === undefined && randomItem.hp) {
    const newFamiliar = createFamiliarFromItem(randomItem, gameState.familiars.length + 1);
    gameState.familiars.push(newFamiliar);
    renderFamiliars();
    saveGame();
    setTimeout(() => {
      showNotification(`You got a new familiar: ${newFamiliar.name} from the Mystery Box!`);
      celebrate();
    }, 80);
  } else {
    // Add to inventory with unique id
    const existingItem = gameState.inventory.find(i => i.name === randomItem.name);
    if (existingItem) {
      existingItem.quantity = (existingItem.quantity || 0) + 1;
    } else {
      gameState.inventory.push({
        id: randomItem.id || Date.now() + Math.floor(Math.random() * 1000),
        name: randomItem.name || 'Mysterious Item',
        emoji: randomItem.emoji,
        quantity: 1,
        type: randomItem.type || 'consumable',
        description: randomItem.description || ''
      });
    }
    renderInventory();
    saveGame();
    setTimeout(() => {
      showNotification(`You got a ${randomItem.name} from the Mystery Box!`);
      celebrate();
    }, 80);
  }
}

function hatchEgg(itemId) {
  const egg = gameState.inventory.find(i => i.id === itemId);
  if (!egg || egg.type !== 'egg') return;

  showHatchingAnimation(() => {
    const newFamiliarInfo = hatchableFamiliars[Math.floor(Math.random() * hatchableFamiliars.length)];
    const newFamiliar = createFamiliarFromItem(newFamiliarInfo, gameState.familiars.length + 1);
    gameState.familiars.push(newFamiliar);
    
    egg.quantity--;
    if (egg.quantity <= 0) {
      gameState.inventory = gameState.inventory.filter(i => i.id !== itemId);
    }

    renderPets();
    renderInventory();
    showNotification(`You hatched a ${newFamiliar.name}!`);
    celebrate();
    saveGame();
  });
}

// Helper to create familiar objects with sane defaults
function createFamiliarFromItem(item, newId) {
  return {
    id: newId,
    name: item.name || 'New Familiar',
    color: item.color || 'default',
    marking: item.marking || 'none',
    level: 1,
    xp: 0,
    image: item.image || `img/${(item.name || 'familiar').toLowerCase()}.jpg`,
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

function levelUpFamiliar(familiar) {
  if (familiar.xp >= 100) {
    familiar.level++;
    familiar.xp -= 100;
    familiar.hp += 10;
    familiar.attack += 2;
    familiar.defense += 2;
    familiar.speed += 1;
    showNotification(`${familiar.name} leveled up to level ${familiar.level}!`);
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
function startEnchanting() { startActivity('enchanting'); }

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
    catching: { coins: 10, dust: 5, xp: 20 },
    enchanting: { coins: 10, dust: 5, xp: 20 }
  };

  const reward = rewards[activityName];
  gainXP(reward.xp);

  if (activityName === 'catching') {
    // 50% chance to catch a new familiar
    if (Math.random() < 0.5) {
        const randomItem = {
          name: `Wildling ${gameState.familiars.length + 1}`,
          image: 'img/monster.jpg',
          hp: 40,
          attack: 8,
          defense: 4,
          speed: 12
        };
        const randomFamiliar = createFamiliarFromItem(randomItem, gameState.familiars.length + 1);
        gameState.familiars.push(randomFamiliar);
      renderPets();
      showNotification(`You caught a new familiar!`);
      celebrate();
    } else {
      showNotification(`The familiar got away...`);
    }
  } else if (activityName === 'enchanting') {
    // 50% chance to enchant a new familiar
    if (Math.random() < 0.5) {
        const randomItem = {
          name: `Sprite ${gameState.familiars.length + 1}`,
          image: 'img/cat.png',
          hp: 60,
          attack: 12,
          defense: 8,
          speed: 25
        };
        const randomFamiliar = createFamiliarFromItem(randomItem, gameState.familiars.length + 1);
        gameState.familiars.push(randomFamiliar);
      renderPets();
      showNotification(`You enchanted a new familiar!`);
      celebrate();
    } else {
      showNotification(`The familiar resisted the enchantment...`);
    }
  } else {
    gameState.coins += reward.coins;
    gameState.dust += reward.dust;
    spawnOrb(coinCountEl);
    showNotification(`${activityName.charAt(0).toUpperCase() + activityName.slice(1)} complete! +${reward.coins} coins, +${reward.dust} dust, +${reward.xp} XP`);
  }

  saveGame();
}

function interactFamiliar(familiarId, interactionType) {
  const familiar = gameState.familiars.find(f => f.id === familiarId);

  switch (interactionType) {
    case 'play':
      familiar.happiness = Math.min(100, familiar.happiness + 10);
      familiar.hunger = Math.max(0, familiar.hunger - 5);
      gainXP(5);
      showNotification(`${familiar.name} is happy! +5 XP`);
      familiarAnimation(familiarId);
      break;
    case 'feed':
      familiar.hunger = Math.min(100, familiar.hunger + 20);
      familiar.thirst = Math.max(0, familiar.thirst - 10);
      gainXP(2);
      showNotification(`${familiar.name} is full! +2 XP`);
      break;
    case 'water':
      familiar.thirst = Math.min(100, familiar.thirst + 20);
      gainXP(2);
      showNotification(`${familiar.name} is hydrated! +2 XP`);
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
    // Heal all familiars
    gameState.familiars.forEach(familiar => {
      familiar.happiness = Math.min(100, familiar.happiness + 20);
    });
    showNotification('All familiars feel refreshed!');
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
  renderFamiliars();
  saveGame();
}