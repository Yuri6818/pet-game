// Game State
let gameState = {
  player: {
    class: 'Knight'
  },
  coins: 150,
  dust: 25,
  level: 1,
  xp: 0,
  lastDaily: null,
  familiars: [
    { id: 1, name: "Grumblenook", color: "moss-green", marking: "none", level: 2, xp: 0, image: "img/grumblenook.jpg", hunger: 95, thirst: 90, happiness: 92, hp: 60, attack: 12, defense: 6, speed: 25 },
    { id: 2, name: "Silver Dragon", color: "silver", marking: "runic", level: 8, xp: 0, image: "img/dragon.jpg", hunger: 70, thirst: 60, happiness: 80, hp: 120, attack: 25, defense: 15, speed: 10 },
    { id: 3, name: "Thistle", color: "brown", marking: "striped", level: 6, xp: 0, image: "img/hippogriff.jpg", hunger: 80, thirst: 70, happiness: 85, hp: 110, attack: 22, defense: 14, speed: 13 }
  ],
  inventory: [
    { id: 101, name: "Health Potion", emoji: "🧪", quantity: 3, type: 'consumable', description: 'Restores familiar happiness and slightly heals.' },
    { id: 102, name: "Magic Crystal", emoji: "💎", quantity: 1, type: 'consumable', description: 'Grants bonus XP when used.' }
  ],
  activities: {
    foraging: { active: false, progress: 0 },
    mining: { active: false, progress: 0 },
    fishing: { active: false, progress: 0 },
    catching: { active: false, progress: 0 }
  }
};

const shopItems = [
  { id: 201, name: "Health Potion", price: 20, currency: "coins", emoji: "🧪", description: "Restores 20 health to all familiars." },
  { id: 202, name: "Magic Sword", price: 100, currency: "coins", emoji: "⚔️", description: "Increases your familiar's attack by 10 for the next battle." },
  { id: 203, name: "Rare Familiar Egg", price: 15, currency: "dust", emoji: "🥚", type: "egg", description: "A rare egg that can be hatched into a powerful familiar." },
  { id: 204, name: "Experience Boost", price: 30, currency: "coins", emoji: "⭐", description: "Doubles the XP gained for the next 3 activities." },
  { id: 205, name: "Mystery Box", price: 5, currency: "dust", emoji: "📦", description: "Contains a random item from the shop." },
  { id: 301, type: "familiar", name: "Griffin", price: 50, currency: "dust", image: "img/griffin.jpg", hp: 110, attack: 22, defense: 12, speed: 18, description: "A majestic creature with the body of a lion and the head and wings of an eagle." }
];

// Image mappings for familiars and enemies
const familiarImages = {
  wolf: 'img/wolf.jpg',
  cat: 'img/cat.jpg',
  cat_png: 'img/cat.png',
  dragon: 'img/dragon.jpg',
  griffin: 'img/griffin.jpg',
  hippogriff: 'img/hippogriff.jpg',
  grumblenook: 'img/grumblenook.jpg',
  default: 'img/cat.png'
};

const enemyImages = {
  goblin: 'img/goblin.jpg',
  slime: 'img/slime.jpg',
  golem: 'img/golem.jpg',
  warg: 'img/wolf.jpg',
  raven: 'img/griffin.jpg',
  boar: 'img/monster.jpg',
  spider: 'img/monster.jpg',
  harpy: 'img/monster.jpg',
  orc: 'img/monster.jpg',
  hydra: 'img/monster.jpg',
  default: 'img/monster.jpg'
};

// Expose image maps globally
window.familiarImages = familiarImages;
window.enemyImages = enemyImages;

// Familiars that can be hatched from eggs or found in mystery boxes
const hatchableFamiliars = [
  { name: "Zephyr", image: familiarImages.griffin, hp: 100, attack: 20, defense: 10, speed: 25 },
  { name: 'Pip', image: familiarImages.cat_png, hp: 60, attack: 8, defense: 6, speed: 30 },
  { name: 'Smokey', image: familiarImages.dragon, hp: 110, attack: 23, defense: 12, speed: 12 },
  { name: 'Fang', image: familiarImages.wolf, hp: 90, attack: 18, defense: 12, speed: 15 }
];

// Opponents for battles
const opponents = [
  { id: 1, name: "Goblin Scavenger", level: 3, image: enemyImages.goblin, hp: 50, attack: 10, defense: 5, speed: 10 },
  { id: 2, name: "Slime", level: 5, image: enemyImages.slime, hp: 70, attack: 12, defense: 10, speed: 5 },
  { id: 3, name: "Golem", level: 7, image: enemyImages.golem, hp: 150, attack: 18, defense: 20, speed: 3 },
  { id: 4, name: "Warg", level: 4, image: enemyImages.warg, hp: 80, attack: 14, defense: 8, speed: 12 },
  { id: 5, name: "Raven", level: 6, image: enemyImages.raven, hp: 90, attack: 16, defense: 9, speed: 18 },
  { id: 6, name: "Wild Boar", level: 5, image: enemyImages.boar, hp: 90, attack: 15, defense: 10, speed: 8 },
  { id: 7, name: "Giant Spider", level: 6, image: enemyImages.spider, hp: 100, attack: 18, defense: 12, speed: 10 },
  { id: 8, name: "Harpy", level: 7, image: enemyImages.harpy, hp: 110, attack: 20, defense: 8, speed: 15 },
  { id: 9, name: "Orc Warlord", level: 8, image: enemyImages.orc, hp: 130, attack: 22, defense: 15, speed: 5 },
  { id: 10, "name": "Hydra", level: 10, image: enemyImages.hydra, hp: 200, attack: 25, defense: 18, speed: 7 }
];