import { CharacterConfig } from "shared/types/CharacterConfig";

export const CHARACTERS_REGISTRY: Record<string, CharacterConfig> = {
	"absolute-swordmaster": {
		id: "absolute-swordmaster",
		name: "Absolute Swordmaster",
		role: "DPS",
		element: "Fire",
		placement: "Vanguard",
		targetAir: false,

		// Stats Núcleo Base
		baseHp: 150,
		baseAtk: 45,
		baseDef: 10,
		attackCooldown: 1.2,
		baseSpeed: 16,
		range: 8,

		// Atributos Secundarios Base
		deployCost: 150,
		blockCapacity: 2,
		targetLimit: 1,
		baseCritRate: 15,
		baseCritDamage: 150,
		growthPerLevel: 3.5,
	},
};