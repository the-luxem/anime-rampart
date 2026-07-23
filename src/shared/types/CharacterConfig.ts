export type PlacementType = "Vanguard" | "Rampart";
export type UnitRole = "DPS" | "SUB-DPS" | "TANK" | "SUPPORT" | "HEALER" | "FARM";

export interface CharacterConfig {
	// 🆔 Identidad Fija
	id: string;
	name: string;
	role: UnitRole;
	element: string;
	placement: PlacementType;
	targetAir: boolean;     // Control anti-aéreo

	// 📊 Stats Núcleo Base (Sometidas a Reroll -F a EX)
	baseHp: number;
	baseAtk: number;
	baseDef: number;
	attackCooldown: number;
	baseSpeed: number;
	range: number;

	// 🛡️ Atributos Secundarios Base
	deployCost: number;     // Costo de oro dentro de la partida
	blockCapacity: number;  // Capacidad de bloqueo (Exclusivo Vanguard)
	targetLimit: number;    // Objetivos simultáneos
	splashRadius?: number;  // Radio de daño AoE (Opcional)

	// 💥 Críticos y Crecimiento
	baseCritRate: number;   // ej: 15 (%)
	baseCritDamage: number; // ej: 150 (%)
	growthPerLevel: number;
}