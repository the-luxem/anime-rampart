import { Workspace } from "@rbxts/services";
import { InventoryUnit } from "shared/types/PlayerData";
import { CHARACTERS_REGISTRY } from "shared/configs/Characters";

export namespace UnitSpawnerService {
	/**
	 * Instancia el modelo 3D de una tropa en la posición indicada
	 */
	export function spawnUnit(
		player: Player,
		unitData: InventoryUnit,
		position: Vector3,
	): Model | undefined {
		const config = CHARACTERS_REGISTRY[unitData.characterId];

		if (!config) {
			warn(`[UnitSpawnerService] No existe configuración para el ID: ${unitData.characterId}`);
			return undefined;
		}

		// Buscamos el modelo en ReplicatedStorage / Assets
		// Por ahora creamos un bloque temporal de prueba si no existe el modelo 3D final
		const unitModel = new Instance("Model");
		unitModel.Name = `${config.name}_${unitData.uuid}`;

		const part = new Instance("Part");
		part.Size = new Vector3(2, 4, 2);
		part.Position = position;
		part.Anchored = true;
		part.Material = Enum.Material.SmoothPlastic;
		
		// Color según el rol táctico
		if (config.placement === "Vanguard") {
			part.Color = Color3.fromRGB(220, 50, 50); // Rojo para Vanguardia
		} else {
			part.Color = Color3.fromRGB(50, 150, 250); // Azul para Muralla
		}

		part.Parent = unitModel;
		unitModel.PrimaryPart = part;
		unitModel.Parent = Workspace;

		print(`[UnitSpawnerService] Tropa ${config.name} spawneda en: ${position} por ${player.Name}`);
		
		return unitModel;
	}
}