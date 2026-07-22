import { Players } from "@rbxts/services";
import { PlayerDataService } from "./services/PlayerDataService";

// Conectar eventos de jugadores
Players.PlayerAdded.Connect((player) => PlayerDataService.onPlayerAdded(player));
Players.PlayerRemoving.Connect((player) => PlayerDataService.onPlayerRemoving(player));

// Por si entra un jugador antes de que corra el script en Studio
for (const player of Players.GetPlayers()) {
	PlayerDataService.onPlayerAdded(player);
}

print("[Anime Rampart Server] Servidor iniciado correctamente.");