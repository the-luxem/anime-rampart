import { Workspace } from "@rbxts/services";
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
	public model?: Model;

	protected level: number;
	protected stats: InventoryUnit["stats"];
	protected isCombatActive: boolean = false;

	// 📊 Stats Finales de Combate
	public finalHp: number = 0;
	public finalAtk: number = 0;
	public finalDef: number = 0;
	public finalCooldown: number = 0;
	public finalSpeed: number = 0;
	public finalRange: number = 0;
	public finalCritRate: number = 0;
	public finalCritDamage: number = 0;

	constructor(unitData: InventoryUnit, config: CharacterConfig, model?: Model) {
		this.uuid = unitData.uuid;
		this.config = config;
		this.level = unitData.level;
		this.stats = unitData.stats;
		this.model = model;

		this.recalculateStats();
	}

	public recalculateStats(): void {
		const hpMult = STAT_MULTIPLIERS[this.stats.HP] ?? 1.0;
		const atkMult = STAT_MULTIPLIERS[this.stats.ATK] ?? 1.0;
		const defMult = STAT_MULTIPLIERS[this.stats.DEF] ?? 1.0;
		const cdMult = STAT_MULTIPLIERS[this.stats.CD] ?? 1.0;
		const spdMult = STAT_MULTIPLIERS[this.stats.SPD] ?? 1.0;
		const rngMult = STAT_MULTIPLIERS[this.stats.RNG] ?? 1.0;

		const baseHpCalculated = this.config.baseHp + (this.level - 1) * (this.config.growthPerLevel * 5);
		this.finalHp = baseHpCalculated * hpMult;

		const baseAtkCalculated = this.config.baseAtk + (this.level - 1) * this.config.growthPerLevel;
		this.finalAtk = baseAtkCalculated * atkMult;

		this.finalDef = this.config.baseDef * defMult;
		this.finalCooldown = this.config.attackCooldown / cdMult;
		this.finalSpeed = this.config.baseSpeed * spdMult;
		this.finalRange = this.config.range * rngMult;

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
	 * Procesa la fórmula de daño y crítico
	 */
	protected executeAttack(target: Model): void {
		const roll = math.random(1, 100);
		const isCritical = roll <= this.finalCritRate;

		let damageToApply = this.finalAtk;
		if (isCritical) {
			damageToApply = this.finalAtk * (this.finalCritDamage / 100);
		}

		this.onAttack(target, damageToApply, isCritical);
	}

	public abstract onAttack(target: Model, damage: number, isCritical: boolean): void;
	public abstract onSkillActivate(): void;

    public destroy(): void {
		// Destruimos el modelo 3D de Workspace
		if (this.model) {
			this.model.Destroy();
		}

		print(`[UnitBase] Tropa ${this.config.name} destruida y limpiada.`);
	}
    
}