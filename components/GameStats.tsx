
import React from 'react';
import { GameStats as GameStatsType } from '../types';

interface GameStatsProps {
  stats: GameStatsType;
}

const StatDisplay: React.FC<{ label: string; value: string; colorClass: string }> = ({ label, value, colorClass }) => (
    <div className="flex flex-col items-center bg-black bg-opacity-50 p-3 rounded-lg shadow-lg">
        <span className="text-sm font-medium text-gray-300 uppercase tracking-wider">{label}</span>
        <span className={`text-2xl font-bold font-mono ${colorClass}`}>{value}</span>
    </div>
);

export const GameStats: React.FC<GameStatsProps> = ({ stats }) => {
  const net = stats.moneyWon - stats.moneySpent;
  const netColor = net >= 0 ? 'text-green-400' : 'text-red-400';
  const netSign = net >= 0 ? '+' : '';

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 w-full max-w-md px-4 z-20">
      <div className="grid grid-cols-3 gap-2 text-white">
        <StatDisplay label="Spent" value={`$${stats.moneySpent.toFixed(2)}`} colorClass="text-red-400" />
        <StatDisplay label="Won" value={`$${stats.moneyWon.toFixed(2)}`} colorClass="text-green-400" />
        <StatDisplay label="Net" value={`${netSign}$${net.toFixed(2)}`} colorClass={netColor} />
      </div>
    </div>
  );
};
