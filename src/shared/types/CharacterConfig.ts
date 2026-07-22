export type PlacementType = "Vanguard" | "Rampart";

export interface CharacterConfig {
	id: string;
	name: string;
	role: string;
	element: string;
	placement: PlacementType;
	
	// Valores Base para las Stats
	baseHp: number;
	baseAtk: number;
	baseDef: number;
	attackCooldown: number;
	baseSpeed: number;
	range: number;
	
	// Probabilidad y Daño Crítico separados
	baseCritRate: number;   // ej: 5 (%)
	baseCritDamage: number; // ej: 150 (%)

	growthPerLevel: number;
}