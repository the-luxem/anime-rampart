import { Players } from "@rbxts/services";
import ProfileService from "@rbxts/profileservice";
import { PlayerDataSchema } from "shared/types/PlayerData";

const initialDeck: string[] = [];
for (let i = 0; i < 12; i++) {
	initialDeck.push("");
}

const DEFAULT_PLAYER_DATA: PlayerDataSchema = {
	gold: 500,
	gems: 50,
	accountXp: 0,
	militaryRank: 1,
	inventory: [],
	equippedDeck: initialDeck,
};

const ProfileStore = ProfileService.GetProfileStore(
	"AnimeRampart_PlayerData_v3", // 💡 Cambiamos a v3 para refrescar los datos del mazo de pruebas
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

			// 🧪 EQUIPAR LOTE DE PRUEBAS PARA LOS 6 SLOTS DE VANGUARDIA
			if (profile.Data.inventory.size() === 0) {
				for (let i = 0; i < 6; i++) {
					const unitUuid = `test-unit-uuid-00${i + 1}`;
					profile.Data.inventory.push({
						uuid: unitUuid,
						characterId: "absolute-swordmaster",
						level: 1,
						stats: { HP: "C", ATK: "C", DEF: "C", CD: "C", SPD: "C", RNG: "C", CRIT: "C" },
					});
					profile.Data.equippedDeck[i] = unitUuid;
				}
			}

			profile.ListenToRelease(() => {
				Profiles.delete(player);
				player.Kick("Tu sesión ha sido cargada en otro servidor.");
			});

			if (player.IsDescendantOf(Players)) {
				Profiles.set(player, profile);
				print(`[PlayerDataService] Perfil cargado para ${player.Name} con 6 slots de Vanguardia listos.`);
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