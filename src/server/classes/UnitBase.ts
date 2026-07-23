import { Workspace } from "@rbxts/services";
import { CharacterConfig } from "shared/types/CharacterConfig";
import { InventoryUnit, StatLetter } from "shared/types/PlayerData";

const STAT_MULTIPLIERS: Record<StatLetter, number> = {
	"F-": 0.50,  "F": 0.55,  "F+": 0.60,
	"E-": 0.65,  "E": 0.70,  "E+": 0.75,
	"D-": 0.80,  "D": 0.85,  "D+": 0.90,
	"C-": 0.95,  "C": 1.00,  "C+": 1.08,
	"B-": 1.15,  "B": 1.22,  "B+": 1.30,
	"A-": 1.38,  "A": 1.46,  "A+": 1.55,
	"S-": 1.65,  "S": 1.75,  "S+": 1.85,
	"SS-": 1.98, "SS": 2.10, "SS+": 2.22,
	"SSS-": 2.32, "SSS": 2.40, "SSS+": 2.45,
	"EX": 2.50,
};

export abstract class UnitBase {
	public readonly uuid: string;
	public readonly config: CharacterConfig;
	public model?: Model;

	protected level: number;
	protected stats: InventoryUnit["stats"];
	protected isCombatActive: boolean = false;

	// 📊 Stats Núcleo Finales de Combate (Calculadas por Rango -F a EX)
	public finalHp: number = 0;
	public finalAtk: number = 0;
	public finalDef: number = 0;
	public finalCooldown: number = 0;
	public finalSpeed: number = 0;
	public finalRange: number = 0;

	// 🛡️ Atributos Secundarios Finales (Modificables por Trait/Estrellas/Equipamiento)
	public finalDeployCost: number = 0;
	public finalBlockCapacity: number = 0;
	public finalTargetLimit: number = 1;
	public finalSplashRadius: number = 0;
	public finalCritRate: number = 0;
	public finalCritDamage: number = 0;
	public finalPassiveDamageMult: number = 1.0;

	constructor(unitData: InventoryUnit, config: CharacterConfig, model?: Model) {
		this.uuid = unitData.uuid;
		this.config = config;
		this.level = unitData.level;
		this.stats = unitData.stats;
		this.model = model;

		this.recalculateStats();
	}

	public recalculateStats(): void {
		// 1. Obtener multiplicadores de letras (-F a EX)
		const hpMult = STAT_MULTIPLIERS[this.stats.HP] ?? 1.0;
		const atkMult = STAT_MULTIPLIERS[this.stats.ATK] ?? 1.0;
		const defMult = STAT_MULTIPLIERS[this.stats.DEF] ?? 1.0;
		const cdMult = STAT_MULTIPLIERS[this.stats.CD] ?? 1.0;
		const spdMult = STAT_MULTIPLIERS[this.stats.SPD] ?? 1.0;
		const rngMult = STAT_MULTIPLIERS[this.stats.RNG] ?? 1.0;

		// 2. Cálculo de Stats Núcleo
		const baseHpCalculated = this.config.baseHp + (this.level - 1) * (this.config.growthPerLevel * 5);
		this.finalHp = baseHpCalculated * hpMult;

		const baseAtkCalculated = this.config.baseAtk + (this.level - 1) * this.config.growthPerLevel;
		this.finalAtk = baseAtkCalculated * atkMult;

		this.finalDef = this.config.baseDef * defMult;
		this.finalCooldown = this.config.attackCooldown / cdMult; // División Invertida según GDD
		this.finalSpeed = this.config.baseSpeed * spdMult;
		this.finalRange = this.config.range * rngMult;

		// 3. Asignación de Atributos Secundarios
		this.finalDeployCost = this.config.deployCost;
		this.finalBlockCapacity = this.config.blockCapacity;
		this.finalTargetLimit = this.config.targetLimit;
		this.finalSplashRadius = this.config.splashRadius ?? 0;
		this.finalCritRate = this.config.baseCritRate;
		this.finalCritDamage = this.config.baseCritDamage;
	}

	/**
	 * Inicia el loop que escanea y ataca periódicamente
	 */
	public startCombatLoop(): void {
		if (this.isCombatActive) return;
		this.isCombatActive = true;

		task.spawn(() => {
			while (this.isCombatActive) {
				const target = this.findNearestTarget();
				if (target) {
					this.executeAttack(target);
				}
				task.wait(this.finalCooldown);
			}
		});
	}

	public stopCombatLoop(): void {
		this.isCombatActive = false;
	}

	/**
	 * Busca en la carpeta Enemies del Workspace el objetivo más cercano dentro del rango
	 */
	protected findNearestTarget(): Model | undefined {
		if (!this.model) return undefined;
		const unitPos = this.model.GetPivot().Position;

		const enemiesFolder = Workspace.FindFirstChild("Enemies");
		if (!enemiesFolder) return undefined;

		let nearestEnemy: Model | undefined = undefined;
		let shortestDistance = this.finalRange;

		for (const child of enemiesFolder.GetChildren()) {
			if (child.IsA("Model")) {
				const enemyPos = child.GetPivot().Position;
				const distance = unitPos.sub(enemyPos).Magnitude; 
				if (distance <= shortestDistance) {
					shortestDistance = distance;
					nearestEnemy = child;
				}
			}
		}

		return nearestEnemy;
	}

	/**
	 * Procesa la fórmula de daño y crítico aplicando el multiplicador pasivo
	 */
	protected executeAttack(target: Model): void {
		const roll = math.random(1, 100);
		const isCritical = roll <= this.finalCritRate;

		let baseDamage = this.finalAtk * this.finalPassiveDamageMult;
		if (isCritical) {
			baseDamage = baseDamage * (this.finalCritDamage / 100);
		}

		this.onAttack(target, baseDamage, isCritical);
	}

	public abstract onAttack(target: Model, damage: number, isCritical: boolean): void;
	public abstract onSkillActivate(): void;

	public destroy(): void {
		this.stopCombatLoop();
		if (this.model) {
			this.model.Destroy();
		}

		print(`[UnitBase] Tropa ${this.config.name} destruida y limpiada.`);
	}
}