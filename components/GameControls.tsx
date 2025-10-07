
import React from 'react';
import { GameParameters } from '../types';

interface GameControlsProps {
  params: GameParameters;
  onParamChange: <K extends keyof GameParameters>(key: K, value: GameParameters[K]) => void;
  isOpen: boolean;
  onClose: () => void;
}

const ControlSlider: React.FC<{ label: string; value: number; min: number; max: number; step: number; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; unit?: string }> = ({ label, unit = '', ...props }) => (
    <div className="flex flex-col space-y-1 text-white">
        <label className="flex justify-between text-sm font-medium">
            <span>{label}</span>
            <span className="font-mono bg-gray-900 px-2 py-0.5 rounded">{props.value}{unit}</span>
        </label>
        <input type="range" {...props} className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-cyan-500" />
    </div>
);

export const GameControls: React.FC<GameControlsProps> = ({ params, onParamChange, isOpen, onClose }) => {
    if (!isOpen) {
        return null;
    }

    const handleChange = (param: keyof GameParameters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onParamChange(param, Number(e.target.value));
    };

    return (
        <div className="absolute inset-0 z-30 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="relative w-full max-w-sm p-6 bg-gray-800 border border-cyan-500/50 rounded-lg shadow-2xl">
                <h3 className="text-lg font-bold text-cyan-400 text-center mb-4 uppercase tracking-wider">Game Settings</h3>
                <div className="space-y-4">
                    <ControlSlider label="Initial Drop Value" unit="$" value={params.initialDropValue} min={1} max={50} step={1} onChange={handleChange('initialDropValue')} />
                    <ControlSlider label="Coins Per Cycle" unit=" coins" value={params.coinsPerDrop} min={1} max={10} step={1} onChange={handleChange('coinsPerDrop')} />
                    <ControlSlider label="Pusher Range" unit="%" value={params.pusherRange} min={5} max={50} step={1} onChange={handleChange('pusherRange')} />
                    <ControlSlider label="Pusher Speed" unit="x" value={params.pusherSpeed} min={1} max={10} step={0.5} onChange={handleChange('pusherSpeed')} />
                    <ControlSlider label="Cost Per Play" unit="$" value={params.costPerPlay} min={0.25} max={5} step={0.25} onChange={handleChange('costPerPlay')} />
                    <ControlSlider label="Duration Per Play" unit="s" value={params.durationPerPlay} min={15} max={300} step={15} onChange={handleChange('durationPerPlay')} />
                </div>
                 <button 
                    onClick={onClose}
                    className="mt-6 w-full bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Close
                </button>
            </div>
        </div>
    );
};
