
import React from 'react';

interface ControlButtonProps {
    onClick: () => void;
    disabled: boolean;
    cost: number;
}

export const ControlButton: React.FC<ControlButtonProps> = ({ onClick, disabled, cost }) => {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`
                absolute bottom-8 left-1/2 -translate-x-1/2 z-20
                px-10 py-5 text-2xl font-bold text-white uppercase tracking-widest
                rounded-xl shadow-lg transition-all duration-300 ease-in-out
                transform active:scale-95
                border-b-8
                ${
                    disabled
                        ? 'bg-gray-600 border-gray-800 cursor-not-allowed'
                        : 'bg-green-600 hover:bg-green-500 border-green-800 hover:border-green-700'
                }
            `}
        >
            {disabled ? 'Running...' : `Pay $${cost.toFixed(2)}`}
        </button>
    );
};
