let battleState = {
  playerPet: null,
  opponentPet: null,
  turn: 'player',
  log: [],
  timeoutId: null
};

function startBattle(petId) {
  const playerPet = gameState.pets.find(p => p.id === petId);
  if (!playerPet) {
    showNotification('Selected pet not found for battle.');
    return;
  }
  const opponentPet = opponents[Math.floor(Math.random() * opponents.length)];

  battleState.playerPet = { ...playerPet, currentHp: Number(playerPet.hp) || 50 };
  battleState.opponentPet = { ...opponentPet, currentHp: Number(opponentPet.hp) || 50 };
  battleState.log = [];

  showSection('battle');
  renderBattle();
  logBattle(`A wild ${opponentPet.name} appeared!`);
}

function renderBattle() {
  const playerPetEl = document.getElementById('player-pet');
  const opponentPetEl = document.getElementById('opponent-pet');
  // Guard: ensure pets exist
  const player = battleState.playerPet || {};
  const opponent = battleState.opponentPet || {};

  const playerImg = getImageSrc(player);
  const opponentImg = getImageSrc(opponent);

  const playerHealthPercent = (player.currentHp / player.hp) * 100;
  const opponentHealthPercent = (opponent.currentHp / opponent.hp) * 100;

  playerPetEl.innerHTML = `
    <h3>${player.name || 'Unknown'}</h3>
    <img src="${playerImg}" alt="${player.name || 'player'}" onerror="this.onerror=null;this.src='img/monster.jpg'">
    <p>HP: ${player.currentHp ?? 0} / ${player.hp ?? 0}</p>
    <div class="health-bar">
      <div class="health-bar-fill" style="width: ${playerHealthPercent}%;"></div>
    </div>
  `;

  opponentPetEl.innerHTML = `
    <h3>${opponent.name || 'Unknown'}</h3>
    <img src="${opponentImg}" alt="${opponent.name || 'opponent'}" onerror="this.onerror=null;this.src='img/monster.jpg'">
    <p>HP: ${opponent.currentHp ?? 0} / ${opponent.hp ?? 0}</p>
    <div class="health-bar">
      <div class="health-bar-fill" style="width: ${opponentHealthPercent}%;"></div>
    </div>
  `;
}

function logBattle(message) {
  const battleLogEl = document.getElementById('battle-log');
  battleLogEl.innerHTML = ''; // Clear previous messages
  const ts = new Date().toLocaleTimeString();
  const entry = `[${ts}] ${message}`;
  const p = document.createElement('div');
  p.textContent = entry;
  battleLogEl.appendChild(p);
  battleLogEl.scrollTop = battleLogEl.scrollHeight;
}

function battleAction(action) {
  if (battleState.turn === 'player') {
    playerTurn(action);
  }
}

function playerTurn(action) {
  const player = battleState.playerPet;
  const opponent = battleState.opponentPet;

  if (!player) {
    console.error("Error: 'player' is null. Cannot set 'isDefending'.");
    return;
  }

  // Reset defending state at the start of the turn
  player.isDefending = false;

  switch (action) {
    case 'attack':
      playSound(200, 0.1, 'triangle');
      const damage = calculateDamage(player, opponent);
      opponent.currentHp = Math.max(0, opponent.currentHp - damage);
      logBattle(`${player.name} attacks ${opponent.name} for ${damage} damage!`);
      // visual hit on opponent
      const oppEl = document.getElementById('opponent-pet');
      if (oppEl) {
        oppEl.classList.add('hit');
        setTimeout(() => oppEl.classList.remove('hit'), 350);
      }
      break;
    case 'defend':
      playSound(400, 0.1, 'sine');
      player.isDefending = true;
      logBattle(`${player.name} is defending!`);
      break;
    case 'run':
      logBattle(`You fled from the battle!`);
      endBattle('run');
      return;
  }

  renderBattle();
  battleState.turn = 'opponent';
  battleState.timeoutId = setTimeout(opponentTurn, 1000);
  checkWinner();
}

function opponentTurn() {
  const player = battleState.playerPet;
  const opponent = battleState.opponentPet;

  if (!player || !opponent) {
    console.error("Player or opponent pet is null. Cannot proceed with the turn.");
    return;
  }

  playSound(200, 0.1, 'triangle');
  const damage = calculateDamage(opponent, player);
  player.currentHp = Math.max(0, player.currentHp - damage);
  logBattle(`${opponent.name} attacks ${player.name} for ${damage} damage!`);
  const playerEl = document.getElementById('player-pet');
  if (playerEl) {
    playerEl.classList.add('hit');
    setTimeout(() => playerEl.classList.remove('hit'), 350);
  }

  renderBattle();
  battleState.turn = 'player';
  checkWinner();
}

function calculateDamage(attacker, defender) {
  // Ensure numeric stats
  const atk = Number(attacker?.attack) || 0;
  let def = Number(defender?.defense) || 0;

  // If defender is defending, boost defense for this calculation
  if (defender && defender.isDefending) {
    def *= 1.5;
  }

  const raw = atk - def;
  const damage = Math.max(1, Math.round(raw || 1));
  return damage;
}

function checkWinner() {
  const player = battleState.playerPet;
  const opponent = battleState.opponentPet;

  if (player.currentHp <= 0) {
    endBattle('lose');
  } else if (opponent.currentHp <= 0) {
    endBattle('win');
  }
}

function endBattle(result) {
  if (battleState.timeoutId) {
    clearTimeout(battleState.timeoutId);
  }

  const battleActionsEl = document.getElementById('battle-actions');
  battleActionsEl.style.display = 'none';

  if (result === 'win') {
    playSound(523, 0.2, 'triangle');
    logBattle(`You defeated ${battleState.opponentPet.name}!`);
    const xpGained = battleState.opponentPet.level * 5;
    gainXP(xpGained);
    
    const pet = gameState.pets.find(p => p.id === battleState.playerPet.id);
    if (pet) {
      pet.xp += xpGained;
      levelUpPet(pet);
    }

    showNotification(`You and your pet gained ${xpGained} XP!`);
    celebrate();
  } else if (result === 'lose') {
    playSound(164, 0.2, 'sawtooth');
    logBattle(`You were defeated by ${battleState.opponentPet.name}...`);
    showNotification(`You lost the battle...`);
  }

  battleState = {
    playerPet: null,
    opponentPet: null,
    turn: 'player',
    log: [],
    timeoutId: null
  };

  setTimeout(() => {
    showSection('pets');
    battleActionsEl.style.display = 'flex';
  }, 3000);
}