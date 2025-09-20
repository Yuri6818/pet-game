// Game State
let gameState = {
  coins: 150,
  dust: 25,
  level: 1,
  xp: 0,
  lastDaily: null,
  pets: [
    { id: 1, name: "Shadowfang", species: "Wolf", level: 5, xp: 0, image: "img/wolf.jpg", hunger: 80, thirst: 70, happiness: 90, hp: 100, attack: 20, defense: 10, speed: 15 },
    { id: 2, name: "Whiskers", species: "Cat", level: 3, xp: 0, image: "img/cat.png", hunger: 90, thirst: 80, happiness: 95, hp: 80, attack: 15, defense: 8, speed: 20 },
    { id: 3, name: "Ember", species: "Dragon", level: 8, xp: 0, image: "img/dragon.jpg", hunger: 70, thirst: 60, happiness: 80, hp: 120, attack: 25, defense: 15, speed: 10 }
  ],
  inventory: [
    { id: 101, name: "Health Potion", emoji: "🧪", quantity: 3 },
    { id: 102, name: "Magic Crystal", emoji: "💎", quantity: 1 }
  ],
  activities: {
    foraging: { active: false, progress: 0 },
    mining: { active: false, progress: 0 },
    fishing: { active: false, progress: 0 },
    catching: { active: false, progress: 0 }
  }
};

const shopItems = [
  { id: 201, name: "Health Potion", price: 20, currency: "coins", emoji: "🧪" },
  { id: 202, name: "Magic Sword", price: 100, currency: "coins", emoji: "⚔️" },
  { id: 203, name: "Rare Pet Egg", price: 15, currency: "dust", emoji: "🥚", type: "egg" },
  { id: 204, name: "Experience Boost", price: 30, currency: "coins", emoji: "⭐" },
  { id: 205, name: "Mystery Box", price: 5, currency: "dust", emoji: "📦" },
  { id: 301, type: "pet", name: "Griffin", price: 50, currency: "dust", image: "img/griffin.jpg", hp: 110, attack: 22, defense: 12, speed: 18 }
];

const opponents = [
  { id: 1, name: "Goblin", species: "Goblin", level: 3, image: "img/goblin.jpg", hp: 50, attack: 10, defense: 5, speed: 10 },
  { id: 2, name: "Slime", species: "Slime", level: 5, image: "img/slime.jpg", hp: 70, attack: 12, defense: 10, speed: 5 },
  { id: 3, name: "Golem", species: "Golem", level: 7, image: "img/golem.jpg", hp: 150, attack: 18, defense: 20, speed: 3 }
];

const hatchablePets = [
  { name: "Aqua", species: "Water Sprite", image: "img/slime.jpg", hp: 90, attack: 18, defense: 12, speed: 15 },
  { name: "Terra", species: "Earth Golem", image: "img/golem.jpg", hp: 150, attack: 15, defense: 25, speed: 5 },
  { name: "Zephyr", species: "Air Elemental", image: "img/griffin.jpg", hp: 100, attack: 20, defense: 10, speed: 25 }
];