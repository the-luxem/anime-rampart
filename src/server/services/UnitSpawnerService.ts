import { Workspace } from "@rbxts/services";
import { InventoryUnit } from "shared/types/PlayerData";
import { CHARACTERS_REGISTRY } from "shared/configs/Characters";
import { UnitBase } from "server/classes/UnitBase";
import { AbsoluteSwordmaster } from "server/classes/AbsoluteSwordMaster";

// Tipo para el constructor de las clases de tropas
type UnitConstructor = new (
	data: InventoryUnit,
	config: typeof CHARACTERS_REGISTRY[string],
	model: Model
) => UnitBase;

// Registro que vincula cada characterId con su clase de TypeScript
const CLASS_REGISTRY: Record<string, UnitConstructor> = {
	"absolute-swordmaster": AbsoluteSwordmaster,
};

export namespace UnitSpawnerService {
	// Guardamos las tropas activas en partida asociadas a cada jugador
	const activeUnits = new Map<Player, UnitBase[]>();

	/**
	 * Instancia el modelo 3D y la clase de combate de una tropa
	 */
	export function spawnUnit(
		player: Player,
		unitData: InventoryUnit,
		position: Vector3,
	): UnitBase | undefined {
		const config = CHARACTERS_REGISTRY[unitData.characterId];

		if (!config) {
			warn(`[UnitSpawnerService] No existe configuración para el ID: ${unitData.characterId}`);
			return undefined;
		}

		const UnitClass = CLASS_REGISTRY[unitData.characterId];
		if (!UnitClass) {
			warn(`[UnitSpawnerService] No hay clase registrada para el ID: ${unitData.characterId}`);
			return undefined;
		}

		// 1. Crear el modelo 3D (Placeholder o Asset)
		const unitModel = new Instance("Model");
		unitModel.Name = `${config.name}_${player.Name}`;

		const part = new Instance("Part");
		part.Size = new Vector3(2, 4, 2);
		part.Position = position;
		part.Anchored = true;
		part.Material = Enum.Material.SmoothPlastic;

		// Color según rol táctico
		if (config.placement === "Vanguard") {
			part.Color = Color3.fromRGB(220, 50, 50); // Rojo para Vanguardia
		} else {
			part.Color = Color3.fromRGB(50, 150, 250); // Azul para Muralla/Rampart
		}

		part.Parent = unitModel;
		unitModel.PrimaryPart = part;
		unitModel.Parent = Workspace;

		// 2. Instanciar la clase de la tropa
		const unitInstance = new UnitClass(unitData, config, unitModel);

		// 3. Registrar la tropa activa en el Map del jugador
		let playerUnits = activeUnits.get(player);
		if (!playerUnits) {
			playerUnits = [];
			activeUnits.set(player, playerUnits);
		}
		playerUnits.push(unitInstance);

		// 4. Iniciar el loop de combate
		unitInstance.startCombatLoop();

		print(`[UnitSpawnerService] Tropa ${config.name} spawneda e iniciada en ${position} para ${player.Name}`);

		return unitInstance;
	}

	/**
	 * Destruye todas las tropas activas de un jugador (útil al salir de partida o reiniciar ronda)
	 */
	export function clearPlayerUnits(player: Player): void {
		const units = activeUnits.get(player);
		if (!units) return;

		for (const unit of units) {
			unit.destroy();
		}

		activeUnits.delete(player);
		print(`[UnitSpawnerService] Limpiadas todas las tropas de ${player.Name}`);
	}
}