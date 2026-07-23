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
	inventory: [
		{
			uuid: "starter-unit-001",
			characterId: "absolute-swordmaster",
			level: 1,
			stats: { HP: "C", ATK: "C", DEF: "C", CD: "C", SPD: "C", RNG: "C", CRIT: "C" },
		},
	],
	equippedDeck: ["starter-unit-001", "", "", "", "", "", "", "", "", "", "", ""],
};

const ProfileStore = ProfileService.GetProfileStore(
	"AnimeRampart_PlayerData_v2", // 💡 Cambiado a v2 para resetear la base de datos local de Studio
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

			// 🧪 Garantizar la tropa starter en inventario y equipada en Slot 0
			let starterUnit = profile.Data.inventory.find((u) => u.characterId === "absolute-swordmaster");
			
			if (!starterUnit) {
				starterUnit = {
					uuid: "starter-unit-001",
					characterId: "absolute-swordmaster",
					level: 1,
					stats: { HP: "C", ATK: "C", DEF: "C", CD: "C", SPD: "C", RNG: "C", CRIT: "C" },
				};
				profile.Data.inventory.push(starterUnit);
			}

			if (profile.Data.equippedDeck[0] === "" || !profile.Data.equippedDeck[0]) {
				profile.Data.equippedDeck[0] = starterUnit.uuid;
			}

			profile.ListenToRelease(() => {
				Profiles.delete(player);
				player.Kick("Tu sesión ha sido cargada en otro servidor.");
			});

			if (player.IsDescendantOf(Players)) {
				Profiles.set(player, profile);
				print(`[PlayerDataService] Perfil cargado para ${player.Name}. Slot 0 equipa: ${profile.Data.equippedDeck[0]}`);
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