import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { Fighter3D } from './Fighter3D';
import { useGameStore } from '../store';
import { GameState, ActionType, FighterEquipment, FighterState, ModelType } from '../types';
import { CHARACTERS } from '../constants';
import { playMenuClickSound, playFighterSelectSound } from '../utils/audio';
import { 
  Sparkles, 
  ArrowLeft, 
  Check, 
  Shield, 
  Shirt, 
  Footprints, 
  Smile, 
  Flame, 
  RotateCw, 
  UserPlus, 
  Layers,
  Crown,
  Scissors
} from 'lucide-react';

type CategoryTab = 'glove' | 'face' | 'shirt' | 'pants' | 'shoe' | 'belt' | 'hat' | 'hair';

export const PersonalizeScreen: React.FC = () => {
  const setGameState = useGameStore(s => s.setGameState);
  const player = useGameStore(s => s.player);
  const updateFighter = useGameStore(s => s.updateFighter);

  const [activeTab, setActiveTab] = useState<CategoryTab>('glove');
  
  // Customization State
  const [selectedCharId, setSelectedCharId] = useState<string>(player.name || "James");
  const [charName, setCharName] = useState<string>(player.name || "James");
  const [modelType, setModelType] = useState<ModelType>(player.modelType || 'HUMAN');
  const [primaryColor, setPrimaryColor] = useState<string>(player.color || '#e0ac69');
  const [subColor, setSubColor] = useState<string>(player.subColor || '#6b7280');
  const [equipment, setEquipment] = useState<FighterEquipment>({
    gloves: player.equipment?.gloves || 'none',
    face: player.equipment?.face || 'none',
    shirt: player.equipment?.shirt || 'default',
    pants: player.equipment?.pants || 'default',
    shoes: player.equipment?.shoes || 'default',
    belt: player.equipment?.belt || 'none',
    hat: player.equipment?.hat || 'none',
    hair: player.equipment?.hair || 'none'
  });

  const [previewAction, setPreviewAction] = useState<ActionType>(ActionType.IDLE);
  const [rotationAngle, setRotationAngle] = useState<number>(0);
  const [saveToast, setSaveToast] = useState<boolean>(false);

  // Character preview state object passed to Fighter3D
  const previewFighterState: FighterState = {
    name: charName,
    modelType: modelType,
    color: primaryColor,
    subColor: subColor,
    action: previewAction,
    direction: 1,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    position: 0,
    y: 0,
    velocityY: 0,
    velocityX: 0,
    isAi: false,
    equipment: equipment
  };

  const handleSelectCharacter = (char: typeof CHARACTERS[0]) => {
    playFighterSelectSound();
    setSelectedCharId(char.id);
    setCharName(char.name);
    setModelType((char.modelType as ModelType) || 'HUMAN');
    setPrimaryColor(char.color);
    setSubColor(char.subColor);
    setEquipment({
      gloves: 'none',
      face: 'none',
      shirt: 'default',
      pants: 'default',
      shoes: 'default',
      belt: 'none',
      hat: 'none',
      hair: 'none'
    });
  };

  const handleCreateCustom = () => {
    playMenuClickSound();
    setSelectedCharId('custom');
    setCharName("Custom Fighter");
    setModelType('HUMAN');
    setPrimaryColor('#e0ac69');
    setSubColor('#1e293b');
    setEquipment({
      gloves: 'none',
      face: 'none',
      shirt: 'default',
      pants: 'default',
      shoes: 'default',
      belt: 'none',
      hat: 'none',
      hair: 'none'
    });
  };

  const handleSaveAndEquip = () => {
    playMenuClickSound();
    updateFighter('player', {
      name: charName,
      modelType: modelType,
      color: primaryColor,
      subColor: subColor,
      equipment: equipment
    });
    setSaveToast(true);
    setTimeout(() => {
      setSaveToast(false);
      setGameState(GameState.MENU);
    }, 900);
  };

  const presetColors = [
    '#e0ac69', '#dc2626', '#3b82f6', '#10b981', '#8b5cf6', 
    '#f59e0b', '#ec4899', '#18181b', '#ffffff', '#ffd700'
  ];

  const categoryItems: Record<CategoryTab, { id: string; name: string; icon: string }[]> = {
    glove: [
      { id: 'none', name: 'Ninguno', icon: '🚫' },
      { id: 'ruby_shield', name: 'Ruby Shield', icon: '💎' }
    ],
    face: [
      { id: 'none', name: 'Ninguno', icon: '🚫' }
    ],
    shirt: [
      { id: 'default', name: 'Ninguno', icon: '🚫' },
      { id: 'none', name: 'Sin Camisa', icon: '🎽' }
    ],
    pants: [
      { id: 'default', name: 'Ninguno', icon: '🚫' },
      { id: 'none', name: 'Sin Pantalón', icon: '🩲' }
    ],
    shoe: [
      { id: 'default', name: 'Ninguno', icon: '🚫' },
      { id: 'warrior_boots', name: 'Botas Guerrero', icon: '👑' },
      { id: 'none', name: 'Descalzo', icon: '👣' }
    ],
    belt: [
      { id: 'none', name: 'Ninguno', icon: '🚫' },
      { id: 'maid_skirt', name: 'Falda Sirvienta', icon: '👗' }
    ],
    hat: [
      { id: 'none', name: 'Ninguno', icon: '🚫' }
    ],
    hair: [
      { id: 'none', name: 'Ninguno', icon: '🚫' }
    ]
  };

  return (
    <div id="personalize-screen-container" className="absolute inset-0 z-50 flex flex-col bg-[#05070d] text-white overflow-hidden select-none font-sans">
      {/* Cyberpunk Grid Texture Background Overlay */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-25 bg-[linear-gradient(to_right,#00f5ff12_1px,transparent_1px),linear-gradient(to_bottom,#00f5ff12_1px,transparent_1px)] bg-[size:32px_32px]"
      />
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(0,245,255,0.15),rgba(255,255,255,0))]" />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-[#05070d] via-transparent to-[#05070d]/80" />

      {/* Top Header Bar */}
      <div className="w-full flex items-center justify-between px-6 py-3 bg-black/85 border-b border-cyan-500/30 backdrop-blur-md z-20 shrink-0 shadow-[0_4px_24px_rgba(0,0,0,0.85)]">
        <div className="flex items-center gap-4">
          <button
            id="personalize-back-btn"
            onClick={() => {
              playMenuClickSound();
              setGameState(GameState.MENU);
            }}
            className="px-3.5 py-1.5 bg-cyan-950/70 hover:bg-cyan-900/90 border border-cyan-500/40 rounded-lg transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider text-cyan-300 hover:text-white cursor-pointer active:scale-95 shadow-[0_0_12px_rgba(6,182,212,0.25)]"
          >
            <ArrowLeft className="w-4 h-4" /> VOLVER
          </button>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-black italic tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-400 drop-shadow-[0_0_15px_rgba(6,182,212,0.6)]">
              ESTUDIO DE PERSONALIZACIÓN
            </h1>
          </div>
        </div>

        {/* Character Roster Quick Ribbon */}
        <div className="hidden md:flex items-center gap-1.5 bg-black/60 p-1 rounded-xl border border-cyan-500/20">
          {CHARACTERS.map((char) => {
            const isSelected = selectedCharId === char.id || (selectedCharId === char.name);
            return (
              <button
                key={char.id}
                onClick={() => handleSelectCharacter(char)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-cyan-500 text-black shadow-[0_0_12px_rgba(6,182,212,0.8)] scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <div 
                  className="w-2.5 h-2.5 rounded-full border border-black/40" 
                  style={{ backgroundColor: char.color }} 
                />
                {char.name}
              </button>
            );
          })}
          <button
            onClick={handleCreateCustom}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer ${
              selectedCharId === 'custom'
                ? 'bg-pink-500 text-white shadow-[0_0_12px_rgba(236,72,153,0.8)] scale-105'
                : 'text-pink-400 hover:text-pink-300 hover:bg-pink-950/30'
            }`}
          >
            <UserPlus className="w-3 h-3" /> NUEVO
          </button>
        </div>

        {/* Save & Equip */}
        <div className="flex items-center gap-3">
          <button
            id="personalize-save-btn"
            onClick={handleSaveAndEquip}
            className="px-5 py-2 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-xs uppercase tracking-widest rounded-lg transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" /> GUARDAR
          </button>
        </div>
      </div>

      {/* Save Success Toast */}
      {saveToast && (
        <div className="absolute top-20 right-6 z-50 bg-cyan-400 text-black font-black text-xs uppercase tracking-wider px-5 py-2.5 rounded-lg shadow-[0_0_30px_rgba(6,182,212,0.9)] flex items-center gap-2 border border-cyan-100 animate-bounce">
          <Check className="w-4 h-4 stroke-[3]" /> ¡Luchador Guardado con Éxito!
        </div>
      )}

      {/* MAIN STUDIO CONTENT */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden relative z-10">
        
        {/* LEFT: 3D FULL BODY PREVIEW */}
        <div className="lg:col-span-7 h-[45vh] lg:h-full relative bg-gradient-to-b from-[#080d16] via-[#04060a] to-[#080d16] border-b lg:border-b-0 lg:border-r border-cyan-500/30 flex flex-col shrink-0">
          
          {/* Cyberpunk Grid Floor Glow */}
          <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,#00f5ff10_0%,transparent_75%)]" />

          <div className="flex-1 w-full h-full relative cursor-grab active:cursor-grabbing">
            <Canvas
              shadows
              gl={{ preserveDrawingBuffer: true, antialias: true }}
            >
              {/* Perfectly framed camera centered at Y = 0.88 with FOV 40 to see full body head to toe */}
              <PerspectiveCamera makeDefault position={[0, 0.95, 3.1]} fov={40} />
              <ambientLight intensity={1.4} />
              <directionalLight position={[4, 6, 4]} intensity={2.2} castShadow />
              <directionalLight position={[-4, -2, -2]} intensity={1.2} color="#00ffff" />
              <pointLight position={[0, 0.5, 1.8]} intensity={1.6} color="#ff0077" distance={4} />

              <Suspense fallback={null}>
                {/* Character Group positioned at origin, rotated with slider / mouse */}
                <group rotation={[0, rotationAngle, 0]} position={[0, 0, 0]}>
                  <Fighter3D who="preview" previewState={previewFighterState} />
                </group>
              </Suspense>

              <OrbitControls 
                enableZoom={true} 
                minDistance={1.6} 
                maxDistance={4.5} 
                target={[0, 0.88, 0]}
                maxPolarAngle={Math.PI / 2 + 0.15} 
                minPolarAngle={Math.PI / 6}
              />
            </Canvas>

            {/* Character Tag */}
            <div className="absolute top-3 left-3 bg-black/85 border border-cyan-500/40 px-3 py-1.5 rounded-lg backdrop-blur-md pointer-events-none shadow-lg flex items-center gap-2">
              <span className="text-xs font-black text-white italic tracking-wider">{charName}</span>
              <span className="text-[9px] px-1.5 py-0.5 bg-cyan-500 text-black font-black rounded font-mono uppercase">{modelType === 'FOX' ? 'ANIMAL' : modelType}</span>
            </div>

            {/* Rotation and Animation Controls */}
            <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-center justify-between gap-2 pointer-events-auto bg-black/85 backdrop-blur-md p-2 rounded-xl border border-cyan-500/30 shadow-[0_0_15px_rgba(0,0,0,0.8)]">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                  <RotateCw className="w-3 h-3" /> Giro:
                </span>
                <input
                  type="range"
                  min={-Math.PI}
                  max={Math.PI}
                  step={0.05}
                  value={rotationAngle}
                  onChange={(e) => setRotationAngle(parseFloat(e.target.value))}
                  className="w-20 md:w-28 accent-cyan-400 cursor-pointer"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto">
                {[
                  { label: 'Idle', action: ActionType.IDLE },
                  { label: 'Puño', action: ActionType.JAB },
                  { label: 'Patada', action: ActionType.KICK },
                  { label: 'Especial', action: ActionType.SPECIAL_ULTIMATE },
                  { label: 'Bloqueo', action: ActionType.BLOCK }
                ].map((p) => (
                  <button
                    key={p.label}
                    onClick={() => setPreviewAction(p.action)}
                    className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all cursor-pointer ${
                      previewAction === p.action
                        ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.8)] font-black'
                        : 'bg-white/5 text-slate-300 hover:bg-white/15'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: HUD CUSTOMIZATION & CATEGORIES */}
        <div className="lg:col-span-5 flex flex-col h-full bg-black/90 overflow-y-auto p-4 md:p-5 space-y-4">
          
          {/* Category Tabs */}
          <div className="grid grid-cols-4 gap-1.5 bg-slate-950 p-1.5 rounded-xl border border-cyan-500/30 shrink-0">
            {[
              { id: 'glove', label: 'Guantes', icon: Shield, color: 'text-red-400 border-red-500 bg-red-950/50' },
              { id: 'face', label: 'Cara', icon: Smile, color: 'text-cyan-400 border-cyan-500 bg-cyan-950/50' },
              { id: 'shirt', label: 'Camisa', icon: Shirt, color: 'text-amber-400 border-amber-500 bg-amber-950/50' },
              { id: 'pants', label: 'Pantalón', icon: Layers, color: 'text-purple-400 border-purple-500 bg-purple-950/50' },
              { id: 'shoe', label: 'Zapatos', icon: Footprints, color: 'text-emerald-400 border-emerald-500 bg-emerald-950/50' },
              { id: 'belt', label: 'Falda/Cinto', icon: Flame, color: 'text-pink-400 border-pink-500 bg-pink-950/50' },
              { id: 'hat', label: 'Sombrero', icon: Crown, color: 'text-yellow-400 border-yellow-500 bg-yellow-950/50' },
              { id: 'hair', label: 'Pelo', icon: Scissors, color: 'text-blue-400 border-blue-500 bg-blue-950/50' },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    playMenuClickSound();
                    setActiveTab(tab.id as CategoryTab);
                  }}
                  className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border transition-all cursor-pointer ${
                    isActive 
                      ? `${tab.color} shadow-[0_0_10px_rgba(6,182,212,0.3)]` 
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4 mb-0.5" />
                  <span className="text-[9px] font-black uppercase tracking-wider">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Gear Selection Grid */}
          {(() => {
            const activeItems = categoryItems[activeTab] || [];
            return (
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  Opciones de {activeTab.toUpperCase()}
                </span>
                <div className="grid grid-cols-2 gap-2.5">
                  {activeItems.map((item) => {
                    const currentSelectedId = 
                      activeTab === 'glove' ? equipment.gloves :
                      activeTab === 'face' ? equipment.face :
                      activeTab === 'shirt' ? equipment.shirt :
                      activeTab === 'pants' ? equipment.pants :
                      activeTab === 'shoe' ? equipment.shoes :
                      activeTab === 'belt' ? equipment.belt :
                      activeTab === 'hat' ? equipment.hat :
                      equipment.hair;

                    const isSelected = currentSelectedId === item.id;
                    
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          playMenuClickSound();
                          const nextEquip = { ...equipment };
                          if (activeTab === 'glove') nextEquip.gloves = item.id as any;
                          else if (activeTab === 'face') nextEquip.face = item.id as any;
                          else if (activeTab === 'shirt') nextEquip.shirt = item.id as any;
                          else if (activeTab === 'pants') nextEquip.pants = item.id as any;
                          else if (activeTab === 'shoe') nextEquip.shoes = item.id as any;
                          else if (activeTab === 'belt') nextEquip.belt = item.id as any;
                          else if (activeTab === 'hat') nextEquip.hat = item.id as any;
                          else if (activeTab === 'hair') nextEquip.hair = item.id as any;
                          setEquipment(nextEquip);
                        }}
                        className={`rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center p-3 relative ${
                          isSelected
                            ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                            : 'border-white/10 bg-slate-950/60 hover:border-white/25'
                        }`}
                      >
                        {isSelected && (
                          <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-cyan-400 flex items-center justify-center text-black">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                        <span className="text-2xl mb-1 select-none">{item.icon}</span>
                        <span className="text-[11px] font-black uppercase tracking-wider text-slate-200">{item.name}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {/* Identity & Archetype */}
          <div className="pt-3 border-t border-cyan-500/20 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                  Nombre
                </label>
                <input
                  type="text"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-xs font-bold text-white focus:outline-none focus:border-cyan-400"
                />
              </div>
              <div>
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block mb-1">
                  Arquetipo
                </label>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => setModelType('HUMAN')}
                    className={`py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      modelType === 'HUMAN'
                        ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    HUMAN
                  </button>
                  <button
                    onClick={() => setModelType('FOX')}
                    className={`py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                      modelType === 'FOX'
                        ? 'bg-cyan-500 text-black shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                        : 'bg-white/5 text-slate-400 hover:bg-white/10'
                    }`}
                  >
                    ANIMAL
                  </button>
                </div>
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  Color Principal
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presetColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setPrimaryColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        primaryColor === col ? 'scale-125 border-white ring-2 ring-cyan-400' : 'border-transparent hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                  Color Secundario
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {presetColors.map((col) => (
                    <button
                      key={col}
                      onClick={() => setSubColor(col)}
                      style={{ backgroundColor: col }}
                      className={`w-5 h-5 rounded-full border-2 transition-transform cursor-pointer ${
                        subColor === col ? 'scale-125 border-white ring-2 ring-cyan-400' : 'border-transparent hover:scale-110'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Dedicated Vertical Screen Aceptar Button */}
            <div className="pt-3 pb-4">
              <button
                id="personalize-accept-vertical-btn"
                onClick={handleSaveAndEquip}
                className="w-full py-3.5 bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-black font-black text-xs md:text-sm uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(6,182,212,0.6)] transform hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[3]" /> ACEPTAR Y GUARDAR
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
