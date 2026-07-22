import { CharacterConfig } from "shared/types/CharacterConfig";
import { InventoryUnit, StatLetter } from "shared/types/PlayerData";

// Tabla de multiplicadores por Rango de Letra
const STAT_MULTIPLIERS: Record<StatLetter, number> = {
	"-F": 0.5,  "F": 0.6,  "F+": 0.7,
	"-E": 0.75, "E": 0.8,  "E+": 0.85,
	"-D": 0.88, "D": 0.92, "D+": 0.96,
	"-C": 0.98, "C": 1.0,  "C+": 1.02,
	"-B": 1.05, "B": 1.1,  "B+": 1.15,
	"-A": 1.2,  "A": 1.25, "A+": 1.3,
	"-S": 1.4,  "S": 1.5,  "S+": 1.6,
	"-SS": 1.7, "SS": 1.8, "SS+": 1.9,
	"-SSS": 2.0, "SSS": 2.05, "SSS+": 2.1,
	"EX": 2.2,
};

export abstract class UnitBase {
	public readonly uuid: string;
	public readonly config: CharacterConfig;
	
	protected level: number;
	protected stats: InventoryUnit["stats"];
	
	// TODO (Fase Avanzada): Descomentar cuando se implementen sistemas de estrellas y variantes
	// protected stars: number;
	// protected isShiny: boolean;
	// protected isRadiant: boolean;

	// Stats finales calculados en tiempo real
	public currentHp: number = 0;
	public currentAtk: number = 0;

	constructor(unitData: InventoryUnit, config: CharacterConfig) {
		this.uuid = unitData.uuid;
		this.config = config;
		this.level = unitData.level;
		this.stats = unitData.stats;
		
		// this.stars = unitData.stars;
		// this.isShiny = unitData.isShiny;
		// this.isRadiant = unitData.isRadiant;

		this.recalculateStats();
	}

	/**
	 * Cálculo de Daño Base
	 * Stat Final = (Stat Base + Nivel * Crecimiento) * Multiplicador Letra
	 */
	public recalculateStats(): void {
		const letterAtkMult = STAT_MULTIPLIERS[this.stats.ATK] ?? 1.0;
		const letterHpMult = STAT_MULTIPLIERS[this.stats.HP] ?? 1.0;
		
		/* 
		// Multiplicadores pendientes para fases futuras:
		const starMult = 1 + this.stars * 0.15;
		const variantMult = this.isShiny ? 1.10 : 1.0;
		*/

		const baseAtkCalculated = this.config.baseAtk + this.level * this.config.growthPerLevel;
		const baseHpCalculated = this.config.baseHp + this.level * (this.config.growthPerLevel * 5);

		this.currentAtk = baseAtkCalculated * letterAtkMult;
		this.currentHp = baseHpCalculated * letterHpMult;
	}

	// Métodos abstractos que implementará cada tropa
	public abstract onAttack(target: Model): void;
	public abstract onSkillActivate(): void;
}