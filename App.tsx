
import React, { useState, useEffect, useRef, useCallback } from 'react';
// FIX: Import Matter from 'matter-js' to resolve namespace errors.
import Matter from 'matter-js';
import { GameStats as GameStatsType, CoinType, GameParameters } from './types';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  WALL_THICKNESS,
  PUSHER_HEIGHT,
  COIN_SPAWN_Y,
  COIN_TYPES,
  COST_PER_PLAY,
  DURATION_PER_PLAY,
  GRAVITY,
  COIN_PROBABILITIES,
  COIN_FRICTION_AIR
} from './constants';
import { GameStats } from './components/GameStats';
import { ControlButton } from './components/ControlButton';
import { GameControls } from './components/GameControls';

// FIX: Removed @ts-ignore as Matter is now properly imported.
const { Engine, Render, Runner, World, Bodies, Body, Events, Composite } = Matter;

const SettingsIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
);


const App: React.FC = () => {
    const [stats, setStats] = useState<GameStatsType>({ moneySpent: 0, moneyWon: 0 });
    const [isRunning, setIsRunning] = useState(false);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    
    const [gameParams, setGameParams] = useState<GameParameters>({
        initialDropValue: 10,
        coinsPerDrop: 3,
        pusherRange: 20, // percentage
        pusherSpeed: 2, // multiplier from constants.ts
        costPerPlay: COST_PER_PLAY,
        durationPerPlay: DURATION_PER_PLAY / 1000, // in seconds
    });

    const isRunningRef = useRef(isRunning);
    const gameParamsRef = useRef(gameParams);

    const sceneRef = useRef<HTMLDivElement>(null);
    const engineRef = useRef(Engine.create());
    const runnerRef = useRef(Runner.create());
    const pusherBodyRef = useRef<Matter.Body | null>(null);

    const pusherDirectionRef = useRef<'up' | 'down'>('down');
    const atCycleTopRef = useRef(false);
    const sessionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const isFirstPlayRef = useRef(true);

    useEffect(() => { isRunningRef.current = isRunning; }, [isRunning]);
    useEffect(() => { gameParamsRef.current = gameParams; }, [gameParams]);

    const handleParamChange = useCallback(<K extends keyof GameParameters>(key: K, value: GameParameters[K]) => {
        setGameParams(prev => ({ ...prev, [key]: value }));
    }, []);

    const playNote = useCallback((frequency: number) => {
        if (!audioContextRef.current) return;
        const context = audioContextRef.current;
        const oscillator = context.createOscillator();
        const gainNode = context.createGain();

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(frequency, context.currentTime);
        
        gainNode.gain.setValueAtTime(0.3, context.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.5);

        oscillator.connect(gainNode);
        gainNode.connect(context.destination);

        oscillator.start();
        oscillator.stop(context.currentTime + 0.2);
    }, []);

    const getRandomCoinType = useCallback(() => {
        const totalWeight = COIN_PROBABILITIES.reduce((sum, coin) => sum + coin.weight, 0);
        let random = Math.random() * totalWeight;
        for (const coin of COIN_PROBABILITIES) {
            if (random < coin.weight) {
                return coin.type;
            }
            random -= coin.weight;
        }
        return COIN_PROBABILITIES[0].type;
    }, []);

    const spawnCoin = useCallback(() => {
        const type = getRandomCoinType();
        const properties = COIN_TYPES[type];
        const x = Math.random() * (GAME_WIDTH - properties.radius * 2 - WALL_THICKNESS * 2) + properties.radius + WALL_THICKNESS;
        
        const coinBody = Bodies.circle(x, COIN_SPAWN_Y, properties.radius, {
            restitution: 0.3,
            friction: 0.5,
            frictionAir: COIN_FRICTION_AIR,
            density: 0.01,
            label: 'coin',
            render: {
                fillStyle: properties.color,
            }
        });
        coinBody.coinType = type;
        World.add(engineRef.current.world, coinBody);
    }, [getRandomCoinType]);

    const spawnInitialPile = useCallback(() => {
        let totalValue = 0;
        const targetValue = gameParamsRef.current.initialDropValue;
        const spawnArea = {
            minY: GAME_HEIGHT * 0.1,
            maxY: GAME_HEIGHT * 0.6,
        };

        while (totalValue < targetValue) {
            const type = getRandomCoinType();
            const properties = COIN_TYPES[type];
            
            const x = Math.random() * (GAME_WIDTH - properties.radius * 2 - WALL_THICKNESS * 2) + properties.radius + WALL_THICKNESS;
            const y = Math.random() * (spawnArea.maxY - spawnArea.minY) + spawnArea.minY;

            const coinBody = Bodies.circle(x, y, properties.radius, {
                restitution: 0.3, friction: 0.5, frictionAir: COIN_FRICTION_AIR, density: 0.01, label: 'coin',
                render: { fillStyle: properties.color }
            });
            coinBody.coinType = type;
            World.add(engineRef.current.world, coinBody);
            totalValue += properties.value;
        }
    }, [getRandomCoinType]);
    
    useEffect(() => {
        const engine = engineRef.current;
        engine.world.gravity.y = GRAVITY;
        const runner = runnerRef.current;

        const render = Render.create({
            element: sceneRef.current!,
            engine: engine,
            options: { width: GAME_WIDTH, height: GAME_HEIGHT, wireframes: false, background: 'transparent' }
        });

        const wallOptions = { isStatic: true, render: { fillStyle: '#1a202c' } };
        World.add(engine.world, [
            Bodies.rectangle(WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT, wallOptions),
            Bodies.rectangle(GAME_WIDTH - WALL_THICKNESS / 2, GAME_HEIGHT / 2, WALL_THICKNESS, GAME_HEIGHT, wallOptions)
        ]);
        
        const pusherTopY = PUSHER_HEIGHT / 2;
        const pusher = Bodies.rectangle(GAME_WIDTH / 2, pusherTopY, GAME_WIDTH - WALL_THICKNESS * 2, PUSHER_HEIGHT,
            { isStatic: true, label: 'pusher', render: { fillStyle: '#e53e3e' } }
        );
        pusherBodyRef.current = pusher;
        World.add(engine.world, pusher);

        const bottomSensor = Bodies.rectangle(GAME_WIDTH / 2, GAME_HEIGHT + 25, GAME_WIDTH, 50, {
            isStatic: true, isSensor: true, label: 'bottomSensor', render: { visible: false }
        });
        World.add(engine.world, bottomSensor);
        
        Events.on(engine, 'beforeUpdate', () => {
            if (!isRunningRef.current || !pusherBodyRef.current) return;
            
            const params = gameParamsRef.current;
            const pusher = pusherBodyRef.current;
            const currentY = pusher.position.y;
            
            const pusherRangePx = GAME_HEIGHT * (params.pusherRange / 100);
            const pusherBottomY = pusherTopY + pusherRangePx;
            const baseSpeed = pusherRangePx / (3 * 60); // px per frame for a 3-second one-way trip
            const effectiveSpeed = baseSpeed * params.pusherSpeed;

            let newY = currentY;
            atCycleTopRef.current = false;

            if (pusherDirectionRef.current === 'up') {
                newY -= effectiveSpeed;
                if (newY <= pusherTopY) {
                    newY = pusherTopY;
                    pusherDirectionRef.current = 'down';
                    atCycleTopRef.current = true;
                }
            } else {
                newY += effectiveSpeed;
                if (newY >= pusherBottomY) {
                    newY = pusherBottomY;
                    pusherDirectionRef.current = 'up';
                }
            }
            Body.setPosition(pusher, { x: pusher.position.x, y: newY });
            
            if (atCycleTopRef.current) {
                const coinsToSpawn = Math.floor(Math.random() * params.coinsPerDrop) + 1;
                for (let i = 0; i < coinsToSpawn; i++) {
                    spawnCoin();
                }
            }
        });

        Events.on(engine, 'collisionStart', (event) => {
            event.pairs.forEach((pair) => {
                const { bodyA, bodyB } = pair;
                let coinBody: Matter.Body | null = null;
                if (bodyA.label === 'coin' && bodyB.label === 'bottomSensor') coinBody = bodyA;
                else if (bodyB.label === 'coin' && bodyA.label === 'bottomSensor') coinBody = bodyB;

                if (coinBody && coinBody.coinType) {
                    const properties = COIN_TYPES[coinBody.coinType];
                    setStats(prev => ({...prev, moneyWon: prev.moneyWon + properties.value }));
                    playNote(properties.noteFrequency);
                    Composite.remove(engine.world, coinBody);
                }
            });
        });

        Render.run(render);
        Runner.run(runner, engine);

        return () => {
            Render.stop(render);
            Runner.stop(runner);
            World.clear(engine.world, false);
            Engine.clear(engine);
            render.canvas.remove();
            render.textures = {};
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [playNote, spawnCoin, spawnInitialPile, getRandomCoinType]);

    const handlePayClick = () => {
        if (isRunning) return;

        if (!audioContextRef.current) {
            audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
        
        if (isFirstPlayRef.current) {
            spawnInitialPile();
            isFirstPlayRef.current = false;
        }

        setIsRunning(true);
        setStats(prev => ({...prev, moneySpent: prev.moneySpent + gameParams.costPerPlay }));

        if (sessionTimeoutRef.current) clearTimeout(sessionTimeoutRef.current);

        sessionTimeoutRef.current = setTimeout(() => {
            setIsRunning(false);
        }, gameParams.durationPerPlay * 1000);
    };

    return (
        <main className="flex items-center justify-center min-h-screen bg-gradient-to-b from-indigo-900 to-black p-4 font-sans">
            <div
                className="relative bg-gray-800 border-4 border-gray-600 shadow-2xl shadow-cyan-500/20 overflow-hidden"
                style={{ width: GAME_WIDTH, height: GAME_HEIGHT }}
            >
                <GameStats stats={stats} />

                <button 
                    onClick={() => setIsSettingsOpen(true)}
                    className="absolute top-20 right-2 z-40 p-2 text-white bg-black bg-opacity-40 rounded-full hover:bg-opacity-60 transition-colors"
                    aria-label="Open game settings"
                >
                    <SettingsIcon />
                </button>
                
                <GameControls 
                    params={gameParams}
                    onParamChange={handleParamChange}
                    isOpen={isSettingsOpen}
                    onClose={() => setIsSettingsOpen(false)}
                />
                
                <div 
                  className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-yellow-500/50 to-transparent z-10 pointer-events-none"
                >
                    <div className="absolute bottom-2 w-full text-center text-yellow-200 font-bold uppercase tracking-widest">
                        Collection Bin
                    </div>
                </div>

                <div ref={sceneRef} className="w-full h-full" />
                
                <ControlButton onClick={handlePayClick} disabled={isRunning || isSettingsOpen} cost={gameParams.costPerPlay} />
            </div>
        </main>
    );
};

export default App;
