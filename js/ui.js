// DOM Elements
const coinCountEl = document.getElementById("coinCount");
const dustCountEl = document.getElementById("dustCount");
const playerLevelEl = document.getElementById("playerLevel");
const playerXPEl = document.getElementById("playerXP");
const serverTimeEl = document.getElementById("serverTime");
const notificationEl = document.getElementById("notification");
const hatchingOverlay = document.getElementById("hatching-overlay");

// UI Updates
function updateUI() {
  coinCountEl.textContent = gameState.coins;
  dustCountEl.textContent = gameState.dust;
  playerLevelEl.textContent = gameState.level;
  playerXPEl.textContent = gameState.xp;
}

function updateServerTime() {
  const now = new Date();
  serverTimeEl.textContent = now.toLocaleTimeString();
}

// Navigation
function showSection(sectionName) {
  // Update body class for background image
  document.body.className = sectionName;

  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  
  document.getElementById(sectionName).classList.add('active');
  document.getElementById(`btn-${sectionName}`).classList.add('active');
}

// Notifications and Animations
function showNotification(message) {
  notificationEl.textContent = message;
  notificationEl.classList.add('show');
  setTimeout(() => {
    notificationEl.classList.remove('show');
  }, 2000);
}

function spawnOrb(targetElement, count = 1) {
  for (let i = 0; i < count; i++) {
    setTimeout(() => {
      const orb = document.createElement('div');
      orb.className = 'orb';
      
      // Random starting position
      orb.style.left = Math.random() * window.innerWidth + 'px';
      orb.style.top = Math.random() * window.innerHeight + 'px';
      
      document.body.appendChild(orb);
      
      // Animate to target
      setTimeout(() => {
        const targetRect = targetElement.getBoundingClientRect();
        orb.style.transition = 'all 1s ease-out';
        orb.style.left = targetRect.left + targetRect.width / 2 + 'px';
        orb.style.top = targetRect.top + targetRect.height / 2 + 'px';
        orb.style.opacity = '0';
        orb.style.transform = 'scale(0.1)';
      }, 100);
      
      setTimeout(() => {
        orb.remove();
      }, 1200);
    }, i * 200);
  }
}

function showHatchingAnimation(callback) {
  hatchingOverlay.classList.remove('hidden');
  const egg = hatchingOverlay.querySelector('.egg');
  egg.classList.add('wobble');

  setTimeout(() => {
    egg.classList.remove('wobble');
    egg.classList.add('crack');
  }, 2000);

  setTimeout(() => {
    egg.classList.remove('crack');
    hatchingOverlay.classList.add('hidden');
    callback();
  }, 4000);
}

// Render Functions
function renderPets() {
  const container = document.getElementById('petContainer');
  container.innerHTML = '';
  
  gameState.pets.filter(pet => pet.name).forEach(pet => {
    const div = document.createElement('div');
    div.className = 'card pet-card';
    div.dataset.petId = pet.id;
    // Safe image handling: prefer pet.image, fall back to species-based or default image
    const imgSrc = pet.image || (`img/${(pet.species || 'pet').toLowerCase()}.jpg`) || 'img/monster.jpg';
    div.innerHTML = `
      <div class="card-image">
        <img src="${imgSrc}" alt="${pet.name}" style="width: 100%; height: 100%; border-radius: 50%;" onerror="this.onerror=null;this.src='img/monster.jpg'">
      </div>
      <h3>${pet.name}</h3>
      <p>Level ${pet.level} ${pet.species}</p>
      <div class="pet-needs">
        <p>❤️ ${pet.happiness}%</p>
        <p>🍖 ${pet.hunger}%</p>
        <p>💧 ${pet.thirst}%</p>
      </div>
      <div class="pet-stats">
        <p>⚔️ ${pet.attack}</p>
        <p>🛡️ ${pet.defense}</p>
        <p>💨 ${pet.speed}</p>
      </div>
      <div class="pet-actions">
        <button class="btn" onclick="interactPet(${pet.id}, 'play')">Play</button>
        <button class="btn" onclick="interactPet(${pet.id}, 'feed')">Feed</button>
        <button class="btn" onclick="interactPet(${pet.id}, 'water')">Water</button>
        <button class="btn btn-primary" onclick="startBattle(${pet.id})">Battle</button>
      </div>
    `;
    container.appendChild(div);
  });
}

function petAnimation(petId) {
  const petCard = document.querySelector(`.pet-card[data-pet-id="${petId}"]`);
  if (petCard) {
    const petImage = petCard.querySelector('.card-image');
    petImage.style.animation = 'pet 0.5s ease-in-out';
    setTimeout(() => {
      petImage.style.animation = '';
    }, 500);
  }
}

function renderInventory() {
  const container = document.getElementById('inventoryContainer');
  container.innerHTML = '';
  
  if (gameState.inventory.length === 0) {
    container.innerHTML = '<p>Your inventory is empty!</p>';
    return;
  }
  
  gameState.inventory.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card item-card';
    let buttonHtml = '';
    if (item.type === 'egg') {
      buttonHtml = `<button class="btn btn-primary" onclick="hatchEgg(${item.id})">Hatch</button>`;
    } else {
      buttonHtml = `<button class="btn btn-secondary" onclick="useItem(${item.id})">Use</button>`;
    }

    div.innerHTML = `
      <div class="card-image">${item.emoji}</div>
      <h3>${item.name}</h3>
      <p class="item-quantity">x${item.quantity}</p>
      ${buttonHtml}
    `;
    container.appendChild(div);
  });
}

function renderShop() {
  const container = document.getElementById('shopContainer');
  container.innerHTML = '';
  
  shopItems.forEach(item => {
    const div = document.createElement('div');
    div.className = 'card shop-card';
    const canAfford = gameState[item.currency] >= item.price;
    let imageHtml = '';
    if (item.image) {
      imageHtml = `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; border-radius: 50%;" onerror="this.onerror=null;this.src='img/monster.jpg'">`;
    } else {
      imageHtml = item.emoji || '';
    }

    div.innerHTML = `
      <div class="card-image">${imageHtml}</div>
      <h3>${item.name}</h3>
      <div class="price">
        <p>${item.currency === 'coins' ? '💰' : '✨'} ${item.price}</p>
      </div>
      <button class="btn btn-primary" ${!canAfford ? 'disabled' : ''} onclick="buyItem(${item.id})">
        Buy
      </button>
    `;
    container.appendChild(div);
  });
}

function renderAllSections() {
  renderPets();
  renderInventory();
  renderShop();
}

/* ---------- Fun helpers: confetti & sound ---------- */
function playSound(freq = 440, duration = 0.15, type = 'sine') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = type;
    o.frequency.value = freq;
    o.connect(g);
    g.connect(ctx.destination);
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
    o.start();
    setTimeout(() => {
      g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      setTimeout(() => { o.stop(); ctx.close(); }, duration * 1000 + 50);
    }, duration * 1000);
  } catch (e) {
    // Audio may be blocked; fail silently
    console.warn('Audio unavailable', e);
  }
}

function spawnConfetti(count = 24) {
  const colors = ['#ff6b6b','#feca57','#ff9ff3','#48dbfb','#1dd1a1','#5f27cd'];
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.left = Math.random() * 100 + 'vw';
    el.style.background = colors[Math.floor(Math.random() * colors.length)];
    el.style.transform = `rotate(${Math.random()*360}deg)`;
    el.style.top = '-10vh';
    el.style.opacity = '1';
    el.style.animation = `confetti-fall ${2 + Math.random()*2}s linear forwards`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

function celebrate() {
  // quick tri-tone
  playSound(880, 0.08, 'sine');
  setTimeout(() => playSound(1100, 0.08, 'sine'), 100);
  setTimeout(() => playSound(660, 0.18, 'sawtooth'), 220);
  spawnConfetti(30);
}
