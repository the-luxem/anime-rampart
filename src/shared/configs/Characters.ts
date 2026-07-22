import { CharacterConfig } from "shared/types/CharacterConfig";

export const CHARACTERS_REGISTRY: Record<string, CharacterConfig> = {
	"absolute-swordmaster": {
		id: "absolute-swordmaster",
		name: "Absolute Swordmaster",
		role: "DPS",
		element: "Fire",
		placement: "Vanguard",
		baseHp: 150,
		baseAtk: 45,
		baseDef: 10,
		attackCooldown: 1.2,
		baseSpeed: 16,
		range: 8,
		baseCritRate: 5,     // 5% de chance
		baseCritDamage: 150, // 150% de daño
		growthPerLevel: 3.5,
	},
};