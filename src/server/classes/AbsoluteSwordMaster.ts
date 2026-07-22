import { UnitBase } from "./UnitBase";

export class AbsoluteSwordmaster extends UnitBase {
	public onAttack(target: Model, damage: number, isCritical: boolean): void {
		const critText = isCritical ? "💥 ¡GOLPE CRÍTICO!" : "";
		print(
			`[Combat] 🗡️ ${this.config.name} atacó a ${target.Name} infligiendo ${damage} de daño! ${critText}`
		);
	}

	public onSkillActivate(): void {
		print(`[Combat] ✨ ${this.config.name} activó su habilidad especial!`);
	}
}

export default AbsoluteSwordmaster;