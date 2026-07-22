import { Players, Workspace } from "@rbxts/services";
import { PlayerDataService } from "./services/PlayerDataService";
import { UnitSpawnerService } from "./services/UnitSpawnerService";
import { InventoryUnit } from "shared/types/PlayerData";

Players.PlayerAdded.Connect((player) => {
	PlayerDataService.onPlayerAdded(player);

	// PRUEBA TEMPORAL: Spawnear una tropa de prueba en el mapa a los 3 segundos
	task.delay(3, () => {
		const dummyUnit: InventoryUnit = {
			uuid: "test-uuid-001",
			characterId: "absolute-swordmaster",
			level: 1,
			stats: {
				HP: "C",
				ATK: "B",
				DEF: "C",
				CD: "C",
				SPD: "C",
				RNG: "C",
				CRIT: "C",
			},
		};

		UnitSpawnerService.spawnUnit(player, dummyUnit, new Vector3(0, 5, 0));
	});
});

Players.PlayerRemoving.Connect((player) => PlayerDataService.onPlayerRemoving(player));

for (const player of Players.GetPlayers()) {
	PlayerDataService.onPlayerAdded(player);
}

print("[Anime Rampart Server] Servidor iniciado correctamente.");