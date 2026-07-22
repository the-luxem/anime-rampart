import { Players } from "@rbxts/services";
import { PlayerDataService } from "./services/PlayerDataService";
import { DeckService } from "./services/DeckService";
import { InventoryUnit } from "shared/types/PlayerData";

Players.PlayerAdded.Connect((player) => {
	PlayerDataService.onPlayerAdded(player);

	// PRUEBA DE DECK SERVICE (a los 2 segundos de entrar)
	task.delay(2, () => {
		const profile = PlayerDataService.getProfile(player);
		if (!profile) return;

		// 1. Damos una tropa de prueba si el inventario está vacío
		if (profile.Data.inventory.size() === 0) {
			const testUnit: InventoryUnit = {
				uuid: "test-uuid-swordmaster",
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
			profile.Data.inventory.push(testUnit);
		}

		const unitToEquip = profile.Data.inventory[0];

		// 2. Probamos equiparla en Slot 0 (Vanguardia - Debe funcionar)
		print("--- Intento 1: Equipar en Slot 0 (Vanguardia) ---");
		DeckService.equipUnit(player, unitToEquip.uuid, 0);

		// 3. Probamos equiparla en Slot 6 (Muralla - Debe rebotar porque es Vanguardia)
		print("--- Intento 2: Equipar en Slot 6 (Muralla - Error Esperado) ---");
		DeckService.equipUnit(player, unitToEquip.uuid, 6);
	});
});

Players.PlayerRemoving.Connect((player) => PlayerDataService.onPlayerRemoving(player));

for (const player of Players.GetPlayers()) {
	PlayerDataService.onPlayerAdded(player);
}

print("[Anime Rampart Server] Servidor iniciado correctamente.");