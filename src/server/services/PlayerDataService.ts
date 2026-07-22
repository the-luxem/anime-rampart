import { Players } from "@rbxts/services";
import ProfileService from "@rbxts/profileservice";
import { PlayerDataSchema } from "shared/types/PlayerData";

// Estructura de mazo inicial vacía de 12 espacios (representados como cadenas vacías)
const initialDeck: string[] = [];
for (let i = 0; i < 12; i++) {
	initialDeck.push("");
}

// Datos por defecto para nuevos jugadores
const DEFAULT_PLAYER_DATA: PlayerDataSchema = {
	gold: 500,
	gems: 50,
	accountXp: 0,
	militaryRank: 1, // Recluta
	inventory: [],
	equippedDeck: initialDeck,
};

const ProfileStore = ProfileService.GetProfileStore(
	"AnimeRampart_PlayerData_v1",
	DEFAULT_PLAYER_DATA,
);

type PlayerProfile = ReturnType<typeof ProfileStore.LoadProfileAsync>;
const Profiles = new Map<Player, NonNullable<PlayerProfile>>();

export namespace PlayerDataService {
	export function onPlayerAdded(player: Player): void {
		const profile = ProfileStore.LoadProfileAsync(`Player_${player.UserId}`);

		if (profile !== undefined) {
			profile.AddUserId(player.UserId);
			profile.Reconcile();

			profile.ListenToRelease(() => {
				Profiles.delete(player);
				player.Kick("Tu sesión ha sido cargada en otro servidor.");
			});

			if (player.IsDescendantOf(Players)) {
				Profiles.set(player, profile);
				print(`[PlayerDataService] Perfil cargado exitosamente para: ${player.Name}`);
			} else {
				profile.Release();
			}
		} else {
			player.Kick("No se pudieron cargar tus datos. Por favor, reingresa al juego.");
		}
	}

	export function onPlayerRemoving(player: Player): void {
		const profile = Profiles.get(player);
		if (profile !== undefined) {
			profile.Release();
		}
	}

	export function getProfile(player: Player) {
		return Profiles.get(player);
	}
}