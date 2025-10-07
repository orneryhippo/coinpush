
import Matter from 'matter-js';

export enum CoinType {
  PENNY = 'PENNY',
  NICKEL = 'NICKEL',
  QUARTER = 'QUARTER',
  DOLLAR = 'DOLLAR',
}

export interface CoinProperties {
  label: string;
  radius: number;
  color: string;
  value: number;
  noteFrequency: number;
}

export interface GameStats {
  moneySpent: number;
  moneyWon: number;
}

export interface GameParameters {
  initialDropValue: number;
  coinsPerDrop: number;
  pusherRange: number; // As a percentage of game height
  pusherSpeed: number; // Speed multiplier
  costPerPlay: number;
  durationPerPlay: number; // In seconds
}

// Add a custom property to Matter.Body to store coin info
// FIX: Augment the global Matter namespace, which is more robust for libraries that expose a global object.
declare global {
    namespace Matter {
        interface Body {
            coinType?: CoinType;
        }
    }
}
