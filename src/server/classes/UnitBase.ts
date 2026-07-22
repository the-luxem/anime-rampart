import { CharacterConfig } from "shared/types/CharacterConfig";
import { InventoryUnit, StatLetter } from "shared/types/PlayerData";

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

	// 📊 Stats Finales de Combate
	public finalHp: number = 0;
	public finalAtk: number = 0;
	public finalDef: number = 0;
	public finalCooldown: number = 0;
	public finalSpeed: number = 0;
	public finalRange: number = 0;
	
	// Valore fijados por base (sin multiplicador de letra)
	public finalCritRate: number = 0;
	public finalCritDamage: number = 0;

	constructor(unitData: InventoryUnit, config: CharacterConfig) {
		this.uuid = unitData.uuid;
		this.config = config;
		this.level = unitData.level;
		this.stats = unitData.stats;

		this.recalculateStats();
	}

	public recalculateStats(): void {
		const hpMult = STAT_MULTIPLIERS[this.stats.HP] ?? 1.0;
		const atkMult = STAT_MULTIPLIERS[this.stats.ATK] ?? 1.0;
		const defMult = STAT_MULTIPLIERS[this.stats.DEF] ?? 1.0;
		const cdMult = STAT_MULTIPLIERS[this.stats.CD] ?? 1.0;
		const spdMult = STAT_MULTIPLIERS[this.stats.SPD] ?? 1.0;
		const rngMult = STAT_MULTIPLIERS[this.stats.RNG] ?? 1.0;

		// 1. HP (Escala por nivel + Multiplicador de Letra)
		const baseHpCalculated = this.config.baseHp + (this.level - 1) * (this.config.growthPerLevel * 5);
		this.finalHp = baseHpCalculated * hpMult;

		// 2. ATK (Escala por nivel + Multiplicador de Letra)
		const baseAtkCalculated = this.config.baseAtk + (this.level - 1) * this.config.growthPerLevel;
		this.finalAtk = baseAtkCalculated * atkMult;

		// 3. DEF (Base + Multiplicador de Letra)
		this.finalDef = this.config.baseDef * defMult;

		// 4. Cooldown (A mayor multiplicador de letra, menor la espera para atacar)
		this.finalCooldown = this.config.attackCooldown / cdMult;

		// 5. Speed (Base + Multiplicador de Letra)
		this.finalSpeed = this.config.baseSpeed * spdMult;

		// 6. Range (Base + Multiplicador de Letra)
		this.finalRange = this.config.range * rngMult;

		// 7. Críticos Limpios (Base fija de la tropa, sin alteración por letra)
		this.finalCritRate = this.config.baseCritRate;     // ej: 10 (%)
		this.finalCritDamage = this.config.baseCritDamage; // ej: 150 (%)
	}

	public abstract onAttack(target: Model): void;
	public abstract onSkillActivate(): void;
}