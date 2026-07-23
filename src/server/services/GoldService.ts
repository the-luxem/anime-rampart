import { Players } from "@rbxts/services";
import { GoldUpdateEvent } from "shared/remotes";

export class GoldService {
	private static playerGold = new Map<number, number>();
	private static readonly INITIAL_GOLD = 500;
	private static readonly GOLD_PER_SECOND = 5;

	public static init(): void {
		Players.PlayerAdded.Connect((player) => {
			GoldService.playerGold.set(player.UserId, GoldService.INITIAL_GOLD);
			GoldService.syncGold(player);
		});

		Players.PlayerRemoving.Connect((player) => {
			GoldService.playerGold.delete(player.UserId);
		});

		// Loop de Oro Pasivo (+5 de oro cada segundo)
		task.spawn(() => {
			while (true) {
				task.wait(1);
				for (const [userId, currentGold] of GoldService.playerGold) {
					const player = Players.GetPlayerByUserId(userId);
					if (player) {
						GoldService.addGold(player, GoldService.GOLD_PER_SECOND);
					}
				}
			}
		});

		print("[GoldService] Servicio de Economía de Oro listo.");
	}

	public static getGold(player: Player): number {
		return GoldService.playerGold.get(player.UserId) ?? 0;
	}

	public static addGold(player: Player, amount: number): void {
		const current = GoldService.getGold(player);
		const newTotal = current + amount;
		GoldService.playerGold.set(player.UserId, newTotal);
		GoldService.syncGold(player);
	}

	public static removeGold(player: Player, amount: number): boolean {
		const current = GoldService.getGold(player);
		if (current >= amount) {
			GoldService.playerGold.set(player.UserId, current - amount);
			GoldService.syncGold(player);
			return true;
		}
		return false;
	}

	private static syncGold(player: Player): void {
		const amount = GoldService.getGold(player);
		GoldUpdateEvent.FireClient(player, amount);
	}
}