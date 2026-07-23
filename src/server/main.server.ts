import { Players } from "@rbxts/services";
import { PlayerDataService } from "./services/PlayerDataService";
import { PlacementService } from "./services/PlacementService";
import { GoldService } from "./services/GoldService";

// 1. Conectar eventos de jugadores
Players.PlayerAdded.Connect((player) => PlayerDataService.onPlayerAdded(player));
Players.PlayerRemoving.Connect((player) => PlayerDataService.onPlayerRemoving(player));

// 🛑 CLAVE DE STUDIO: Procesar al jugador si ya entró antes de que el script cargara
for (const player of Players.GetPlayers()) {
	task.spawn(() => PlayerDataService.onPlayerAdded(player));
}


GoldService.init(); // 👈 Inicializamos primero la economía

// 3. Inicializar servicios de juego
PlacementService.init();

print("🚀 [Servidor] Todos los servicios iniciados correctamente.");