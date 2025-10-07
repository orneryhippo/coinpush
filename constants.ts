import { CoinType, CoinProperties } from './types';

// Game Area
export const GAME_WIDTH = 400;
export const GAME_HEIGHT = 700;
export const WALL_THICKNESS = 20;

// Pusher
export const PUSHER_HEIGHT = 25;
export const PUSHER_RANGE = GAME_HEIGHT * 0.2; // Operates in the top 20%
export const PUSHER_TOP_Y = PUSHER_HEIGHT / 2; // Starts at the very top edge
export const PUSHER_BOTTOM_Y = PUSHER_TOP_Y + PUSHER_RANGE;
// One full cycle is up + down. A 6-second cycle means 3s up, 3s down.
// Speed = distance / time. Time is in frames (assuming 60fps). 3s * 60fps = 180 frames.
export const PUSHER_SPEED = PUSHER_RANGE / (3 * 60); // px per frame

// Coin Spawning
export const COIN_SPAWN_Y = GAME_HEIGHT * 0.1; // Spawn coins 10% down from the top

// Gameplay
export const COST_PER_PLAY = 1.00;
export const DURATION_PER_PLAY = 180 * 1000; // 180 seconds (4x original)

// Physics
export const GRAVITY = 0; // Top-down view, no gravity along Y-axis
export const COIN_FRICTION_AIR = 0.05; // Simulates friction against the game surface

// Coin Definitions
export const COIN_TYPES: Record<CoinType, CoinProperties> = {
  [CoinType.PENNY]: {
    label: 'Penny',
    radius: 15 / 2,
    color: '#8B4513', // Brown
    value: 0.05,
    noteFrequency: 261.63, // C4
  },
  [CoinType.NICKEL]: {
    label: 'Nickel',
    radius: 18 / 2,
    color: '#CD7F32', // Bronze
    value: 0.10,
    noteFrequency: 329.63, // E4
  },
  [CoinType.QUARTER]: {
    label: 'Quarter',
    radius: 22 / 2,
    color: '#C0C0C0', // Silver
    value: 0.25,
    noteFrequency: 392.00, // G4
  },
  [CoinType.DOLLAR]: {
    label: 'Dollar',
    radius: 26 / 2,
    color: '#FFD700', // Gold
    value: 1.00,
    noteFrequency: 523.25, // C5
  },
};

export const COIN_PROBABILITIES: { type: CoinType; weight: number }[] = [
    { type: CoinType.PENNY, weight: 40 },
    { type: CoinType.NICKEL, weight: 30 },
    { type: CoinType.QUARTER, weight: 25 },
    { type: CoinType.DOLLAR, weight: 5 },
];
