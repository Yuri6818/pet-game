// Game State
let gameState = {
  coins: 150,
  dust: 25,
  level: 1,
  xp: 0,
  lastDaily: null,
  pets: [
    { id: 1, name: "Shadowfang", species: "Wolf", level: 5, xp: 0, image: "img/wolf.jpg", hunger: 80, thirst: 70, happiness: 90, hp: 100, attack: 20, defense: 10, speed: 15 },
    { id: 2, name: "Whiskers", species: "Cat", level: 3, xp: 0, image: "img/cat.jpg", hunger: 90, thirst: 80, happiness: 95, hp: 80, attack: 15, defense: 8, speed: 20 },
    { id: 3, name: "Ember", species: "Dragon", level: 8, xp: 0, image: "img/dragon.jpg", hunger: 70, thirst: 60, happiness: 80, hp: 120, attack: 25, defense: 15, speed: 10 }
  ],
  // Example extra slots (initially empty, available so save migrations don't conflict)
  // To add more starter pets, edit the lines below or push new pets via the shop or hatching.
  inventory: [
    { id: 101, name: "Health Potion", emoji: "🧪", quantity: 3, type: 'consumable', description: 'Restores pet happiness and slightly heals.' },
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
  { id: 201, name: "Health Potion", price: 20, currency: "coins", emoji: "🧪", description: "Restores 20 health to all pets." },
  { id: 202, name: "Magic Sword", price: 100, currency: "coins", emoji: "⚔️", description: "Increases your pet's attack by 10 for the next battle." },
  { id: 203, name: "Rare Pet Egg", price: 15, currency: "dust", emoji: "🥚", type: "egg", description: "A rare egg that can be hatched into a powerful pet." },
  { id: 204, name: "Experience Boost", price: 30, currency: "coins", emoji: "⭐", description: "Doubles the XP gained for the next 3 activities." },
  { id: 205, name: "Mystery Box", price: 5, currency: "dust", emoji: "📦", description: "Contains a random item from the shop." },
  { id: 301, type: "pet", name: "Griffin", price: 50, currency: "dust", image: "img/griffin.jpg", hp: 110, attack: 22, defense: 12, speed: 18, description: "A majestic creature with the body of a lion and the head and wings of an eagle." }
];

// A small image mapping so images can be swapped by editing this object only.
const petImages = {
  shadowfang: 'img/wolf.jpg',
  whiskers: 'img/cat.jpg',
  ember: 'img/dragon.jpg',
  griffin: 'img/griffin.jpg',
  goblin: 'img/goblin.jpg',
  slime: 'img/slime.jpg',
  golem: 'img/golem.jpg',
  aqua: 'img/slime.jpg',
  terra: 'img/golem.jpg',
  zephyr: 'img/griffin.jpg',
  wildling: 'img/monster.jpg',
  default: 'img/monster.jpg'
};

// Expose petImages globally for other modules
window.petImages = petImages;

// Expand the hatchable pool and provide a larger pet list for easy swaps.
const hatchablePets = [
  { name: "Aqua", species: "Water Sprite", image: petImages.aqua || 'img/monster.jpg', hp: 90, attack: 18, defense: 12, speed: 15 },
  { name: "Terra", species: "Earth Golem", image: petImages.terra || 'img/monster.jpg', hp: 150, attack: 15, defense: 25, speed: 5 },
  { name: "Zephyr", species: "Air Elemental", image: petImages.zephyr || 'img/monster.jpg', hp: 100, attack: 20, defense: 10, speed: 25 },
  // Additional friendly variations so the Mystery Box / hatching has more variety
  { name: 'Pip', species: 'Sprite', image: petImages.whiskers || 'img/cat.jpg', hp: 60, attack: 8, defense: 6, speed: 30 },
  { name: 'Boulder', species: 'Rockling', image: petImages.golem || 'img/golem.jpg', hp: 130, attack: 14, defense: 20, speed: 6 }
];

// Opponents used by the battle system. You can edit `petImages` to change images easily.
const opponents = [
  { id: 1, name: "Goblin", species: "Goblin", level: 3, image: petImages.goblin || 'img/goblin.jpg', hp: 50, attack: 10, defense: 5, speed: 10 },
  { id: 2, name: "Slime", species: "Slime", level: 5, image: petImages.slime || 'img/slime.jpg', hp: 70, attack: 12, defense: 10, speed: 5 },
  { id: 3, name: "Golem", species: "Golem", level: 7, image: petImages.golem || 'img/golem.jpg', hp: 150, attack: 18, defense: 20, speed: 3 },
  { id: 4, name: "Warg", species: "Warg", level: 4, image: petImages.shadowfang || 'img/wolf.jpg', hp: 80, attack: 14, defense: 8, speed: 12 },
  { id: 5, name: "Raven", species: "Raven", level: 6, image: petImages.zephyr || 'img/griffin.jpg', hp: 90, attack: 16, defense: 9, speed: 18 }
];


