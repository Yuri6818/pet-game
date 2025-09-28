let battleState = {
  playerFamiliar: null,
  opponentFamiliar: null,
  turn: 'player',
  log: [],
  timeoutId: null
};

function startBattle(familiarId) {
  const playerFamiliar = gameState.familiars.find(f => f.id === familiarId);
  if (!playerFamiliar) {
    showNotification('Selected familiar not found for battle.');
    return;
  }
  const opponentFamiliar = opponents[Math.floor(Math.random() * opponents.length)];

  battleState.playerFamiliar = { ...playerFamiliar, currentHp: Number(playerFamiliar.hp) || 50 };
  battleState.opponentFamiliar = { ...opponentFamiliar, currentHp: Number(opponentFamiliar.hp) || 50 };
  battleState.log = [];

  showSection('battle');
  renderBattle();
  logBattle(`A wild ${opponentFamiliar.name} appeared!`);
}

function renderBattle() {
  const playerFamiliarEl = document.getElementById('player-familiar');
  const opponentFamiliarEl = document.getElementById('opponent-familiar');
  // Guard: ensure familiars exist
  const player = battleState.playerFamiliar || {};
  const opponent = battleState.opponentFamiliar || {};

  const playerImg = getImageSrc(player);
  const opponentImg = getImageSrc(opponent);

  const playerHealthPercent = (player.currentHp / player.hp) * 100;
  const opponentHealthPercent = (opponent.currentHp / opponent.hp) * 100;

  playerFamiliarEl.innerHTML = `
    <h3>${player.name || 'Unknown'}</h3>
    <img src="${playerImg}" alt="${player.name || 'player'}" onerror="this.onerror=null;this.src='img/monster.jpg'">
    <p>HP: ${player.currentHp ?? 0} / ${player.hp ?? 0}</p>
    <div class="health-bar">
      <div class="health-bar-fill" style="width: ${playerHealthPercent}%;"></div>
    </div>
  `;

  opponentFamiliarEl.innerHTML = `
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
  const player = battleState.playerFamiliar;
  const opponent = battleState.opponentFamiliar;

  if (!player) {
    console.error("Error: 'player' is null. Cannot set 'isDefending'.");
    return;
  }

  // Reset defending state at the start of the turn
  player.isDefending = false;

  switch (action) {
    case 'attack':
      playSound('sounds/attack.ogg');
      const damage = calculateDamage(player, opponent);
      opponent.currentHp = Math.max(0, opponent.currentHp - damage);
      logBattle(`${player.name} attacks ${opponent.name} for ${damage} damage!`);
      // visual hit on opponent
      const oppEl = document.getElementById('opponent-familiar');
      if (oppEl) {
        oppEl.classList.add('hit', 'shake');
        setTimeout(() => {
            oppEl.classList.remove('hit', 'shake');
        }, 500);
      }
      break;
    case 'defend':
      playSound('sounds/defend.wav');
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
  const player = battleState.playerFamiliar;
  const opponent = battleState.opponentFamiliar;

  if (!player || !opponent) {
    console.error("Player or opponent familiar is null. Cannot proceed with the turn.");
    return;
  }

  playSound('sounds/attack.ogg');
  const damage = calculateDamage(opponent, player);
  player.currentHp = Math.max(0, player.currentHp - damage);
  logBattle(`${opponent.name} attacks ${player.name} for ${damage} damage!`);
  const playerEl = document.getElementById('player-familiar');
  if (playerEl) {
    playerEl.classList.add('hit', 'shake');
    setTimeout(() => {
        playerEl.classList.remove('hit', 'shake');
    }, 500);
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
  const player = battleState.playerFamiliar;
  const opponent = battleState.opponentFamiliar;

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
    playSound('sounds/win.wav');
    logBattle(`You defeated ${battleState.opponentFamiliar.name}!`);
    const xpGained = battleState.opponentFamiliar.level * 5;
    gainXP(xpGained);
    
    const familiar = gameState.familiars.find(f => f.id === battleState.playerFamiliar.id);
    if (familiar) {
      familiar.xp += xpGained;
      levelUpFamiliar(familiar);
    }

    showNotification(`You and your familiar gained ${xpGained} XP!`);
    celebrate();
  } else if (result === 'lose') {
    playSound('sounds/lose.wav');
    logBattle(`You were defeated by ${battleState.opponentFamiliar.name}...`);
    showNotification(`You lost the battle...`);
  }

  battleState = {
    playerFamiliar: null,
    opponentFamiliar: null,
    turn: 'player',
    log: [],
    timeoutId: null
  };

  setTimeout(() => {
    showSection('familiars');
    battleActionsEl.style.display = 'flex';
  }, 3000);
}